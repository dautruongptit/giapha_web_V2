import { useState } from 'react'
import { useApp, useRoute, go, useLoading, Role } from './store'
import { Badge, Confirm, Empty, ErrorState, RoleSwitcher, Skeleton, fmtTime } from './ui'
import { Member, Feedback, TYPE_LABEL, STATUS_LABEL, ROLE_LABEL, infoLine, norm, REL, relOf, MAXGEN } from './data'

const primary = 'rounded-md bg-maroon hover:bg-maroon-dark text-white font-semibold px-4 py-2 text-sm shadow-sm'
const outline = 'rounded-md border border-stone-300 hover:bg-stone-50 px-3 py-2 text-sm bg-white'
const danger = 'rounded-md bg-red-700 hover:bg-red-800 text-white font-semibold px-3 py-2 text-sm'
const inp = 'w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400'

export function Admin() {
  const { role, loggedIn } = useApp()
  const route = useRoute()
  const sub = route.replace('/admin', '') || '/'
  const nav = [
    ['/', 'Tổng quan', ['chief', 'admin']], ['/members', 'Quản lý thành viên', ['admin']], ['/feedbacks', 'Quản lý góp ý', ['chief', 'admin']],
    ['/users', 'Quản lý người dùng', ['admin']], ['/logs', 'Nhật ký thay đổi', ['admin']],
  ] as const
  const allowed = (r: readonly string[]) => r.includes(role)
  const cur = nav.find((n) => n[0] === sub) || nav[0]
  let body
  if (!loggedIn) body = <ErrorState title="Chưa đăng nhập" text="Xin đăng nhập để vào trang quản trị." action={<button className={primary} onClick={() => go('/')}>Về trang đăng nhập</button>} />
  else if (role === 'viewer' || !allowed(cur[2])) body = <ErrorState title="Không có quyền truy cập" text="Tài khoản hiện tại không được phép xem mục này." action={<button className={primary} onClick={() => go(role === 'viewer' ? '/' : '/admin')}>Quay lại</button>} />
  else body = sub === '/members' ? <Members /> : sub.startsWith('/feedbacks') ? <Feedbacks /> : sub === '/users' ? <Users /> : sub === '/logs' ? <Logs /> : <Dashboard />
  return (
    <div className="min-h-dvh bg-stone-50 text-stone-800 md:flex">
      <aside className="md:w-60 md:min-h-dvh bg-white border-b md:border-b-0 md:border-r border-stone-200 shrink-0">
        <div className="px-4 py-4 flex md:block items-center justify-between">
          <div><div className="font-serif font-bold text-maroon text-lg leading-tight">Quản trị gia phả</div><div className="text-xs text-stone-500">Dòng họ Nguyễn</div></div>
        </div>
        <nav className="flex md:flex-col overflow-x-auto px-2 pb-2 gap-1">
          {nav.filter((n) => role !== 'viewer' && allowed(n[2])).map((n) => (
            <a key={n[0]} href={'#/admin' + (n[0] === '/' ? '' : n[0])} className={`px-3 py-2 rounded-md text-sm whitespace-nowrap ${cur[0] === n[0] ? 'bg-maroon text-white font-semibold' : 'text-stone-700 hover:bg-amber-50'}`}>{n[1]}</a>
          ))}
          <a href="#/" className="px-3 py-2 rounded-md text-sm text-stone-500 hover:bg-amber-50 whitespace-nowrap md:mt-4 md:border-t md:border-stone-200">← Về giao diện Viewer</a>
        </nav>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="h-14 bg-white border-b border-stone-200 flex items-center justify-between px-4 sticky top-0 z-30 gap-2">
          <h1 className="font-semibold text-stone-900">{cur[1]}</h1>
          <div className="flex items-center gap-3"><RoleSwitcher dark={false} /><span className="hidden sm:inline text-sm text-stone-600">{ROLE_LABEL[role]}</span></div>
        </div>
        <div className="p-4 md:p-6 max-w-6xl">{body}</div>
      </main>
    </div>
  )
}

