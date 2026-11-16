import { useApp } from '../../context'
import { RoleSwitcher } from '../common'

export function TopBar({ route }: { route: string }) {
  const { role, logout, loggedIn, actor } = useApp()

  const navItem = (path: string, label: string) => {
    const active = route === path
    return (
      <a
        href={`#${path}`}
        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
          active
            ? 'bg-maroon-dark text-gold font-semibold shadow-xs'
            : 'text-amber-100 hover:text-white hover:bg-white/10'
        }`}
      >
        {label}
      </a>
    )
  }

  return (
    <header className="h-12 bg-maroon/95 backdrop-blur-md text-amber-50 px-3 sm:px-6 flex items-center justify-between shadow-md sticky top-0 z-40 border-b border-amber-800/30">
      <div className="flex items-center gap-2.5">
        <a
          href="#/"
          className="font-serif font-bold text-base sm:text-lg tracking-wide hover:text-gold flex items-center gap-2 transition-colors"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-gold shadow-xs" />
          <span>Gia Phả Họ Nguyễn</span>
        </a>
        <span className="text-amber-300/40 hidden md:inline">|</span>
        <span className="text-xs text-amber-200/80 hidden md:inline font-serif italic">
          Đông Triều, Quảng Ninh
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {loggedIn && (
          <nav className="flex items-center gap-1">
            {navItem('/', 'Trang chủ')}
            {navItem('/tree', 'Cây Phả Hệ')}
            {navItem('/my', 'Góp ý của tôi')}
          </nav>
        )}

        <div className="hidden sm:block">
          <RoleSwitcher dark />
        </div>

        {loggedIn ? (
          <div className="flex items-center gap-2 pl-2 border-l border-amber-900/50 text-xs">
            {role !== 'viewer' && (
              <a
                href="#/admin"
                className="px-2.5 py-1 rounded-lg bg-gold text-maroon-dark font-semibold hover:bg-amber-300 shadow-xs transition-all"
              >
                Quản trị →
              </a>
            )}
            <span className="text-amber-100 font-medium hidden lg:inline max-w-[120px] truncate">
              {actor}
            </span>
            <button
              onClick={logout}
              className="px-2.5 py-1 rounded-lg text-amber-200 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="Đăng xuất khỏi hệ thống"
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
