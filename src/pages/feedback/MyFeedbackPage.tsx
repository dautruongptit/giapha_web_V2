import { useApp, useLoading } from '../../context'
import { TYPE_LABEL } from '../../constants'
import { fmtTime } from '../../utils'
import { Badge, Skeleton, Empty, btnPrimary } from '../../components/common'

function Page({
  title,
  children,
  wide,
}: {
  title: string
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className="min-h-[calc(100dvh-44px)] py-6 px-3 bg-[#f1e6bd]">
      <div className={`paper mx-auto p-5 sm:p-8 fade ${wide ? 'max-w-3xl' : 'max-w-xl'}`}>
        <h1 className="font-serif font-bold text-2xl text-maroon">{title}</h1>
        <div className="h-px bg-bronze/50 my-4" />
        {children}
      </div>
    </div>
  )
}

export function MyFeedbackPage() {
  const { feedbacks, actor, byId } = useApp()
  const loading = useLoading(actor, 500)
  const mine = feedbacks.filter((f) => f.author === actor)

  return (
    <Page title="Góp ý của tôi" wide>
      {loading ? (
        <Skeleton rows={3} />
      ) : mine.length === 0 ? (
        <Empty
          title="Quý vị chưa gửi góp ý nào"
          text="Mở thẻ thành viên trên cây gia phả và chọn “Góp ý / Báo sai thông tin”."
          action={
            <a href="#/tree" className={`${btnPrimary} inline-block`}>
              Xem cây gia phả
            </a>
          }
        />
      ) : (
        <ul className="space-y-3">
          {mine.map((f) => (
            <li key={f.id} className="border border-gold/70 rounded bg-white/70 p-4 fade">
              <div className="flex flex-wrap justify-between gap-2 items-center">
                <span className="font-serif font-bold uppercase text-maroon">
                  {byId[f.memberId]?.name ?? 'Thành viên đã xóa'}
                </span>
                <Badge status={f.status} />
              </div>
              <p className="text-xs text-brown/60 mt-0.5">
                {TYPE_LABEL[f.type]} · {fmtTime(f.createdAt)}
              </p>
              <p className="text-sm mt-2">{f.content}</p>
              {f.image && (
                <img src={f.image} alt="Ảnh đính kèm" className="mt-2 h-20 rounded border object-cover" />
              )}
              {f.reply && (
                <div className="mt-3 border-l-4 border-bronze bg-amber-50 px-3 py-2 text-sm">
                  <b className="font-serif">Phản hồi của Tộc trưởng: </b>
                  {f.reply}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Page>
  )
}
