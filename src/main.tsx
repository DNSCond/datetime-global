// Learn more at developers.reddit.com/docs
import { Devvit, useState, useInterval, useForm } from '@devvit/public-api';
import * as chrono from 'chrono-node';
import { Datetime_local } from './Datetime_local.ts';

Devvit.configure({
  redditAPI: true,
});

const now = function (): Datetime_local {
  return new Datetime_local(Datetime_local.zeroms());
};

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

export default Devvit;
