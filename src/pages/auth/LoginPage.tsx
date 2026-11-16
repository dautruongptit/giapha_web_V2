import { useState } from 'react'
import { useApp } from '../../context'
import { Board, BoardDecor } from '../../components/ornaments'

export function LoginPage() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const { login } = useApp()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !pass) {
      setErr('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.')
      return
    }
    setErr('')
    login()
  }

  return (
    <div className="p-2 sm:p-4 min-h-[calc(100dvh-44px)] flex">
      <Board className="flex-1 w-full">
        <BoardDecor />
        <div className="relative flex flex-col items-center justify-center px-4 py-8 md:py-12 min-h-[560px]">
          <div className="paper p-7 sm:p-8 max-w-md w-full text-center shadow-lg border border-amber-900/15 rounded-xl backdrop-blur-xs bg-amber-50/95 fade">
            <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 text-maroon mx-auto flex items-center justify-center font-serif text-2xl shadow-inner mb-3">
              ❖
            </div>
            <h1 className="font-serif font-bold text-2xl text-maroon">Phả Hệ Dòng Tộc</h1>
            <p className="text-xs text-stone-600 font-serif italic mt-0.5 mb-2">Đông Triều, Quảng Ninh</p>
            <p className="text-sm text-brown/80 mt-2 leading-relaxed">
              Kính mời con cháu đăng nhập để xem Gia phả và gửi góp ý cho Tộc trưởng.
            </p>
            <form onSubmit={submit} className="mt-5 space-y-3 text-left">
              {err && (
                <div
                  className="bg-red-50 border border-red-300 text-red-800 text-xs rounded p-2"
                  role="alert"
                >
                  {err}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-brown mb-1">
                  Số điện thoại / Email
                </label>
                <input
                  type="text"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full border border-bronze/50 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Ví dụ: 0912 345 678"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brown mb-1">Mật khẩu</label>
                <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="w-full border border-bronze/50 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded bg-maroon text-amber-50 font-serif font-bold hover:bg-maroon-dark text-sm shadow transition-colors"
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={login}
                className="w-full py-2 rounded border border-bronze/60 text-brown hover:bg-gold/20 text-xs font-medium transition-colors"
              >
                Đăng nhập nhanh bằng tài khoản mẫu
              </button>
            </form>
          </div>
        </div>
      </Board>
    </div>
  )
}
