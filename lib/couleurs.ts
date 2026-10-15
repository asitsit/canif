// Calculs de couleurs : conversions, harmonies, contraste (règles WCAG).

export type Rvb = [number, number, number];

export function hexVersRvb(hex: string): Rvb {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rvbVersHex([r, v, b]: Rvb) {
  return "#" + [r, v, b].map((x) => Math.round(Math.min(255, Math.max(0, x))).toString(16).padStart(2, "0")).join("");
}

// Teinte (0-360), saturation et luminosité (0-100).
export function rvbVersTsl([r, v, b]: Rvb): [number, number, number] {
  const [R, V, B] = [r / 255, v / 255, b / 255];
  const max = Math.max(R, V, B);
  const min = Math.min(R, V, B);
  const l = (max + min) / 2;
  let t = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    t = max === R ? (V - B) / d + (V < B ? 6 : 0) : max === V ? (B - R) / d + 2 : (R - V) / d + 4;
    t *= 60;
  }
  return [t, s * 100, l * 100];
}

export function tslVersHex(t: number, s: number, l: number) {
  const S = s / 100;
  const L = l / 100;
  const k = (n: number) => (n + ((t % 360) + 360) % 360 / 30) % 12;
  const a = S * Math.min(L, 1 - L);
  const f = (n: number) => L - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rvbVersHex([f(0) * 255, f(8) * 255, f(4) * 255]);
}

// Luminance relative et rapport de contraste (WCAG 2).
function luminance([r, v, b]: Rvb) {
  const c = (x: number) => {
    const y = x / 255;
    return y <= 0.03928 ? y / 12.92 : ((y + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * c(r) + 0.7152 * c(v) + 0.0722 * c(b);
}

export function contraste(a: string, b: string) {
  const [l1, l2] = [luminance(hexVersRvb(a)), luminance(hexVersRvb(b))].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// Harmonies à partir d'une couleur de base.
export function harmonie(base: string, type: string): string[] {
  const [t, s, l] = rvbVersTsl(hexVersRvb(base));
  const tourner = (d: number) => tslVersHex(t + d, s, l);
  switch (type) {
    case "complementaire":
      return [base, tslVersHex(t, s, Math.min(l + 25, 92)), tourner(180), tslVersHex(t + 180, s, Math.max(l - 20, 10)), tslVersHex(t, Math.max(s - 40, 5), 95)];
    case "analogue":
      return [tourner(-40), tourner(-20), base, tourner(20), tourner(40)];
    case "triadique":
      return [base, tourner(120), tourner(240), tslVersHex(t, s, Math.min(l + 30, 94)), tslVersHex(t, s, Math.max(l - 30, 8))];
    default: // monochrome
      return [92, 75, 55, 38, 20].map((ll) => tslVersHex(t, s, ll));
  }
}

// Couleurs dominantes d'une image : regroupement simple des pixels par cases de
// couleur (quantification), sur une version réduite de l'image.
export function couleursDominantes(img: HTMLImageElement, nombre = 6): string[] {
  const c = document.createElement("canvas");
  const r = Math.min(1, 120 / Math.max(img.naturalWidth, img.naturalHeight));
  c.width = Math.max(1, Math.round(img.naturalWidth * r));
  c.height = Math.max(1, Math.round(img.naturalHeight * r));
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0, c.width, c.height);
  const { data } = ctx.getImageData(0, 0, c.width, c.height);
  const cases = new Map<number, { n: number; r: number; v: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue; // pixels transparents ignorés
    const cle = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
    const x = cases.get(cle) ?? { n: 0, r: 0, v: 0, b: 0 };
    x.n++;
    x.r += data[i];
    x.v += data[i + 1];
    x.b += data[i + 2];
    cases.set(cle, x);
  }
  const triees = [...cases.values()].sort((a, b) => b.n - a.n).map((x) => rvbVersHex([x.r / x.n, x.v / x.n, x.b / x.n]));
  // On écarte les couleurs trop proches d'une couleur déjà retenue.
  const retenues: string[] = [];
  for (const h of triees) {
    const [r1, v1, b1] = hexVersRvb(h);
    if (retenues.every((x) => {
      const [r2, v2, b2] = hexVersRvb(x);
      return Math.abs(r1 - r2) + Math.abs(v1 - v2) + Math.abs(b1 - b2) > 60;
    })) retenues.push(h);
    if (retenues.length >= nombre) break;
  }
  return retenues;
}
