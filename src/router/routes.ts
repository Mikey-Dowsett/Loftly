import { type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // Main layout routes
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/LandingPage.vue'),
        meta: {
          public: true,
        }
      },
      {
        path: '/signup',
        component: () => import('pages/SignupPage.vue'),
        meta: {
          public: true,
        }
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
        component: () => import('pages/Support Pages/PricingPage.vue'),
        meta: {
          public: true,
        }
      },
      {
        path: '/feedback',
        component: () => import('pages/FeedbackPage.vue'),
      },
      {
        path: '/privacy-policy',
        component: () => import('pages/Support Pages/PrivacyPolicy.vue'),
        meta: {
          public: true,
        }
      },
      {
        path: '/terms-of-service',
        component: () => import('pages/Support Pages/TermsOfService.vue'),
        meta: {
          public: true,
        }
      },
      // Settings with nested routes
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

  // Minimal layout routes
  {
    path: '/',
    component: () => import('layouts/MinimalLayout.vue'),
    children: [
      {
        path: '/mastodon/callback',
        component: () => import('pages/Callbacks/MastodonCallback.vue'),
      },
      {
        path: '/pixelfed/callback',
        component: () => import('pages/Callbacks/PixelfedCallback.vue'),
      },
      {
        path: '/email-confirmed',
        component: () => import('pages/Settings/ConfirmEmailPage.vue'),
      },
      {
        path: '/reset-password',
        component: () => import('pages/Settings/ForgotPasswordPage.vue'),
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Support Pages/ErrorNotFound.vue'),
  },
];

export default routes;
