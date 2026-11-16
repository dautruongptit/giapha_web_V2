import { useState } from 'react'
import { useApp, useRoute, go, useLoading } from '../../context'
import { Feedback } from '../../types'
import { TYPE_LABEL, STATUS_LABEL } from '../../constants'
import { fmtTime, infoLine } from '../../utils'
import { Badge, Skeleton, Empty, ErrorState } from '../../components/common'

const primary =
  'rounded-md bg-maroon hover:bg-maroon-dark text-white font-semibold px-4 py-2 text-sm shadow-sm transition-colors'
const outline =
  'rounded-md border border-stone-300 hover:bg-stone-50 px-3 py-2 text-sm bg-white transition-colors'
const inp =
  'w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400'

export function FeedbackDetailView({ f }: { f: Feedback }) {
  const { byId, decide, members, role } = useApp()
  const m = byId[f.memberId]
  const [reply, setReply] = useState(f.reply)
  const done = f.status !== 'pending'

  const kv = (k: string, v: any) => (
    <div className="flex gap-3 py-1.5 text-sm border-b border-stone-100">
      <dt className="w-28 text-stone-500 shrink-0">{k}</dt>
      <dd>{v}</dd>
    </div>
  )

  return (
    <div className="space-y-4 fade">
      <button className="text-sm text-maroon underline" onClick={() => go('/admin/feedbacks')}>
        ← Danh sách góp ý
      </button>
      <div className="grid md:grid-cols-2 gap-4">
        <section className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm">
          <h2 className="font-semibold mb-2 text-stone-900">Thông tin hiện tại</h2>
          {m ? (
            <dl>
              {kv('Họ tên', m.name)}
              {kv('Giới tính', m.gender === 'M' ? 'Nam' : 'Nữ')}
              {kv('Đời', m.gen)}
              {kv('Năm sinh – mất', infoLine(m).text)}
              {kv('Cha', byId[m.fatherId ?? '']?.name ?? '—')}
              {kv(
                'Vợ/chồng',
                members
                  .filter((x) => x.spouseOf === m.id || x.id === m.spouseOf)
                  .map((x) => x.name)
                  .join(', ') || '—'
              )}
              {kv('Quê quán', m.hometown)}
              {kv('Ghi chú', m.note || '—')}
            </dl>
          ) : (
            <ErrorState title="Thành viên đã bị xóa" />
          )}
          {role === 'admin' && m && (
            <button
              className="mt-3 text-sm text-maroon underline"
              onClick={() => go('/admin/members')}
            >
              Mở trang quản lý thành viên
            </button>
          )}
        </section>
        <section className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm">
          <h2 className="font-semibold mb-2 text-stone-900">Nội dung góp ý</h2>
          <dl>
            {kv('Loại', TYPE_LABEL[f.type])}
            {kv('Người gửi', f.author)}
            {kv('Thời gian', fmtTime(f.createdAt))}
            {kv('Trạng thái', <Badge status={f.status} />)}
          </dl>
          <p className="text-sm mt-3 bg-amber-50 border border-amber-200 rounded p-3 leading-relaxed">
            {f.content}
          </p>
          {f.image && (
            <img
              src={f.image}
              alt="Ảnh đính kèm"
              className="mt-3 max-h-40 rounded border object-cover"
            />
          )}
        </section>
      </div>

      <section className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm">
        <label className="block text-sm font-medium mb-1 text-stone-700">Ghi chú phản hồi</label>
        <textarea
          rows={3}
          disabled={done}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          className={`${inp} disabled:bg-stone-100`}
          placeholder="Phản hồi gửi đến người góp ý…"
        />
        {done ? (
          <p className="text-sm text-stone-500 mt-2">Góp ý này đã được xử lý.</p>
        ) : (
          <div className="flex gap-2 mt-3">
            <button
              className={primary}
              onClick={() => {
                decide(f.id, 'accepted', reply)
                go('/admin/feedbacks')
              }}
            >
              Chấp nhận
            </button>
            <button
              className="rounded-md border border-red-300 text-red-800 hover:bg-red-50 px-4 py-2 text-sm font-semibold bg-white transition-colors"
              onClick={() => {
                decide(f.id, 'rejected', reply)
                go('/admin/feedbacks')
              }}
            >
              Từ chối
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export function FeedbacksTab() {
  const { feedbacks, byId } = useApp()
  const route = useRoute()
  const id = route.split('/')[3]
  const [st, setSt] = useState('all')
  const loading = useLoading('f', 500)

  if (id) {
    const f = feedbacks.find((x) => x.id === id)
    return f ? (
      <FeedbackDetailView f={f} />
    ) : (
      <ErrorState
        title="Không tìm thấy góp ý"
        action={
          <button className={outline} onClick={() => go('/admin/feedbacks')}>
            Quay lại
          </button>
        }
      />
    )
  }

  const list = feedbacks.filter((f) => st === 'all' || f.status === st)

  return (
    <div className="space-y-4 fade">
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'accepted', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setSt(s)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              st === s ? 'bg-maroon text-white border-maroon' : 'bg-white border-stone-300 hover:bg-stone-50'
            }`}
          >
            {s === 'all' ? 'Tất cả' : STATUS_LABEL[s as keyof typeof STATUS_LABEL]}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton />
      ) : list.length === 0 ? (
        <Empty title="Không có góp ý" text="Chưa có góp ý nào ở trạng thái này." />
      ) : (
        <div className="bg-white border border-stone-200 rounded-lg overflow-x-auto shadow-sm">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-amber-50 text-left text-stone-600">
              <tr>
                {['Thành viên', 'Loại', 'Người gửi', 'Thời gian', 'Trạng thái'].map((h) => (
                  <th key={h} className="px-3 py-2.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => go('/admin/feedbacks/' + f.id)}
                  className="border-t border-stone-100 hover:bg-amber-50/50 cursor-pointer transition-colors"
                >
                  <td className="px-3 py-2.5 font-medium text-stone-900">
                    {byId[f.memberId]?.name}
                  </td>
                  <td className="px-3">{TYPE_LABEL[f.type]}</td>
                  <td className="px-3">{f.author}</td>
                  <td className="px-3 whitespace-nowrap">{fmtTime(f.createdAt)}</td>
                  <td className="px-3">
                    <Badge status={f.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
