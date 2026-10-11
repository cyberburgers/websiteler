/**
 * Ürün çizimleri — fotoğrafı olmayan her yerde gösterilir. Logo renkleriyle,
 * düz (flat) üslupta çizilmiştir. Dokular (kadayıf telleri, fıstık kırıkları)
 * sabit tohumlu rastgele sayılarla üretilir; sunucu ve tarayıcı aynı resmi çizer.
 */

export type ArtKind =
  | "kunefe"
  | "kunefe-fistik"
  | "kunefe-kaymak"
  | "kunefe-dondurma"
  | "kunefe-ozel"
  | "tepsi"
  | "tel"
  | "baklava"
  | "burma"
  | "sobiyet"
  | "katmer"
  | "sillik"
  | "dondurma"
  | "sutlac"
  | "fistik"
  | "cay"
  | "kahve"
  | "mirra";

const C = {
  trayShadow: "#6f441e",
  tray: "#a8692d",
  trayDark: "#7a4a1e",
  trayLight: "#e0b479",
  crustEdge: "#cf7f26",
  crust: "#e2952f",
  crustLight: "#eba640",
  strandDark: "#b4621a",
  strandLight: "#f7c66a",
  strandShine: "#fde3a3",
  cut: "#8f4c12",
  pistachio: ["#7e9838", "#a2ba57", "#5f7628", "#c4d68c"],
  skin: "#8f5468",
  cream: "#fffaf0",
  creamShade: "#efe2c2",
  plate: "#fffdf6",
  plateWell: "#f8f1dc",
  plateLine: "#e8dbad",
  navy: "#23264a",
} as const;

// --- deterministic texture helpers -------------------------------------------

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rand = () => number;
const n1 = (v: number) => v.toFixed(1);

function inDisc(r: Rand, cx: number, cy: number, radius: number): [number, number] {
  const a = r() * Math.PI * 2;
  const d = Math.sqrt(r()) * radius;
  return [cx + Math.cos(a) * d, cy + Math.sin(a) * d];
}

/** Short bent strokes, like strands of baked kadayıf. One path for many strands. */
function strands(r: Rand, cx: number, cy: number, radius: number, count: number, min: number, max: number) {
  let d = "";
  for (let i = 0; i < count; i++) {
    const [x, y] = inDisc(r, cx, cy, radius);
    const a = r() * Math.PI * 2;
    const len = min + r() * (max - min);
    const ex = x + Math.cos(a) * len;
    const ey = y + Math.sin(a) * len;
    const bend = (r() - 0.5) * len;
    const mx = (x + ex) / 2 - Math.sin(a) * bend;
    const my = (y + ey) / 2 + Math.cos(a) * bend;
    d += `M${n1(x)} ${n1(y)}Q${n1(mx)} ${n1(my)} ${n1(ex)} ${n1(ey)}`;
  }
  return d;
}

/** Irregular little chunks: crushed pistachio, walnut, caramelised spots. */
function crumbs(r: Rand, cx: number, cy: number, radius: number, count: number, min: number, max: number) {
  let d = "";
  for (let i = 0; i < count; i++) {
    const [x, y] = inDisc(r, cx, cy, radius);
    const s = min + r() * (max - min);
    const a = r() * Math.PI;
    for (let k = 0; k < 4; k++) {
      const ang = a + (k * Math.PI) / 2 + (r() - 0.5) * 0.7;
      const rad = s * (0.55 + r() * 0.6);
      d += `${k === 0 ? "M" : "L"}${n1(x + Math.cos(ang) * rad)} ${n1(y + Math.sin(ang) * rad)}`;
    }
    d += "Z";
  }
  return d;
}

/** Soft organic blob around a centre (dollops, caramelised patches). */
function blob(r: Rand, cx: number, cy: number, radius: number, points = 9, wobble = 0.25) {
  const pts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const rad = radius * (1 - wobble / 2 + r() * wobble);
    pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
  }
  const mid = (p: [number, number], q: [number, number]) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  let d = `M${mid(pts[points - 1], pts[0])
    .map(n1)
    .join(" ")}`;
  for (let i = 0; i < points; i++) {
    const p = pts[i];
    const m = mid(p, pts[(i + 1) % points]);
    d += `Q${n1(p[0])} ${n1(p[1])} ${n1(m[0])} ${n1(m[1])}`;
  }
  return d + "Z";
}

