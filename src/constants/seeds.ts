import { Member, Feedback, User, Log } from '../types'
import { HOME, ACTOR } from './genealogy'

const given = [
  'Hiển', 'Kiến', 'Luyện', 'Khải', 'Đạt', 'Thành', 'Lương', 'Phúc', 'Quang', 'Hưng',
  'Trí', 'Đức', 'Nghĩa', 'Bảo', 'Long', 'Dũng', 'Minh', 'Tuấn', 'Khôi', 'An',
]

const wives = [
  'Mạc Thị Sải', 'Nguyễn Thị Luân', 'Đoàn Thị Lan', 'Phạm Thị Của', 'Trần Thị Ức',
  'Lê Thị Phái', 'Vũ Thị Pha', 'Mai Thị Lan', 'Hoàng Thị Tươi', 'Bùi Thị Huyên',
  'Đỗ Thị Sen', 'Phan Thị Mai', 'Ngô Thị Hạnh', 'Đinh Thị Thu', 'Lý Thị Hoa',
  'Vương Thị Nga', 'Cao Thị Yến', 'Tạ Thị Hà',
]

const pad = (n: number) => String(n).padStart(2, '0')
const gioOf = (i: number) => `${pad((i * 7) % 28 + 1)}/${pad((i * 5) % 12 + 1)}`

function life(gen: number, k: number) {
  const b = 1524 + (gen - 1) * 26 + (k % 5)
  if (gen <= 8) return { status: 'dead' as const, birth: null, death: null, gio: gioOf(gen * 3 + k) }
  if (gen <= 12) return { status: 'dead' as const, birth: b, death: b + 58 + ((k * 3) % 15), gio: null }
  if (gen <= 14) {
    return k % 2 === 0
      ? { status: 'dead' as const, birth: b, death: b + 62, gio: null }
      : { status: 'dead' as const, birth: b, death: null, gio: k % 3 === 1 ? null : gioOf(gen + k) }
  }
  if (gen <= 16) return { status: 'dead' as const, birth: b, death: b + 55 + (k % 9), gio: gioOf(gen + k) }
  if (gen === 17) {
    return k % 2 === 0
      ? { status: 'alive' as const, birth: b, death: null, gio: null }
      : { status: 'dead' as const, birth: b, death: b + 50, gio: null }
  }
  return { status: 'alive' as const, birth: gen === 19 && k === 3 ? null : b, death: null, gio: null }
}

const out: Member[] = []
function mk(
  id: string,
  name: string,
  gender: 'M' | 'F',
  gen: number,
  k: number,
  extra: Partial<Member> = {}
) {
  out.push({
    id,
    name,
    gender,
    gen,
    ...life(gen, k),
    fatherId: null,
    motherId: null,
    spouseOf: null,
    note: '',
    hometown: HOME,
    bio: `Thuộc đời thứ ${gen} của dòng họ Nguyễn tại ${HOME}.`,
    ...extra,
  })
}

const nm = (g: number) => `Nguyễn ${g <= 17 ? 'Văn' : 'Minh'} ${given[g - 1]}`
for (let g = 1; g <= 20; g++) {
  mk(
    'a' + g,
    nm(g),
    'M',
    g,
    g,
    g > 1
      ? { fatherId: 'a' + (g - 1) }
      : { bio: 'Cụ tổ khai sinh dòng họ Nguyễn tại vùng đất Đông Triều, người dựng nhà thờ họ đầu tiên.' }
  )
}

;[1, 2, 3, 4, 8, 9, 10, 11, 12, 13, 14, 15, 17].forEach((g) =>
  mk('w' + g, wives[g - 1], 'F', g, g + 1, { spouseOf: 'a' + g })
)
mk('w3b', 'Nguyễn Thị Bích', 'F', 3, 4, { spouseOf: 'a3' })

for (let g = 3; g <= 8; g++) {
  mk(
    'b' + g,
    `Nguyễn Văn ${['Trung', 'Tâm', 'Thuận', 'Khánh', 'Hòa', 'Lộc'][g - 3]}`,
    'M',
    g,
    g + 2,
    { fatherId: g === 3 ? 'a2' : 'b' + (g - 1) }
  )
}

