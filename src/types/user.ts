export type Role = 'viewer' | 'chief' | 'admin'

export type User = {
  id: string
  name: string
  email: string
  role: Role
  locked: boolean
}

export type Log = {
  id: string
  who: string
  what: string
  at: string
}
