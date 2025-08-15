import { boot } from 'quasar/wrappers'
import { Notify } from 'quasar'
import { useAuthStore } from 'stores'
import { type Router } from 'vue-router'

export default boot(({ router }: { router: Router }) => {
  router.beforeEach(async (to) => {
    const auth = useAuthStore()

    if(!auth.user) {
      await auth.init();
    }

    const isLoggedIn = !!auth.user
    const isPublic = to.meta.public === true

    if (!isLoggedIn && !isPublic) {
      Notify.create({
        type: 'negative',
        message: 'Please login to access this page',
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
      return { path: '/' }
    }

    return true;
  })
})
