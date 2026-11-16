import { useApp, go } from '../../context'
import { infoLine } from '../../utils'
import { MiniLotus } from '../ornaments'

export function MemberDrawer() {
  const { openId, openMember, byId, members, role } = useApp()
  if (!openId) return null
  const m = byId[openId]
  if (!m) return null

  const father = m.fatherId ? byId[m.fatherId] : null
  const mother = m.motherId ? byId[m.motherId] : null
  const spouses = m.spouseOf ? [byId[m.spouseOf]] : members.filter((x) => x.spouseOf === m.id)
  const children = members.filter((x) => x.fatherId === m.id || x.motherId === m.id)
  const info = infoLine(m)

  const viewBranch = () => {
    openMember(null)
    go('/tree')
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end fade"
      onClick={() => openMember(null)}
    >
      <aside
        className="w-full max-w-md bg-paper h-full shadow-2xl p-5 overflow-y-auto flex flex-col border-l-4 border-maroon"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full text-white ${
                  m.gender === 'M' ? 'bg-blue-700' : 'bg-pink-700'
                }`}
              >
                {m.gender === 'M' ? 'Nam' : 'Nữ'}
              </span>
              <span className="text-xs font-serif font-bold text-maroon uppercase tracking-wider">
                Đời thứ {m.gen}
              </span>
            </div>
            <h2 className="font-serif font-bold text-2xl text-brown mt-1.5 flex items-center gap-2">
              {m.name}
              {info.lotus && <MiniLotus className="w-5 h-4" />}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
              <span>{info.text}</span>
              <span>•</span>
              <span className={m.status === 'alive' ? 'text-emerald-700 font-medium' : 'text-stone-500'}>
                {m.status === 'alive' ? '🟢 Còn sống' : '🪷 Đã tạ thế'}
              </span>
            </p>
          </div>
          <button
            onClick={() => openMember(null)}
            className="text-stone-400 hover:text-stone-700 text-xl p-1 cursor-pointer"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Photo if available */}
        {m.photo && (
          <img
            src={m.photo}
            alt={m.name}
            className="mt-4 rounded-lg border border-bronze/40 max-h-52 object-cover w-full shadow-xs"
          />
        )}

        {/* Note alert */}
        {m.note && (
          <div className="mt-3.5 text-xs bg-amber-50/90 border border-amber-300 rounded-lg p-2.5 text-brown shadow-xs">
            <b className="text-maroon">Ghi chú:</b> {m.note}
          </div>
        )}

        {/* Bio */}
        <div className="mt-4 text-sm text-stone-800 leading-relaxed bg-white/70 border border-stone-200/80 rounded-lg p-3.5 shadow-xs">
          <h4 className="text-xs font-serif font-bold text-maroon uppercase mb-1">Tiểu sử</h4>
          <p>{m.bio}</p>
        </div>

        {/* Family connections section */}
        <div className="mt-4 space-y-2.5 text-xs bg-white/70 border border-stone-200/80 rounded-lg p-3.5 shadow-xs">
          <h4 className="text-xs font-serif font-bold text-maroon uppercase mb-2">Thân tộc & Huyết thống</h4>
          <div className="text-stone-700">
            <b className="text-stone-900">Quê quán:</b> {m.hometown}
          </div>
          {m.gio && (
            <div className="text-stone-700">
              <b className="text-stone-900">Ngày giỗ (âm lịch):</b> {m.gio}
            </div>
          )}

          {father && (
            <div className="pt-1.5 border-t border-stone-100">
              <b className="text-stone-900">Thân phụ (Cha):</b>{' '}
              <button
                onClick={() => openMember(father.id)}
                className="text-maroon underline font-medium hover:text-maroon-dark cursor-pointer"
              >
                {father.name}
              </button>{' '}
              <span className="text-stone-500">(Đời {father.gen})</span>
            </div>
          )}

          {mother && (
            <div>
              <b className="text-stone-900">Thân mẫu (Mẹ):</b>{' '}
              <button
                onClick={() => openMember(mother.id)}
                className="text-maroon underline font-medium hover:text-maroon-dark cursor-pointer"
              >
                {mother.name}
              </button>
            </div>
          )}

          {spouses.length > 0 && (
            <div className="pt-1.5 border-t border-stone-100">
              <b className="text-stone-900">{m.gender === 'M' ? 'Phu nhân' : 'Phu quân'}:</b>{' '}
              {spouses.map((s, i) => (
                <span key={s.id}>
                  {i > 0 && ', '}
                  <button
                    onClick={() => openMember(s.id)}
                    className="text-maroon underline font-medium hover:text-maroon-dark cursor-pointer"
                  >
                    {s.name}
                  </button>
                </span>
              ))}
            </div>
          )}

          {children.length > 0 && (
            <div className="pt-1.5 border-t border-stone-100">
              <b className="text-stone-900">Hậu duệ ({children.length} người con):</b>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {children.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => openMember(c.id)}
                    className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                      c.gender === 'M'
                        ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900'
                        : 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-900'
                    }`}
                  >
                    <span>{c.gender === 'M' ? '👦' : '👧'}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto pt-4 border-t border-stone-200 space-y-2">
          <button
            onClick={viewBranch}
            className="w-full text-center px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🌳</span> Xem cành này trên Cây Phả Hệ
          </button>

          <a
            href={`#/feedback/${m.id}`}
            onClick={() => openMember(null)}
            className="w-full text-center px-4 py-2 rounded-lg bg-maroon hover:bg-maroon-dark text-amber-50 text-xs font-semibold shadow-xs transition-colors cursor-pointer block"
          >
            ✍️ Góp ý chỉnh sửa thông tin người này
          </a>

          {role !== 'viewer' && (
            <a
              href={`#/admin/members/${m.id}`}
              onClick={() => openMember(null)}
              className="w-full text-center px-4 py-2 rounded-lg border border-maroon text-maroon text-xs font-semibold hover:bg-amber-50 transition-colors cursor-pointer block"
            >
              ⚙️ Chỉnh sửa trong trang Quản trị →
            </a>
          )}
        </div>
      </aside>
    </div>
  )
}
