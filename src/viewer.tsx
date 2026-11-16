import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp, go, useLoading } from './store'
import { Board, BoardDecor, Scroll, Couplet, COUPLET_L, COUPLET_R, MiniLotus } from './orn'
import { Badge, Empty, ErrorState, RoleSwitcher, Skeleton, btnPrimary, fmtTime } from './ui'
import { Member, REL, relOf, infoLine, norm, MAXGEN, HOME, FOUNDED, TYPE_LABEL } from './data'

export function TopBar({ route }: { route: string }) {
  const { role, logout, loggedIn, actor } = useApp()
  const link = (p: string, t: string, on: boolean) => <a href={'#' + p} className={`px-2.5 py-1 rounded whitespace-nowrap ${on ? 'bg-gold/25 text-gold' : 'text-amber-100/85 hover:text-white'}`}>{t}</a>
  return (
    <header className="h-11 bg-maroon-dark text-amber-50 flex items-center gap-2 px-3 text-sm border-b-2 border-bronze sticky top-0 z-50">
      <span className="font-serif font-bold text-gold hidden sm:block mr-2 whitespace-nowrap">Gia phả họ Nguyễn</span>
      <nav className="flex items-center overflow-x-auto flex-1 min-w-0">
        {loggedIn && <>
          {link('/', 'Trang chủ', route === '/')}
          {link('/tree', 'Cây gia phả', route === '/tree')}
          {link('/my', 'Góp ý của tôi', route === '/my')}
          {role !== 'viewer' && link('/admin', role === 'admin' ? 'Quản trị' : 'Duyệt góp ý', false)}
        </>}
      </nav>
      <RoleSwitcher />
      {loggedIn && <button onClick={logout} className="text-xs text-amber-100/80 hover:text-white whitespace-nowrap" title={actor}>Đăng xuất</button>}
    </header>
  )
}

/* ---------- Member card ---------- */
const BH = 48, RBH = 60, CW = 192, RW = 260
type Unit = { main: Member; persons: Member[] }
export function makeUnit(m: Member, all: Member[]): Unit {
  const sp = all.filter((x) => x.spouseOf === m.id)
  return { main: m, persons: m.gender === 'F' ? [...sp, m] : [m, ...sp] }
}
function spouseLabel(p: Member, u: Unit) {
  if (!p.spouseOf) return ''
  if (p.gender === 'M') return 'Chồng'
  const wives = u.persons.filter((x) => x.gender === 'F' && x.spouseOf)
  return wives.length > 1 ? `Vợ ${wives.indexOf(p) + 1}` : 'Vợ'
}
export function MemberCard({ u, onOpen, dim, hit, root, flat }: { u: Unit; onOpen: (id: string) => void; dim?: boolean; hit?: boolean; root?: boolean; flat?: boolean }) {
  const col = REL[relOf(u.main)].color
  const dead = u.main.status === 'dead' && u.persons.every((p) => p.status === 'dead')
  const bh = root ? RBH : BH
  return (
    <div className={`rounded-sm overflow-hidden transition-opacity ${dim ? 'opacity-25' : ''} ${hit ? 'ring-4 ring-gold' : ''}`}
      style={{ width: flat ? '100%' : root ? RW : CW, border: `${root ? 3 : 2}px solid ${root ? '#c4161c' : dead ? col + 'aa' : col}`, background: root ? '#f7c93b' : dead ? '#f4ecd2' : '#fff', boxShadow: '0 1px 3px rgba(74,46,26,.25)' }}>
      {u.persons.map((p, i) => {
        const info = infoLine(p), lab = spouseLabel(p, u), pd = p.status === 'dead'
        return (
          <button key={p.id} onClick={() => onOpen(p.id)} title={p.name} aria-label={`Xem ${p.name}`}
            className={`block w-full text-center px-1 hover:bg-gold/30 focus:outline-none focus-visible:bg-gold/40 ${i ? 'border-t border-dashed' : ''}`}
            style={{ height: flat ? undefined : bh, minHeight: flat ? bh : undefined, borderColor: REL[relOf(p)].color + '88', paddingTop: 3, color: pd && !root ? '#4a2e1acc' : '#3b2616' }}>
            <div className={`font-serif font-bold uppercase leading-[16px] truncate ${root ? 'text-[14px]' : 'text-[11px]'}`} style={{ color: root ? '#8b1a1a' : undefined }}>
              {lab && <i className="not-italic font-semibold normal-case text-[10px] mr-1" style={{ color: REL[relOf(p)].color }}>{lab}:</i>}{p.name}
            </div>
            <div className={`leading-[15px] flex items-center justify-center gap-1 ${root ? 'text-[12px]' : 'text-[10.5px]'} ${pd ? 'opacity-80' : ''}`}>
              {info.text}{info.lotus && <MiniLotus className="w-3.5 h-2.5" />}
            </div>
            {p.note && <div className="text-[9.5px] italic leading-[12px] truncate opacity-80">{p.note}</div>}
          </button>
        )
      })}
    </div>
  )
}

