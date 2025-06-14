import { Cookie, MessageEvent } from '@dcp/shared';
import { useEffect, useState } from 'preact/hooks';
import { pushNotification } from '~/stores/notification';
import { sendMessage } from '~/utils/helper';
import Dialog from '../Dialog';
import { useActionDialog } from '../search-action/Actions';
import CookieForm, { COOKIE_FORM_ID } from '../search-action/CookieForm';

export const ClientEventHandler = () => {
  const [openNewCookie, setOpenNewCookie] = useState(false);

  const handleToggleNewCookie = (open: boolean) => {
    useActionDialog.setState({ openModal: open });
    setOpenNewCookie(open);
  };

  const handleCreateNewCookie = async (cookie: Cookie) => {
    const isSuccess = await sendMessage<boolean>(MessageEvent.SetCookie, cookie);

    if (isSuccess) {
      pushNotification({ message: 'Added', variant: 'success' });
      handleToggleNewCookie(false);
    } else {
      pushNotification({ message: 'Failed', variant: 'error' });
    }
  };

  useEffect(() => {
    const handleNewCookieEvent = () => handleToggleNewCookie(true);

    window.addEventListener(MessageEvent.NewCookie, handleNewCookieEvent);

    return () => {
      window.removeEventListener(MessageEvent.NewCookie, handleNewCookieEvent);
    };
  }, []);

  return (
    <>
      {openNewCookie && (
        <Dialog
          open
          title="New Cookie"
          width={520}
          onClose={() => handleToggleNewCookie(false)}
          body={<CookieForm onSubmit={handleCreateNewCookie} />}
          actions={
            <div class="flex items-center justify-end gap-2">
              <button class="btn btn-grey-500" onClick={() => handleToggleNewCookie(false)}>
                Close
              </button>
              <button type="submit" form={COOKIE_FORM_ID} class="btn btn-primary">
                Save
              </button>
            </div>
          }
        />
      )}
    </>
  );
};

export default ClientEventHandler;
