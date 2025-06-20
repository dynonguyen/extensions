import { Bot, ExectuionValidator, Execution } from '..';

const runEcho: Execution = (args) => {
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
const runEchoValidator: ExectuionValidator = (args) => {
  if (!args) return false;
  if (args[0] === '') return false;
  return !!args.length;
};

const ShellBot: Bot = {
  name: 'Shell Utils',
  alias: 'shell',
  botCommandSet: [
    {
      name: 'Run the shell echo command',
      alias: 'echo',
      flags: [],
      validateArgs: runEchoValidator,
      exec: runEcho
    }
  ]
};

export { ShellBot };
