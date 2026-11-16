import { Member, Unit } from '../../types'
import { REL } from '../../constants'
import { infoLine, relOf } from '../../utils'
import { MiniLotus } from '../ornaments'

export const BH = 54
export const RBH = 68
export const CW = 208
export const RW = 270

export function makeUnit(m: Member, all: Member[]): Unit {
  const sp = all.filter((x) => x.spouseOf === m.id)
  return { main: m, persons: m.gender === 'F' ? [...sp, m] : [m, ...sp] }
}

function spouseLabel(p: Member, u: Unit) {
  if (!p.spouseOf) return ''
  if (p.gender === 'M') return 'Chồng'
  const wives = u.persons.filter((x) => x.gender === 'F' && x.spouseOf)
  return wives.length > 1 ? `Bà ${wives.indexOf(p) + 1}` : 'Phu nhân'
}

export function MemberCard({
  u,
  onOpen,
  dim,
  hit,
  root,
  flat,
}: {
  u: Unit
  onOpen: (id: string) => void
  dim?: boolean
  hit?: boolean
  root?: boolean
  flat?: boolean
}) {
  const isDead = u.main.status === 'dead'
  const bh = root ? RBH : BH
  const relMain = REL[relOf(u.main)]

  return (
    <div
      className={`group relative rounded-lg transition-all duration-200 overflow-hidden select-none ${
        dim ? 'opacity-25 pointer-events-none' : 'opacity-100'
      } ${
        hit
          ? 'ring-4 ring-amber-400 shadow-xl scale-105 z-20'
          : 'hover:shadow-lg hover:-translate-y-0.5'
      }`}
      style={{
        width: flat ? '100%' : root ? RW : CW,
        border: root
          ? '2px solid #b91c1c'
          : isDead
          ? '1.5px solid #b45309'
          : '1.5px solid #059669',
        backgroundColor: root ? '#fffbeb' : '#ffffff',
        boxShadow: root
          ? '0 4px 14px rgba(185, 28, 28, 0.25)'
          : '0 2px 8px rgba(74, 46, 26, 0.12)',
      }}
    >
      {/* Header ribbon for root node */}
      {root && (
        <div className="bg-gradient-to-r from-red-700 via-amber-600 to-red-700 text-amber-100 text-[10px] font-serif font-bold text-center py-0.5 uppercase tracking-wider shadow-inner">
          ❖ Cụ Khởi Tổ — Đời Thứ 1 ❖
        </div>
      )}

      {u.persons.map((p, i) => {
        const info = infoLine(p)
        const isSpouse = !!p.spouseOf
        const lab = spouseLabel(p, u)
        const pDead = p.status === 'dead'
        const rel = REL[relOf(p)]

        return (
          <button
            key={p.id}
            onClick={() => onOpen(p.id)}
            title={`Xem chi tiết: ${p.name}`}
            aria-label={`Xem ${p.name}`}
            className={`w-full text-left px-2.5 py-1.5 transition-colors cursor-pointer flex flex-col justify-center ${
              isSpouse
                ? 'bg-stone-50/70 hover:bg-amber-50/80 border-t border-stone-200/80'
                : 'hover:bg-amber-50/60'
            } ${i > 0 && !isSpouse ? 'border-t border-dashed border-stone-200' : ''}`}
            style={{
              height: flat ? undefined : bh,
              minHeight: flat ? bh : undefined,
            }}
          >
            {/* Top row: Name & Badges */}
            <div className="flex items-center justify-between gap-1 w-full">
              <div className="flex items-center gap-1 min-w-0">
                {/* Gender indicator icon */}
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: p.gender === 'M' ? '#1d4ed8' : '#db2777' }}
                  title={p.gender === 'M' ? 'Nam' : 'Nữ'}
                />

                {/* Role / Spouse tag */}
                {lab && (
                  <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 border border-stone-200 rounded px-1 shrink-0">
                    {lab}
                  </span>
                )}

                {/* Person Name */}
                <span
                  className={`font-serif font-bold truncate tracking-tight transition-colors group-hover:text-maroon ${
                    root ? 'text-sm text-red-950' : 'text-xs text-stone-900'
                  }`}
                >
                  {p.name}
                </span>
              </div>

              {/* Status / Generation badge */}
              <div className="shrink-0 flex items-center gap-1">
                {pDead ? (
                  <span title="Đã tạ thế">
                    <MiniLotus className="w-3.5 h-3 text-red-700" />
                  </span>
                ) : (
                  <span
                    className="w-2 h-2 rounded-full bg-emerald-500 border border-emerald-600 shrink-0"
                    title="Còn sống"
                  />
                )}
              </div>
            </div>

            {/* Bottom row: Birth/Death & Notes */}
            <div className="flex items-center justify-between text-[10.5px] text-stone-500 mt-0.5">
              <span className="truncate">{info.text}</span>
              {!isSpouse && !root && (
                <span
                  className="text-[9.5px] font-medium px-1 rounded"
                  style={{
                    color: rel.color,
                    backgroundColor: `${rel.color}15`,
                  }}
                >
                  Đời {p.gen}
                </span>
              )}
            </div>

            {/* Optional note badge if exists */}
            {p.note && (
              <div className="text-[9.5px] text-amber-800/90 truncate italic mt-0.5">
                • {p.note}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
