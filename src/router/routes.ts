import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('src/pages/LandingPage.vue'),
  },

  {
    path: '/post',
    component: () => import('pages/PostPage.vue'),
  },

  {
    path: '/history',
    component: () => import('pages/PostHistoryPage.vue'),
  },

  {
    path: '/settings',
    component: () => import('pages/SettingsPage.vue'),
    children: [
      {
        path: '',
        redirect: '/settings/account',
      },
      {
        path: '/settings/account',
        component: () => import('components/Settings/AccountSettings.vue'),
      },
      {
        path: '/settings/connections',
        component: () => import('components/Settings/ConnectionSettings.vue'),
      },
    ],
  },

  {
    path: '/mastodon/callback',
    component: () => import('pages/MastodonCallback.vue'),
  },

  {
    path: '/pixelfed/callback',
    component: () => import('pages/PixelfedCallback.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
