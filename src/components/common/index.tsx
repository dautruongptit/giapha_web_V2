import { ReactNode } from 'react'
import { useApp, go } from '../../context'
import { Role } from '../../types'
import { ROLE_LABEL, STATUS_LABEL } from '../../constants'

export function RoleSwitcher({ dark = true }: { dark?: boolean }) {
  const { role, setRole } = useApp()
  return (
    <div
      className={`flex items-center gap-1 rounded-md p-0.5 text-xs ${
        dark ? 'bg-black/25' : 'bg-stone-100 border border-stone-200'
      }`}
      role="group"
      aria-label="Chuyển vai trò xem thử"
    >
      {(['viewer', 'chief', 'admin'] as Role[]).map((r) => (
        <button
          key={r}
          onClick={() => {
            setRole(r)
            if (location.hash.startsWith('#/admin') && r === 'viewer') go('/')
          }}
          className={`px-2.5 py-1 rounded transition-colors ${
            role === r
              ? 'bg-gold text-maroon-dark font-semibold shadow-sm'
              : dark
              ? 'text-amber-100/80 hover:text-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          {ROLE_LABEL[r]}
        </button>
      ))}
    </div>
  )
}

export function Badge({ status }: { status: 'pending' | 'accepted' | 'rejected' }) {
  const c = {
    pending: 'bg-amber-100 text-amber-900 border-amber-300',
    accepted: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    rejected: 'bg-red-100 text-red-900 border-red-300',
  }[status]
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${c}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

export function Skeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Đang tải">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skel h-14" />
      ))}
    </div>
  )
}

export function Empty({
  title,
  text,
  action,
}: {
  title: string
  text?: string
  action?: ReactNode
}) {
  return (
    <div className="text-center py-12 px-4 fade">
      <div className="mx-auto mb-3 h-12 w-12 rounded-full border-2 border-bronze/50 flex items-center justify-center text-bronze font-serif text-xl">
        ∅
      </div>
      <p className="font-serif font-semibold text-brown">{title}</p>
      {text && <p className="text-sm text-brown/70 mt-1">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({
  title,
  text,
  action,
}: {
  title: string
  text?: string
  action?: ReactNode
}) {
  return (
    <div className="text-center py-12 px-4 fade">
      <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-red-100 border border-red-300 flex items-center justify-center text-red-800 font-bold text-xl">
        !
      </div>
      <p className="font-serif font-semibold text-red-900">{title}</p>
      {text && <p className="text-sm text-brown/70 mt-1">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Confirm({
  title,
  text,
  okLabel,
  onOk,
  onCancel,
}: {
  title: string
  text: string
  okLabel: string
  onOk: () => void
  onCancel: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg max-w-sm w-full p-5 shadow-xl fade">
        <h3 className="font-serif font-bold text-lg text-red-900">{title}</h3>
        <p className="text-sm text-stone-700 mt-2">{text}</p>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onCancel} className="px-4 py-2 rounded border border-stone-300 text-sm">
            Hủy
          </button>
          <button
            onClick={onOk}
            className="px-4 py-2 rounded bg-red-700 hover:bg-red-800 text-white text-sm font-semibold"
          >
            {okLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export const btnPrimary =
  'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded bg-maroon hover:bg-maroon-dark text-amber-50 font-medium text-sm transition-colors shadow-sm disabled:opacity-50'
