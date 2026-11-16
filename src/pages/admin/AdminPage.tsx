import { useApp, useRoute, go } from '../../context'
import { ROLE_LABEL } from '../../constants'
import { ErrorState, RoleSwitcher } from '../../components/common'
import { DashboardTab } from './DashboardTab'
import { MembersTab } from './MembersTab'
import { FeedbacksTab } from './FeedbacksTab'
import { UsersTab } from './UsersTab'
import { AuditLogsTab } from './AuditLogsTab'

const primary =
  'rounded-md bg-maroon hover:bg-maroon-dark text-white font-semibold px-4 py-2 text-sm shadow-sm transition-colors'

export function AdminPage() {
  const { role, loggedIn } = useApp()
  const route = useRoute()
  const sub = route.replace('/admin', '') || '/'

  const nav = [
    ['/', 'Tổng quan', ['chief', 'admin']],
    ['/members', 'Quản lý thành viên', ['admin']],
    ['/feedbacks', 'Quản lý góp ý', ['chief', 'admin']],
    ['/users', 'Quản lý người dùng', ['admin']],
    ['/logs', 'Nhật ký thay đổi', ['admin']],
  ] as const

  const allowed = (r: readonly string[]) => r.includes(role)
  const cur = nav.find((n) => n[0] === sub) || nav[0]

  let body
  if (!loggedIn) {
    body = (
      <ErrorState
        title="Chưa đăng nhập"
        text="Xin đăng nhập để vào trang quản trị."
        action={
          <button className={primary} onClick={() => go('/')}>
            Về trang đăng nhập
          </button>
        }
      />
    )
  } else if (role === 'viewer' || !allowed(cur[2])) {
    body = (
      <ErrorState
        title="Không có quyền truy cập"
        text="Tài khoản hiện tại không được phép xem mục này."
        action={
          <button className={primary} onClick={() => go(role === 'viewer' ? '/' : '/admin')}>
            Quay lại
          </button>
        }
      />
    )
  } else {
    body =
      sub === '/members' ? (
        <MembersTab />
      ) : sub.startsWith('/feedbacks') ? (
        <FeedbacksTab />
      ) : sub === '/users' ? (
        <UsersTab />
      ) : sub === '/logs' ? (
        <AuditLogsTab />
      ) : (
        <DashboardTab />
      )
  }

  return (
    <div className="min-h-dvh bg-stone-50 text-stone-800 md:flex">
      <aside className="md:w-60 md:min-h-dvh bg-white border-b md:border-b-0 md:border-r border-stone-200 shrink-0">
        <div className="px-4 py-4 flex md:block items-center justify-between">
          <div>
            <div className="font-serif font-bold text-maroon text-lg leading-tight">
              Quản trị gia phả
            </div>
            <div className="text-xs text-stone-500">Dòng họ Nguyễn</div>
          </div>
        </div>
        <nav className="flex md:flex-col overflow-x-auto px-2 pb-2 gap-1">
          {nav
            .filter((n) => role !== 'viewer' && allowed(n[2]))
            .map((n) => (
              <a
                key={n[0]}
                href={'#/admin' + (n[0] === '/' ? '' : n[0])}
                className={`px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors ${
                  cur[0] === n[0]
                    ? 'bg-maroon text-white font-semibold'
                    : 'text-stone-700 hover:bg-amber-50'
                }`}
              >
                {n[1]}
              </a>
            ))}
          <a
            href="#/"
            className="px-3 py-2 rounded-md text-sm text-stone-500 hover:bg-amber-50 whitespace-nowrap md:mt-4 md:border-t md:border-stone-200 transition-colors"
          >
            ← Về giao diện Viewer
          </a>
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="h-14 bg-white border-b border-stone-200 flex items-center justify-between px-4 sticky top-0 z-30 gap-2">
          <h1 className="font-semibold text-stone-900">{cur[1]}</h1>
          <div className="flex items-center gap-3">
            <RoleSwitcher dark={false} />
            <span className="hidden sm:inline text-sm text-stone-600">{ROLE_LABEL[role]}</span>
          </div>
        </div>
        <div className="p-4 md:p-6 max-w-6xl">{body}</div>
      </main>
    </div>
  )
}
