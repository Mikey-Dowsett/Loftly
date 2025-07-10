export type LinkedAccount = {
  id: string
  user_id: string
  platform: string
  handle: string
  account_url?: string
  access_token: string
  refresh_token?: string
  token_expires_at?: string
  created_at: string
  token_count: number
}
