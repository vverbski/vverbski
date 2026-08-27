// Renders the profile's raster assets: the banner in both themes, and the avatar. GitHub swaps them with <picture>,
// so the header follows the reader's theme instead of fighting it.
// Text is rasterised here rather than shipped as SVG: an <img> SVG would pick
// up whatever fonts the reader's machine has and the spacing would drift.
// Run `npm run assets` and commit the PNGs — nothing regenerates them in CI.
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)));

// Metric-compatible stacks: Arial/Menlo on macOS, Liberation/DejaVu on the CI
// runner. Both render the same layout, so a card refreshed by the workflow sits
// next to a banner rendered locally without the typography jumping.
const SANS = 'Arial, Liberation Sans, Helvetica, sans-serif';
const MONO = 'Menlo, DejaVu Sans Mono, monospace';

/** Same tokens as the site's `:root` — the profile and vverbski.dev are one surface. */
const themes = {
  dark: { bg: '#0b0b0d', elev: '#111114', ink: '#ededf0', dim: '#9a9aa6', faint: '#5c5c66', line: '#22222a', dots: 0.14, glow: 0.1 },
  light: { bg: '#f4f1e9', elev: '#efebe0', ink: '#17150f', dim: '#5c5749', faint: '#8b8474', line: '#ddd7c6', dots: 0.22, glow: 0.05 },
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

/** Avatar. GitHub crops it to a circle, so the plate is a full square and the
 *  monogram — the same one the site uses as its favicon — stays well inside. */
function avatar(size, t) {
  const s = size / 32;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${t.bg}"/>
  <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="${2.7 * s}">
    <path d="M${6.4 * s} ${9.6 * s}L${12 * s} ${22.6 * s}L${17.6 * s} ${9.6 * s}" stroke="${t.ink}"/>
    <path d="M${20.6 * s} ${9.6 * s}L${26.2 * s} ${22.6 * s}" stroke="${t.faint}"/>
  </g>
</svg>`;
}

await sharp(Buffer.from(avatar(512, themes.dark)))
  .png({ compressionLevel: 9 })
  .toFile(path.join(root, 'assets', 'avatar.png'));
console.log('wrote assets/avatar.png');

/** The numbers, in the site's own type rather than as badge chips. Refreshed by
 *  .github/workflows/stats.yml, so the profile never drifts far from /stats. */
function statsCard(stats, t) {
  const H = 300;
  const cols = [
    { value: (stats.revenue < 0 ? '−$' : '$') + Math.abs(stats.revenue), label: 'NET REVENUE' },
    { value: String(Math.max(0, stats.projectsLaunched)), label: 'LAUNCHED' },
    { value: String(Math.max(0, stats.projectsInProgress)), label: 'BUILDING' },
    { value: String(Math.max(0, stats.users)), label: 'USERS' },
  ];
  const col = W / cols.length;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="${t.faint}" opacity="${t.dots}"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="${t.elev}"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${t.line}"/>

  ${cols
    .slice(1)
    .map((_, i) => `<line x1="${col * (i + 1)}" y1="64" x2="${col * (i + 1)}" y2="212" stroke="${t.line}"/>`)
    .join('\n  ')}

  <g text-anchor="middle">
    ${cols
      .map(
        (c, i) => `<text x="${col * i + col / 2}" y="152" font-family="${SANS}" font-size="92" font-weight="700" fill="${t.ink}" letter-spacing="-3">${c.value}</text>
    <text x="${col * i + col / 2}" y="202" font-family="${MONO}" font-size="19" fill="${t.dim}" letter-spacing="2.6">${c.label}</text>`,
      )
      .join('\n    ')}
    <text x="${W / 2}" y="262" font-family="${MONO}" font-size="17" fill="${t.faint}" letter-spacing="2.4">UPDATED ${stats.updatedAt}</text>
  </g>
</svg>`;
}

/** Falls back to whatever is already committed if pulse is unreachable — a dead
 *  service should not blank the numbers on the profile. */
const res = await fetch('https://pulse.vverbski.dev/stats');
if (!res.ok) throw new Error('pulse /stats returned ' + res.status);
const stats = await res.json();

for (const [name, t] of Object.entries(themes)) {
  const file = path.join(root, 'assets', `stats-${name}.png`);
  await sharp(Buffer.from(statsCard(stats, t))).png({ compressionLevel: 9 }).toFile(file);
  console.log('wrote assets/stats-' + name + '.png');
}
