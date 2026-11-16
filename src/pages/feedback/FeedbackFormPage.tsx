import { useState } from 'react'
import { useApp, go } from '../../context'
import { FeedbackType } from '../../types'
import { TYPE_LABEL } from '../../constants'
import { btnPrimary, ErrorState } from '../../components/common'

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
    <div className="min-h-[calc(100dvh-44px)] py-6 px-3">
      <div className={`paper mx-auto p-5 sm:p-8 fade ${wide ? 'max-w-3xl' : 'max-w-xl'}`}>
        <h1 className="font-serif font-bold text-2xl text-maroon">{title}</h1>
        <div className="h-px bg-bronze/50 my-4" />
        {children}
      </div>
    </div>
  )
}

export function FeedbackFormPage({ id }: { id: string }) {
  const { byId, addFeedback } = useApp()
  const m = byId[id]
  const [type, setType] = useState<FeedbackType>('wrong')
  const [content, setContent] = useState('')
  const [image, setImage] = useState<string | undefined>()
  const [err, setErr] = useState('')

  if (!m) {
    return (
      <Page title="Góp ý">
        <ErrorState
          title="Không tìm thấy thành viên"
          action={
            <a href="#/tree" className="underline text-maroon">
              Quay lại cây gia phả
            </a>
          }
        />
      </Page>
    )
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim().length < 10) {
      return setErr('Xin nhập nội dung góp ý tối thiểu 10 ký tự.')
    }
    addFeedback({ memberId: id, type, content: content.trim(), image })
    go('/my')
  }

  const lbl = 'block text-sm font-semibold text-brown mb-1'
  const inp =
    'w-full border border-bronze/60 rounded px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold'

  return (
    <Page title="Góp ý / Báo sai thông tin">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={lbl}>Thành viên liên quan</label>
          <input
            readOnly
            value={`${m.name} – Đời ${m.gen}`}
            className={`${inp} bg-amber-50 font-serif uppercase`}
          />
        </div>
        <div>
          <label className={lbl}>Loại góp ý</label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TYPE_LABEL) as FeedbackType[]).map((k) => (
              <label
                key={k}
                className={`px-3 py-1.5 rounded border text-sm cursor-pointer transition-colors ${
                  type === k
                    ? 'bg-maroon text-amber-50 border-maroon'
                    : 'border-bronze/60 bg-white hover:bg-gold/20'
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  checked={type === k}
                  onChange={() => setType(k)}
                />
                {TYPE_LABEL[k]}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={lbl} htmlFor="nd">
            Nội dung
          </label>
          <textarea
            id="nd"
            rows={5}
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              setErr('')
            }}
            className={inp}
            placeholder="Xin nêu rõ thông tin cần sửa hoặc bổ sung…"
          />
          {err && (
            <p className="text-sm text-red-700 mt-1" role="alert">
              {err}
            </p>
          )}
        </div>
        <div>
          <label className={lbl}>Ảnh đính kèm (không bắt buộc)</label>
          <input
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (!f) return setImage(undefined)
              const r = new FileReader()
              r.onload = () => setImage(String(r.result))
              r.readAsDataURL(f)
            }}
          />
          {image && (
            <img
              src={image}
              alt="Ảnh đính kèm"
              className="mt-2 h-24 rounded border border-bronze/50 object-cover"
            />
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className={btnPrimary}>
            Gửi
          </button>
          <button
            type="button"
            onClick={() => history.back()}
            className="px-5 py-2.5 rounded-md border border-bronze/60 text-sm hover:bg-stone-100 transition-colors"
          >
            Hủy
          </button>
        </div>
        <p className="text-xs text-brown/60">Kính mong Tộc trưởng xem xét.</p>
      </form>
    </Page>
  )
}