/** Crushed pistachio: four greens plus a few purple-red skin flakes. */
function Pistachio({
  seed,
  cx,
  cy,
  radius,
  count,
  size = [2.5, 5.5],
}: {
  seed: number;
  cx: number;
  cy: number;
  radius: number;
  count: number;
  size?: [number, number];
}) {
  const r = rng(seed);
  const share = [0.34, 0.3, 0.16, 0.14];
  return (
    <g>
      {C.pistachio.map((color, i) => (
        <path key={color} d={crumbs(r, cx, cy, radius, Math.round(count * share[i]), size[0], size[1])} fill={color} />
      ))}
      <path d={crumbs(r, cx, cy, radius, Math.round(count * 0.06), size[0] * 0.8, size[1] * 0.8)} fill={C.skin} />
    </g>
  );
}

// --- shared vessels --------------------------------------------------------

function Tray({ r = 182 }: { r?: number }) {
  return (
    <g>
      <circle cx="207" cy="214" r={r + 2} fill={C.trayShadow} opacity=".16" />
      <circle cx="200" cy="200" r={r} fill={C.tray} />
      <path
        d={`M${200 - r * 0.86} ${200 - r * 0.5}A${r} ${r} 0 0 1 ${200 - r * 0.5} ${200 - r * 0.86}`}
        stroke={C.trayLight}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity=".85"
      />
      <circle cx="200" cy="200" r={r - 13} fill={C.trayDark} />
    </g>
  );
}

function Plate() {
  return (
    <g>
      <circle cx="207" cy="214" r="178" fill={C.trayShadow} opacity=".13" />
      <circle cx="200" cy="200" r="176" fill={C.plate} />
      <circle cx="200" cy="200" r="166" fill="none" stroke={C.navy} strokeWidth="3" opacity=".85" />
      <circle cx="200" cy="200" r="130" fill={C.plateWell} />
      <circle cx="200" cy="200" r="130" fill="none" stroke={C.plateLine} strokeWidth="2" />
    </g>
  );
}

