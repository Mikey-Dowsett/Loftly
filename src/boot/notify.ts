import { boot } from 'quasar/wrappers';

export default boot(({ app }) => {
  // Attach a global notify helper
  app.config.globalProperties.$notify = {
    success(message: string) {
      app.config.globalProperties.$q.notify({
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
            handler: () => {}
          }
        ]
      });
    },
    error(message: string) {
      app.config.globalProperties.$q.notify({
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
            handler: () => {}
          }
        ]
      });
    },
    warning(message: string) {
      app.config.globalProperties.$q.notify({
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
            handler: () => {}
          }
        ]
      });
    },
    info(message: string) {
      app.config.globalProperties.$q.notify({
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
            handler: () => {}
          }
        ]
      });
    }
  };
});
