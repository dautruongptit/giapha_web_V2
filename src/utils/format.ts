import { Member } from '../types'
import { REL } from '../constants'

export function infoLine(m: Member): { text: string; lotus: boolean } {
  if (m.status === 'alive') return { text: m.birth ? `SN ${m.birth}` : 'SN ?', lotus: false }
  if (m.death) return { text: `${m.birth ?? '?'} – ${m.death}`, lotus: true }
  return { text: m.gio ? `Tạ thế: ${m.gio}` : 'Tạ thế: không rõ', lotus: true }
}

export const relOf = (m: Member) =>
  (m.spouseOf ? (m.gender === 'F' ? 'dil' : 'sil') : m.gender === 'M' ? 'son' : 'daughter') as keyof typeof REL

export const fmtTime = (s: string) => s.replace('T', ' ').slice(0, 16)