function Dollop({ cx, cy, s = 1, seed }: { cx: number; cy: number; s?: number; seed: number }) {
  const r = rng(seed);
  return (
    <g>
      <ellipse cx={cx + 6 * s} cy={cy + 10 * s} rx={44 * s} ry={38 * s} fill={C.trayShadow} opacity=".2" />
      <path d={blob(r, cx, cy, 40 * s, 9, 0.3)} fill={C.cream} />
      <path d={blob(r, cx + 8 * s, cy + 9 * s, 26 * s, 7, 0.3)} fill={C.creamShade} opacity=".75" />
      <path
        d={`M${cx - 22 * s} ${cy - 12 * s}Q${cx - 12 * s} ${cy - 28 * s} ${cx + 8 * s} ${cy - 26 * s}`}
        stroke="#fff"
        strokeWidth={5 * s}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

function Scoop({
  cx,
  cy,
  s = 1,
  color = C.cream,
  shade = C.creamShade,
  seed,
}: {
  cx: number;
  cy: number;
  s?: number;
  color?: string;
  shade?: string;
  seed: number;
}) {
  const bumps = 16;
  let d = "";
  for (let i = 0; i <= bumps * 2; i++) {
    const a = (i / (bumps * 2)) * Math.PI * 2;
    const rad = (44 + (i % 2 ? 3.5 : -1)) * s;
    d += `${i === 0 ? "M" : "L"}${n1(cx + Math.cos(a) * rad)} ${n1(cy + Math.sin(a) * rad)}`;
  }
  const r = rng(seed);
  return (
    <g>
      <ellipse cx={cx + 7 * s} cy={cy + 10 * s} rx={48 * s} ry={44 * s} fill={C.trayShadow} opacity=".2" />
      <path d={d + "Z"} fill={color} strokeLinejoin="round" stroke={color} strokeWidth={3 * s} />
      <path
        d={`M${cx + 30 * s} ${cy - 24 * s}A${40 * s} ${40 * s} 0 0 1 ${cx - 18 * s} ${cy + 38 * s}A${46 * s} ${46 * s} 0 0 0 ${cx + 30 * s} ${cy - 24 * s}Z`}
        fill={shade}
      />
      <path
        d={strands(r, cx - 6 * s, cy - 6 * s, 26 * s, 7, 8 * s, 16 * s)}
        stroke={shade}
        strokeWidth={2.2 * s}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M${cx - 26 * s} ${cy - 10 * s}Q${cx - 20 * s} ${cy - 30 * s} ${cx} ${cy - 32 * s}`}
        stroke="#fff"
        strokeWidth={5 * s}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

// --- künefe ----------------------------------------------------------------

type Topping = "klasik" | "fistik" | "kaymak" | "dondurma" | "ozel";

function Kunefe({ topping, cuts = 4, seed }: { topping: Topping; cuts?: number; seed: number }) {
  const r = rng(seed);
  const dark = strands(r, 200, 200, 156, 120, 8, 18);
  const light = strands(r, 200, 200, 150, 150, 10, 22);
  const shine = strands(r, 196, 192, 120, 60, 10, 24);
  const angles = Array.from({ length: cuts }, (_, i) => (i / cuts) * Math.PI * 2 + 0.35);

  return (
    <g>
      <Tray />
      <circle cx="200" cy="200" r="163" fill={C.crustEdge} />
      <circle cx="197" cy="196" r="152" fill={C.crust} />
      <circle cx="190" cy="187" r="116" fill={C.crustLight} opacity=".85" />
      <path d={dark} stroke={C.strandDark} strokeWidth="2" strokeLinecap="round" fill="none" opacity=".5" />
      <path d={light} stroke={C.strandLight} strokeWidth="2.3" strokeLinecap="round" fill="none" opacity=".75" />
      <path d={shine} stroke={C.strandShine} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity=".6" />
      {angles.map((a) => (
        <g key={a}>
          <path
            d={`M200 200L${n1(200 + Math.cos(a) * 163)} ${n1(200 + Math.sin(a) * 163)}`}
            stroke={C.cut}
            strokeWidth="3.2"
            opacity=".55"
          />
          <path
            d={`M${n1(200 + Math.cos(a + 0.02) * 20)} ${n1(200 + Math.sin(a + 0.02) * 20)}L${n1(200 + Math.cos(a + 0.012) * 160)} ${n1(200 + Math.sin(a + 0.012) * 160)}`}
            stroke={C.strandShine}
            strokeWidth="1.2"
            opacity=".5"
          />
        </g>
      ))}
      {/* syrup gloss */}
      <path
        d="M96 168Q118 112 176 92"
        stroke="#fff"
        strokeOpacity=".32"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M108 206Q110 190 118 178"
        stroke="#fff"
        strokeOpacity=".25"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {topping === "klasik" && <Pistachio seed={seed + 1} cx={200} cy={200} radius={66} count={150} />}
      {topping === "fistik" && <Pistachio seed={seed + 1} cx={200} cy={200} radius={146} count={520} size={[2.8, 6]} />}
      {topping === "kaymak" && (
        <>
          <Pistachio seed={seed + 1} cx={200} cy={200} radius={120} count={140} />
          <Dollop cx={218} cy={192} s={1.25} seed={seed + 2} />
          <Pistachio seed={seed + 3} cx={212} cy={180} radius={22} count={22} />
        </>
      )}
      {topping === "dondurma" && (
        <>
          <Pistachio seed={seed + 1} cx={200} cy={200} radius={120} count={140} />
          <Scoop cx={206} cy={196} s={1.3} seed={seed + 2} />
          <Pistachio seed={seed + 3} cx={198} cy={184} radius={20} count={18} />
        </>
      )}
      {topping === "ozel" && (
        <>
          <Pistachio seed={seed + 1} cx={200} cy={200} radius={140} count={420} size={[2.8, 6]} />
          <Dollop cx={252} cy={232} s={0.95} seed={seed + 2} />
          <Scoop cx={160} cy={170} s={1.05} seed={seed + 3} />
          <Pistachio seed={seed + 4} cx={152} cy={160} radius={18} count={16} />
          <Pistachio seed={seed + 5} cx={248} cy={222} radius={16} count={12} />
        </>
      )}
    </g>
  );
}

/** Raw tel kadayıf piled in a tray. */
function Tel() {
  const r = rng(41);
  let d1 = "";
  let d2 = "";
  let d3 = "";
  for (let i = 0; i < 120; i++) {
    const rad = 30 + r() * 120;
    const a = r() * Math.PI * 2;
    const sweep = 0.5 + r() * 0.9;
    const x1 = 200 + Math.cos(a) * rad;
    const y1 = 200 + Math.sin(a) * rad;
    const x2 = 200 + Math.cos(a + sweep) * (rad + (r() - 0.5) * 30);
    const y2 = 200 + Math.sin(a + sweep) * (rad + (r() - 0.5) * 30);
    const cr = rad * 1.15;
    const seg = `M${n1(x1)} ${n1(y1)}Q${n1(200 + Math.cos(a + sweep / 2) * cr)} ${n1(200 + Math.sin(a + sweep / 2) * cr)} ${n1(x2)} ${n1(y2)}`;
    if (i % 3 === 0) d1 += seg;
    else if (i % 3 === 1) d2 += seg;
    else d3 += seg;
  }
  return (
    <g>
      <Tray />
      <circle cx="200" cy="200" r="162" fill="#d9b77a" />
      <path d={d1} stroke="#b88d4f" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".7" />
      <path d={d2} stroke="#f4dfae" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d={d3} stroke="#fff3d6" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".9" />
    </g>
  );
}

// --- syrup desserts ----------------------------------------------------------

function Baklava() {
  const s = 52;
  const h = s / 2;
  let base = "";
  let top = "";
  let nut = "";
  let nutLight = "";
  const diamond = (x: number, y: number, k: number) =>
    `M${n1(x)} ${n1(y - h * k)}L${n1(x + h * k)} ${n1(y)}L${n1(x)} ${n1(y + h * k)}L${n1(x - h * k)} ${n1(y)}Z`;
  for (let i = -5; i <= 5; i++) {
    for (let j = -5; j <= 5; j++) {
      for (const [ox, oy] of [
        [0, 0],
        [h, h],
      ]) {
        const x = 200 + i * s + ox;
        const y = 200 + j * s + oy;
        if (Math.hypot(x - 200, y - 200) + h * 0.8 > 160) continue;
        base += diamond(x, y, 0.94);
        top += diamond(x - 1.5, y - 2, 0.66);
        nut += diamond(x - 1, y - 2, 0.26);
        nutLight += diamond(x - 2.5, y - 4, 0.1);
      }
    }
  }
  return (
    <g>
      <Tray />
      <circle cx="200" cy="200" r="163" fill="#8f5a28" />
      <path d={base} fill="#d88d31" stroke="#9f5817" strokeWidth="2" strokeLinejoin="round" />
      <path d={top} fill="#eab052" />
      <path d={nut} fill={C.pistachio[0]} />
      <path d={nutLight} fill={C.pistachio[3]} />
      <path
        d="M96 150Q120 104 170 88"
        stroke="#fff"
        strokeOpacity=".3"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

function BurmaPiece({ x, y }: { x: number; y: number }) {
  let stripes = "";
  let light = "";
  for (let t = -80; t <= 74; t += 8) {
    stripes += `M${t - 9} -22L${t + 9} 23`;
    light += `M${t - 5} -23L${t + 13} 22`;
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(-14)`}>
      <rect x="-86" y="-22" width="180" height="58" rx="28" fill={C.trayShadow} opacity=".18" />
      <rect x="-92" y="-28" width="184" height="56" rx="28" fill="#d68b2d" />
      <path d={stripes} stroke="#a85d18" strokeWidth="2.2" opacity=".55" />
      <path d={light} stroke="#f3c169" strokeWidth="1.6" opacity=".8" />
      <rect x="-80" y="-24" width="160" height="10" rx="5" fill="#f6cf7c" opacity=".55" />
      <ellipse cx="-88" cy="0" rx="12" ry="27" fill="#bf6f20" />
      <ellipse cx="-88" cy="0" rx="7.5" ry="17" fill={C.pistachio[0]} />
      <ellipse cx="-89.5" cy="-4" rx="3.5" ry="7" fill={C.pistachio[3]} />
    </g>
  );
}

function Burma() {
  return (
    <g>
      <Plate />
      <BurmaPiece x={208} y={128} />
      <BurmaPiece x={200} y={202} />
      <BurmaPiece x={192} y={276} />
      <Pistachio seed={77} cx={200} cy={200} radius={120} count={36} />
    </g>
  );
}

function Sobiyet() {
  const piece = (x: number, y: number, rot: number) => (
    <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d="M4 -46L60 46L-52 46Z" fill={C.trayShadow} opacity=".18" />
      <path d="M0 -52L56 40L-56 40Z" fill="#d98f33" stroke="#a35b18" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M0 -36L40 30L-40 30Z" fill="#ecb456" />
      <path d="M-50 40Q0 56 50 40Q0 46 -50 40Z" fill={C.cream} />
      <path d="M0 -14L18 16L-18 16Z" fill={C.pistachio[0]} />
      <path d="M-2 -6L8 10L-10 10Z" fill={C.pistachio[3]} />
    </g>
  );
  return (
    <g>
      <Plate />
      {piece(146, 152, -8)}
      {piece(254, 150, 172)}
      {piece(150, 254, 172)}
      {piece(252, 252, -8)}
      <Pistachio seed={93} cx={200} cy={200} radius={110} count={30} />
    </g>
  );
}

function Katmer() {
  const r = rng(58);
  return (
    <g>
      <Plate />
      <g transform="rotate(8 200 200)">
        <rect x="88" y="88" width="230" height="230" rx="18" fill={C.trayShadow} opacity=".16" />
        <rect x="82" y="82" width="236" height="236" rx="18" fill="#e7b25f" />
        <rect x="92" y="92" width="216" height="216" rx="12" fill="#f3d18c" />
        <path d={crumbs(r, 200, 200, 120, 70, 3, 8)} fill="#d79a48" opacity=".75" />
        <path d={crumbs(r, 200, 200, 115, 40, 2, 5)} fill="#b9772f" opacity=".6" />
        <path d="M200 84V316M84 200H316" stroke="#a8692d" strokeWidth="3.5" opacity=".6" />
        <path d="M203 86V314M86 203H314" stroke="#fde3a3" strokeWidth="1.4" opacity=".8" />
      </g>
      <Pistachio seed={59} cx={200} cy={200} radius={104} count={180} />
    </g>
  );
}

function Sillik() {
  const r = rng(64);
  const roll = (y: number) => (
    <g key={y} transform={`translate(200 ${y}) rotate(-12)`}>
      <rect x="-94" y="-20" width="190" height="52" rx="26" fill={C.trayShadow} opacity=".16" />
      <rect x="-98" y="-26" width="196" height="52" rx="26" fill="#eccf98" />
      <path d={crumbs(r, 0, 0, 22, 1, 0, 0)} fill="none" />
      <rect x="-86" y="-22" width="170" height="11" rx="5.5" fill="#fbe8bf" opacity=".9" />
      <ellipse cx="-96" cy="0" rx="13" ry="25" fill="#d9b26f" />
      <path d="M-96 -14Q-86 0 -96 14Q-104 0 -96 -6Q-92 0 -96 4" stroke="#a87b3b" strokeWidth="2.2" fill="none" />
    </g>
  );
  return (
    <g>
      <Plate />
      {roll(132)}
      {roll(202)}
      {roll(272)}
      <path d={crumbs(r, 200, 200, 112, 26, 4, 9)} fill="#8a5a2b" />
      <path d={crumbs(r, 200, 200, 112, 18, 3, 7)} fill="#6f441e" />
      <path
        d="M110 160Q170 140 290 120M118 232Q178 212 286 192"
        stroke="#fff"
        strokeOpacity=".45"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

// --- milk desserts ----------------------------------------------------------

function Dondurma() {
  return (
    <g>
      <Plate />
      <Scoop cx={162} cy={170} s={1.05} seed={11} />
      <Scoop cx={244} cy={176} s={1.05} color="#d6e3a3" shade="#bccb7e" seed={12} />
      <Scoop cx={202} cy={248} s={1.05} seed={13} />
      <Pistachio seed={14} cx={204} cy={206} radius={86} count={70} />
    </g>
  );
}

function Sutlac() {
  const r = rng(27);
  return (
    <g>
      <circle cx="207" cy="214" r="168" fill={C.trayShadow} opacity=".16" />
      <circle cx="200" cy="200" r="166" fill="#b5592b" />
      <path d="M62 116A160 160 0 0 1 116 62" stroke="#dd8457" strokeWidth="6" strokeLinecap="round" fill="none" />
      <circle cx="200" cy="200" r="148" fill="#8f3f1d" />
      <circle cx="200" cy="200" r="138" fill="#f7e8c6" />
      {/* the oven browns the middle most, fading out to the rim */}
      <path d={blob(r, 204, 196, 96, 11, 0.35)} fill="#e9c58c" opacity=".7" />
      <path d={blob(r, 206, 194, 70, 10, 0.4)} fill="#d9a35f" opacity=".6" />
      <path d={blob(r, 210, 190, 44, 9, 0.5)} fill="#c07c37" opacity=".55" />
      <path d={crumbs(r, 204, 196, 90, 70, 2, 6)} fill="#b8722f" opacity=".45" />
      <path d={crumbs(r, 206, 194, 60, 40, 1.5, 4)} fill="#8f4f1d" opacity=".45" />
      <path
        d="M118 150Q140 112 186 98"
        stroke="#fff"
        strokeOpacity=".45"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

// --- pistachios ----------------------------------------------------------------

function Fistik() {
  const r = rng(5);
  // A heap: nuts near the centre sit higher (drawn later) and slightly bigger.
  const nuts = Array.from({ length: 30 }, () => {
    const [x, y] = inDisc(r, 200, 206, 112);
    const d = Math.hypot(x - 200, y - 206) / 112;
    return { x, y, d, rot: r() * 360, s: 1.55 - d * 0.35 + r() * 0.15 };
  }).sort((a, b) => b.d - a.d);
  return (
    <g>
      <circle cx="207" cy="214" r="168" fill={C.trayShadow} opacity=".16" />
      <circle cx="200" cy="200" r="166" fill={C.navy} />
      <path d="M62 116A160 160 0 0 1 116 62" stroke="#464b86" strokeWidth="6" strokeLinecap="round" fill="none" />
      <circle cx="200" cy="200" r="150" fill="#181a3a" />
      {nuts.map(({ x, y, rot, s }, i) => (
        <g key={i} transform={`translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)}) scale(${n1(s)})`}>
          <ellipse cx="2" cy="4" rx="28" ry="18" fill="#000" opacity=".25" />
          <ellipse rx="28" ry="18" fill="#efdfbb" stroke="#c4a574" strokeWidth="2" />
          <path d="M-21 -3Q0 -17 21 -3Q0 7 -21 -3Z" fill={C.pistachio[0]} />
          <path d="M-13 -6Q0 -14 13 -6" stroke={C.skin} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M-8 -3Q0 -7 8 -3" stroke={C.pistachio[3]} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M-24 4Q0 16 24 4" stroke="#d8c294" strokeWidth="2" fill="none" />
        </g>
      ))}
    </g>
  );
}

// --- drinks ----------------------------------------------------------------------

function Saucer({ cx = 200, cy = 330, rx = 130, ry = 26 }: { cx?: number; cy?: number; rx?: number; ry?: number }) {
  return (
    <g>
      <ellipse cx={cx + 6} cy={cy + 10} rx={rx} ry={ry} fill={C.trayShadow} opacity=".15" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={C.plate} />
      <ellipse cx={cx} cy={cy} rx={rx - 8} ry={ry - 5} fill="none" stroke={C.navy} strokeWidth="2.5" opacity=".85" />
      <ellipse cx={cx} cy={cy - 2} rx={rx * 0.5} ry={ry * 0.42} fill={C.plateWell} />
    </g>
  );
}

function Cay() {
  // İnce belli bardak: narrow waist, round belly.
  const glass =
    "M138 96C138 140 172 170 172 214C172 240 142 258 142 296C142 322 164 336 200 336C236 336 258 322 258 296C258 258 228 240 228 214C228 170 262 140 262 96Z";
  const tea =
    "M146 124C150 156 176 180 176 214C176 242 148 260 148 296C148 318 168 330 200 330C232 330 252 318 252 296C252 260 224 242 224 214C224 180 250 156 254 124Z";
  return (
    <g>
      <Saucer cy={336} />
      <path d={glass} fill="#ffffff" fillOpacity=".55" stroke="#e8dbad" strokeWidth="3" />
      <path d={tea} fill="#a8361a" />
      <path
        d="M150 140C158 166 180 186 180 214C180 236 160 252 154 280"
        stroke="#cf5a2a"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        opacity=".7"
      />
      <ellipse cx="200" cy="124" rx="54" ry="8" fill="#c94b22" />
      <path
        d="M150 104C152 132 170 152 176 176"
        stroke="#fff"
        strokeOpacity=".8"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M156 268C152 286 154 304 166 318"
        stroke="#fff"
        strokeOpacity=".55"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="200" cy="96" rx="62" ry="9" fill="none" stroke="#e8dbad" strokeWidth="3" />
      <path d="M244 70L210 300" stroke="#c9a46a" strokeWidth="4" strokeLinecap="round" />
      <rect
        x="270"
        y="314"
        width="22"
        height="20"
        rx="3"
        fill="#fff"
        stroke="#e8dbad"
        strokeWidth="2"
        transform="rotate(-10 281 324)"
      />
      <rect
        x="292"
        y="320"
        width="20"
        height="18"
        rx="3"
        fill="#fff"
        stroke="#e8dbad"
        strokeWidth="2"
        transform="rotate(12 302 329)"
      />
    </g>
  );
}

function Kahve() {
  return (
    <g>
      <Saucer cy={318} rx={138} ry={28} />
      {/* handle */}
      <path d="M262 214C300 206 304 260 262 262" stroke="#fffdf6" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M262 214C300 206 304 260 262 262" stroke="#e8dbad" strokeWidth="2" fill="none" />
      {/* cup */}
      <path
        d="M128 176H272C270 250 248 304 200 304C152 304 130 250 128 176Z"
        fill="#fffdf6"
        stroke="#e8dbad"
        strokeWidth="2.5"
      />
      <path d="M134 206H266C264 216 262 224 260 232H140C138 224 136 216 134 206Z" fill={C.navy} />
      <path d="M140 232H260" stroke="#d6a94f" strokeWidth="3" />
      <path d="M134 206H266" stroke="#d6a94f" strokeWidth="3" />
      <ellipse cx="200" cy="176" rx="72" ry="13" fill="#5a3418" />
      <ellipse cx="196" cy="174" rx="56" ry="8" fill="#a8774f" />
      <ellipse cx="186" cy="173" rx="20" ry="3" fill="#c9996b" />
      <path
        d="M150 248C156 272 170 290 188 296"
        stroke="#fff"
        strokeOpacity=".8"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* lokum */}
      <g transform="translate(96 288)">
        <path d="M-22 -8L0 -20L22 -8L0 4Z" fill="#fff6f2" />
        <path d="M-22 -8L0 4V26L-22 14Z" fill="#f4d9da" />
        <path d="M22 -8L0 4V26L22 14Z" fill="#eac2c6" />
      </g>
    </g>
  );
}

function Mirra() {
  return (
    <g>
      <ellipse cx="200" cy="330" rx="150" ry="20" fill={C.trayShadow} opacity=".14" />
      {/* brass pot */}
      <path
        d="M118 316C84 316 78 270 96 236C108 214 112 194 108 172H156C152 194 156 214 168 236C186 270 180 316 146 316Z"
        fill="#c9973f"
      />
      <path
        d="M104 236C96 262 98 292 116 306"
        stroke="#f3d488"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity=".9"
      />
      <path d="M166 230C200 214 214 168 240 150" stroke="#b07f2c" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M104 172H160" stroke="#a87526" strokeWidth="8" strokeLinecap="round" />
      <path d="M118 172C118 150 146 150 146 172" fill="#c9973f" />
      <circle cx="132" cy="140" r="7" fill="#d9a94f" />
      <path d="M132 147V156" stroke="#d9a94f" strokeWidth="4" />
      {/* cups */}
      {[
        [252, 290],
        [312, 300],
      ].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <ellipse cx="2" cy="22" rx="30" ry="7" fill={C.trayShadow} opacity=".16" />
          <path d="M-30 -14H30C28 8 18 22 0 22C-18 22 -28 8 -30 -14Z" fill="#fffdf6" stroke="#e8dbad" strokeWidth="2" />
          <path d="M-29 -4H29" stroke={C.navy} strokeWidth="4" />
          <ellipse cx="0" cy="-14" rx="30" ry="6" fill="#3a2212" />
        </g>
      ))}
    </g>
  );
}

// --- frame -------------------------------------------------------------------

const arts: Record<ArtKind, () => React.ReactNode> = {
  kunefe: () => <Kunefe topping="klasik" seed={3} />,
  "kunefe-fistik": () => <Kunefe topping="fistik" seed={7} />,
  "kunefe-kaymak": () => <Kunefe topping="kaymak" seed={13} />,
  "kunefe-dondurma": () => <Kunefe topping="dondurma" seed={17} />,
  "kunefe-ozel": () => <Kunefe topping="ozel" seed={21} />,
  tepsi: () => <Kunefe topping="fistik" cuts={8} seed={29} />,
  tel: () => <Tel />,
  baklava: () => <Baklava />,
  burma: () => <Burma />,
  sobiyet: () => <Sobiyet />,
  katmer: () => <Katmer />,
  sillik: () => <Sillik />,
  dondurma: () => <Dondurma />,
  sutlac: () => <Sutlac />,
  fistik: () => <Fistik />,
  cay: () => <Cay />,
  kahve: () => <Kahve />,
  mirra: () => <Mirra />,
};

/** Round dishes seen from above can be cropped to the rim, e.g. inside a circular frame. */
const roundKinds = new Set<ArtKind>([
  "fistik",
  "kunefe",
  "kunefe-fistik",
  "kunefe-kaymak",
  "kunefe-dondurma",
  "kunefe-ozel",
  "tepsi",
  "tel",
  "baklava",
  "sutlac",
]);

export function FoodArt({ kind, fill = false, className = "" }: { kind: ArtKind; fill?: boolean; className?: string }) {
  const bleed = fill && roundKinds.has(kind);
  return (
    <div
      className={`absolute inset-0 ${bleed ? "bg-karamel-600" : "bg-[radial-gradient(circle_at_50%_38%,var(--color-krem-50),var(--color-krem-200)_78%)]"} ${className}`}
    >
      {!bleed && <div className="pattern-star-light absolute inset-0" />}
      <svg
        viewBox={bleed ? "18 18 364 364" : "-12 -12 424 424"}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        className={`absolute inset-0 size-full ${bleed ? "" : "p-[5%]"}`}
      >
        {arts[kind]()}
      </svg>
    </div>
  );
}
