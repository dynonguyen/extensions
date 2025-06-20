import { Bot, ExectuionValidator, Execution } from '..';

const openYoutube: Execution = () => {
  return {
    type: 'action',
    action: () => window.location.replace('https://youtube.com')
  };
};
const openYoutubeValidator: ExectuionValidator = (args) => {
  if (!args) return true;
  if (args.length === 0) return true;
  return false;
};

const YoutubeBot: Bot = {
  name: 'Youtube',
  alias: 'youtube',
  botCommandSet: [
    {
      name: 'Open Yotube',
      alias: 'open',
      flags: [],
      validateArgs: openYoutubeValidator,
      exec: openYoutube
    }
  ]
};

export { openYoutube, openYoutubeValidator, YoutubeBot };
