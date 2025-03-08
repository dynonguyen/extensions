import { pick } from '@dcp/shared';
import { useCommandStore } from '~/stores/command';

export const CommandResult = () => {
  const { error, result } = useCommandStore((state) => pick(state, ['error', 'getBotCall', 'result']));

  // useCommandStore

  if (!result) return null;

  if (error) {
    return <div class="my-6 text-center text-grey-500">🥹 🐞 🐞 Something went wrong 🐞 🐞 🥹</div>;
  }

  return (
    <>
      <div id="dcp-command-result-wrapper">
        <div class="grid h-[400px] w-full p-3">
          <div class="h-full rounded-lg" style={{ background: `rgba(var(--base-50))` }}>
            <div class="p-3">
              <p class="m-0 text-white">{result}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="divider" />
    </>
  );
};

export default CommandResult;
