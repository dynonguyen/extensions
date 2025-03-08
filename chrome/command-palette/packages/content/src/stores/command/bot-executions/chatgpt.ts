import { Bot, ExectuionValidator, Execution } from '..';

const openChatGpt: Execution = () => {
  return { type: 'action', action: () => window.location.replace('https://chat.com') };
};
const openChatGptValidator: ExectuionValidator = (args) => {
  if (!args) return true;
  if (args.length === 0) return true;
  return false;
};

const askChatGpt: Execution = (args) => {
  if (!args)
    return {
      type: 'error',
      error: new Error('No command found')
    };
  return {
    type: 'message',
    message: args.join(' ')
  };
};
const askChatGptValidator: ExectuionValidator = (args) => {
  if (!args) return false;
  if (args[0] === '') return false;
  return !!args.length;
};

const ChatGptBot: Bot = {
  name: 'Chat GPT',
  alias: 'chatgpt',
  botCommandSet: [
    {
      name: 'Ask a question',
      alias: 'ask',
      flags: [],
      validateArgs: askChatGptValidator,
      exec: askChatGpt
    },
    {
      name: 'Open chatgpt',
      alias: 'open',
      flags: [],
      validateArgs: openChatGptValidator,
      exec: openChatGpt
    }
  ]
};

export { openChatGpt, openChatGptValidator, askChatGpt, askChatGptValidator, ChatGptBot };
