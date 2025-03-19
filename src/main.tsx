// Learn more at developers.reddit.com/docs
import { Devvit, useState, useInterval, useForm } from '@devvit/public-api';
import * as chrono from 'chrono-node';
import { Datetime_local } from './Datetime_local.ts';
import { Datetime_global } from 'datetime_global/Datetime_global.ts';

Devvit.configure({ redditAPI: true, });


// Add a menu item to the subreddit menu for instantiating the new experience post
Devvit.addMenuItem({
  label: 'post inital clock',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    ui.showToast("Submitting your post - upon completion you'll navigate there.");

    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: Date(), subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    ui.navigateTo(post);
  },
});

// Add a post type definition
Devvit.addCustomPostType({
  name: 'Experience Post',
  height: 'tall',
  render: (context) => {
    // @ts-ignore
    const [svgString, set_svgString] = useState('data:image/svg+xml,' + (new Datetime_local()).drawClock());
    const [datetime, set_datetime] = useState('Datetime-loading'), [walking, set_walking] = useState(true);
    const /*updateInterval = useInterval(() => {
      if (walking) {
        // @ts-ignore
        const date = now();
        set_svgString('data:image/svg+xml,' + date.drawClock());
        set_datetime(date.toString());
      }
    }, 1000),*/ form = useForm({
      fields: [
        {
          type: 'string',
          name: 'datetime-local',
          label: 'enter a Date',
        },
      ],
      acceptLabel: 'Travel',
      cancelLabel: 'Cancel',
    }, function (values: any) {
      set_walking(false); let parsedBy = 'is not a datetime';
      const datetime_text: string = `${values['datetime-local']}`;
      const time = chrono.parseDate(datetime_text);
      const date = new Datetime_local(time === null ? NaN : time.getTime());
      if (date.isValid()) {
        parsedBy = 'is matched successfully!';
      }
      context.ui.showToast(`"${date}" ${parsedBy}`);
      set_svgString('data:image/svg+xml,' + date.drawClock());
      set_datetime(date.toString());
    });

    //updateInterval.start();
    return (
      <vstack height="100%" width="100%" gap="medium" alignment="center middle">
        <image url={svgString} description="Clock"
          imageHeight={500} imageWidth={500}
          height="250px" width="250px" />
        <text size="large">{`${datetime}`}</text>
        <button onPress={async function () {
          context.ui.showForm(form);
        }}>set datetime</button>
        <button disabled={true} onPress={async function () {
          set_walking(true);
        }}>run clock</button>
      </vstack>
    );
  },
});

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

Devvit.addTrigger({
  event: 'CommentCreate',
  onEvent: async (event, context) => {
    if (!event.author || !event.comment) return;
    if (event.author.id === context.appAccountId && (event.author.id) !== undefined) {
      return;
    }
    const commentBody = String(event.comment.body);
    const finditer = findall(/u(?:ser)?\/datetime-global\/?\s+(['"])([a-zA-Z0-9 (\-)+:]+)\1(?:,?\s*(['"])([A-Za-z_\/, ]+)\3)?/i, commentBody, true);
    if (finditer) {
      const date = chrono.parseDate(String(finditer[0][2]));
      if (date !== null) {
        const datetime = new Datetime_global(date, 'UTC'), datetimezones = String(finditer[0][4] ?? 'UTC').split(/, */), datetimezonesArray = [];
        for (const dtZone of datetimezones) {
          try {
            datetimezonesArray.push(new Datetime_global(datetime, dtZone));
          } catch {
            // ignore failures
          }
        }
        const zoned = datetimezonesArray.length > 0 ? `- \`${datetimezonesArray.map(String).join('`\n- `')}\`\n\n` : '';
        await context.reddit.submitComment({
          id: event.comment.id, //text: `hi u/${event.author.name}\n\nDatetime\\_global: \`${datetime}\`\n\nDatetime\\_local: \`${datetime_local}\``,
          text: `Hi there u/${event.author.name}\n\ni computed your Datetime and got \`${datetime}\``
            + `\n\n${zoned}I am a Bot, you can summon me by mentioning me and putting your datetime in` +
            ` quotes (\`"\`) and a iana timezoneId in quotes after that`,
        });
      }
    }
  },
});


export default Devvit;
