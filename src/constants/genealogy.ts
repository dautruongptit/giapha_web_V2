export const HOME = 'Đông Triều, Quảng Ninh'
export const FOUNDED = 2024
export const MAXGEN = 20

export const TYPE_LABEL = {
  wrong: 'Sai thông tin',
  missing: 'Thiếu người',
  other: 'Khác',
} as const

export const STATUS_LABEL = {
  pending: 'Chờ duyệt',
  accepted: 'Đã chấp nhận',
  rejected: 'Đã từ chối',
} as const

export const ROLE_LABEL = {
  viewer: 'Viewer',
  chief: 'Tộc trưởng',
  admin: 'Admin',
} as const

export const ACTOR = {
  viewer: 'Nguyễn Văn An',
  chief: 'Nguyễn Văn Tộc',
  admin: 'Nguyễn Quản Trị',
} as const

export const REL = {
  son: { label: 'Con trai', color: '#1d4ed8' },
  daughter: { label: 'Con gái', color: '#be185d' },
  dil: { label: 'Con dâu', color: '#15803d' },
  sil: { label: 'Con rể', color: '#c2410c' },
} as const