mk('d2', 'Nguyễn Thị Tý', 'F', 2, 1, { fatherId: 'a1' })
mk('d6', 'Nguyễn Thị Vẽ', 'F', 6, 2, { fatherId: 'a5' })
mk('d13', 'Nguyễn Thị Huệ', 'F', 13, 2, { fatherId: 'a12' })
mk('d17', 'Nguyễn Thị Hoa', 'F', 17, 2, { fatherId: 'a16', note: 'Giáo viên, Hải Phòng' })
mk('d19', 'Nguyễn Thị Thảo', 'F', 19, 2, { fatherId: 'a18' })
mk('c5', 'Nguyễn Văn Trọng', 'M', 5, 3, { fatherId: 'a4' })
mk('c18', 'Nguyễn Minh Tâm', 'M', 18, 3, { fatherId: 'a17', note: 'Kỹ sư xây dựng' })
mk('h17', 'Lê Văn Cường', 'M', 17, 2, { spouseOf: 'd17' })
mk('h13', 'Vũ Quang Thịnh', 'M', 13, 2, { spouseOf: 'd13' })
mk('h19', 'Đặng Hoàng Nam', 'M', 19, 1, { spouseOf: 'd19' })

const byId = Object.fromEntries(out.map((m) => [m.id, m]))
out.forEach((m) => {
  if (m.fatherId && !m.spouseOf) {
    const w = out.find((x) => x.spouseOf === m.fatherId && x.gender === 'F')
    m.motherId = w ? w.id : null
  }
})

byId.a17.note = 'Giáo viên'
byId.a19.note = 'Sinh viên'
byId.a18.note = 'Kinh doanh, Hà Nội'
byId.a16.note = 'Bác sĩ'

export const SEED_MEMBERS = out

export const SEED_FEEDBACKS: Feedback[] = [
  {
    id: 'f1',
    memberId: 'a15',
    type: 'wrong',
    content: 'Năm mất của cụ ghi trong gia phả giấy là một năm khác, kính mong Tộc trưởng đối chiếu lại.',
    status: 'pending',
    reply: '',
    author: ACTOR.viewer,
    createdAt: '2024-05-02T09:20:00',
  },
  {
    id: 'f2',
    memberId: 'a17',
    type: 'other',
    content: 'Xin bổ sung nghề nghiệp của ông trong phần ghi chú.',
    status: 'accepted',
    reply: 'Đã cập nhật theo góp ý. Cảm ơn con.',
    author: ACTOR.viewer,
    createdAt: '2024-04-18T15:05:00',
  },
  {
    id: 'f3',
    memberId: 'd17',
    type: 'missing',
    content: 'Thiếu một người con của bà ở đời 18, hiện sống tại Hải Phòng.',
    status: 'pending',
    reply: '',
    author: 'Nguyễn Thị Hoa',
    createdAt: '2024-05-04T20:41:00',
  },
  {
    id: 'f4',
    memberId: 'b6',
    type: 'wrong',
    content: 'Tên đệm của cụ có thể là "Đình".',
    status: 'rejected',
    reply: 'Chưa có căn cứ trong gia phả gốc, xin gửi thêm tư liệu.',
    author: 'Nguyễn Văn Bình',
    createdAt: '2024-03-09T08:00:00',
  },
]

export const SEED_USERS: User[] = [
  { id: 'u1', name: ACTOR.viewer, email: 'an.nguyen@gmail.com', role: 'viewer', locked: false },
  { id: 'u2', name: ACTOR.chief, email: 'toctruong.nguyen@gmail.com', role: 'chief', locked: false },
  { id: 'u3', name: ACTOR.admin, email: 'admin.nguyen@gmail.com', role: 'admin', locked: false },
  { id: 'u4', name: 'Nguyễn Thị Hoa', email: 'hoa.nguyen@gmail.com', role: 'viewer', locked: false },
  { id: 'u5', name: 'Nguyễn Văn Bình', email: 'binh.nv@gmail.com', role: 'viewer', locked: true },
]

export const SEED_LOGS: Log[] = [
  { id: 'l1', who: ACTOR.admin, what: 'Cập nhật ghi chú của Nguyễn Văn Trí', at: '2024-05-01T10:12:00' },
  { id: 'l2', who: ACTOR.chief, what: 'Chấp nhận góp ý về Nguyễn Văn Đức', at: '2024-04-18T16:30:00' },
  { id: 'l3', who: ACTOR.admin, what: 'Thêm thành viên Nguyễn Thị Thảo', at: '2024-04-02T08:45:00' },
  { id: 'l4', who: ACTOR.chief, what: 'Từ chối góp ý về Nguyễn Văn Thuận', at: '2024-03-09T11:00:00' },
]
