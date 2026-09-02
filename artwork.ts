// Generates a deterministic, original gradient "poster" for each title key.
// Avoids using any real film artwork while still giving each card a distinct look.

const PALETTES: [string, string, string][] = [
  ["#7a2f1f", "#e8a33d", "#1a1006"],
  ["#0f2a3d", "#2f8f8f", "#04120f"],
  ["#3a1030", "#c23b6e", "#12040d"],
  ["#0d1b3a", "#3b5fc2", "#04091a"],
  ["#2a3a10", "#8fae3b", "#0a1004"],
  ["#3a1a10", "#c25b3b", "#140702"],
  ["#1a1a3a", "#6b5fc2", "#07071a"],
  ["#3a2a0a", "#c2953b", "#140d02"],
];

function hash(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function paletteFor(key: string) {
  const h = hash(key);
  const p = PALETTES[h % PALETTES.length];
  const angle = 100 + (h % 3) * 40;
  return { colors: p, angle };
}

export function posterGradient(key: string): string {
  const { colors, angle } = paletteFor(key);
  return `linear-gradient(${angle}deg, ${colors[0]} 0%, ${colors[2]} 55%, ${colors[2]} 100%)`;
}

export function backdropGradient(key: string): string {
  const { colors } = paletteFor(key);
  return `radial-gradient(120% 100% at 15% 20%, ${colors[1]}33 0%, transparent 45%), linear-gradient(180deg, ${colors[2]} 0%, #060608 75%)`;
}

export function accentFor(key: string): string {
  return paletteFor(key).colors[1];
}
