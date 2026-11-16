import { useApp } from '../../context'
import { RoleSwitcher } from '../common'

export function TopBar({ route }: { route: string }) {
  const { role, logout, loggedIn, actor } = useApp()
  return (
    <header className="h-11 bg-maroon text-amber-50 px-3 flex items-center justify-between shadow-sm sticky top-0 z-40 text-sm">
      <div className="flex items-center gap-2">
        <a href="#/" className="font-serif font-bold tracking-wide hover:text-gold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gold" />
          Gia Phả Họ Nguyễn
        </a>
        <span className="text-amber-200/50 hidden sm:inline">|</span>
        <span className="text-xs text-amber-200/80 hidden sm:inline">Đông Triều</span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {loggedIn && (
          <nav className="flex items-center gap-1 text-xs sm:text-sm mr-1">
            <a
              href="#/"
              className={`px-2 py-1 rounded transition-colors ${
                route === '/' ? 'bg-maroon-dark text-gold font-semibold' : 'hover:text-gold'
              }`}
            >
              Trang chủ
            </a>
            <a
              href="#/tree"
              className={`px-2 py-1 rounded transition-colors ${
                route === '/tree' ? 'bg-maroon-dark text-gold font-semibold' : 'hover:text-gold'
              }`}
            >
              Phả hệ
            </a>
            <a
              href="#/my"
              className={`px-2 py-1 rounded transition-colors ${
                route === '/my' ? 'bg-maroon-dark text-gold font-semibold' : 'hover:text-gold'
              }`}
            >
              Góp ý của tôi
            </a>
          </nav>
        )}
        <RoleSwitcher dark />
        {loggedIn ? (
          <div className="flex items-center gap-1.5 pl-1 border-l border-amber-900/40 text-xs">
            {role !== 'viewer' && (
              <a
                href="#/admin"
                className="px-2 py-1 rounded bg-gold/90 text-maroon-dark font-semibold hover:bg-gold shadow-sm transition-colors"
              >
                Vào trang Quản trị →
              </a>
            )}
            <span className="text-amber-200 hidden md:inline">{actor}</span>
            <button
              onClick={logout}
              className="px-2 py-1 rounded text-amber-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <span className="text-xs text-amber-200/80">Chưa đăng nhập</span>
        )}
      </div>
    </header>
  )
}
