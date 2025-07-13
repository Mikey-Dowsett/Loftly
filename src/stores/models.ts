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
  created_at: string,
  enabled: boolean,
}

export type Instances = {
  id: number,
  platform: string,
  instance: string,
  client_key: string,
  client_secret: string,
}