function Dashboard() {
  const { members, feedbacks, logs, byId } = useApp()
  const loading = useLoading('d', 500)
  const pending = feedbacks.filter((f) => f.status === 'pending')
  const stat = (t: string, v: any, sub?: string) => <div className="bg-white border border-stone-200 rounded-lg p-4 border-t-4 border-t-amber-600"><div className="text-sm text-stone-500">{t}</div><div className="text-3xl font-serif font-bold text-maroon mt-1">{v}</div>{sub && <div className="text-xs text-stone-500 mt-1">{sub}</div>}</div>
  if (loading) return <Skeleton rows={4} />
  return (
    <div className="space-y-6 fade">
      <div className="grid sm:grid-cols-3 gap-4">
        {stat('Tổng số thành viên', members.length, `${members.filter((m) => m.status === 'alive').length} còn sống · ${members.filter((m) => m.status === 'dead').length} đã mất`)}
        {stat('Góp ý chờ duyệt', pending.length, 'Cần Tộc trưởng xem xét')}
        {stat('Số đời', MAXGEN)}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <section className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3"><h2 className="font-semibold">Góp ý chờ duyệt</h2><a href="#/admin/feedbacks" className="text-sm text-maroon underline">Xem tất cả</a></div>
          {pending.length === 0 ? <Empty title="Không có góp ý chờ duyệt" /> : <ul className="divide-y divide-stone-100">{pending.map((f) => <li key={f.id}><button onClick={() => go('/admin/feedbacks/' + f.id)} className="w-full text-left py-2.5 hover:bg-amber-50 px-1 flex justify-between gap-2 text-sm"><span><b>{byId[f.memberId]?.name}</b><br /><span className="text-stone-500">{TYPE_LABEL[f.type]} · {f.author}</span></span><Badge status={f.status} /></button></li>)}</ul>}
        </section>
        <section className="bg-white border border-stone-200 rounded-lg p-4">
          <h2 className="font-semibold mb-3">Thay đổi gần đây</h2>
          <ul className="divide-y divide-stone-100">{logs.slice(0, 6).map((l) => <li key={l.id} className="py-2.5 text-sm"><span className="font-medium">{l.who}</span> {l.what.charAt(0).toLowerCase() + l.what.slice(1)}<div className="text-xs text-stone-500">{fmtTime(l.at)}</div></li>)}</ul>
        </section>
      </div>
    </div>
  )
}

