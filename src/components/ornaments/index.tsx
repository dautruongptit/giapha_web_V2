import { ReactNode } from 'react'

export function Board({
  children,
  className = '',
  style,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div className={`board ${className}`} style={style}>
      <div className="board-inner">{children}</div>
    </div>
  )
}

export function Dragon({ flip = false, className = '' }: { flip?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 270 120"
      className={className}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden
    >
      <g fill="none" strokeLinecap="round" opacity=".95">
        <path d="M14 98 C50 20 80 112 120 56 S190 100 214 44" stroke="#e8a13a" strokeWidth="11" />
        <path
          d="M14 98 C50 20 80 112 120 56 S190 100 214 44"
          stroke="#b9561a"
          strokeWidth="3"
          strokeDasharray="1 7"
        />
        <path
          d="M30 100 q20 -8 40 0 M96 84 q16 -14 32 -4 M150 96 q16 -10 30 -2"
          stroke="#e8a13a"
          strokeWidth="3"
        />
        <path
          d="M214 44 q16 -26 40 -22 q-4 14 -18 18 q16 6 20 18 q-26 4 -42 -14z"
          fill="#e8a13a"
          stroke="#b9561a"
          strokeWidth="2"
        />
        <path d="M226 26 q4 -16 18 -22 M238 22 q10 -12 24 -12" stroke="#b9561a" strokeWidth="2.5" />
        <circle cx="238" cy="33" r="2.5" fill="#8b1a1a" />
        <path
          d="M6 112 q30 -14 60 0 M90 114 q30 -10 56 2 M170 112 q26 -10 50 0"
          stroke="#f0b95a"
          strokeWidth="3"
          opacity=".7"
        />
      </g>
    </svg>
  )
}

export function Scroll({
  title = 'CÂY GIA PHẢ',
  sub,
  className = '',
}: {
  title?: string
  sub?: string
  className?: string
}) {
  return (
    <svg viewBox="0 0 640 130" className={className} role="img" aria-label={title}>
      <defs>
        <pattern id="sp" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="2.4" fill="#d9242b" />
          <rect width="10" height="10" fill="none" />
        </pattern>
      </defs>
      <circle cx="320" cy="22" r="17" fill="#fff6cf" stroke="#a87420" strokeWidth="2" />
      <path
        d="M320 5 a17 17 0 0 1 0 34 a8.5 8.5 0 0 1 0 -17 a8.5 8.5 0 0 0 0 -17z"
        fill="#4a2e1a"
      />
      <path d="M303 8 l17 -10 l17 10" fill="#2f7d32" />
      <path
        d="M90 34 Q320 14 550 34 L550 108 Q320 90 90 108Z"
        fill="#f4c430"
        stroke="#a87420"
        strokeWidth="2"
      />
      <path d="M90 34 Q320 14 550 34 L550 44 Q320 24 90 44Z" fill="url(#sp)" />
      <path d="M90 98 Q320 80 550 98 L550 108 Q320 90 90 108Z" fill="url(#sp)" />
      <path
        d="M112 50 Q320 33 528 50 L528 94 Q320 78 112 94Z"
        fill="#d9242b"
        stroke="#fff1a8"
        strokeWidth="2.5"
      />
      <text
        x="320"
        y={sub ? 70 : 77}
        textAnchor="middle"
        fontFamily="Noto Serif, serif"
        fontWeight="900"
        fontSize="30"
        fill="#f9dd7a"
        letterSpacing="1.5"
      >
        {title}
      </text>
      {sub && (
        <text
          x="320"
          y="88"
          textAnchor="middle"
          fontFamily="Noto Serif, serif"
          fontSize="11"
          fill="#f9dd7a"
        >
          {sub}
        </text>
      )}
      {[48, 592].map((x) => (
        <g key={x}>
          <rect
            x={x - 28}
            y="30"
            width="56"
            height="84"
            rx="8"
            fill="#fff6cf"
            stroke="#a87420"
            strokeWidth="2"
          />
          <rect x={x - 28} y="46" width="56" height="8" fill="#d9242b" />
          <rect x={x - 28} y="90" width="56" height="8" fill="#d9242b" />
          <rect x={x - 14} y="58" width="28" height="28" fill="#2f7d32" opacity=".85" />
          <rect x={x - 8} y="64" width="16" height="16" fill="#f4c430" />
          <ellipse cx={x} cy="30" rx="28" ry="6" fill="#f2deA0" stroke="#a87420" strokeWidth="1.5" />
        </g>
      ))}
    </svg>
  )
}

