import { useMemo, useState } from 'react'
import { useApp } from '../../context'
import { Member } from '../../types'
import { norm } from '../../utils'
import { MAXGEN, HOME, FOUNDED } from '../../constants'
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

  const directMembers = members.filter((m) => !m.spouseOf)
  const aliveCount = members.filter((m) => m.status === 'alive').length
  const deadCount = members.filter((m) => m.status === 'dead').length

  return (
    <div className="p-2 sm:p-4 min-h-[calc(100dvh-48px)] flex">
      <Board className="flex-1 w-full">
        <BoardDecor />
        <div className="relative flex flex-col items-center px-4 py-6 md:py-8 min-h-[640px] fade max-w-4xl mx-auto">
          {/* Scroll Banner */}
          <Scroll className="w-full max-w-[620px]" sub={`Vùng đất ${HOME}`} />

          {/* Greeting */}
          <div className="text-center mt-6">
            <h2 className="font-serif text-brown text-xl sm:text-2xl font-bold">
              Kính chào, <span className="text-maroon">{actor}</span>
            </h2>
            <p className="text-xs sm:text-sm text-brown/80 mt-1 max-w-xl">
              Phả hệ dòng tộc vùng đất {HOME}, khởi lập năm {FOUNDED}, trải qua {MAXGEN} đời phụng sự tổ tiên và kế thừa truyền thống hiếu học, nhân nghĩa.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mt-6">
            <div className="bg-paper/90 border border-bronze/40 rounded-xl p-3 text-center shadow-xs">
              <div className="text-xs text-stone-500 font-medium">Thế hệ</div>
              <div className="text-2xl font-serif font-bold text-maroon mt-0.5">{MAXGEN} đời</div>
              <div className="text-[10px] text-stone-400">Từ năm 1524</div>
            </div>
            <div className="bg-paper/90 border border-bronze/40 rounded-xl p-3 text-center shadow-xs">
              <div className="text-xs text-stone-500 font-medium">Huyết thống</div>
              <div className="text-2xl font-serif font-bold text-amber-900 mt-0.5">
                {directMembers.length}
              </div>
              <div className="text-[10px] text-stone-400">Tổng nam & nữ</div>
            </div>
            <div className="bg-paper/90 border border-bronze/40 rounded-xl p-3 text-center shadow-xs">
              <div className="text-xs text-stone-500 font-medium">Còn sống</div>
              <div className="text-2xl font-serif font-bold text-emerald-800 mt-0.5">
                {aliveCount}
              </div>
              <div className="text-[10px] text-emerald-600 font-medium">Con cháu đương thời</div>
            </div>
            <div className="bg-paper/90 border border-bronze/40 rounded-xl p-3 text-center shadow-xs">
              <div className="text-xs text-stone-500 font-medium">Đã tạ thế</div>
              <div className="text-2xl font-serif font-bold text-stone-700 mt-0.5">
                {deadCount}
              </div>
              <div className="text-[10px] text-stone-400">Tiền nhân tiên tổ</div>
            </div>
          </div>

          {/* Search Box with Autocomplete */}
          <div className="w-full max-w-lg mt-7 relative">
            <div className="relative">
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm thành viên theo họ tên, quê quán, nghề nghiệp…"
                className="w-full bg-paper border-2 border-bronze/60 rounded-full py-3 pl-11 pr-10 text-sm text-brown placeholder-brown/50 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-md transition-all"
              />
              <span className="absolute left-4 top-3.5 text-brown/60 text-base">🔍</span>
              {q && (
                <button
                  onClick={() => setQ('')}
                  className="absolute right-4 top-3.5 text-stone-400 hover:text-stone-700 text-sm"
                >
                  ✕
                </button>
              )}
            </div>

            {q && (
              <div className="absolute top-13 left-0 right-0 bg-white border-2 border-bronze/60 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50 p-2 divide-y divide-stone-100">
                {res.length === 0 ? (
                  <p className="text-xs text-stone-500 p-4 text-center italic">
                    Không tìm thấy thành viên phù hợp với từ khóa "{q}".
                  </p>
                ) : (
                  res.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => openMember(m.id)}
                      className="w-full text-left p-2.5 hover:bg-amber-50 rounded-lg flex items-center justify-between text-xs text-stone-800 transition-colors cursor-pointer"
                    >
                      <div>
                        <b className="text-sm font-serif text-stone-900">{m.name}</b>
                        <span className="text-stone-500 ml-1.5">(Đời {m.gen} • {m.gender === 'M' ? 'Nam' : 'Nữ'})</span>
                      </div>
                      <span className="text-[11px] text-maroon font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {m.note || m.hometown}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <a
              href="#/tree"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-800 to-maroon hover:from-maroon hover:to-red-900 text-amber-50 font-serif font-bold text-sm shadow-md hover:shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>🌳</span> Khám Phá Cây Phả Hệ
            </a>
            <a
              href="#/my"
              className="px-5 py-3 rounded-xl border-2 border-bronze/70 text-brown font-serif font-semibold text-sm hover:bg-gold/25 bg-paper/80 shadow-xs transition-all cursor-pointer"
            >
              ✍️ Góp ý của tôi
            </a>
          </div>

          {/* Mobile Couplets */}
          <div className="md:hidden mt-8 flex gap-4">
            <Couplet words={COUPLET_L} />
            <Couplet words={COUPLET_R} />
          </div>
        </div>
      </Board>
    </div>
  )
}
