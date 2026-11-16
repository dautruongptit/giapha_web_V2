import { useState } from 'react'
import { useApp, useLoading } from '../../context'
import { Member } from '../../types'
import { norm, infoLine, relOf } from '../../utils'
import { MAXGEN, REL } from '../../constants'
import { Skeleton, Empty, Confirm } from '../../components/common'
import { MemberFormModal } from './MemberFormModal'

const primary =
  'rounded-md bg-maroon hover:bg-maroon-dark text-white font-semibold px-4 py-2 text-sm shadow-sm transition-colors'
const inp =
  'w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400'

export function MembersTab() {
  const { members, deleteMember } = useApp()
  const [q, setQ] = useState('')
  const [st, setSt] = useState('all')
  const [gen, setGen] = useState('all')
  const [edit, setEdit] = useState<Member | 'new' | null>(null)
  const [del, setDel] = useState<Member | null>(null)
  const [err, setErr] = useState('')
  const loading = useLoading('m', 500)

  const list = members.filter(
    (m) =>
      (!q.trim() || norm(m.name).includes(norm(q))) &&
      (st === 'all' || m.status === st) &&
      (gen === 'all' || m.gen === +gen)
  )

  if (edit) {
    return (
      <MemberFormModal
        initial={edit === 'new' ? null : edit}
        onClose={() => setEdit(null)}
      />
    )
  }

  return (
    <div className="space-y-4 fade">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo họ tên…"
          className={`${inp} sm:w-64`}
        />
        <select value={st} onChange={(e) => setSt(e.target.value)} className={`${inp} w-auto`}>
          <option value="all">Mọi trạng thái</option>
          <option value="alive">Còn sống</option>
          <option value="dead">Đã mất</option>
        </select>
        <select value={gen} onChange={(e) => setGen(e.target.value)} className={`${inp} w-auto`}>
          <option value="all">Mọi đời</option>
          {Array.from({ length: MAXGEN }, (_, i) => (
            <option key={i} value={i + 1}>
              Đời {i + 1}
            </option>
          ))}
        </select>
        <button className={`${primary} ml-auto`} onClick={() => setEdit('new')}>
          + Thêm thành viên
        </button>
      </div>

      {err && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2" role="alert">
          {err}
        </p>
      )}

      {loading ? (
        <Skeleton />
      ) : list.length === 0 ? (
        <Empty title="Không có thành viên phù hợp" text="Thử đổi từ khóa hoặc bộ lọc." />
      ) : (
        <div className="bg-white border border-stone-200 rounded-lg overflow-x-auto shadow-sm">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-amber-50 text-left text-stone-600">
              <tr>
                {['Họ tên', 'Quan hệ', 'Đời', 'Năm sinh – mất', 'Trạng thái', ''].map((h) => (
                  <th key={h} className="px-3 py-2.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id} className="border-t border-stone-100 hover:bg-amber-50/40">
                  <td className="px-3 py-2.5 font-medium text-stone-900">{m.name}</td>
                  <td className="px-3" style={{ color: REL[relOf(m)].color }}>
                    {REL[relOf(m)].label}
                  </td>
                  <td className="px-3">{m.gen}</td>
                  <td className="px-3">{infoLine(m).text}</td>
                  <td className="px-3">{m.status === 'alive' ? 'Còn sống' : 'Đã mất'}</td>
                  <td className="px-3 text-right whitespace-nowrap">
                    <button
                      className="text-maroon hover:text-maroon-dark font-medium mr-3"
                      onClick={() => setEdit(m)}
                    >
                      Sửa
                    </button>
                    <button
                      className="text-red-700 hover:text-red-800 font-medium"
                      onClick={() => {
                        setErr('')
                        setDel(m)
                      }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {del && (
        <Confirm
          title="Xóa thành viên"
          okLabel="Xóa"
          text={`Bạn chắc chắn muốn xóa "${del.name}"? Thao tác này không thể hoàn tác.`}
          onCancel={() => setDel(null)}
          onOk={() => {
            if (members.some((x) => x.fatherId === del.id || x.spouseOf === del.id)) {
              setErr(
                `Không thể xóa "${del.name}" vì còn con hoặc vợ/chồng liên kết. Hãy xóa hoặc chuyển các hồ sơ đó trước.`
              )
            } else {
              deleteMember(del.id)
            }
            setDel(null)
          }}
        />
      )}
    </div>
  )
}