/* ---------- Members ---------- */
function Members() {
  const { members, deleteMember, byId } = useApp()
  const [q, setQ] = useState(''); const [st, setSt] = useState('all'); const [gen, setGen] = useState('all')
  const [edit, setEdit] = useState<Member | 'new' | null>(null)
  const [del, setDel] = useState<Member | null>(null)
  const [err, setErr] = useState('')
  const loading = useLoading('m', 500)
  const list = members.filter((m) => (!q.trim() || norm(m.name).includes(norm(q))) && (st === 'all' || m.status === st) && (gen === 'all' || m.gen === +gen))
  if (edit) return <MemberForm initial={edit === 'new' ? null : edit} onClose={() => setEdit(null)} />
  return (
    <div className="space-y-4 fade">
      <div className="flex flex-wrap gap-2 items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo họ tên…" className={`${inp} sm:w-64`} />
        <select value={st} onChange={(e) => setSt(e.target.value)} className={`${inp} w-auto`}><option value="all">Mọi trạng thái</option><option value="alive">Còn sống</option><option value="dead">Đã mất</option></select>
        <select value={gen} onChange={(e) => setGen(e.target.value)} className={`${inp} w-auto`}><option value="all">Mọi đời</option>{Array.from({ length: MAXGEN }, (_, i) => <option key={i} value={i + 1}>Đời {i + 1}</option>)}</select>
        <button className={`${primary} ml-auto`} onClick={() => setEdit('new')}>+ Thêm thành viên</button>
      </div>
      {err && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2" role="alert">{err}</p>}
      {loading ? <Skeleton /> : list.length === 0 ? <Empty title="Không có thành viên phù hợp" text="Thử đổi từ khóa hoặc bộ lọc." /> : (
        <div className="bg-white border border-stone-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-amber-50 text-left text-stone-600"><tr>{['Họ tên', 'Quan hệ', 'Đời', 'Năm sinh – mất', 'Trạng thái', ''].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr></thead>
            <tbody>{list.map((m) => (
              <tr key={m.id} className="border-t border-stone-100 hover:bg-amber-50/40">
                <td className="px-3 py-2.5 font-medium">{m.name}</td><td className="px-3" style={{ color: REL[relOf(m)].color }}>{REL[relOf(m)].label}</td><td className="px-3">{m.gen}</td>
                <td className="px-3">{infoLine(m).text}</td><td className="px-3">{m.status === 'alive' ? 'Còn sống' : 'Đã mất'}</td>
                <td className="px-3 text-right whitespace-nowrap"><button className="text-maroon font-medium mr-3" onClick={() => setEdit(m)}>Sửa</button><button className="text-red-700 font-medium" onClick={() => { setErr(''); setDel(m) }}>Xóa</button></td>
              </tr>))}</tbody>
          </table>
        </div>
      )}
      {del && <Confirm title="Xóa thành viên" okLabel="Xóa" text={`Bạn chắc chắn muốn xóa "${del.name}"? Thao tác này không thể hoàn tác.`} onCancel={() => setDel(null)}
        onOk={() => {
          if (members.some((x) => x.fatherId === del.id || x.spouseOf === del.id)) setErr(`Không thể xóa "${del.name}" vì còn con hoặc vợ/chồng liên kết. Hãy xóa hoặc chuyển các hồ sơ đó trước.`)
          else deleteMember(del.id)
          setDel(null)
        }} />}
    </div>
  )
}

function MemberForm({ initial, onClose }: { initial: Member | null; onClose: () => void }) {
  const { members, saveMember } = useApp()
  const [f, setF] = useState<Member>(initial ?? { id: 'm' + Date.now(), name: '', gender: 'M', gen: 2, status: 'alive', birth: null, death: null, gio: null, fatherId: null, motherId: null, spouseOf: null, note: '', hometown: 'Đông Triều, Quảng Ninh', bio: '' })
  const [bUnk, setBUnk] = useState(initial ? initial.birth === null : false)
  const [dUnk, setDUnk] = useState(initial ? initial.status === 'dead' && initial.death === null : false)
  const [errs, setErrs] = useState<Record<string, string>>({})
  const set = (p: Partial<Member>) => setF((x) => ({ ...x, ...p }))
  const blood = members.filter((m) => !m.spouseOf && m.id !== f.id)
  const fathers = blood.filter((m) => m.gender === 'M' && m.gen === f.gen - 1)
  const mothers = members.filter((m) => m.spouseOf === f.fatherId && m.gender === 'F')
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (!f.name.trim()) er.name = 'Vui lòng nhập họ tên.'
    if (f.gen < 1 || f.gen > MAXGEN) er.gen = `Đời từ 1 đến ${MAXGEN}.`
    if (!bUnk && (!f.birth || f.birth < 1000 || f.birth > 2100)) er.birth = 'Nhập năm sinh hợp lệ hoặc tick “Không rõ”.'
    if (f.status === 'dead' && !dUnk && (!f.death || f.death < 1000 || f.death > 2100 || (f.birth && f.death < f.birth))) er.death = 'Năm mất không hợp lệ.'
    if (f.status === 'dead' && f.gio && !/^(0?[1-9]|[12]\d|3[01])\/(0?[1-9]|1[0-2])$/.test(f.gio)) er.gio = 'Nhập theo định dạng dd/mm.'
    if (!f.spouseOf && f.gen > 1 && !f.fatherId) er.father = 'Vui lòng chọn cha.'
    setErrs(er); if (Object.keys(er).length) return
    saveMember({ ...f, name: f.name.trim(), birth: bUnk ? null : f.birth, death: f.status === 'dead' && !dUnk ? f.death : null, gio: f.status === 'dead' ? f.gio || null : null }, !initial); onClose()
  }
  const Field = ({ l, k, children }: { l: string; k?: string; children: any }) => <div><label className="block text-sm font-medium mb-1">{l}</label>{children}{k && errs[k] && <p className="text-xs text-red-700 mt-1" role="alert">{errs[k]}</p>}</div>
  return (
    <form onSubmit={submit} className="bg-white border border-stone-200 rounded-lg p-5 max-w-3xl space-y-4 fade">
      <h2 className="text-lg font-semibold">{initial ? 'Sửa thành viên' : 'Thêm thành viên'}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field l="Họ tên *" k="name"><input className={inp} value={f.name} onChange={(e) => set({ name: e.target.value })} /></Field>
        <Field l="Giới tính"><select className={inp} value={f.gender} onChange={(e) => set({ gender: e.target.value as any })}><option value="M">Nam</option><option value="F">Nữ</option></select></Field>
        <Field l="Đời *" k="gen"><input type="number" min={1} max={MAXGEN} className={inp} value={f.gen} onChange={(e) => set({ gen: +e.target.value, fatherId: null, motherId: null })} /></Field>
        <Field l="Là vợ/chồng của"><select className={inp} value={f.spouseOf ?? ''} onChange={(e) => set({ spouseOf: e.target.value || null, fatherId: null, motherId: null })}><option value="">Không (thành viên huyết thống)</option>{blood.map((m) => <option key={m.id} value={m.id}>{m.name} (đời {m.gen})</option>)}</select></Field>
        {!f.spouseOf && <>
          <Field l="Cha" k="father"><select className={inp} value={f.fatherId ?? ''} onChange={(e) => set({ fatherId: e.target.value || null, motherId: null })}><option value="">{f.gen === 1 ? 'Không (cụ tổ)' : '— Chọn cha —'}</option>{fathers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></Field>
          <Field l="Mẹ"><select className={inp} value={f.motherId ?? ''} onChange={(e) => set({ motherId: e.target.value || null })}><option value="">— Chưa rõ —</option>{mothers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></Field>
        </>}
      </div>
      <div className="grid sm:grid-cols-2 gap-4 border-t border-stone-100 pt-4">
        <Field l="Trạng thái"><div className="flex gap-4 text-sm py-2">{(['alive', 'dead'] as const).map((s) => <label key={s} className="flex items-center gap-1.5"><input type="radio" checked={f.status === s} onChange={() => set({ status: s })} />{s === 'alive' ? 'Còn sống' : 'Đã mất'}</label>)}</div></Field>
        <Field l="Năm sinh" k="birth"><div className="flex items-center gap-3"><input type="number" disabled={bUnk} className={`${inp} disabled:bg-stone-100`} value={bUnk ? '' : f.birth ?? ''} onChange={(e) => set({ birth: e.target.value ? +e.target.value : null })} /><label className="flex items-center gap-1.5 text-sm whitespace-nowrap"><input type="checkbox" checked={bUnk} onChange={(e) => setBUnk(e.target.checked)} />Không rõ</label></div></Field>
        {f.status === 'dead' && <>
          <Field l="Năm mất" k="death"><div className="flex items-center gap-3"><input type="number" disabled={dUnk} className={`${inp} disabled:bg-stone-100`} value={dUnk ? '' : f.death ?? ''} onChange={(e) => set({ death: e.target.value ? +e.target.value : null })} /><label className="flex items-center gap-1.5 text-sm whitespace-nowrap"><input type="checkbox" checked={dUnk} onChange={(e) => setDUnk(e.target.checked)} />Không rõ năm mất</label></div></Field>
          <Field l="Ngày giỗ (âm lịch, dd/mm) – không bắt buộc" k="gio"><input className={inp} placeholder="21/07" value={f.gio ?? ''} onChange={(e) => set({ gio: e.target.value })} /></Field>
        </>}
      </div>
      <div className="grid gap-4 border-t border-stone-100 pt-4">
        <Field l="Ảnh"><input type="file" accept="image/*" className="text-sm" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = () => set({ photo: String(r.result) }); r.readAsDataURL(file) }} />{f.photo && <img src={f.photo} alt="" className="h-20 mt-2 rounded border" />}</Field>
        <Field l="Quê quán"><input className={inp} value={f.hometown} onChange={(e) => set({ hometown: e.target.value })} /></Field>
        <Field l="Ghi chú (nơi ở, nghề nghiệp)"><input className={inp} value={f.note} onChange={(e) => set({ note: e.target.value })} /></Field>
        <Field l="Tiểu sử"><textarea rows={4} className={inp} value={f.bio} onChange={(e) => set({ bio: e.target.value })} /></Field>
      </div>
      <div className="flex gap-2 pt-2"><button className={primary}>Lưu</button><button type="button" className={outline} onClick={onClose}>Hủy</button></div>
    </form>
  )
}

/* ---------- Feedbacks ---------- */
function Feedbacks() {
  const { feedbacks, byId } = useApp()
  const route = useRoute()
  const id = route.split('/')[3]
  const [st, setSt] = useState('all')
  const loading = useLoading('f', 500)
  if (id) { const f = feedbacks.find((x) => x.id === id); return f ? <FeedbackDetail f={f} /> : <ErrorState title="Không tìm thấy góp ý" action={<button className={outline} onClick={() => go('/admin/feedbacks')}>Quay lại</button>} /> }
  const list = feedbacks.filter((f) => st === 'all' || f.status === st)
  return (
    <div className="space-y-4 fade">
      <div className="flex flex-wrap gap-2">{['all', 'pending', 'accepted', 'rejected'].map((s) => <button key={s} onClick={() => setSt(s)} className={`px-3 py-1.5 rounded-full text-sm border ${st === s ? 'bg-maroon text-white border-maroon' : 'bg-white border-stone-300'}`}>{s === 'all' ? 'Tất cả' : STATUS_LABEL[s as keyof typeof STATUS_LABEL]}</button>)}</div>
      {loading ? <Skeleton /> : list.length === 0 ? <Empty title="Không có góp ý" text="Chưa có góp ý nào ở trạng thái này." /> : (
        <div className="bg-white border border-stone-200 rounded-lg overflow-x-auto"><table className="w-full text-sm min-w-[640px]">
          <thead className="bg-amber-50 text-left text-stone-600"><tr>{['Thành viên', 'Loại', 'Người gửi', 'Thời gian', 'Trạng thái'].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr></thead>
          <tbody>{list.map((f) => <tr key={f.id} onClick={() => go('/admin/feedbacks/' + f.id)} className="border-t border-stone-100 hover:bg-amber-50/50 cursor-pointer"><td className="px-3 py-2.5 font-medium">{byId[f.memberId]?.name}</td><td className="px-3">{TYPE_LABEL[f.type]}</td><td className="px-3">{f.author}</td><td className="px-3 whitespace-nowrap">{fmtTime(f.createdAt)}</td><td className="px-3"><Badge status={f.status} /></td></tr>)}</tbody>
        </table></div>)}
    </div>
  )
}
function FeedbackDetail({ f }: { f: Feedback }) {
  const { byId, decide, members, role } = useApp()
  const m = byId[f.memberId]
  const [reply, setReply] = useState(f.reply)
  const done = f.status !== 'pending'
  const kv = (k: string, v: any) => <div className="flex gap-3 py-1.5 text-sm border-b border-stone-100"><dt className="w-28 text-stone-500 shrink-0">{k}</dt><dd>{v}</dd></div>
  return (
    <div className="space-y-4 fade">
      <button className="text-sm text-maroon underline" onClick={() => go('/admin/feedbacks')}>← Danh sách góp ý</button>
      <div className="grid md:grid-cols-2 gap-4">
        <section className="bg-white border border-stone-200 rounded-lg p-4"><h2 className="font-semibold mb-2">Thông tin hiện tại</h2>
          {m ? <dl>{kv('Họ tên', m.name)}{kv('Giới tính', m.gender === 'M' ? 'Nam' : 'Nữ')}{kv('Đời', m.gen)}{kv('Năm sinh – mất', infoLine(m).text)}{kv('Cha', byId[m.fatherId ?? '']?.name ?? '—')}{kv('Vợ/chồng', members.filter((x) => x.spouseOf === m.id || x.id === m.spouseOf).map((x) => x.name).join(', ') || '—')}{kv('Quê quán', m.hometown)}{kv('Ghi chú', m.note || '—')}</dl> : <ErrorState title="Thành viên đã bị xóa" />}
          {role === 'admin' && m && <button className="mt-3 text-sm text-maroon underline" onClick={() => go('/admin/members')}>Mở trang quản lý thành viên</button>}</section>
        <section className="bg-white border border-stone-200 rounded-lg p-4"><h2 className="font-semibold mb-2">Nội dung góp ý</h2>
          <dl>{kv('Loại', TYPE_LABEL[f.type])}{kv('Người gửi', f.author)}{kv('Thời gian', fmtTime(f.createdAt))}{kv('Trạng thái', <Badge status={f.status} />)}</dl>
          <p className="text-sm mt-3 bg-amber-50 border border-amber-200 rounded p-3 leading-relaxed">{f.content}</p>
          {f.image && <img src={f.image} alt="Ảnh đính kèm" className="mt-3 max-h-40 rounded border" />}</section>
      </div>
      <section className="bg-white border border-stone-200 rounded-lg p-4">
        <label className="block text-sm font-medium mb-1">Ghi chú phản hồi</label>
        <textarea rows={3} disabled={done} value={reply} onChange={(e) => setReply(e.target.value)} className={`${inp} disabled:bg-stone-100`} placeholder="Phản hồi gửi đến người góp ý…" />
        {done ? <p className="text-sm text-stone-500 mt-2">Góp ý này đã được xử lý.</p> :
          <div className="flex gap-2 mt-3"><button className={primary} onClick={() => { decide(f.id, 'accepted', reply); go('/admin/feedbacks') }}>Chấp nhận</button>
            <button className="rounded-md border border-red-300 text-red-800 hover:bg-red-50 px-4 py-2 text-sm font-semibold bg-white" onClick={() => { decide(f.id, 'rejected', reply); go('/admin/feedbacks') }}>Từ chối</button></div>}
      </section>
    </div>
  )
}

/* ---------- Users ---------- */
function Users() {
  const { users, setUserRole, toggleLock } = useApp()
  const [lock, setLock] = useState<string | null>(null)
  const loading = useLoading('u', 500)
  const target = users.find((u) => u.id === lock)
  if (loading) return <Skeleton />
  return (
    <div className="bg-white border border-stone-200 rounded-lg overflow-x-auto fade">
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-amber-50 text-left text-stone-600"><tr>{['Người dùng', 'Email', 'Vai trò', 'Tình trạng', ''].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr></thead>
        <tbody>{users.map((u) => (
          <tr key={u.id} className="border-t border-stone-100">
            <td className="px-3 py-2.5 font-medium">{u.name}</td><td className="px-3 text-stone-600">{u.email}</td>
            <td className="px-3"><select value={u.role} onChange={(e) => setUserRole(u.id, e.target.value as Role)} className="border border-stone-300 rounded px-2 py-1 bg-white">{(['viewer', 'chief', 'admin'] as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select></td>
            <td className="px-3">{u.locked ? <span className="text-red-800 bg-red-100 border border-red-300 rounded-full px-2 py-0.5 text-xs">Đã khóa</span> : <span className="text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-full px-2 py-0.5 text-xs">Hoạt động</span>}</td>
            <td className="px-3 text-right">{u.locked ? <button className={outline} onClick={() => toggleLock(u.id)}>Mở khóa</button> : <button className={danger} onClick={() => setLock(u.id)}>Khóa</button>}</td>
          </tr>))}</tbody>
      </table>
      {target && <Confirm title="Khóa tài khoản" okLabel="Khóa tài khoản" text={`Người dùng "${target.name}" sẽ không thể đăng nhập cho đến khi được mở khóa.`} onCancel={() => setLock(null)} onOk={() => { toggleLock(target.id); setLock(null) }} />}
    </div>
  )
}

function Logs() {
  const { logs } = useApp()
  const loading = useLoading('l', 500)
  if (loading) return <Skeleton />
  if (!logs.length) return <Empty title="Chưa có thay đổi nào" />
  return (
    <div className="bg-white border border-stone-200 rounded-lg overflow-x-auto fade"><table className="w-full text-sm min-w-[560px]">
      <thead className="bg-amber-50 text-left text-stone-600"><tr>{['Thời gian', 'Người thực hiện', 'Nội dung thay đổi'].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr></thead>
      <tbody>{logs.map((l) => <tr key={l.id} className="border-t border-stone-100"><td className="px-3 py-2.5 whitespace-nowrap text-stone-600">{fmtTime(l.at)}</td><td className="px-3 font-medium">{l.who}</td><td className="px-3">{l.what}</td></tr>)}</tbody>
    </table></div>
  )
}