export function Couplet({ words, className = '' }: { words: string[]; className?: string }) {
  return (
    <div
      className={`bg-[#d9242b] border-2 border-[#f4c430] rounded-sm flex flex-col items-center py-1 shadow-md ${className}`}
      style={{ width: 52 }}
      aria-hidden
    >
      <div
        className="w-9 h-[18px] rounded-t-full mb-1"
        style={{
          background:
            'repeating-conic-gradient(from 270deg at 50% 100%, #f4c430 0 12deg, #d9242b 12deg 24deg)',
        }}
      />
      <div className="flex flex-col items-center gap-2.5 py-2">
        {words.map((w) => (
          <span
            key={w}
            className="font-serif italic font-semibold text-[#f9dd7a] text-[13px] leading-none select-none"
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  )
}

export const COUPLET_L = ['Tổ', 'Tông', 'Công', 'Đức', 'Thiên', 'Niên', 'Thịnh']
export const COUPLET_R = ['Tử', 'Hiếu', 'Tôn', 'Hiền', 'Vạn', 'Đại', 'Vinh']

export function Medallion({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden fill="none" stroke="#e6b94a" opacity=".28">
      {[190, 165, 120, 78].map((r) => (
        <circle key={r} cx="200" cy="200" r={r} strokeWidth={r === 190 ? 6 : 3} />
      ))}
      {Array.from({ length: 24 }).map((_, i) => (
        <path
          key={i}
          d={`M200 ${200 - 120} q18 -22 0 -45`}
          transform={`rotate(${i * 15} 200 200)`}
          strokeWidth="3"
        />
      ))}
      <path
        d="M110 230 C140 120 250 140 240 210 S160 270 200 300 S300 260 290 190"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path d="M290 190 q20 -30 -6 -50 q-14 16 -4 36z" strokeWidth="4" />
    </svg>
  )
}

export function Phoenix({ flip = false, className = '' }: { flip?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 260 150"
      className={className}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden
      fill="none"
      stroke="#e1b445"
      opacity=".38"
      strokeLinecap="round"
    >
      <path d="M40 120 C70 40 120 90 150 50 C170 25 200 40 190 62 C180 78 150 70 150 60" strokeWidth="6" />
      <path
        d="M60 126 C90 126 130 110 168 78 M70 116 C100 108 130 90 150 70 M20 130 C60 150 150 140 230 100"
        strokeWidth="3"
      />
      <path d="M185 34 q12 -16 28 -14 M10 100 q30 -10 20 -40 q-24 6 -20 40z" strokeWidth="3" />
    </svg>
  )
}

export function Lotus({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 70" className={className} aria-hidden>
      <ellipse cx="20" cy="60" rx="20" ry="8" fill="#3f8a3c" />
      <ellipse cx="62" cy="62" rx="18" ry="7" fill="#3f8a3c" />
      {[-40, -20, 0, 20, 40].map((a) => (
        <ellipse
          key={a}
          cx="40"
          cy="30"
          rx="7"
          ry="18"
          fill={a % 40 === 0 ? '#f48fb1' : '#f8bbd0'}
          stroke="#c2185b"
          strokeWidth=".8"
          transform={`rotate(${a} 40 48)`}
        />
      ))}
      <ellipse cx="40" cy="38" rx="6" ry="14" fill="#f06292" stroke="#c2185b" strokeWidth=".8" />
    </svg>
  )
}

export function MiniLotus({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 14" className={className} aria-label="Đã mất" role="img">
      {[-35, 0, 35].map((a) => (
        <ellipse
          key={a}
          cx="10"
          cy="6"
          rx="2.6"
          ry="5.5"
          fill="#d98aa6"
          transform={`rotate(${a} 10 12)`}
        />
      ))}
      <path d="M2 12.5 q8 3 16 0" stroke="#5a8a4e" strokeWidth="1.4" fill="none" />
    </svg>
  )
}

/** Frame decoration (couplets on both sides) */
export function BoardDecor(_props?: { tree?: boolean }) {
  return null
}