/* ---------- Drawer ---------- */
export function Drawer() {
  const { openId, openMember, byId, members, role } = useApp()
  if (!openId) return null
  const m = byId[openId]
  const bad = !m
  const Rel = ({ id }: { id: string | null }) => id && byId[id] ? <button onClick={() => openMember(id)} className="text-maroon underline underline-offset-2 hover:text-maroon-dark text-left">{byId[id].name}</button> : <span className="text-brown/60">Chưa có thông tin</span>
  const spouses = bad ? [] : members.filter((x) => x.spouseOf === m.id)
  const kids = bad ? [] : members.filter((x) => x.fatherId === m.id)
  const info = bad ? null : infoLine(m)
  const row = (k: string, v: any) => <div className="grid grid-cols-[110px_1fr] gap-2 py-2 border-b border-gold/40 text-sm"><dt className="text-brown/60">{k}</dt><dd className="font-medium">{v}</dd></div>
  return (
    <div className="fixed inset-0 z-[90] flex justify-end" role="dialog" aria-modal="true" aria-label="Chi tiết thành viên">
      <div className="absolute inset-0 bg-black/40 fade" onClick={() => openMember(null)} />
      <aside className="relative w-full sm:w-[440px] h-full bg-[#f7edcb] p-3 sm:p-4 overflow-y-auto fade">
        <div className="paper p-5 min-h-full">
          <div className="flex justify-between items-start">
            <span className="text-xs tracking-widest text-bronze uppercase">Chi tiết thành viên</span>
            <button onClick={() => openMember(null)} className="text-2xl leading-none text-brown/70 hover:text-brown" aria-label="Đóng">×</button>
          </div>
          {bad ? <ErrorState title="Không tìm thấy thành viên" /> : <>
            <h2 className="font-serif font-bold text-2xl uppercase text-maroon mt-2 leading-tight">{m.name}</h2>
            <p className="text-sm mt-1" style={{ color: REL[relOf(m)].color }}>{REL[relOf(m)].label}</p>
            <div className="h-px bg-bronze/40 my-3" />
            <dl>
              {row('Giới tính', m.gender === 'M' ? 'Nam' : 'Nữ')}
              {row(m.status === 'alive' ? 'Năm sinh' : 'Năm sinh – năm mất', m.status === 'alive' ? (m.birth ?? 'Chưa rõ') : m.death ? `${m.birth ?? '?'} – ${m.death}` : `${m.birth ?? 'Chưa rõ'} – không rõ`)}
              {m.status === 'dead' && row('Ngày giỗ (âm lịch)', m.gio ?? 'Không rõ')}
              {row('Tình trạng', <span className="flex items-center gap-1">{m.status === 'alive' ? 'Còn sống' : <>Đã mất <MiniLotus className="w-4 h-3" /></>}</span>)}
              {row('Đời', `Đời thứ ${m.gen}`)}
              {row('Cha', <Rel id={m.fatherId} />)}
              {row('Mẹ', <Rel id={m.motherId} />)}
              {row(m.gender === 'M' ? 'Vợ' : 'Chồng', spouses.length ? <div className="flex flex-col">{spouses.map((s) => <Rel key={s.id} id={s.id} />)}</div> : m.spouseOf ? <Rel id={m.spouseOf} /> : <span className="text-brown/60">Chưa có thông tin</span>)}
              {row('Con', kids.length ? <div className="flex flex-col">{kids.map((s) => <Rel key={s.id} id={s.id} />)}</div> : <span className="text-brown/60">Chưa có</span>)}
              {row('Quê quán', m.hometown)}
              {m.note && row('Ghi chú', m.note)}
            </dl>
            <h3 className="font-serif font-semibold mt-4 text-brown">Tiểu sử</h3>
            <p className="text-sm leading-relaxed mt-1 text-brown/90">{m.bio || 'Chưa có tiểu sử.'}</p>
            <button onClick={() => { openMember(null); go('/feedback/' + m.id) }} className={`${btnPrimary} w-full mt-6`}>Góp ý / Báo sai thông tin</button>
            {role === 'admin' && <button onClick={() => { openMember(null); go('/admin/members') }} className="w-full mt-2 text-sm text-bronze underline">Mở trong trang quản trị</button>}
          </>}
        </div>
      </aside>
    </div>
  )
}

