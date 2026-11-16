import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp, useLoading } from '../../context'
import { Member, Unit } from '../../types'
import { norm } from '../../utils'
import { MAXGEN, HOME, FOUNDED, REL } from '../../constants'
import { Scroll, MiniLotus } from '../../components/ornaments'
import { Skeleton, Empty } from '../../components/common'
import { MemberCard, makeUnit, CW, RW, BH, RBH } from '../../components/member'
import { RootPicker } from './RootPicker'

const PITCH = 195
const GAP = 22
const PAGES = [
  { start: 1, label: 'Đời 1–6', desc: 'Thủy Tổ & Tiền Nhân' },
  { start: 7, label: 'Đời 7–12', desc: 'Trung Đại' },
  { start: 13, label: 'Đời 13–18', desc: 'Cận Đại' },
  { start: 19, label: 'Đời 19–20', desc: 'Hậu Duệ' },
]

type TNode = {
  u: Unit
  w: number
  h: number
  sub: number
  cx: number
  x: number
  y: number
  kids: TNode[]
  gen: number
}

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

export function TreePage() {
  const { members, openMember, byId } = useApp()
  const [page, setPage] = useState(0)
  const [rootId, setRootId] = useState<string | null>(null)
  const [pick, setPick] = useState(false)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all' | 'alive' | 'dead'>('all')
  const [mode, setMode] = useState<'tree' | 'list'>('tree')
  const [z, setZ] = useState<number | null>(null)
  const [vp, setVp] = useState({ w: 900, h: 400 })
  const vpRef = useRef<HTMLDivElement>(null)
  const loading = useLoading(rootId + '' + page, 250)

  const start = rootId && byId[rootId] ? byId[rootId].gen : PAGES[page].start
  const rows = Math.min(6, MAXGEN - start + 1)
  const last = start + rows - 1
  const search = useSearch(members, q)
  const hitIds = useMemo(() => new Set(search.map((m) => m.spouseOf ?? m.id)), [search])

  // Compute ancestor path for breadcrumb navigation
  const ancestorPath = useMemo(() => {
    if (!rootId || !byId[rootId]) return []
    const path: Member[] = []
    let curr: Member | undefined = byId[rootId]
    while (curr) {
      path.unshift(curr)
      curr = curr.fatherId ? byId[curr.fatherId] : undefined
    }
    return path
  }, [rootId, byId])

  // Tree layout calculation
  const { roots, W, H } = useMemo(() => {
    const build = (m: Member): TNode => {
      const u = makeUnit(m, members)
      const isRoot = m.gen === 1
      const kids =
        m.gen < last
          ? members.filter((x) => x.fatherId === m.id && !x.spouseOf).map(build)
          : []
      const w = isRoot ? RW : CW
      const h = u.persons.length * (isRoot ? RBH : BH) + 8
      const kw = kids.reduce((s, k) => s + k.sub, 0) + GAP * Math.max(0, kids.length - 1)
      return {
        u,
        w,
        h,
        sub: Math.max(w, kw),
        cx: 0,
        x: 0,
        y: (m.gen - start) * PITCH + 20,
        kids,
        gen: m.gen,
      }
    }

    const place = (n: TNode, left: number) => {
      const kw = n.kids.reduce((s, k) => s + k.sub, 0) + GAP * Math.max(0, n.kids.length - 1)
      let x = left + (n.sub - kw) / 2
      n.kids.forEach((k) => {
        place(k, x)
        x += k.sub + GAP
      })
      n.cx = n.kids.length ? (n.kids[0].cx + n.kids[n.kids.length - 1].cx) / 2 : left + n.sub / 2
      n.x = n.cx - n.w / 2
    }

    const rs = (
      rootId && byId[rootId]
        ? [byId[rootId]]
        : members.filter((m) => !m.spouseOf && m.gen === start)
    ).map(build)

    let x = 40
    rs.forEach((r) => {
      place(r, x)
      x += r.sub + GAP * 2
    })
    return { roots: rs, W: Math.max(x + 40, 320), H: rows * PITCH + 40 }
  }, [members, start, last, rootId, rows, byId])

  const flat = useMemo(() => {
    const a: TNode[] = []
    const f = (n: TNode) => {
      a.push(n)
      n.kids.forEach(f)
    }
    roots.forEach(f)
    return a
  }, [roots])

  const mobile = vp.w < 640
  const fit = mobile ? 0.75 : Math.max(0.4, Math.min(1.05, (vp.w - 120) / W, (vp.h - 60) / H))
  const s = z ?? fit

  useEffect(() => setZ(null), [start, rootId])
  useEffect(() => {
    const el = vpRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setVp({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [mode])

  const drag = useRef<any>(null)
  const dim = (n: TNode) => {
    const ps = n.u.persons
    const fOk = filter === 'all' || ps.some((p) => p.status === filter)
    const qOk = !q.trim() || hitIds.has(n.u.main.id)
    return !(fOk && qOk)
  }

  const legend = ['son', 'daughter', 'dil', 'sil'] as const

  const jump = (m: Member) => {
    const id = m.spouseOf ?? m.id
    const g = byId[id].gen
    setRootId(null)
    setPage(g >= 19 ? 3 : g >= 13 ? 2 : g >= 7 ? 1 : 0)
    setQ('')
    openMember(m.id)
  }

  const lists = Array.from({ length: rows }, (_, i) => start + i)
  const inRoot = (m: Member) => {
    if (!rootId) return true
    let c: Member | undefined = byId[m.spouseOf ?? m.id]
    while (c) {
      if (c.id === rootId) return true
      c = c.fatherId ? byId[c.fatherId] : undefined
    }
    return false
  }

  return (
    <div className="h-[calc(100dvh-48px)] p-2 sm:p-4 flex flex-col gap-2">
      {/* Top Controls Card */}
      <div className="bg-amber-50/95 backdrop-blur-md border border-amber-800/20 rounded-xl shadow-md p-2.5 sm:px-4 shrink-0 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Generation Range Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex bg-stone-200/80 p-0.5 rounded-lg border border-stone-300" role="group" aria-label="Chọn giai đoạn đời">
            {PAGES.map((p, i) => (
              <button
                key={p.label}
                onClick={() => {
                  setRootId(null)
                  setPage(i)
                }}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all cursor-pointer ${
                  !rootId && page === i
                    ? 'bg-maroon text-amber-50 shadow-sm font-semibold'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
                }`}
                title={p.desc}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Root branch picker button */}
          <button
            onClick={() => setPick(true)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
              rootId
                ? 'bg-amber-600 text-white border-amber-700 font-semibold shadow-sm'
                : 'bg-white hover:bg-amber-50 text-stone-700 border-stone-300'
            }`}
          >
            <span>🎯</span> {rootId ? `Nhánh: ${byId[rootId]?.name}` : 'Chọn nhánh gốc'}
          </button>

          {rootId && (
            <button
              onClick={() => setRootId(null)}
              className="px-2 py-1.5 text-xs text-red-700 hover:bg-red-50 border border-red-200 rounded-lg cursor-pointer"
              title="Quay lại toàn bộ gia tộc"
            >
              ✕ Bỏ lọc nhánh
            </button>
          )}
        </div>

        {/* Right: Search, Filter, Mode & Zoom */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Search box */}
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên thành viên…"
              aria-label="Tìm theo tên"
              className="w-40 sm:w-52 text-xs rounded-lg border border-stone-300 bg-white px-3 py-1.5 pl-8 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            />
            <span className="absolute left-2.5 top-2 text-stone-400 text-xs">🔍</span>
            {q && (
              <button
                onClick={() => setQ('')}
                className="absolute right-2 top-1.5 text-stone-400 hover:text-stone-600 text-xs px-1"
              >
                ✕
              </button>
            )}

            {q.trim() && (
              <ul className="absolute left-0 top-full mt-1.5 w-64 max-h-60 overflow-auto bg-white border border-stone-300 rounded-lg shadow-xl z-50 divide-y divide-stone-100">
                {search.length === 0 ? (
                  <li className="px-3 py-2 text-xs text-stone-500">Không tìm thấy thành viên.</li>
                ) : (
                  search.slice(0, 10).map((m) => (
                    <li key={m.id}>
                      <button
                        onClick={() => jump(m)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-amber-50 flex justify-between items-center transition-colors cursor-pointer"
                      >
                        <span className="font-semibold text-stone-900">{m.name}</span>
                        <span className="text-[11px] text-maroon font-serif">Đời {m.gen}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {/* Status filter: All, Alive, Dead */}
          <div className="flex bg-stone-200/80 p-0.5 rounded-lg border border-stone-300 text-xs" role="group">
            {[
              ['all', 'Tất cả'],
              ['alive', '🟢 Sống'],
              ['dead', '🪷 Đã mất'],
            ].map(([k, t]) => (
              <button
                key={k}
                onClick={() => setFilter(k as any)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  filter === k ? 'bg-white text-stone-900 font-semibold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* View Mode: Tree vs List */}
          <div className="flex bg-stone-200/80 p-0.5 rounded-lg border border-stone-300 text-xs">
            <button
              onClick={() => setMode('tree')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                mode === 'tree' ? 'bg-white text-maroon font-semibold shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Xem dạng sơ đồ cây"
            >
              🌳 Cây
            </button>
            <button
              onClick={() => setMode('list')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                mode === 'list' ? 'bg-white text-maroon font-semibold shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Xem dạng danh sách theo đời"
            >
              📋 Danh sách
            </button>
          </div>

          {/* Zoom Controls (Tree mode only) */}
          {mode === 'tree' && (
            <div className="flex items-center gap-1 bg-white border border-stone-300 rounded-lg p-0.5 text-xs shadow-xs">
              <button
                onClick={() => setZ(Math.max(0.3, s - 0.1))}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-stone-100 text-stone-700 font-bold cursor-pointer"
                aria-label="Thu nhỏ"
                title="Thu nhỏ"
              >
                −
              </button>
              <button
                onClick={() => setZ(null)}
                className="px-2 h-6 flex items-center justify-center rounded hover:bg-stone-100 text-[11px] text-stone-600 cursor-pointer"
                title="Tự động căn vừa màn hình"
              >
                {Math.round(s * 100)}%
              </button>
              <button
                onClick={() => setZ(Math.min(1.6, s + 0.1))}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-stone-100 text-stone-700 font-bold cursor-pointer"
                aria-label="Phóng to"
                title="Phóng to"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Breadcrumb path for selected branch */}
      {ancestorPath.length > 0 && (
        <div className="bg-amber-100/90 border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-amber-950 flex items-center gap-1.5 overflow-x-auto shrink-0 shadow-xs">
          <span className="font-semibold text-maroon shrink-0">Nhánh gia tộc:</span>
          {ancestorPath.map((a, i) => (
            <span key={a.id} className="flex items-center gap-1 shrink-0">
              {i > 0 && <span className="text-stone-400">›</span>}
              <button
                onClick={() => setRootId(a.id)}
                className={`underline hover:text-maroon cursor-pointer ${
                  a.id === rootId ? 'font-bold text-red-900' : ''
                }`}
              >
                {a.name} (Đời {a.gen})
              </button>
            </span>
          ))}
          <button
            onClick={() => setRootId(null)}
            className="ml-auto text-[11px] text-maroon hover:underline shrink-0 pl-2 cursor-pointer"
          >
            Về toàn phả hệ
          </button>
        </div>
      )}

      {/* Main Tree / List Canvas */}
      <div className="flex-1 min-h-0 bg-paper/85 backdrop-blur-md border border-amber-900/20 rounded-2xl shadow-xl overflow-hidden relative flex flex-col">
        {loading ? (
          <div className="p-8">
            <Skeleton rows={5} />
          </div>
        ) : mode === 'tree' ? (
          roots.length === 0 ? (
            <div className="m-auto">
              <Empty
                title="Chưa có thành viên ở nhánh này"
                text="Hãy chọn giai đoạn đời hoặc nhánh khác."
                action={
                  <button
                    onClick={() => {
                      setRootId(null)
                      setPage(0)
                    }}
                    className="px-4 py-2 rounded-lg bg-maroon text-amber-50 text-xs font-semibold cursor-pointer"
                  >
                    Về Đời 1–6
                  </button>
                }
              />
            </div>
          ) : (
            <div
              ref={vpRef}
              className="h-full overflow-auto cursor-grab active:cursor-grabbing select-none relative"
              onMouseDown={(e) => {
                if ((e.target as HTMLElement).closest('button')) return
                const el = e.currentTarget
                drag.current = {
                  x: e.clientX,
                  y: e.clientY,
                  l: el.scrollLeft,
                  t: el.scrollTop,
                }
              }}
              onMouseMove={(e) => {
                if (!drag.current) return
                const el = e.currentTarget
                el.scrollLeft = drag.current.l - (e.clientX - drag.current.x)
                el.scrollTop = drag.current.t - (e.clientY - drag.current.y)
              }}
              onMouseUp={() => (drag.current = null)}
              onMouseLeave={() => (drag.current = null)}
              onWheel={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  e.preventDefault()
                  setZ(Math.min(1.6, Math.max(0.3, s - e.deltaY * 0.002)))
                }
              }}
            >
              {/* Inner scalable canvas */}
              <div className="flex" style={{ width: 140 + W * s, height: H * s + 60 }}>
                {/* Generation Scale Column (Sticky Left) */}
                <div
                  className="sticky left-0 z-30 shrink-0 bg-amber-50/90 backdrop-blur-md border-r border-amber-800/15"
                  style={{ width: 120, height: H * s + 60 }}
                >
                  <div className="text-[10px] font-serif font-bold text-maroon text-center pt-2 pb-1 uppercase tracking-wider border-b border-amber-800/10">
                    Thế Hệ
                  </div>
                  {Array.from({ length: rows }, (_, i) => {
                    const g = start + i
                    const eraName =
                      g === 1
                        ? 'Khởi Tổ'
                        : g <= 6
                        ? 'Tiền Nhân'
                        : g <= 12
                        ? 'Trung Đại'
                        : g <= 18
                        ? 'Cận Đại'
                        : 'Hậu Duệ'
                    return (
                      <div
                        key={i}
                        className="absolute left-2 right-2 flex items-center gap-1.5 transition-transform"
                        style={{ top: (PITCH * i + 20) * s + 24 }}
                      >
                        <div
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-amber-800/40 text-amber-950 font-serif font-bold text-xs flex items-center justify-center shadow-sm shrink-0"
                          title={`Đời thứ ${g}`}
                        >
                          {String(g).padStart(2, '0')}
                        </div>
                        <div className="leading-tight">
                          <div className="font-serif font-bold text-[11px] text-maroon">
                            Đời {g}
                          </div>
                          <div className="text-[9px] text-stone-500 uppercase tracking-tighter">
                            {eraName}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Scaled Tree Area */}
                <div className="relative" style={{ width: W * s, height: H * s + 60 }}>
                  <div
                    style={{
                      width: W,
                      height: H + 40,
                      transform: `scale(${s})`,
                      transformOrigin: '0 0',
                      position: 'absolute',
                      left: 10,
                      top: 10,
                    }}
                  >
                    {/* Horizontal generation guide lines */}
                    {Array.from({ length: rows }, (_, i) => (
                      <div
                        key={i}
                        className="absolute left-0 right-0 border-b border-dashed border-amber-900/10 pointer-events-none"
                        style={{ top: (i + 1) * PITCH + 8 }}
                      />
                    ))}

                    {/* SVG Connector Lines */}
                    <svg
                      width={W}
                      height={H + 40}
                      className="absolute inset-0 pointer-events-none"
                      fill="none"
                    >
                      {flat
                        .filter((n) => n.kids.length)
                        .map((n) => {
                          const y0 = n.y + n.h
                          const ym = n.y + PITCH - 12
                          const xs = n.kids.map((k) => k.cx)
                          const minX = Math.min(...xs, n.cx)
                          const maxX = Math.max(...xs, n.cx)
                          return (
                            <g key={n.u.main.id}>
                              {/* Parent stem down to junction */}
                              <path
                                d={`M${n.cx} ${y0} V${ym}`}
                                stroke="#9a5b1c"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              {/* Dot at parent stem bottom */}
                              <circle cx={n.cx} cy={y0 + 2} r="2.5" fill="#9a5b1c" />

                              {/* Horizontal distribution branch */}
                              <path
                                d={`M${minX} ${ym} H${maxX}`}
                                stroke="#9a5b1c"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />

                              {/* Vertical branch to each child */}
                              {n.kids.map((k) => (
                                <g key={k.u.main.id}>
                                  <path
                                    d={`M${k.cx} ${ym} V${k.y}`}
                                    stroke="#9a5b1c"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                  {/* Dot at connection point */}
                                  <circle cx={k.cx} cy={ym} r="2.5" fill="#b45309" />
                                </g>
                              ))}
                            </g>
                          )
                        })}
                    </svg>

                    {/* Member Cards */}
                    {flat.map((n) => (
                      <div
                        key={n.u.main.id}
                        className="absolute"
                        style={{ left: n.x, top: n.y }}
                      >
                        <MemberCard
                          u={n.u}
                          onOpen={openMember}
                          root={n.gen === 1}
                          dim={dim(n)}
                          hit={!!q.trim() && hitIds.has(n.u.main.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          /* List Mode (Danh sách theo đời) */
          <div className="h-full overflow-auto p-4 sm:p-6 fade space-y-6">
            {lists.map((g) => {
              const items = members
                .filter((m) => !m.spouseOf && m.gen === g && inRoot(m))
                .map((m) => ({ u: makeUnit(m, members), m }))
                .filter(
                  ({ u }) =>
                    (filter === 'all' || u.persons.some((p) => p.status === filter)) &&
                    (!q.trim() || hitIds.has(u.main.id))
                )

              return (
                <section key={g} className="space-y-3">
                  <div className="sticky top-0 z-10 flex items-center gap-2.5 bg-paper/95 backdrop-blur-md py-2 border-b border-amber-800/15">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-800/30 text-amber-950 font-serif font-bold text-xs flex items-center justify-center shadow-xs">
                      {String(g).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-serif font-bold text-maroon text-sm leading-tight">
                        Đời thứ {g}
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        {items.length} thành viên hiển thị
                      </p>
                    </div>
                  </div>

                  {items.length === 0 ? (
                    <p className="text-xs text-stone-400 pl-10 italic">
                      Không có thành viên phù hợp với bộ lọc.
                    </p>
                  ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-2.5">
                      {items.map(({ u }) => (
                        <MemberCard
                          key={u.main.id}
                          u={u}
                          flat
                          onOpen={openMember}
                          root={g === 1}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        )}

        {/* Footer legend bar */}
        <div className="shrink-0 bg-amber-50/95 backdrop-blur-md border-t border-amber-800/15 px-4 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-xs text-stone-700">
          <p className="font-serif italic text-[11.5px] text-maroon font-medium">
            Phả hệ dòng tộc — {HOME} — Lập năm {FOUNDED}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-stone-600 text-[11px]">Chú thích:</span>
            {legend.map((k) => (
              <span key={k} className="flex items-center gap-1.5 text-[11px] font-medium">
                <span
                  className="w-2.5 h-2.5 rounded-xs"
                  style={{ backgroundColor: REL[k].color }}
                />
                {REL[k].label}
              </span>
            ))}
            <span className="text-stone-300">|</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Còn sống
            </span>
            <span className="flex items-center gap-1 text-[11px] text-red-800">
              <MiniLotus className="w-3 h-2.5" /> Đã tạ thế
            </span>
          </div>
        </div>
      </div>

      {/* Root Picker Modal */}
      {pick && (
        <RootPicker
          onClose={() => setPick(false)}
          onPick={(id) => {
            setRootId(id)
            setPick(false)
          }}
        />
      )}
    </div>
  )
}
