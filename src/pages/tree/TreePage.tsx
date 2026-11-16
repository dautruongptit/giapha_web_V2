import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp, useLoading } from '../../context'
import { Member, Unit } from '../../types'
import { norm } from '../../utils'
import { MAXGEN, HOME, FOUNDED, REL } from '../../constants'
import { Board, BoardDecor, Scroll } from '../../components/ornaments'
import { Skeleton, Empty } from '../../components/common'
import { MemberCard, makeUnit, CW, RW, BH, RBH } from '../../components/member'
import { RootPicker } from './RootPicker'

const PITCH = 170
const GAP = 14
const PAGES = [1, 7, 13, 19]

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
  const loading = useLoading(rootId + '' + page, 350)

  const start = rootId && byId[rootId] ? byId[rootId].gen : PAGES[page]
  const rows = Math.min(6, MAXGEN - start + 1)
  const last = start + rows - 1
  const search = useSearch(members, q)
  const hitIds = useMemo(() => new Set(search.map((m) => m.spouseOf ?? m.id)), [search])

  const { roots, W, H } = useMemo(() => {
    const build = (m: Member): TNode => {
      const u = makeUnit(m, members)
      const root = m.gen === 1
      const kids =
        m.gen < last
          ? members.filter((x) => x.fatherId === m.id && !x.spouseOf).map(build)
          : []
      const w = root ? RW : CW
      const h = u.persons.length * (root ? RBH : BH) + 6
      const kw = kids.reduce((s, k) => s + k.sub, 0) + GAP * Math.max(0, kids.length - 1)
      return {
        u,
        w,
        h,
        sub: Math.max(w, kw),
        cx: 0,
        x: 0,
        y: (m.gen - start) * PITCH + 10,
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

    let x = 24
    rs.forEach((r) => {
      place(r, x)
      x += r.sub + GAP * 2
    })
    return { roots: rs, W: Math.max(x + 10, 300), H: rows * PITCH + 10 }
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
  const fit = mobile ? 0.8 : Math.max(0.4, Math.min(1, (vp.w - 64) / W, vp.h / H))
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

  const btn = (on: boolean) =>
    `px-2.5 py-1 text-xs rounded border transition-colors ${
      on
        ? 'bg-maroon text-amber-50 border-maroon font-medium'
        : 'bg-paper/90 border-bronze/60 text-brown hover:bg-gold/30'
    }`

  return (
    <div className="h-[calc(100dvh-44px)] p-1.5 sm:p-3">
      <Board className="h-full">
        <BoardDecor tree />
        <div className="relative h-full flex flex-col">
          <div className="shrink-0 flex justify-center pt-2">
            <Scroll className="w-[88%] max-w-[460px] md:max-w-[420px] h-auto" />
          </div>
          <div className="shrink-0 flex flex-wrap items-center gap-1.5 px-2 md:px-20 pt-1 pb-1.5 justify-center relative z-30">
            <div className="flex gap-1" role="group" aria-label="Chuyển đời">
              {['Đời 1–6', '7–12', '13–18', '19–20'].map((t, i) => (
                <button
                  key={t}
                  onClick={() => {
                    setRootId(null)
                    setPage(i)
                  }}
                  className={btn(!rootId && page === i)}
                >
                  {t}
                </button>
              ))}
            </div>
            <button onClick={() => setPick(true)} className={btn(!!rootId)}>
              Chọn người gốc
            </button>
            {rootId && (
              <button onClick={() => setRootId(null)} className={btn(false)}>
                Bỏ chọn: {byId[rootId]?.name.split(' ').slice(-2).join(' ')} ×
              </button>
            )}
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tên…"
                aria-label="Tìm theo tên"
                className="w-36 sm:w-44 text-xs rounded border border-bronze/60 bg-paper px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-gold"
              />
              {q.trim() && (
                <ul className="absolute left-0 top-full mt-1 w-60 max-h-56 overflow-auto bg-paper border border-bronze rounded shadow-lg z-40">
                  {search.length === 0 && (
                    <li className="px-3 py-2 text-xs text-brown/70">Không có kết quả.</li>
                  )}
                  {search.slice(0, 10).map((m) => (
                    <li key={m.id}>
                      <button
                        onClick={() => jump(m)}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-gold/25 flex justify-between"
                      >
                        <span className="font-semibold uppercase">{m.name}</span>
                        <span>Đời {m.gen}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex gap-1" role="group" aria-label="Lọc trạng thái">
              {(
                [
                  ['all', 'Tất cả'],
                  ['alive', 'Còn sống'],
                  ['dead', 'Đã mất'],
                ] as const
              ).map(([k, t]) => (
                <button key={k} onClick={() => setFilter(k)} className={btn(filter === k)}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-1" role="group" aria-label="Chế độ xem">
              <button onClick={() => setMode('tree')} className={btn(mode === 'tree')}>
                Cây
              </button>
              <button onClick={() => setMode('list')} className={btn(mode === 'list')}>
                Danh sách theo đời
              </button>
            </div>
            {mode === 'tree' && (
              <div className="flex gap-1" role="group" aria-label="Thu phóng">
                <button
                  onClick={() => setZ(Math.max(0.3, s - 0.1))}
                  className={btn(false)}
                  aria-label="Thu nhỏ"
                >
                  −
                </button>
                <button onClick={() => setZ(null)} className={btn(false)}>
                  Vừa khung
                </button>
                <button
                  onClick={() => setZ(Math.min(1.6, s + 0.1))}
                  className={btn(false)}
                  aria-label="Phóng to"
                >
                  +
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-0 md:mx-[76px] relative">
            {loading ? (
              <div className="p-6">
                <Skeleton rows={4} />
              </div>
            ) : mode === 'tree' ? (
              roots.length === 0 ? (
                <Empty
                  title="Chưa có thành viên ở các đời này"
                  text="Hãy chọn nhóm đời khác."
                />
              ) : (
                <div
                  ref={vpRef}
                  className="h-full overflow-auto cursor-grab active:cursor-grabbing select-none fade"
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
                    if (e.ctrlKey || e.metaKey)
                      setZ(Math.min(1.6, Math.max(0.3, s - e.deltaY * 0.002)))
                  }}
                >
                  <div className="flex" style={{ width: 52 + W * s, height: H * s }}>
                    <div
                      className="sticky left-0 z-10 shrink-0"
                      style={{ width: 52, height: H * s }}
                    >
                      {Array.from({ length: rows }, (_, i) => (
                        <div key={i}>
                          <div
                            className="absolute left-2 w-9 h-9 rounded-full bg-gold border-2 border-bronze text-maroon-dark font-serif font-bold text-sm flex items-center justify-center shadow"
                            style={{ top: (PITCH * i + 10) * s + 4 }}
                            title={`Đời ${start + i}`}
                          >
                            {String(start + i).padStart(2, '0')}
                          </div>
                          {i < rows - 1 && (
                            <div
                              className="absolute left-[25px] w-px bg-bronze"
                              style={{
                                top: (PITCH * i + 10) * s + 44,
                                height: Math.max(6, PITCH * s - 54),
                              }}
                            >
                              <span className="absolute -bottom-1 -left-[3px] border-x-[3.5px] border-x-transparent border-t-[6px] border-t-bronze" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="relative" style={{ width: W * s, height: H * s }}>
                      <div
                        style={{
                          width: W,
                          height: H,
                          transform: `scale(${s})`,
                          transformOrigin: '0 0',
                          position: 'absolute',
                        }}
                      >
                        <svg
                          width={W}
                          height={H}
                          className="absolute inset-0 pointer-events-none"
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="1.3"
                        >
                          {flat
                            .filter((n) => n.kids.length)
                            .map((n) => {
                              const y0 = n.y + n.h
                              const ym = n.y + PITCH - 9
                              const xs = n.kids.map((k) => k.cx)
                              return (
                                <path
                                  key={n.u.main.id}
                                  d={`M${n.cx} ${y0}V${ym}M${Math.min(
                                    ...xs,
                                    n.cx
                                  )} ${ym}H${Math.max(...xs, n.cx)}${n.kids
                                    .map((k) => `M${k.cx} ${ym}V${k.y}`)
                                    .join('')}`}
                                />
                              )
                            })}
                        </svg>
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
              <div className="h-full overflow-auto px-2 pb-2 fade">
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
                    <section key={g} className="mb-3">
                      <h3 className="sticky top-0 z-10 flex items-center gap-2 bg-paper/95 py-1 backdrop-blur-sm">
                        <span className="w-8 h-8 rounded-full bg-gold border-2 border-bronze text-maroon-dark font-serif font-bold text-xs flex items-center justify-center">
                          {String(g).padStart(2, '0')}
                        </span>
                        <span className="font-serif font-semibold text-maroon">
                          Đời thứ {g}
                        </span>
                      </h3>
                      {items.length === 0 ? (
                        <p className="text-xs text-brown/60 pl-10">
                          Không có thành viên phù hợp.
                        </p>
                      ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2 pl-1">
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
          </div>

          <div className="shrink-0 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 md:px-20 py-1.5 text-[11px] text-brown">
            <p className="font-serif italic">
              Gia tộc họ Nguyễn – {HOME} – Gia phả lập năm {FOUNDED}
            </p>
            <div className="flex items-center gap-2 border border-bronze/60 bg-paper/80 rounded px-2 py-0.5 mr-8 md:mr-16">
              <span className="font-semibold">Chú giải:</span>
              {legend.map((k) => (
                <span
                  key={k}
                  className="flex items-center gap-1 font-semibold"
                  style={{ color: REL[k].color }}
                >
                  <i
                    className="inline-block w-3 h-2.5 border-2 bg-white"
                    style={{ borderColor: REL[k].color }}
                  />
                  {REL[k].label}
                </span>
              ))}
            </div>
          </div>
        </div>
        {pick && (
          <RootPicker
            onClose={() => setPick(false)}
            onPick={(id) => {
              setRootId(id)
              setPick(false)
            }}
          />
        )}
      </Board>
    </div>
  )
}