/* ---------- Login ---------- */
export function Login() {
  const { login } = useApp()
  return (
    <div className="p-2 sm:p-4 min-h-[calc(100dvh-44px)] flex"><Board className="flex-1 w-full">
      <BoardDecor />
      <div className="relative flex flex-col items-center px-4 py-6 md:py-8 min-h-[560px]">
        <Scroll className="w-full max-w-[560px]" />
        <div className="paper mt-8 md:mt-10 p-7 max-w-md w-full text-center fade">
          <h1 className="font-serif font-bold text-2xl text-maroon">Kính chào</h1>
          <p className="text-sm text-brown/80 mt-2 leading-relaxed">Kính mời con cháu đăng nhập để xem Gia phả họ Nguyễn và gửi góp ý cho Tộc trưởng.</p>
          <button onClick={() => { login(); go('/') }} className="mt-6 w-full flex items-center justify-center gap-3 bg-white border border-stone-300 hover:bg-stone-50 rounded-md py-3 font-medium text-stone-800">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" /><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.500 42.600 14.600 48 24 48z" /></svg>
            Đăng nhập với Google
          </button>
          <p className="text-xs text-brown/50 mt-3">Đăng nhập giả lập dùng cho bản thử. Có thể đổi vai trò ở thanh phía trên.</p>
        </div>
      </div>
    </Board></div>
  )
}

/* ---------- Search box (shared) ---------- */
function useSearch(members: Member[], q: string) {
  return useMemo(() => { const n = norm(q.trim()); return n ? members.filter((m) => norm(m.name).includes(n)) : [] }, [members, q])
}

