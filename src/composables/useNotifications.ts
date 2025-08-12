import { useQuasar } from 'quasar';


export function useNotify() {
  const $q = useQuasar();

  function notifySuccess(message: string) {
    $q.notify({
      type: 'positive',
      message,
      position: 'top-left',
      icon: 'fa-solid fa-check',
      timeout: 5000,
      progress: true,
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

  function notifyError(message: string) {
    $q.notify({
      type: 'negative',
      message,
      position: 'top-left',
      icon: 'fa-solid fa-exclamation',
      timeout: 5000,
      progress: true,
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

  function notifyWarning(message: string) {
    $q.notify({
      type: 'warning',
      message,
      position: 'top-left',
      icon: 'fa-solid fa-triangle-exclamation',
      timeout: 5000,
      progress: true,
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
      icon: 'fa-solid fa-info',
      timeout: 5000,
      progress: true,
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
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
  };
}
