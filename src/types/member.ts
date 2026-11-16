export type Member = {
  id: string
  name: string
  gender: 'M' | 'F'
  gen: number
  status: 'alive' | 'dead'
  birth: number | null
  death: number | null
  gio: string | null
  fatherId: string | null
  motherId: string | null
  spouseOf: string | null
  note: string
  hometown: string
  bio: string
  photo?: string
}

export type Unit = {
  main: Member
  persons: Member[]
}