export function Home() {
  const { members, openMember, actor } = useApp()
  const [q, setQ] = useState('')
  const res = useSearch(members, q)
  return (
    <div className="p-2 sm:p-4 min-h-[calc(100dvh-44px)] flex"><Board className="flex-1 w-full">
      <BoardDecor />
      <div className="relative flex flex-col items-center px-4 py-6 md:py-8 min-h-[600px] fade">
        <Scroll className="w-full max-w-[600px]" sub="Dòng họ Nguyễn – Đông Triều, Quảng Ninh" />
        <p className="font-serif text-brown mt-8 text-lg">Kính chào, <b>{actor}</b></p>
        <p className="text-sm text-brown/75 mt-1 text-center">Gia phả gồm {members.filter((m) => !m.spouseOf).length} thành viên huyết thống trải dài {MAXGEN} đời.</p>
        <div className="w-full max-w-md mt-6 relative">
          <label className="sr-only" htmlFor="hq">Tìm thành viên</label>
          <input id="hq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm thành viên theo họ tên…" className="w-full rounded-md border border-bronze bg-paper px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold" />
          {q.trim() && (
            <ul className="absolute z-20 mt-1 w-full max-h-64 overflow-auto bg-paper border border-bronze rounded-md shadow-lg fade">
              {res.length === 0 && <li className="px-4 py-3 text-sm text-brown/70">Không tìm thấy thành viên phù hợp.</li>}
              {res.slice(0, 12).map((m) => (
                <li key={m.id}><button onClick={() => openMember(m.id)} className="w-full text-left px-4 py-2 hover:bg-gold/25 flex justify-between gap-2 text-sm">
                  <span className="font-serif font-semibold uppercase text-maroon">{m.name}</span><span className="text-brown/60 whitespace-nowrap">Đời {m.gen}</span></button></li>
              ))}
            </ul>
          )}
        </div>
        <button onClick={() => go('/tree')} className={`${btnPrimary} mt-6 text-lg px-8 py-3`}>Xem cây gia phả</button>
        <div className="md:hidden mt-8 flex gap-4"><Couplet words={COUPLET_L} /><Couplet words={COUPLET_R} /></div>
      </div>
    </Board></div>
  )
}

/* ---------- Tree ---------- */
const PITCH = 170, GAP = 14, PAGES = [1, 7, 13, 19]
type TNode = { u: Unit; w: number; h: number; sub: number; cx: number; x: number; y: number; kids: TNode[]; gen: number }

