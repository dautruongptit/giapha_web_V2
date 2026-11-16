import { useApp, useLoading, go } from '../../context'
import { TYPE_LABEL, MAXGEN } from '../../constants'
import { fmtTime } from '../../utils'
import { Skeleton, Empty, Badge } from '../../components/common'

export function DashboardTab() {
  const { members, feedbacks, logs, byId } = useApp()
  const loading = useLoading('d', 500)
  const pending = feedbacks.filter((f) => f.status === 'pending')

  const stat = (t: string, v: any, sub?: string) => (
    <div className="bg-white border border-stone-200 rounded-lg p-4 border-t-4 border-t-amber-600 shadow-sm">
      <div className="text-sm text-stone-500">{t}</div>
      <div className="text-3xl font-serif font-bold text-maroon mt-1">{v}</div>
      {sub && <div className="text-xs text-stone-500 mt-1">{sub}</div>}
    </div>
  )

  if (loading) return <Skeleton rows={4} />

  return (
    <div className="space-y-6 fade">
      <div className="grid sm:grid-cols-3 gap-4">
        {stat(
          'Tổng số thành viên',
          members.length,
          `${members.filter((m) => m.status === 'alive').length} còn sống · ${
            members.filter((m) => m.status === 'dead').length
          } đã mất`
        )}
        {stat('Góp ý chờ duyệt', pending.length, 'Cần Tộc trưởng xem xét')}
        {stat('Số đời', MAXGEN)}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <section className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-stone-900">Góp ý chờ duyệt</h2>
            <a href="#/admin/feedbacks" className="text-sm text-maroon underline hover:text-maroon-dark">
              Xem tất cả
            </a>
          </div>
          {pending.length === 0 ? (
            <Empty title="Không có góp ý chờ duyệt" />
          ) : (
            <ul className="divide-y divide-stone-100">
              {pending.map((f) => (
                <li key={f.id}>
                  <button
                    onClick={() => go('/admin/feedbacks/' + f.id)}
                    className="w-full text-left py-2.5 hover:bg-amber-50 px-1 flex justify-between gap-2 text-sm transition-colors"
                  >
                    <span>
                      <b>{byId[f.memberId]?.name}</b>
                      <br />
                      <span className="text-stone-500">
                        {TYPE_LABEL[f.type]} · {f.author}
                      </span>
                    </span>
                    <Badge status={f.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm">
          <h2 className="font-semibold text-stone-900 mb-3">Thay đổi gần đây</h2>
          <ul className="divide-y divide-stone-100">
            {logs.slice(0, 6).map((l) => (
              <li key={l.id} className="py-2.5 text-sm">
                <span className="font-medium text-stone-900">{l.who}</span>{' '}
                {l.what.charAt(0).toLowerCase() + l.what.slice(1)}
                <div className="text-xs text-stone-500">{fmtTime(l.at)}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
