import isEqual from 'react-fast-compare';
import { createWithEqualityFn } from 'zustand/traditional';
import {
  askChatGpt,
  askChatGptValidator,
  ChatGptBot,
  openChatGpt,
  openChatGptValidator
} from './bot-executions/chatgpt';
import { openYoutube, openYoutubeValidator, YoutubeBot } from './bot-executions/youtube';
import { ShellBot } from './bot-executions/shell';

interface MessageResult {
  type: 'message';
  message: string;
}

interface ActionResult {
  type: 'action';
  action: () => void;
}

interface ErrorResult {
  type: 'error';
  error: Error;
}

type Result = MessageResult | ActionResult | ErrorResult;

export type Execution = (args?: string[]) => Result;
export type ExectuionValidator = (args?: string[]) => Boolean;

interface Flags {
  name: string;
  alias: string;
}
interface Command {
  name: string;
  alias: string;
  flags: Flags[];
  validateArgs: ExectuionValidator;
  exec?: Execution;
}
export interface Bot {
  name: string;
  alias: string;
  botCommandSet: Command[];
}

// ---

type CommandState = {
  init: boolean;
  open: boolean;
  openAction: boolean;
  processing: boolean;
  result?: string | null;
  error?: Error | null;
  focusedIndex: number;
  rawInput: string;
};

type CommandAction = {
  setOpen: (open?: boolean | 'toggle') => void;
  set: (state: Partial<CommandState> | ((prev: CommandState) => Partial<CommandState>)) => void;
  reset: () => void;
  isExecBotCallValid: () => Boolean;
  exec: () => Promise<Result | null>;
  getBotCall: () => string;
  getBot: () => Bot | undefined;
  getBotCommand: () => Command | undefined;
  getBotCommandArgs: () => string[];
};

export type CommandStore = CommandState & CommandAction;

const bots: Bot[] = [ChatGptBot, YoutubeBot, ShellBot];

const DEFAULT_STATE: CommandState = {
  init: false,
  open: false,
  openAction: false,
  processing: false,
  rawInput: '',
  result: null,
  focusedIndex: 0
};

export const useCommandStore = createWithEqualityFn<CommandStore>(
  (set, get) => ({
    ...DEFAULT_STATE,
    isExecBotCallValid: () => {
      const command = get().getBotCommand();
      const args = get().getBotCommandArgs();
      if (!command) return false;
      if (!command.validateArgs(args)) return false;
      set({
        exec: async () => {
          const exec = command.exec;
          const args = get().getBotCommandArgs();
          if (exec) {
            const result = await exec(args);
            switch (result.type) {
              case 'error':
                console.error(result.error.message);
                set({ error: result.error });
                return result;
              case 'action':
                result.action();
                return result;
              case 'message':
                set({ result: result.message });
                return result;
              default:
            }
            return result;
          }
          return {
            type: 'error',
            error: new Error('Exec not found')
          };
        }
      });
      return true;
    },
    exec: async () => null,
    setOpen: (open) => {
      let isOpen = open === 'toggle' ? !get().open : open;

      const rootElem = document.getElementById('_dcp_root_');

      if (rootElem) {
        if (isOpen) rootElem.style.removeProperty('display');
        else rootElem.style.display = 'none';
      }

      set({ open: isOpen, init: true, ...(isOpen === false && { result: '', focusedIndex: 0 }) });
    },
    getBotCall: () => {
      const input = get().rawInput;
      if (input) {
        if (input[0] == '@') {
          return input.slice(1);
        }
        return '';
      }
      return '';
    },
    getBot: () => {
      const botCall = get().getBotCall();
      const splitBotCall = botCall.split(' ');
      const botAlias = splitBotCall[0];
      return bots.find((b) => b.alias === botAlias);
    },
    getBotCommand: () => {
      const botCall = get().getBotCall();
      const splitBotCall = botCall.split(' ');
      const botCommandAlias = splitBotCall[1];
      const botCommand = get()
        .getBot()
        ?.botCommandSet.find((s) => s.alias === botCommandAlias);
      return botCommand;
    },
    getBotCommandArgs: () => {
      const botCall = get().getBotCall();
      const splitBotCall = botCall.split(' ');
      return splitBotCall.slice(2);
    },
    reset: () => set({ ...DEFAULT_STATE }),
    set
  }),
  isEqual
);
