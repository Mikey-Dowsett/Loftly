import { useQuasar } from 'quasar';


export function useNotify() {
  const $q = useQuasar();

  function notifyError(message: string) {
    $q.notify({
      type: 'negative',
      message,
      position: 'top-left',
      timeout: 5000,
      icon: 'fa-solid fa-exclamation',
      actions: [
        {
          icon: 'fa-solid fa-xmark',
          color: 'white',
          handler: () => {
          }
        }
      ]
    });
  }

  function notifyInfo(message: string) {
    $q.notify({
      type: 'info',
      message,
      position: 'top-left',
      timeout: 5000,
      icon: 'fa-solid fa-info',
      actions: [
        {
          icon: 'fa-solid fa-xmark',
          color: 'white',
          handler: () => {
          }
        }
      ]
    });
  }

  function notifySuccess(message: string) {
    $q.notify({
      type: 'positive',
      message,
      position: 'top-left',
      timeout: 5000,
      icon: 'fa-solid fa-check',
      actions: [
        {
          icon: 'fa-solid fa-xmark',
          color: 'white',
          handler: () => {
          }
        }
      ]
    });
  }

  return {
    notifyError,
    notifyInfo,
    notifySuccess
  };
}
