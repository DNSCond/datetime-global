// Learn more at developers.reddit.com/docs
import { CommentV2 } from '@devvit/protos/types/devvit/reddit/v2alpha/commentv2.js';
import { Devvit, TriggerContext, CommentCreateDefinition } from '@devvit/public-api';
import { jsonEncodeIndent } from 'anthelpers';
import * as chrono from 'chrono-node';
import { Datetime_global } from 'datetime_global/Datetime_global.ts';
import { Temporal } from 'temporal-polyfill';

Devvit.configure({ redditAPI: true, });

function splitZones(zones: string | unknown): string[] {
  const array = String(zones).split(/[^\/a-zA-Z0-9:\-+_]+/i);
  if (!array.some(element => /UTC/i.test(element))) return [...array, "UTC"];
  return [...array];
}


Devvit.addSettings([
  {
    type: 'string',
    name: 'parseTimezone',
    label: 'subreddit parse timezone', defaultValue: "UTC",
    helpText: 'specify an iana timezone to parse in, some examples (Europe/Berlin, Asia/Tokyo, America/New_York)',
    onValidate({ value }) {
      try {
        new Datetime_global(Date.now(), value);
      } catch (e) {
        return String(e);
      }
    },
  },
  {
    type: 'string',
    name: 'displayTimezone',
    label: 'subreddit display timezones', defaultValue: "UTC, Europe/Amsterdam, America/New_York, Asia/Tokyo",
    helpText: 'specify an iana timezone to display in, seperated by commas, some examples (UTC, Europe/Amsterdam, America/New_York, Asia/Tokyo)',
    onValidate({ value }) {
      const now = Date.now();
      try {
        for (let tz of splitZones(value)) {
          new Datetime_global(now, tz);
        }
      } catch (e) {
        return String(e);
      }
    },
  },
  {
    type: 'boolean',
    name: 'commentOnPosts',
    label: 'comment time informatyion on posts that have them?', defaultValue: false,
  },
]);

function cloneWithGlobalFlag(regex: RegExp): RegExp {
  const flags = regex.flags.includes('g') ? regex.flags : regex.flags + 'g';
  return new RegExp(regex.source, flags);
}

function findall(regex: RegExp, input: string, nullIfNoMatch: boolean): string[][] | null {
  let matched = [];
  if (!regex.flags.includes('g')) {
    // @ts-ignore
    matched = String(input).match(regex);
    if (matched === null) return nullIfNoMatch ? null : new Array;
    matched = [matched];
  } else {
    matched = [...String(input).matchAll(cloneWithGlobalFlag(regex))];
  }
  if (matched.length > 0) {
    return matched;
  } else {
    return nullIfNoMatch ? null : new Array;
  }
}

function parseInstant(toParse: string): Datetime_global | null {
  const dateTimeRegex: RegExp = /(\d{4})(-\d{2})?(-\d{2})?(?:[Tt](\d{2})(:\d{2})?(:\d{2})?(\.\d{1,9})?)?([+\-]\d{2}:?\d{2}|[Zz])?(\[[a-zA-Z]+(?:\/[a-zA-Z]+)?])?/;
  const match: RegExpMatchArray | null = toParse.match(dateTimeRegex);
  if (match !== null) {
    try {
      let contextValue: Temporal.Instant | Temporal.ZonedDateTime = Temporal.Instant.from(`${match[1]}${match[2] ?? '-01'}${match[3] ?? '-01'}T${match[4] ?? '00'}${match[5] ?? ':00'}${match[6] ?? ':00'}${match[7] ?? '.000'}${match[8] ?? '+00:00'}`);
      if (match[9] !== null) {
        contextValue = new Temporal.ZonedDateTime(
          contextValue.epochNanoseconds,
          String(match[9])
            .replace(/^\[/, '')
            .replace(/]$/, ''),
        );
      }
      return new Datetime_global(contextValue);
    } catch {
      return null;
    }
  }
  return null;
}

type extractionResult = { start: Date, end: Date | null };
function extractDates(text: string, defaultTimezone: string): extractionResult[] {
  const results = chrono.parse(text, { timezone: defaultTimezone }), dateArray = [];

  for (const result of results) {
    let start = result.start.date(), end = null;

    if (result.end) {
      end = result.end.date();
    }

    dateArray.push({ start: start, end: end });
  }

  return dateArray;
}

function format_extractedDates(name: string, extractedDates: extractionResult[], displayTimezones: string[]) {
  let text = `Hello u/${name}\n`;
  for (let time of extractedDates) {
    text += `\n- \`${Datetime_global(time.start, 'UTC')}\`${time.end === null ? '' : ` to \`${Datetime_global(time.end, 'UTC')}\``} (\`UTC\`)`;
    for (let tz of displayTimezones) {
      if (/UTC/i.test(tz)) continue;
      text += `\n  - \`${Datetime_global(time.start, tz)}\`${time.end === null ? '' : ` to \`${Datetime_global(time.end, tz)}\``} (\`${tz}\`)`;
    }
  } return text;
}

async function verifChecker(body: string, comment: CommentV2, context: TriggerContext, event: any): Promise<boolean> {
  const id = comment.id, tz: string = await context.settings.get('parseTimezone') ?? 'UTC',
    displayTz: string = await context.settings.get('displayTimezone') ?? 'UTC',
    displayTimezones = splitZones(displayTz), extractedDates = extractDates(body, tz);

  if (extractedDates.length > 0) {
    const text = format_extractedDates(event.author.name, extractedDates, displayTimezones);
    await context.reddit.submitComment({ id, text });
    return true;
  }
  return false;
}

Devvit.addTrigger({
  event: 'CommentCreate',
  async onEvent(event, context) {
    const comment = event.comment;
    if (!comment || !comment.body) return;
    // Check if the bot is mentioned
    if (comment.body.match(/u\/datetime-global(\/?|[^a-zA-Z\-0-9_]|$)/i)) {
      // Call verifChecker with the comment body, comment object, and context
      const result = await verifChecker(comment.body, comment, context, event);
      if (result === true) return;

      // If false, try with the parent comment (if parentId is a comment)
      if (comment.parentId && comment.parentId.startsWith('t1')) {
        if (event?.author?.name === 'datetime-global') return;
        // Fetch parent comment using Reddit API
        const parentCommentId = comment.parentId,
          parentComment = await context.reddit.getCommentById(parentCommentId);
        await verifChecker(parentComment.body, comment, context, event);
      }
      return;
    }
  },
});

Devvit.addTrigger({
  event: 'PostCreate',
  async onEvent(event, context) {
    const { post } = event; if (!post) return;
    if (!event?.author) return; const { id } = post;
    if (event?.author?.name === 'datetime-global') return;
    if (await context.settings.get('commentOnPosts')) {
      // i should not have to do this. fix your Post class reddit
      const { title, body } = (await context.reddit.getPostById(post.id)) ?? {};
      const tz: string = await context.settings.get('parseTimezone') ?? 'UTC';
      const extractedDates = extractDates((title ?? '') + '\n\n' + (body ?? ''), tz);
      if (extractedDates.length > 0) {
        const displayTz: string = await context.settings.get('displayTimezone') ?? 'UTC', displayTimezones = splitZones(displayTz);
        const text = format_extractedDates(event.author.name, extractedDates, displayTimezones);
        await context.reddit.submitComment({ id, text });
      }
    }
  },
});

export default Devvit;
