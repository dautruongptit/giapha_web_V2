import { useApp, useLoading } from '../../context'
import { fmtTime } from '../../utils'
import { Skeleton, Empty } from '../../components/common'

export function AuditLogsTab() {
  const { logs } = useApp()
  const loading = useLoading('l', 500)

  if (loading) return <Skeleton />
  if (!logs.length) return <Empty title="Chưa có thay đổi nào" />

  return (
    <div className="bg-white border border-stone-200 rounded-lg overflow-x-auto fade shadow-sm">
      <table className="w-full text-sm min-w-[560px]">
        <thead className="bg-amber-50 text-left text-stone-600">
          <tr>
            {['Thời gian', 'Người thực hiện', 'Nội dung thay đổi'].map((h) => (
              <th key={h} className="px-3 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id} className="border-t border-stone-100 hover:bg-stone-50/50">
              <td className="px-3 py-2.5 whitespace-nowrap text-stone-600">{fmtTime(l.at)}</td>
              <td className="px-3 font-medium text-stone-900">{l.who}</td>
              <td className="px-3 text-stone-800">{l.what}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
