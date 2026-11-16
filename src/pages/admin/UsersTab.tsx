import { useState } from 'react'
import { useApp, useLoading } from '../../context'
import { Role } from '../../types'
import { ROLE_LABEL } from '../../constants'
import { Skeleton, Confirm } from '../../components/common'

const outline =
  'rounded-md border border-stone-300 hover:bg-stone-50 px-3 py-2 text-sm bg-white transition-colors'
const danger =
  'rounded-md bg-red-700 hover:bg-red-800 text-white font-semibold px-3 py-2 text-sm transition-colors'

export function UsersTab() {
  const { users, setUserRole, toggleLock } = useApp()
  const [lock, setLock] = useState<string | null>(null)
  const loading = useLoading('u', 500)
  const target = users.find((u) => u.id === lock)

  if (loading) return <Skeleton />

  return (
    <div className="bg-white border border-stone-200 rounded-lg overflow-x-auto fade shadow-sm">
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-amber-50 text-left text-stone-600">
          <tr>
            {['Người dùng', 'Email', 'Vai trò', 'Tình trạng', ''].map((h) => (
              <th key={h} className="px-3 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-stone-100">
              <td className="px-3 py-2.5 font-medium text-stone-900">{u.name}</td>
              <td className="px-3 text-stone-600">{u.email}</td>
              <td className="px-3">
                <select
                  value={u.role}
                  onChange={(e) => setUserRole(u.id, e.target.value as Role)}
                  className="border border-stone-300 rounded px-2 py-1 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {(['viewer', 'chief', 'admin'] as Role[]).map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-3">
                {u.locked ? (
                  <span className="text-red-800 bg-red-100 border border-red-300 rounded-full px-2 py-0.5 text-xs font-medium">
                    Đã khóa
                  </span>
                ) : (
                  <span className="text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-full px-2 py-0.5 text-xs font-medium">
                    Hoạt động
                  </span>
                )}
              </td>
              <td className="px-3 text-right">
                {u.locked ? (
                  <button className={outline} onClick={() => toggleLock(u.id)}>
                    Mở khóa
                  </button>
                ) : (
                  <button className={danger} onClick={() => setLock(u.id)}>
                    Khóa
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {target && (
        <Confirm
          title="Khóa tài khoản"
          okLabel="Khóa tài khoản"
          text={`Người dùng "${target.name}" sẽ không thể đăng nhập cho đến khi được mở khóa.`}
          onCancel={() => setLock(null)}
          onOk={() => {
            toggleLock(target.id)
            setLock(null)
          }}
        />
      )}
    </div>
  )
}
