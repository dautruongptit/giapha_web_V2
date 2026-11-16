import { useState } from 'react'
import { useApp } from '../../context'
import { norm } from '../../utils'

export function RootPicker({
  onClose,
  onPick,
}: {
  onClose: () => void
  onPick: (id: string) => void
}) {
  const { members } = useApp()
  const [q, setQ] = useState('')
  const direct = members.filter((m) => !m.spouseOf)
  const list = q ? direct.filter((m) => norm(m.name).includes(norm(q))) : direct

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="bg-paper border-2 border-bronze rounded-lg max-w-md w-full p-4 max-h-[80vh] flex flex-col shadow-2xl fade"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-bronze/30">
          <h3 className="font-serif font-bold text-brown text-base">Chọn cụ tổ / nhánh gốc</h3>
          <button onClick={onClose} className="text-brown/60 hover:text-brown text-lg px-2">
            ✕
          </button>
        </div>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm tên thành viên…"
          className="mt-3 w-full bg-white border border-bronze/50 rounded px-3 py-1.5 text-xs text-brown focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <div className="mt-3 overflow-y-auto divide-y divide-bronze/20 text-xs">
          {list.map((m) => (
            <button
              key={m.id}
              onClick={() => onPick(m.id)}
              className="w-full text-left py-2 px-2 hover:bg-gold/30 rounded flex justify-between items-center transition-colors"
            >
              <span>
                <b>{m.name}</b> <span className="text-brown/60">({m.gender === 'M' ? 'Nam' : 'Nữ'})</span>
              </span>
              <span className="text-maroon font-serif font-bold">Đời {m.gen}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
