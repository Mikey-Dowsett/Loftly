export type ConnectedAccount = {
  id: number,
  user_id: number,
  platform: string,
  handle: string,
  account_url: string,
  did: string,
  app_password: string,
  access_token: string,
  refresh_token: string,
  token_expires_at: string,
  instance: string,
  created_at: string,
  enabled: boolean,
  lemmy_communities: {
    instance: string,
    community_name: string,
    community_id: number,
  }[],
}

export type Instances = {
  id: number,
  platform: string,
  instance: string,
  client_key: string,
  client_secret: string,
}

export type Posts = {
  id: number,
  user_id: string,
  content: string,
  status: string,
  created_at: string,
}

export type AccountPost = {
  id: number,
  post_id: number,
  user_id: string,
  platform: string,
  handle: string,
  status: string,
  message: string,
  post_url: string,
  external_post_id: string,
  instance: string,
  created_at: string,
}

export type Plans = {
  id: number,
  name: string,
  price_monthly: number,
  price_yearly: number,
  account_limit: number,
  post_limit: number,
  ai_limit: number,
  platform_access: string[],
  history_days: number,
  schedule_limit_days: number,
  image_limit: number,
  video_access: boolean,
}

export type SubscriptionModel = {
  id: number,
  user_id: string,
  plan_name: PlanTiers,
  stripe_customer_id: string,
  subscription_status: string,
  subscription_price_id: string,
  subscription_ends_at: string,
  email: string,
}

export type UsageModel = {
  user_id: string,
  post_count: number,
  post_last_reset: string,
  ai_usage: number,
  ai_last_reset: string,
}

export enum Platform {
  mastodon = 'mastodon',
  bluesky = 'bluesky',
  pixelfed = 'pixelfed',
  lemmy = 'lemmy',
}

export enum PlanTiers {
  free = 0,
  indie = 1,
  creator = 2,
  business = 3,
}

export const PlanNameToEnum: Record<string, PlanTiers> = {
  free: PlanTiers.free,
  indie: PlanTiers.indie,
  creator: PlanTiers.creator,
  business: PlanTiers.business,
};
