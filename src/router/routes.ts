import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/LandingPage.vue'),
      },
      {
        path: '/signup',
        component: () => import('pages/SignupPage.vue'),
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
        path: '/pricing',
        component: () => import('pages/PricingPage.vue'),
      },
      {
        path: '/feedback',
        component: () => import('pages/FeedbackPage.vue'),
      },
      {
        path: '/settings',
        component: () => import('pages/Settings/SettingsPage.vue'),
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
          {
            path: '/settings/subscription',
            component: () => import('components/Settings/SubscriptionSettings.vue'),
          },
        ],
      },
    ]
  },

  {
    path: '/mastodon/callback',
    component: () => import('layouts/MinimalLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Callbacks/MastodonCallback.vue') },
    ],
  },

  {
    path: '/pixelfed/callback',
    component: () => import('layouts/MinimalLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Callbacks/PixelfedCallback.vue') },
    ],
  },

  {
    path: '/email-confirmed',
    component: () => import('layouts/MinimalLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Settings/ConfirmEmailPage.vue') },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
