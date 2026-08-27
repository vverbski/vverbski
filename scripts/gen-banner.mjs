// Renders the profile banner in both themes. GitHub swaps them with <picture>,
// so the header follows the reader's theme instead of fighting it.
// Text is rasterised here rather than shipped as SVG: an <img> SVG would pick
// up whatever fonts the reader's machine has and the spacing would drift.
// Run `npm run banner` and commit the PNGs — nothing regenerates them in CI.
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)));

const SANS = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const MONO = 'Menlo, DejaVu Sans Mono, monospace';

/** Same tokens as the site's `:root` — the profile and vverbski.dev are one surface. */
const themes = {
  dark: { bg: '#0b0b0d', ink: '#ededf0', dim: '#9a9aa6', faint: '#5c5c66', line: '#22222a', dots: 0.14, glow: 0.1 },
  light: { bg: '#f4f1e9', ink: '#17150f', dim: '#5c5749', faint: '#8b8474', line: '#ddd7c6', dots: 0.22, glow: 0.05 },
};

const W = 1600;
const H = 348;

function banner(t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="${t.faint}" opacity="${t.dots}"/>
    </pattern>
    <radialGradient id="glow" cx="50%" cy="0%" r="80%">
      <stop offset="0%" stop-color="${t.ink}" stop-opacity="${t.glow}"/>
      <stop offset="100%" stop-color="${t.ink}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${t.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <g font-family="${SANS}" text-anchor="middle">
    <text x="${W / 2}" y="152" font-size="96" font-weight="700" fill="${t.ink}" letter-spacing="-4">vverbski</text>
    <text x="${W / 2}" y="210" font-size="34" fill="${t.dim}" letter-spacing="-0.6">1 app = 1 feature = 1 problem solved</text>
  </g>

  <g font-family="${MONO}" font-size="19" letter-spacing="2.6">
    <line x1="96" y1="266" x2="${W - 96}" y2="266" stroke="${t.line}" stroke-width="1"/>
    <text x="96" y="308" fill="${t.dim}">BUILD IN PUBLIC</text>
    <text x="${W - 96}" y="308" fill="${t.faint}" text-anchor="end">VVERBSKI.DEV</text>
  </g>

</svg>`;
}

for (const [name, t] of Object.entries(themes)) {
  const file = path.join(root, 'assets', `banner-${name}.png`);
  await sharp(Buffer.from(banner(t))).png({ compressionLevel: 9 }).toFile(file);
  console.log('wrote assets/banner-' + name + '.png');
}
