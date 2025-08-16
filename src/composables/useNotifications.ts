import { getCurrentInstance } from 'vue';


export function useNotify() {
  const app = getCurrentInstance()?.appContext.app;
  const notify = app?.config.globalProperties.$notify;

  function notifySuccess(message: string) {
    notify?.success(message);
  }

  function notifyError(message: string) {
    notify?.error(message);
  }

  function notifyWarning(message: string) {
    notify?.warning(message);
  }

  function notifyInfo(message: string) {
    notify?.info(message);
  }

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
  };
}
