import { createContext, useContext, useState, ReactNode } from 'react'
import { Member, Feedback, User, Log, Role } from '../types'
import { SEED_MEMBERS, SEED_FEEDBACKS, SEED_USERS, SEED_LOGS, ACTOR } from '../constants'
import { go } from './useRouter'

type AppState = {
  role: Role
  setRole: (r: Role) => void
  loggedIn: boolean
  login: () => void
  logout: () => void
  actor: string
  members: Member[]
  byId: Record<string, Member>
  saveMember: (m: Member, isNew: boolean) => void
  deleteMember: (id: string) => void
  feedbacks: Feedback[]
  addFeedback: (f: Omit<Feedback, 'id' | 'status' | 'reply' | 'author' | 'createdAt'>) => void
  decide: (id: string, status: 'accepted' | 'rejected', reply: string) => void
  users: User[]
  setUserRole: (id: string, r: Role) => void
  toggleLock: (id: string) => void
  logs: Log[]
  openId: string | null
  openMember: (id: string | null) => void
}

const Ctx = createContext<AppState>(null as any)

export const useApp = () => useContext(Ctx)

let seq = 100

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('viewer')
  const [loggedIn, setLoggedIn] = useState(false)
  const [members, setMembers] = useState(SEED_MEMBERS)
  const [feedbacks, setFeedbacks] = useState(SEED_FEEDBACKS)
  const [users, setUsers] = useState(SEED_USERS)
  const [logs, setLogs] = useState(SEED_LOGS)
  const [openId, openMember] = useState<string | null>(null)

  const actor = ACTOR[role]
  const byId = Object.fromEntries(members.map((m) => [m.id, m]))

  const log = (what: string) =>
    setLogs((l) => [{ id: 'l' + ++seq, who: actor, what, at: new Date().toISOString() }, ...l])

  const value: AppState = {
    role,
    setRole,
    loggedIn,
    login: () => setLoggedIn(true),
    logout: () => {
      setLoggedIn(false)
      go('/')
    },
    actor,
    members,
    byId,
    saveMember: (m, isNew) => {
      setMembers((l) => (isNew ? [...l, m] : l.map((x) => (x.id === m.id ? m : x))))
      log(`${isNew ? 'Thêm thành viên' : 'Cập nhật thành viên'} ${m.name}`)
    },
    deleteMember: (id) => {
      log(`Xóa thành viên ${byId[id]?.name}`)
      setMembers((l) => l.filter((x) => x.id !== id))
    },
    feedbacks,
    addFeedback: (f) =>
      setFeedbacks((l) => [
        {
          ...f,
          id: 'f' + ++seq,
          status: 'pending',
          reply: '',
          author: actor,
          createdAt: new Date().toISOString(),
        },
        ...l,
      ]),
    decide: (id, status, reply) => {
      const f = feedbacks.find((x) => x.id === id)!
      setFeedbacks((l) => l.map((x) => (x.id === id ? { ...x, status, reply } : x)))
      log(`${status === 'accepted' ? 'Chấp nhận' : 'Từ chối'} góp ý về ${byId[f.memberId]?.name}`)
    },
    users,
    setUserRole: (id, r) => {
      setUsers((l) => l.map((u) => (u.id === id ? { ...u, role: r } : u)))
      log(`Đổi vai trò người dùng ${users.find((u) => u.id === id)?.name} thành ${r}`)
    },
    toggleLock: (id) => {
      const u = users.find((x) => x.id === id)!
      setUsers((l) => l.map((x) => (x.id === id ? { ...x, locked: !x.locked } : x)))
      log(`${u.locked ? 'Mở khóa' : 'Khóa'} tài khoản ${u.name}`)
    },
    logs,
    openId,
    openMember,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
