/**
 * Line drawings for "How it works". Paper stays white in both themes like the
 * covers do; every other stroke and fill comes from theme tokens.
 */

function Lines({ x, y, w, rows, gap = 7 }: { x: number; y: number; w: number; rows: number; gap?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <line
          key={i}
          x1={x}
          x2={x + (i % 3 === 2 ? w * 0.62 : w)}
          y1={y + i * gap}
          y2={y + i * gap}
          strokeWidth={2}
          strokeLinecap="round"
          className="stroke-line-strong"
        />
      ))}
    </>
  );
}

function Sheet({ x, y, r = 0, children }: { x: number; y: number; r?: number; children?: React.ReactNode }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r} 34 48)`}>
      <rect width={68} height={96} rx={5} fill="#ffffff" strokeWidth={1.25} className="stroke-line-strong" />
      {children ?? <Lines x={10} y={18} w={48} rows={9} />}
    </g>
  );
}

/** Step 1: three sheets fanned out, the front one picked. */
export function ChooseArt() {
  return (
    <svg viewBox="0 0 240 150" aria-hidden className="h-full w-full">
      <Sheet x={50} y={30} r={-12} />
      <Sheet x={122} y={30} r={11} />
      <g transform="translate(86 18)">
        <rect width={68} height={96} rx={5} fill="#ffffff" strokeWidth={1.5} className="stroke-text" />
        <rect x={10} y={10} width={26} height={8} rx={4} className="fill-surface-2" />
        <Lines x={10} y={28} w={48} rows={8} />
      </g>
      <g transform="translate(140 98)">
        <circle cx={12} cy={12} r={12} className="fill-brand" />
        <path d="M7 12.5l3.5 3.5L17 9" fill="none" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" className="stroke-brand-contrast" />
      </g>
    </svg>
  );
}

/** Step 2: a phone showing a QR code. */
export function PayArt() {
  const cells = [
    [0, 0], [1, 0], [3, 0], [5, 0], [6, 1], [2, 1], [4, 2], [0, 2], [1, 3], [3, 3], [5, 3], [2, 4], [6, 4], [0, 5], [4, 5], [1, 6], [3, 6], [5, 6], [6, 6],
  ];
  return (
    <svg viewBox="0 0 240 150" aria-hidden className="h-full w-full">
      <rect x={88} y={10} width={64} height={128} rx={12} strokeWidth={1.5} className="fill-surface stroke-text" />
      <rect x={110} y={16} width={20} height={4} rx={2} className="fill-line-strong" />
      <rect x={96} y={36} width={48} height={48} rx={4} fill="#ffffff" strokeWidth={1.25} className="stroke-line-strong" />
      {[
        [99, 39],
        [129, 39],
        [99, 69],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={12} height={12} rx={2} fill="none" strokeWidth={2.5} className="stroke-text" />
      ))}
      {cells.map(([cx, cy]) => (
        <rect key={`${cx}-${cy}`} x={113 + cx * 3.6} y={53 + cy * 3.6} width={3} height={3} className="fill-text" />
      ))}
      <rect x={96} y={94} width={48} height={6} rx={3} className="fill-line" />
      <rect x={96} y={106} width={48} height={18} rx={9} className="fill-brand" />
      <line x1={44} x2={76} y1={60} y2={60} strokeWidth={2} strokeLinecap="round" strokeDasharray="2 6" className="stroke-line-strong" />
      <line x1={164} x2={196} y1={60} y2={60} strokeWidth={2} strokeLinecap="round" strokeDasharray="2 6" className="stroke-line-strong" />
    </svg>
  );
}

/** Step 3: a page open in a browser window. */
export function ReadArt() {
  return (
    <svg viewBox="0 0 240 150" aria-hidden className="h-full w-full">
      <rect x={34} y={14} width={172} height={122} rx={10} strokeWidth={1.5} className="fill-surface stroke-text" />
      <line x1={34} x2={206} y1={32} y2={32} strokeWidth={1.25} className="stroke-line-strong" />
      {[46, 56, 66].map((cx) => (
        <circle key={cx} cx={cx} cy={23} r={3} className="fill-line-strong" />
      ))}
      <rect x={48} y={42} width={28} height={84} rx={4} className="fill-surface-2" />
      <rect x={54} y={50} width={16} height={22} rx={2} fill="#ffffff" strokeWidth={1} className="stroke-line-strong" />
      <rect x={54} y={78} width={16} height={22} rx={2} fill="#ffffff" strokeWidth={1} className="stroke-line-strong" />
      <g transform="translate(96 40)">
        <rect width={64} height={90} rx={4} fill="#ffffff" strokeWidth={1.25} className="stroke-line-strong" />
        <Lines x={9} y={14} w={46} rows={10} />
      </g>
      <g transform="translate(170 98)">
        <circle cx={12} cy={12} r={12} className="fill-brand" />
        <path d="M7 12.5l3.5 3.5L17 9" fill="none" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" className="stroke-brand-contrast" />
      </g>
    </svg>
  );
}
