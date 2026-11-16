import { useApp } from '../../context'
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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex justify-end fade"
      onClick={() => openMember(null)}
    >
      <aside
        className="w-full max-w-md bg-paper h-full shadow-2xl p-5 overflow-y-auto flex flex-col border-l-4 border-maroon"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-serif font-bold text-maroon uppercase tracking-wider">
              Đời thứ {m.gen} · {m.gender === 'M' ? 'Nam' : 'Nữ'}
            </span>
            <h2 className="font-serif font-bold text-2xl text-brown mt-0.5 flex items-center gap-2">
              {m.name}
              {info.lotus && <MiniLotus />}
            </h2>
            <p className="text-xs text-brown/70 mt-0.5">{info.text}</p>
          </div>
          <button
            onClick={() => openMember(null)}
            className="text-brown/60 hover:text-brown text-xl px-2"
          >
            ✕
          </button>
        </div>

        {m.photo && (
          <img
            src={m.photo}
            alt={m.name}
            className="mt-4 rounded-md border border-bronze/40 max-h-48 object-cover w-full"
          />
        )}

        {m.note && (
          <div className="mt-3 text-xs bg-amber-50 border border-amber-200 rounded p-2 text-brown">
            <b className="text-maroon">Ghi chú:</b> {m.note}
          </div>
        )}

        <div className="mt-4 text-sm text-brown/90 leading-relaxed border-t border-bronze/30 pt-3">
          {m.bio}
        </div>

        <div className="mt-4 space-y-2 text-xs border-t border-bronze/30 pt-3">
          <div className="text-brown/70">
            <b className="text-brown">Quê quán:</b> {m.hometown}
          </div>
          {m.gio && (
            <div className="text-brown/70">
              <b className="text-brown">Ngày giỗ (âm lịch):</b> {m.gio}
            </div>
          )}
          {father && (
            <div>
              <b className="text-brown">Cha:</b>{' '}
              <button
                onClick={() => openMember(father.id)}
                className="text-maroon underline font-medium"
              >
                {father.name}
              </button>{' '}
              (Đời {father.gen})
            </div>
          )}
          {mother && (
            <div>
              <b className="text-brown">Mẹ:</b>{' '}
              <button
                onClick={() => openMember(mother.id)}
                className="text-maroon underline font-medium"
              >
                {mother.name}
              </button>
            </div>
          )}
          {spouses.length > 0 && (
            <div>
              <b className="text-brown">{m.gender === 'M' ? 'Phu nhân' : 'Phu quân'}:</b>{' '}
              {spouses.map((s, i) => (
                <span key={s.id}>
                  {i > 0 && ', '}
                  <button
                    onClick={() => openMember(s.id)}
                    className="text-maroon underline font-medium"
                  >
                    {s.name}
                  </button>
                </span>
              ))}
            </div>
          )}
          {children.length > 0 && (
            <div>
              <b className="text-brown">Con cái ({children.length}):</b>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {children.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => openMember(c.id)}
                    className="px-2 py-0.5 rounded bg-amber-100 hover:bg-gold/40 text-brown border border-bronze/30 text-[11px]"
                  >
                    {c.name} ({c.gender === 'M' ? 'Trai' : 'Gái'})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-bronze/30 flex flex-col gap-2">
          <a
            href={`#/feedback/${m.id}`}
            onClick={() => openMember(null)}
            className="w-full text-center px-4 py-2 rounded bg-maroon text-amber-50 text-xs font-semibold hover:bg-maroon-dark transition-colors"
          >
            Góp ý chỉnh sửa thông tin người này
          </a>
          {role !== 'viewer' && (
            <a
              href={`#/admin/members/${m.id}`}
              onClick={() => openMember(null)}
              className="w-full text-center px-4 py-2 rounded border border-maroon text-maroon text-xs font-semibold hover:bg-gold/20 transition-colors"
            >
              Chỉnh sửa trong trang Quản trị →
            </a>
          )}
        </div>
      </aside>
    </div>
  )
}
