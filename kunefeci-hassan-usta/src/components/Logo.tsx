import { site } from "@/content/site";

type Props = {
  className?: string;
  /** Gradient/filter ids must be unique when the logo appears more than once on a page. */
  id?: string;
  title?: string;
};

/**
 * Tabeladaki logonun vektör çizimi. Yazılar Berkshire Swash ile, tabeladaki gibi
 * beyaz kontur ve gölgeyle çizilir. Orijinal vektör dosyası gelirse bu bileşen
 * yerine doğrudan o kullanılabilir.
 */
export function Logo({ className, id = "logo", title = site.name }: Props) {
  return (
    <svg viewBox="8 96 468 360" role="img" aria-label={title} className={className}>
      <defs>
        <radialGradient id={`${id}-fill`} cx="42%" cy="36%" r="72%">
          <stop offset="0" stopColor="#fcf6d2" />
          <stop offset=".62" stopColor="#f1e49c" />
          <stop offset="1" stopColor="#e2cd6e" />
        </radialGradient>
        <linearGradient id={`${id}-ring`} x1=".2" y1="0" x2=".8" y2="1">
          <stop offset="0" stopColor="#d29a55" />
          <stop offset=".55" stopColor="#a8692d" />
          <stop offset="1" stopColor="#7a4a1e" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-5%" y="-5%" width="110%" height="125%">
          <feDropShadow dx="0" dy="5" stdDeviation="2.5" floodColor="#10112a" floodOpacity=".45" />
        </filter>
      </defs>
      <circle cx="266" cy="278" r="170" fill={`url(#${id}-ring)`} />
      <circle cx="266" cy="278" r="158" fill={`url(#${id}-fill)`} />
      <circle cx="266" cy="278" r="147" fill="none" stroke="#23264a" strokeWidth="2.5" />
      <g
        filter={`url(#${id}-shadow)`}
        fill="#23264a"
        stroke="#fffdf6"
        strokeWidth="9"
        strokeLinejoin="round"
        paintOrder="stroke"
        style={{ fontFamily: "var(--font-berkshire), serif" }}
      >
        <text x="20" y="232" fontSize="96" textLength="350" lengthAdjust="spacingAndGlyphs">
          Künefeci
        </text>
        <text x="150" y="324" fontSize="92" textLength="276" lengthAdjust="spacingAndGlyphs">
          Hassan
        </text>
        <text x="254" y="410" fontSize="96" textLength="206" lengthAdjust="spacingAndGlyphs">
          Usta
        </text>
      </g>
    </svg>
  );
}
