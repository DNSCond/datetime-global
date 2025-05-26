// Learn more at developers.reddit.com/docs
import { CommentV2 } from '@devvit/protos/types/devvit/reddit/v2alpha/commentv2.js';
import { Devvit, TriggerContext, CommentCreateDefinition } from '@devvit/public-api';
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
function normalize_newlines(string: string) {
  return String(string).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}
function indent_codeblock(string: string) {
  return '    ' + normalize_newlines(string).replace(/\n/g, '\n    ');
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

function extractDates(text: string, defaultTimezone: string): { start: Date, end: Date | null }[] {
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

async function verifChecker(body: string, comment: CommentV2, context: TriggerContext, event: any): Promise<boolean> {
  const id = comment.id, tz: string = await context.settings.get('parseTimezone') ?? 'UTC',
    displayTz: string = await context.settings.get('displayTimezone') ?? 'UTC',
    displayTimezones = splitZones(displayTz), extractedDates = extractDates(body, tz);

  if (extractedDates.length > 0) {
    let text = `Hello u/${event.author.name}\n`;
    for (let time of extractedDates) {
      text += `\n- \`${Datetime_global(time.start, 'UTC')}\`${time.end === null ? '' : ` to \`${Datetime_global(time.end, 'UTC')}\``} (\`UTC\`)`;
      for (let tz of displayTimezones) {
        if (/UTC/i.test(tz)) continue;
        text += `\n  - \`${Datetime_global(time.start, tz)}\`${time.end === null ? '' : ` to \`${Datetime_global(time.end, tz)}\``} (\`${tz}\`)`;
      }
    }
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

// // Add a menu item to the subreddit menu for instantiating the new experience post
// Devvit.addMenuItem({
//   label: 'post inital clock',
//   location: 'subreddit',
//   forUserType: 'moderator',
//   onPress: async (_event, context) => {
//     const { reddit, ui } = context;
//     ui.showToast("Submitting your post - upon completion you'll navigate there.");

//     const subreddit = await reddit.getCurrentSubreddit();
//     const post = await reddit.submitPost({
//       title: Date(), subredditName: subreddit.name,
//       // The preview appears while the post loads
//       preview: (
//         <vstack height="100%" width="100%" alignment="middle center">
//           <text size="large">Loading ...</text>
//         </vstack>
//       ),
//     });
//     ui.navigateTo(post);
//   },
// });
//
// // Add a post type definition
// Devvit.addCustomPostType({
//   name: 'Experience Post',
//   height: 'tall',
//   render: (context) => {
//     // @ts-ignore
//     const [svgString, set_svgString] = useState('data:image/svg+xml,' + (new Datetime_local()).drawClock());
//     const [datetime, set_datetime] = useState('Datetime-loading'), [walking, set_walking] = useState(true);
//     const /*updateInterval = useInterval(() => {
//       if (walking) {
//         // @ts-ignore
//         const date = now();
//         set_svgString('data:image/svg+xml,' + date.drawClock());
//         set_datetime(date.toString());
//       }
//     }, 1000),*/ form = useForm({
//       fields: [
//         {
//           type: 'string',
//           name: 'datetime-local',
//           label: 'enter a Date',
//         },
//       ],
//       acceptLabel: 'Travel',
//       cancelLabel: 'Cancel',
//     }, function (values: any) {
//       set_walking(false); let parsedBy = 'is not a datetime';
//       const datetime_text: string = `${values['datetime-local']}`;
//       const time = chrono.parseDate(datetime_text);
//       const date = new Datetime_local(time === null ? NaN : time.getTime());
//       if (date.isValid()) {
//         parsedBy = 'is matched successfully!';
//       }
//       context.ui.showToast(`"${date}" ${parsedBy}`);
//       set_svgString('data:image/svg+xml,' + date.drawClock());
//       set_datetime(date.toString());
//     });
//
//     //updateInterval.start();
//     return (
//       <vstack height="100%" width="100%" gap="medium" alignment="center middle">
//         <image url={svgString} description="Clock"
//           imageHeight={500} imageWidth={500}
//           height="250px" width="250px" />
//         <text size="large">{`${datetime}`}</text>
//         <button onPress={async function () {
//           context.ui.showForm(form);
//         }}>set datetime</button>
//         <button disabled={true} onPress={async function () {
//           set_walking(true);
//         }}>run clock</button>
//       </vstack>
//     );
//   },
// });

// Devvit.addTrigger({
//   event: 'CommentCreate',
//   onEvent: async (event, context) => {
//     if (!event.author || !event.comment) return;
//     if (event.author.id === context.appAccountId && (event.author.id) !== undefined) {
//       return;
//     }
//     const commentBody = String(event.comment.body);
//     const finditer = findall(/u\/datetime-global\/?\s+(['"])([a-zA-Z0-9 (\-)+:]+)\1(?:,?\s*(['"])([A-Za-z_\/, ]+)\3)?/i, commentBody, true);
//     if (finditer) {
//       const date = chrono.parseDate(String(finditer[0][2]));
//       if (date !== null) {
//         const datetime = new Datetime_global(date, 'UTC'), datetimezones = String(finditer[0][4] ?? 'UTC').split(/, */), datetimezonesArray = [];
//         for (const dtZone of datetimezones) {
//           try {
//             datetimezonesArray.push(new Datetime_global(datetime, dtZone));
//           } catch {
//             // ignore failures
//           }
//         }
//         const zoned = datetimezonesArray.length > 0 ? `- \`${datetimezonesArray.map(String).join('`\n- `')}\`\n\n` : '';
//         await context.reddit.submitComment({
//           id: event.comment.id, //text: `hi u/${event.author.name}\n\nDatetime\\_global: \`${datetime}\`\n\nDatetime\\_local: \`${datetime_local}\``,
//           text: `Hi there u/${event.author.name}\n\ni computed your Datetime and got \`${datetime}\``
//             + `\n\n${zoned}I am a Bot, you can summon me by mentioning me and putting your datetime in` +
//             ` quotes (\`"\`) and a iana timezoneId in quotes after that`,
//         });
//       }
//     }
//   },
// });


export default Devvit;
