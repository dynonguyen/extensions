import { debounce, getAliasFromKeyword } from '@dcp/shared';
import { useCallback, useEffect, useRef, useState } from 'preact/compat';
import { useSearchStore } from '~/stores/search';
import { useUserOptionStore } from '~/stores/user-options';
import { searchCategoryMapping } from '~/utils/mapping';
import Chip from '../Chip';
import { useCommandStore } from '~/stores/command/index';

const AliasCategory = () => {
  const keyword = useSearchStore((state) => state.keyword);
  const aliases = useUserOptionStore((state) => state.aliases);

  const alias = getAliasFromKeyword(keyword);
  const aliasCategory = alias ? Object.entries(aliases).find(([key]) => key === alias)?.[1] : undefined;

  if (!aliasCategory) return null;

  const category = searchCategoryMapping(aliasCategory);

  return category ? <Chip {...category} /> : null;
};

export const SearchInput = () => {
  const [isCommandValid, setIsCommandValid] = useState<Boolean>(false);
  const setSearchStore = useSearchStore((state) => state.set);
  const setCommandStore = useCommandStore((state) => state.set);

  const open = useSearchStore((state) => state.open);
  const ref = useRef<HTMLInputElement>();

  const handleBotInputChange = (e: any) => {
    const value = e.target?.value;
    if (value) {
      if (value[0] === '@') {
        setCommandStore({ rawInput: value });
        setIsCommandValid(useCommandStore.getState().isExecBotCallValid());
      }
    }
  };

  const executeCommand = async () => {
    await useCommandStore.getState().exec();
    setCommandStore({ rawInput: '' });
    setIsCommandValid(false);
    if (ref.current) ref.current.value = '';
  };

  const handleEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand();
    }
  };

  const handleInputMap = (e: any) => {
    if (e.target?.value?.[0] === '@') {
      setSearchStore({ keyword: '' }); // clear search box (for some reason when you type @ really quickly, panel still shows up)
      return handleBotInputChange(e);
    } else {
      useCommandStore.getState().reset();
    }
    return handleSearchChange(e);
  };

  const handleSearchChange = useCallback(
    debounce((ev) => {
      setSearchStore({ keyword: ev.target?.value?.trimLeft() || '' });
    }, 250),
    []
  );

  useEffect(() => {
    if (open && ref.current) {
      ref.current.value = '';
      ref.current.focus();
    }
  }, [open]);

  return (
    <>
      <div class="h-15 shrink-0 w-full px-3 p-3 flex items-center justify-between">
        <input
          id="dcp-search-input"
          // @ts-ignore
          ref={ref}
          type="text"
          class="w-full h-full !border-none !outline-none !bg-transparent !text-base-content !text-base shadow-none"
          placeholder="Search for bookmarks, history,..."
          onInput={handleInputMap}
          onKeyDown={handleEnter}
          autoComplete="off"
          autoFocus
        />
        <button
          disabled={!isCommandValid}
          class="!text-base-content border-0 rounded-full text-xs font-medium transition px-2 py-2"
          onClick={() => executeCommand()}
          style={
            isCommandValid
              ? {
                  color: `rgb(var(--purple))`,
                  backgroundColor: `rgba(var(--purple), 0.2)`
                }
              : {
                  color: `rgb(var(--grey-300)) !important`,
                  backgroundColor: `rgba(var(--grey-300), 0.2)`
                }
          }
        >
          Execute
        </button>
        <AliasCategory />
      </div>
      <div class="divider" />
    </>
  );
};

export default SearchInput;