export function Tree() {
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
      const u = makeUnit(m, members), root = m.gen === 1
      const kids = m.gen < last ? members.filter((x) => x.fatherId === m.id && !x.spouseOf).map(build) : []
      const w = root ? RW : CW, h = u.persons.length * (root ? RBH : BH) + 6
      const kw = kids.reduce((s, k) => s + k.sub, 0) + GAP * Math.max(0, kids.length - 1)
      return { u, w, h, sub: Math.max(w, kw), cx: 0, x: 0, y: (m.gen - start) * PITCH + 10, kids, gen: m.gen }
    }
    const place = (n: TNode, left: number) => {
      const kw = n.kids.reduce((s, k) => s + k.sub, 0) + GAP * Math.max(0, n.kids.length - 1)
      let x = left + (n.sub - kw) / 2
      n.kids.forEach((k) => { place(k, x); x += k.sub + GAP })
      n.cx = n.kids.length ? (n.kids[0].cx + n.kids[n.kids.length - 1].cx) / 2 : left + n.sub / 2
      n.x = n.cx - n.w / 2
    }
    const rs = (rootId && byId[rootId] ? [byId[rootId]] : members.filter((m) => !m.spouseOf && m.gen === start)).map(build)
    let x = 24
    rs.forEach((r) => { place(r, x); x += r.sub + GAP * 2 })
    return { roots: rs, W: Math.max(x + 10, 300), H: rows * PITCH + 10 }
  }, [members, start, last, rootId, rows, byId])

  const flat = useMemo(() => { const a: TNode[] = []; const f = (n: TNode) => { a.push(n); n.kids.forEach(f) }; roots.forEach(f); return a }, [roots])
  const mobile = vp.w < 640
  const fit = mobile ? 0.8 : Math.max(0.4, Math.min(1, (vp.w - 64) / W, vp.h / H))
  const s = z ?? fit
  useEffect(() => setZ(null), [start, rootId])
  useEffect(() => {
    const el = vpRef.current; if (!el) return
    const ro = new ResizeObserver(() => setVp({ w: el.clientWidth, h: el.clientHeight })); ro.observe(el)
    return () => ro.disconnect()
  }, [mode])

  const drag = useRef<any>(null)
  const dim = (n: TNode) => {
    const ps = n.u.persons
    const fOk = filter === 'all' || ps.some((p) => p.status === filter)
    const qOk = !q.trim() || hitIds.has(n.u.main.id)
    return !(fOk && qOk)
  }
  const legend = (['son', 'daughter', 'dil', 'sil'] as const)
  const jump = (m: Member) => { const id = m.spouseOf ?? m.id; const g = byId[id].gen; setRootId(null); setPage(g >= 19 ? 3 : g >= 13 ? 2 : g >= 7 ? 1 : 0); setQ(''); openMember(m.id) }
  const lists = Array.from({ length: rows }, (_, i) => start + i)
  const inRoot = (m: Member) => { if (!rootId) return true; let c: Member | undefined = byId[m.spouseOf ?? m.id]; while (c) { if (c.id === rootId) return true; c = c.fatherId ? byId[c.fatherId] : undefined } return false }

  const btn = (on: boolean) => `px-2.5 py-1 text-xs rounded border ${on ? 'bg-maroon text-amber-50 border-maroon' : 'bg-paper/90 border-bronze/60 text-brown hover:bg-gold/30'}`
  return (
    <div className="h-[calc(100dvh-44px)] p-1.5 sm:p-3"><Board className="h-full">
      <BoardDecor tree />
      <div className="relative h-full flex flex-col">
        <div className="shrink-0 flex justify-center pt-2"><Scroll className="w-[88%] max-w-[460px] md:max-w-[420px] h-auto" /></div>
        <div className="shrink-0 flex flex-wrap items-center gap-1.5 px-2 md:px-20 pt-1 pb-1.5 justify-center relative z-30">
          <div className="flex gap-1" role="group" aria-label="Chuyển đời">
            {['Đời 1–6', '7–12', '13–18', '19–20'].map((t, i) => <button key={t} onClick={() => { setRootId(null); setPage(i) }} className={btn(!rootId && page === i)}>{t}</button>)}
          </div>
          <button onClick={() => setPick(true)} className={btn(!!rootId)}>Chọn người gốc</button>
          {rootId && <button onClick={() => setRootId(null)} className={btn(false)}>Bỏ chọn: {byId[rootId]?.name.split(' ').slice(-2).join(' ')} ×</button>}
          <div className="relative">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên…" aria-label="Tìm theo tên" className="w-36 sm:w-44 text-xs rounded border border-bronze/60 bg-paper px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-gold" />
            {q.trim() && (
              <ul className="absolute left-0 top-full mt-1 w-60 max-h-56 overflow-auto bg-paper border border-bronze rounded shadow-lg z-40">
                {search.length === 0 && <li className="px-3 py-2 text-xs text-brown/70">Không có kết quả.</li>}
                {search.slice(0, 10).map((m) => <li key={m.id}><button onClick={() => jump(m)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-gold/25 flex justify-between"><span className="font-semibold uppercase">{m.name}</span><span>Đời {m.gen}</span></button></li>)}
              </ul>
            )}
          </div>
          <div className="flex gap-1" role="group" aria-label="Lọc trạng thái">
            {([['all', 'Tất cả'], ['alive', 'Còn sống'], ['dead', 'Đã mất']] as const).map(([k, t]) => <button key={k} onClick={() => setFilter(k)} className={btn(filter === k)}>{t}</button>)}
          </div>
          <div className="flex gap-1" role="group" aria-label="Chế độ xem">
            <button onClick={() => setMode('tree')} className={btn(mode === 'tree')}>Cây</button>
            <button onClick={() => setMode('list')} className={btn(mode === 'list')}>Danh sách theo đời</button>
          </div>
          {mode === 'tree' && <div className="flex gap-1" role="group" aria-label="Thu phóng">
            <button onClick={() => setZ(Math.max(0.3, s - 0.1))} className={btn(false)} aria-label="Thu nhỏ">−</button>
            <button onClick={() => setZ(null)} className={btn(false)}>Vừa khung</button>
            <button onClick={() => setZ(Math.min(1.6, s + 0.1))} className={btn(false)} aria-label="Phóng to">+</button>
          </div>}
        </div>

        <div className="flex-1 min-h-0 md:mx-[76px] relative">
          {loading ? <div className="p-6"><Skeleton rows={4} /></div> : mode === 'tree' ? (
            roots.length === 0 ? <Empty title="Chưa có thành viên ở các đời này" text="Hãy chọn nhóm đời khác." /> :
            <div ref={vpRef} className="h-full overflow-auto cursor-grab active:cursor-grabbing select-none fade"
              onMouseDown={(e) => { if ((e.target as HTMLElement).closest('button')) return; const el = e.currentTarget; drag.current = { x: e.clientX, y: e.clientY, l: el.scrollLeft, t: el.scrollTop } }}
              onMouseMove={(e) => { if (!drag.current) return; const el = e.currentTarget; el.scrollLeft = drag.current.l - (e.clientX - drag.current.x); el.scrollTop = drag.current.t - (e.clientY - drag.current.y) }}
              onMouseUp={() => (drag.current = null)} onMouseLeave={() => (drag.current = null)}
              onWheel={(e) => { if (e.ctrlKey || e.metaKey) setZ(Math.min(1.6, Math.max(0.3, s - e.deltaY * 0.002))) }}>
              <div className="flex" style={{ width: 52 + W * s, height: H * s }}>
                <div className="sticky left-0 z-10 shrink-0" style={{ width: 52, height: H * s }}>
                  {Array.from({ length: rows }, (_, i) => (
                    <div key={i}>
                      <div className="absolute left-2 w-9 h-9 rounded-full bg-gold border-2 border-bronze text-maroon-dark font-serif font-bold text-sm flex items-center justify-center shadow" style={{ top: (PITCH * i + 10) * s + 4 }} title={`Đời ${start + i}`}>{String(start + i).padStart(2, '0')}</div>
                      {i < rows - 1 && <div className="absolute left-[25px] w-px bg-bronze" style={{ top: (PITCH * i + 10) * s + 44, height: Math.max(6, PITCH * s - 54) }}><span className="absolute -bottom-1 -left-[3px] border-x-[3.5px] border-x-transparent border-t-[6px] border-t-bronze" /></div>}
                    </div>
                  ))}
                </div>
                <div className="relative" style={{ width: W * s, height: H * s }}>
                  <div style={{ width: W, height: H, transform: `scale(${s})`, transformOrigin: '0 0', position: 'absolute' }}>
                    <svg width={W} height={H} className="absolute inset-0 pointer-events-none" fill="none" stroke="#2563eb" strokeWidth="1.3">
                      {flat.filter((n) => n.kids.length).map((n) => {
                        const y0 = n.y + n.h, ym = n.y + PITCH - 9, xs = n.kids.map((k) => k.cx)
                        return <path key={n.u.main.id} d={`M${n.cx} ${y0}V${ym}M${Math.min(...xs, n.cx)} ${ym}H${Math.max(...xs, n.cx)}${n.kids.map((k) => `M${k.cx} ${ym}V${k.y}`).join('')}`} />
                      })}
                    </svg>
                    {flat.map((n) => <div key={n.u.main.id} className="absolute" style={{ left: n.x, top: n.y }}>
                      <MemberCard u={n.u} onOpen={openMember} root={n.gen === 1} dim={dim(n)} hit={!!q.trim() && hitIds.has(n.u.main.id)} /></div>)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto px-2 pb-2 fade">
              {lists.map((g) => {
                const items = members.filter((m) => !m.spouseOf && m.gen === g && inRoot(m)).map((m) => ({ u: makeUnit(m, members), m }))
                  .filter(({ u }) => (filter === 'all' || u.persons.some((p) => p.status === filter)) && (!q.trim() || hitIds.has(u.main.id)))
                return (
                  <section key={g} className="mb-3">
                    <h3 className="sticky top-0 z-10 flex items-center gap-2 bg-[#fbf0a8]/95 py-1"><span className="w-8 h-8 rounded-full bg-gold border-2 border-bronze text-maroon-dark font-serif font-bold text-xs flex items-center justify-center">{String(g).padStart(2, '0')}</span><span className="font-serif font-semibold text-maroon">Đời thứ {g}</span></h3>
                    {items.length === 0 ? <p className="text-xs text-brown/60 pl-10">Không có thành viên phù hợp.</p> :
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2 pl-1">{items.map(({ u }) => <MemberCard key={u.main.id} u={u} flat onOpen={openMember} root={g === 1} />)}</div>}
                  </section>
                )
              })}
            </div>
          )}
        </div>

        <div className="shrink-0 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 md:px-20 py-1.5 text-[11px] text-brown">
          <p className="font-serif italic">Gia tộc họ Nguyễn – {HOME} – Gia phả lập năm {FOUNDED}</p>
          <div className="flex items-center gap-2 border border-bronze/60 bg-paper/80 rounded px-2 py-0.5 mr-8 md:mr-16">
            <span className="font-semibold">Chú giải:</span>
            {legend.map((k) => <span key={k} className="flex items-center gap-1 font-semibold" style={{ color: REL[k].color }}><i className="inline-block w-3 h-2.5 border-2 bg-white" style={{ borderColor: REL[k].color }} />{REL[k].label}</span>)}
          </div>
        </div>
      </div>
      {pick && <RootPicker onClose={() => setPick(false)} onPick={(id) => { setRootId(id); setPick(false) }} />}
    </Board></div>
  )
}

function RootPicker({ onClose, onPick }: { onClose: () => void; onPick: (id: string) => void }) {
  const { members } = useApp()
  const [q, setQ] = useState('')
  const list = members.filter((m) => !m.spouseOf && (!q.trim() || norm(m.name).includes(norm(q))))
  return (
    <div className="fixed inset-0 z-[95] bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="paper max-w-md w-full max-h-[80dvh] flex flex-col p-5 fade">
        <div className="flex justify-between items-center"><h3 className="font-serif font-bold text-lg text-maroon">Chọn người gốc</h3><button onClick={onClose} className="text-2xl leading-none" aria-label="Đóng">×</button></div>
        <p className="text-xs text-brown/70 mt-1">Cây chỉ hiển thị nhánh con cháu của người được chọn.</p>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên…" className="mt-3 border border-bronze/60 rounded px-3 py-2 text-sm bg-white" />
        <ul className="mt-2 overflow-auto divide-y divide-gold/40">
          {list.length === 0 && <li className="py-4"><Empty title="Không tìm thấy" /></li>}
          {list.map((m) => <li key={m.id}><button onClick={() => onPick(m.id)} className="w-full flex justify-between py-2 px-1 text-sm hover:bg-gold/25"><span className="font-serif font-semibold uppercase">{m.name}</span><span className="text-brown/60">Đời {m.gen}</span></button></li>)}
        </ul>
      </div>
    </div>
  )
}

/* ---------- Reading pages ---------- */
function Page({ title, children, wide }: { title: string; children: any; wide?: boolean }) {
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

export function FeedbackForm({ id }: { id: string }) {
  const { byId, addFeedback } = useApp()
  const m = byId[id]
  const [type, setType] = useState<'wrong' | 'missing' | 'other'>('wrong')
  const [content, setContent] = useState('')
  const [image, setImage] = useState<string | undefined>()
  const [err, setErr] = useState('')
  if (!m) return <Page title="Góp ý"><ErrorState title="Không tìm thấy thành viên" action={<a href="#/tree" className="underline text-maroon">Quay lại cây gia phả</a>} /></Page>
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim().length < 10) return setErr('Xin nhập nội dung góp ý tối thiểu 10 ký tự.')
    addFeedback({ memberId: id, type, content: content.trim(), image }); go('/my')
  }
  const lbl = 'block text-sm font-semibold text-brown mb-1'
  const inp = 'w-full border border-bronze/60 rounded px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold'
  return (
    <Page title="Góp ý / Báo sai thông tin">
      <form onSubmit={submit} className="space-y-4">
        <div><label className={lbl}>Thành viên liên quan</label><input readOnly value={`${m.name} – Đời ${m.gen}`} className={`${inp} bg-amber-50 font-serif uppercase`} /></div>
        <div><label className={lbl}>Loại góp ý</label>
          <div className="flex flex-wrap gap-2">{(Object.keys(TYPE_LABEL) as (keyof typeof TYPE_LABEL)[]).map((k) => (
            <label key={k} className={`px-3 py-1.5 rounded border text-sm cursor-pointer ${type === k ? 'bg-maroon text-amber-50 border-maroon' : 'border-bronze/60 bg-white'}`}><input type="radio" className="sr-only" checked={type === k} onChange={() => setType(k)} />{TYPE_LABEL[k]}</label>))}</div></div>
        <div><label className={lbl} htmlFor="nd">Nội dung</label><textarea id="nd" rows={5} value={content} onChange={(e) => { setContent(e.target.value); setErr('') }} className={inp} placeholder="Xin nêu rõ thông tin cần sửa hoặc bổ sung…" />
          {err && <p className="text-sm text-red-700 mt-1" role="alert">{err}</p>}</div>
        <div><label className={lbl}>Ảnh đính kèm (không bắt buộc)</label>
          <input type="file" accept="image/*" className="text-sm" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return setImage(undefined); const r = new FileReader(); r.onload = () => setImage(String(r.result)); r.readAsDataURL(f) }} />
          {image && <img src={image} alt="Ảnh đính kèm" className="mt-2 h-24 rounded border border-bronze/50" />}</div>
        <div className="flex gap-3 pt-2"><button className={btnPrimary}>Gửi</button><button type="button" onClick={() => history.back()} className="px-5 py-2.5 rounded-md border border-bronze/60 text-sm">Hủy</button></div>
        <p className="text-xs text-brown/60">Kính mong Tộc trưởng xem xét.</p>
      </form>
    </Page>
  )
}

export function MyFeedback() {
  const { feedbacks, actor, byId } = useApp()
  const loading = useLoading(actor, 500)
  const mine = feedbacks.filter((f) => f.author === actor)
  return (
    <Page title="Góp ý của tôi" wide>
      {loading ? <Skeleton rows={3} /> : mine.length === 0 ? <Empty title="Quý vị chưa gửi góp ý nào" text="Mở thẻ thành viên trên cây gia phả và chọn “Góp ý / Báo sai thông tin”." action={<a href="#/tree" className={`${btnPrimary} inline-block`}>Xem cây gia phả</a>} /> :
        <ul className="space-y-3">{mine.map((f) => (
          <li key={f.id} className="border border-gold/70 rounded bg-white/70 p-4 fade">
            <div className="flex flex-wrap justify-between gap-2 items-center"><span className="font-serif font-bold uppercase text-maroon">{byId[f.memberId]?.name ?? 'Thành viên đã xóa'}</span><Badge status={f.status} /></div>
            <p className="text-xs text-brown/60 mt-0.5">{TYPE_LABEL[f.type]} · {fmtTime(f.createdAt)}</p>
            <p className="text-sm mt-2">{f.content}</p>
            {f.image && <img src={f.image} alt="Ảnh đính kèm" className="mt-2 h-20 rounded border" />}
            {f.reply && <div className="mt-3 border-l-4 border-bronze bg-amber-50 px-3 py-2 text-sm"><b className="font-serif">Phản hồi của Tộc trưởng: </b>{f.reply}</div>}
          </li>))}</ul>}
    </Page>
  )
}
