import { useMemo, useState } from 'react'
import { useApp } from '../../context'
import { Member } from '../../types'
import { norm } from '../../utils'
import { MAXGEN } from '../../constants'
import { Board, BoardDecor, Scroll, Couplet, COUPLET_L, COUPLET_R } from '../../components/ornaments'

function useSearch(members: Member[], q: string) {
  return useMemo(() => {
    const s = norm(q.trim())
    if (!s) return []
    return members.filter(
      (m) =>
        norm(m.name).includes(s) ||
        (m.hometown && norm(m.hometown).includes(s)) ||
        (m.note && norm(m.note).includes(s))
    )
  }, [members, q])
}

export function HomePage() {
  const [q, setQ] = useState('')
  const { members, actor, openMember } = useApp()
  const res = useSearch(members, q)

  return (
    <div className="p-2 sm:p-4 min-h-[calc(100dvh-44px)] flex">
      <Board className="flex-1 w-full">
        <BoardDecor />
        <div className="relative flex flex-col items-center px-4 py-6 md:py-8 min-h-[600px] fade">
          <Scroll className="w-full max-w-[600px]" sub="Dòng họ Nguyễn – Đông Triều, Quảng Ninh" />
          <p className="font-serif text-brown mt-8 text-lg">
            Kính chào, <b>{actor}</b>
          </p>
          <p className="text-sm text-brown/75 mt-1 text-center">
            Gia phả gồm {members.filter((m) => !m.spouseOf).length} thành viên huyết thống trải dài{' '}
            {MAXGEN} đời.
          </p>

          <div className="w-full max-w-md mt-6 relative">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên thành viên, nơi cư trú, nghề nghiệp…"
              className="w-full bg-paper border-2 border-bronze/70 rounded-full py-2.5 pl-10 pr-4 text-sm text-brown placeholder-brown/50 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            />
            <span className="absolute left-3.5 top-3 text-brown/50 text-sm">🔍</span>
            {q && (
              <div className="absolute top-12 left-0 right-0 bg-paper border-2 border-bronze/60 rounded-lg shadow-xl max-h-80 overflow-y-auto z-40 p-2 divide-y divide-bronze/20">
                {res.length === 0 ? (
                  <p className="text-xs text-brown/60 p-3 text-center">
                    Không tìm thấy thành viên phù hợp
                  </p>
                ) : (
                  res.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => openMember(m.id)}
                      className="w-full text-left p-2 hover:bg-gold/25 rounded flex items-center justify-between text-xs text-brown transition-colors"
                    >
                      <span>
                        <b>{m.name}</b> <span className="text-brown/60">(Đời {m.gen})</span>
                      </span>
                      <span className="text-[11px] text-maroon">{m.note || m.hometown}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#/tree"
              className="px-5 py-2.5 rounded bg-maroon text-amber-50 font-serif font-bold text-sm shadow hover:bg-maroon-dark flex items-center gap-2 transition-colors"
            >
              <span>❖</span> Xem Cây Phả Hệ
            </a>
            <a
              href="#/my"
              className="px-4 py-2.5 rounded border-2 border-bronze/70 text-brown font-serif font-semibold text-sm hover:bg-gold/25 bg-paper/60 transition-colors"
            >
              Góp ý của tôi
            </a>
          </div>

          <div className="md:hidden mt-8 flex gap-4">
            <Couplet words={COUPLET_L} />
            <Couplet words={COUPLET_R} />
          </div>
        </div>
      </Board>
    </div>
  )
}
