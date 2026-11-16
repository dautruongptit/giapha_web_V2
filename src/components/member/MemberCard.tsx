import { Member, Unit } from '../../types'
import { REL } from '../../constants'
import { infoLine, relOf } from '../../utils'
import { MiniLotus } from '../ornaments'

export const BH = 48
export const RBH = 60
export const CW = 192
export const RW = 260

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
  const col = REL[relOf(u.main)].color
  const dead = u.main.status === 'dead' && u.persons.every((p) => p.status === 'dead')
  const bh = root ? RBH : BH

  return (
    <div
      className={`rounded-sm overflow-hidden transition-opacity ${dim ? 'opacity-25' : ''} ${
        hit ? 'ring-4 ring-gold' : ''
      }`}
      style={{
        width: flat ? '100%' : root ? RW : CW,
        border: `${root ? 3 : 2}px solid ${root ? '#c4161c' : dead ? col + 'aa' : col}`,
        background: root ? '#f7c93b' : dead ? '#f4ecd2' : '#fff',
        boxShadow: '0 1px 3px rgba(74,46,26,.25)',
      }}
    >
      {u.persons.map((p, i) => {
        const info = infoLine(p)
        const lab = spouseLabel(p, u)
        const pd = p.status === 'dead'
        return (
          <button
            key={p.id}
            onClick={() => onOpen(p.id)}
            title={p.name}
            aria-label={`Xem ${p.name}`}
            className={`block w-full text-center px-1 hover:bg-gold/30 focus:outline-none focus-visible:bg-gold/40 transition-colors ${
              i ? 'border-t border-dashed' : ''
            }`}
            style={{
              height: flat ? undefined : bh,
              minHeight: flat ? bh : undefined,
              borderColor: REL[relOf(p)].color + '88',
              paddingTop: 3,
              color: pd && !root ? '#4a2e1acc' : '#3b2616',
            }}
          >
            <div
              className={`font-serif font-bold uppercase leading-[16px] truncate ${
                root ? 'text-[14px]' : 'text-[11px]'
              }`}
              style={{ color: root ? '#8b1a1a' : undefined }}
            >
              {lab && (
                <i
                  className="not-italic font-semibold normal-case text-[10px] mr-1"
                  style={{ color: REL[relOf(p)].color }}
                >
                  {lab}:
                </i>
              )}
              {p.name}
            </div>
            <div
              className={`leading-[15px] flex items-center justify-center gap-1 ${
                root ? 'text-[12px]' : 'text-[10.5px]'
              } ${pd ? 'opacity-80' : ''}`}
            >
              {info.text}
              {info.lotus && <MiniLotus className="w-3.5 h-2.5" />}
            </div>
            {p.note && (
              <div className="text-[9.5px] italic leading-[12px] truncate opacity-80">{p.note}</div>
            )}
          </button>
        )
      })}
    </div>
  )
}
