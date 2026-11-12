// 料理イラスト（SVG）をコードだけで生成する。写真素材が無くても「真上から撮った料理写真」風の絵を用意できる。
// 使い方: node tools/make-art.mjs   → img/ に SVG を書き出す
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'img');
mkdirSync(OUT, { recursive: true });

let seed = 1;
const R = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
const rr = (a, b) => a + (b - a) * R();
const f = n => n.toFixed(1);
let uid = 0;

// ---------- 背景 ----------
function wood(w, h, base = '#a8743f', dark = '#7d5229', light = '#c08a50') {
  let s = `<rect width="${w}" height="${h}" fill="${base}"/>`;
  const plank = h / 4;
  for (let i = 0; i < 4; i++) {
    s += `<rect y="${f(i * plank)}" width="${w}" height="${f(plank)}" fill="${i % 2 ? light : dark}" opacity=".18"/>`;
    s += `<rect y="${f(i * plank)}" width="${w}" height="2" fill="#3b2410" opacity=".35"/>`;
  }
  for (let i = 0; i < 70; i++) {
    const y = rr(0, h), x = rr(-100, w), len = rr(120, 520), b = rr(-6, 6);
    s += `<path d="M${f(x)} ${f(y)} q${f(len / 2)} ${f(b)} ${f(len)} 0" stroke="${R() > .5 ? dark : light}" stroke-width="${f(rr(.6, 2))}" fill="none" opacity="${f(rr(.15, .45))}"/>`;
  }
  return s;
}
const vignette = (w, h, o = .45) => {
  const id = 'v' + uid++;
  return `<defs><radialGradient id="${id}" cx="50%" cy="50%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${o}"/></radialGradient></defs><rect width="${w}" height="${h}" fill="url(#${id})"/>`;
};

// ---------- 麺 ----------
function noodles(cx, cy, r, n = 11, width = r * 0.11) {
  const id = 'c' + uid++;
  let under = '', body = '', hi = '';
  for (let i = 0; i < n; i++) {
    const a0 = rr(0, Math.PI * 2), span = rr(2.4, 5.2), f0 = rr(.25, .8), f1 = rr(.4, .9);
    const ox = rr(-r * .12, r * .12), oy = rr(-r * .12, r * .12);
    let d = '';
    for (let k = 0; k <= 40; k++) {
      const t = a0 + (span * k) / 40, fr = f0 + ((f1 - f0) * k) / 40 + Math.sin(k / 5 + i) * .04;
      d += `${k ? 'L' : 'M'}${f(cx + ox + r * fr * Math.cos(t))} ${f(cy + oy + r * fr * Math.sin(t))}`;
    }
    under += `<path d="${d}"/>`; body += `<path d="${d}"/>`; hi += `<path d="${d}"/>`;
  }
  const g = 'fill="none" stroke-linecap="round" stroke-linejoin="round"';
  return `<defs><clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${f(r * .97)}"/></clipPath></defs><g clip-path="url(#${id})">` +
    `<g ${g} stroke="#c9b27c" stroke-width="${f(width + 5)}" opacity=".9">${under}</g>` +
    `<g ${g} stroke="#f6edd6" stroke-width="${f(width)}">${body}</g>` +
    `<g ${g} stroke="#fffdf6" stroke-width="${f(width * .28)}" opacity=".75" transform="translate(-1.5 -2)">${hi}</g></g>`;
}

// ---------- 具 ----------
const T = {
  negi(cx, cy, r, n = 16) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = rr(0, 6.28), d = rr(0, r), q = rr(5, 8);
      s += `<circle cx="${f(cx + d * Math.cos(a))}" cy="${f(cy + d * Math.sin(a))}" r="${f(q)}" fill="#cfe5a0" stroke="#5f9a3c" stroke-width="2.6"/>`;
    }
    return s;
  },
  egg(cx, cy, r = 44) {
    const id = 'y' + uid++;
    return `<defs><radialGradient id="${id}" cx="40%" cy="35%"><stop offset="0" stop-color="#ffd257"/><stop offset="1" stop-color="#ee8f12"/></radialGradient></defs>` +
      `<ellipse cx="${cx}" cy="${cy}" rx="${r * 1.25}" ry="${r * 1.1}" fill="#fffef6" opacity=".93"/>` +
      `<circle cx="${cx}" cy="${cy}" r="${r * .56}" fill="url(#${id})"/><ellipse cx="${cx - r * .16}" cy="${cy - r * .2}" rx="${r * .14}" ry="${r * .08}" fill="#fff" opacity=".7"/>`;
  },
  niku(cx, cy, r, n = 12) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = rr(0, 6.28), d = rr(0, r), x = cx + d * Math.cos(a), y = cy + d * Math.sin(a);
      s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rr(22, 36))}" ry="${f(rr(10, 17))}" transform="rotate(${f(rr(0, 180))} ${f(x)} ${f(y)})" fill="${['#7b4a2b', '#93603a', '#6a3d22', '#a8734a'][i % 4]}" stroke="#4d2a14" stroke-width="1.5"/>`;
    }
    return s;
  },
  kakiage(cx, cy, r, n = 70) {
    let s = `<circle cx="${cx}" cy="${cy}" r="${r * .8}" fill="#d99a35"/>`;
    for (let i = 0; i < n; i++) {
      const a = rr(0, 6.28), d = rr(0, r), x = cx + d * Math.cos(a), y = cy + d * Math.sin(a), b = rr(0, 6.28), l = rr(r * .15, r * .4);
      s += `<path d="M${f(x)} ${f(y)} l${f(l * Math.cos(b))} ${f(l * Math.sin(b))}" stroke="${['#f1c35e', '#e0a23a', '#c4821f', '#f6d98a', '#e9863a'][i % 5]}" stroke-width="${f(rr(4, 9))}" stroke-linecap="round"/>`;
    }
    return s;
  },
  ebi(cx, cy, len = 150, rot = -20) {
    let s = `<g transform="rotate(${rot} ${cx} ${cy})"><path d="M${cx - len / 2} ${cy} l-34 -20 l8 20 l-8 20 z" fill="#e2573a"/>` +
      `<path d="M${cx - len / 2} ${cy - 13} q${len / 2} -22 ${len} 0 q10 13 0 26 q-${len / 2} 22 -${len} 0 z" fill="#e6ad48" stroke="#c4821f" stroke-width="2"/>`;
    for (let i = 0; i < 26; i++) s += `<circle cx="${f(rr(cx - len / 2 + 6, cx + len / 2))}" cy="${f(rr(cy - 20, cy + 20))}" r="${f(rr(3, 8))}" fill="${i % 2 ? '#f6d98a' : '#d99a35'}"/>`;
    return s + '</g>';
  },
  imo(cx, cy, rot = 20) {
    return `<g transform="rotate(${rot} ${cx} ${cy})"><ellipse cx="${cx}" cy="${cy}" rx="78" ry="42" fill="#f3cf5a" stroke="#7b3a5c" stroke-width="7"/><ellipse cx="${cx - 15}" cy="${cy - 10}" rx="40" ry="14" fill="#f9e08a" opacity=".7"/></g>`;
  },
  wakame(cx, cy, r) {
    let s = '';
    for (let i = 0; i < 7; i++) {
      const x = cx + rr(-r, r), y = cy + rr(-r, r);
      s += `<path d="M${f(x)} ${f(y)} q18 -22 36 -4 q16 16 -6 26 q-24 8 -30 -22z" fill="${i % 2 ? '#1f4a2b' : '#2c6238'}" opacity=".95"/>`;
    }
    return s;
  },
  kamaboko(cx, cy, rot = 0) {
    return `<g transform="rotate(${rot} ${cx} ${cy})"><path d="M${cx - 34} ${cy + 14} a34 30 0 0 1 68 0z" fill="#fff8f4" stroke="#ee7f93" stroke-width="7"/></g>`;
  },
  ginger: (cx, cy, r = 16) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#f0d98c"/><circle cx="${cx - 4}" cy="${cy - 4}" r="${r * .45}" fill="#f8ebb8"/>`,
  tenkasu(cx, cy, r, n = 60) {
    let s = '';
    for (let i = 0; i < n; i++) { const a = rr(0, 6.28), d = rr(0, r); s += `<circle cx="${f(cx + d * Math.cos(a))}" cy="${f(cy + d * Math.sin(a))}" r="${f(rr(2.5, 6))}" fill="${i % 3 ? '#e9b851' : '#f6dc94'}"/>`; }
    return s;
  },
  nori(cx, cy, r, n = 26) {
    let s = '';
    for (let i = 0; i < n; i++) { const a = rr(0, 6.28), d = rr(0, r), b = rr(0, 6.28); s += `<path d="M${f(cx + d * Math.cos(a))} ${f(cy + d * Math.sin(a))} l${f(26 * Math.cos(b))} ${f(26 * Math.sin(b))}" stroke="#15201a" stroke-width="3" stroke-linecap="round"/>`; }
    return s;
  },
  kamo(cx, cy, n = 5) {
    let s = '';
    for (let i = 0; i < n; i++) { const x = cx + i * 30 - n * 15, y = cy + i * 6; s += `<g transform="rotate(-24 ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="40" ry="19" fill="#b8635a" stroke="#e9c9a0" stroke-width="5"/><ellipse cx="${x}" cy="${y}" rx="24" ry="8" fill="#9c463f"/></g>`; }
    return s;
  },
  naganegi(cx, cy, n = 3) {
    let s = '';
    for (let i = 0; i < n; i++) { const x = cx + i * 34, y = cy + i * 14; s += `<g transform="rotate(35 ${x} ${y})"><rect x="${x - 34}" y="${y - 12}" width="68" height="24" rx="10" fill="#f4f1d6" stroke="#b9c98a" stroke-width="2"/><path d="M${x - 20} ${y - 12}v24M${x} ${y - 12}v24M${x + 20} ${y - 12}v24" stroke="#5c4320" stroke-width="3" opacity=".55"/></g>`; }
    return s;
  },
};

// ---------- 器 ----------
function bowl(cx, cy, r, { rim = '#26211d', inner = '#3a322c', broth = ['#e9cf93', '#c99a4e'], level = .84, noodle = true, top = '' } = {}) {
  const id = 'b' + uid++;
  return `<ellipse cx="${cx + r * .06}" cy="${cy + r * .1}" rx="${r * 1.04}" ry="${r * 1.02}" fill="#000" opacity=".32" filter="url(#blur)"/>` +
    `<defs><radialGradient id="${id}" cx="45%" cy="40%"><stop offset="0" stop-color="${broth[0]}"/><stop offset="1" stop-color="${broth[1]}"/></radialGradient></defs>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${rim}"/><circle cx="${cx}" cy="${cy}" r="${r * .95}" fill="${inner}"/>` +
    `<path d="M${cx - r * .8} ${cy - r * .5} a${r * .95} ${r * .95} 0 0 1 ${r * .9} -${r * .43}" stroke="#fff" stroke-width="${r * .018}" fill="none" opacity=".25" stroke-linecap="round"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r * level}" fill="url(#${id})"/>` +
    (noodle ? noodles(cx, cy, r * level * .92) : '') + top +
    `<ellipse cx="${cx - r * .3}" cy="${cy - r * .42}" rx="${r * .26}" ry="${r * .08}" fill="#fff" opacity=".16" transform="rotate(-28 ${cx - r * .3} ${cy - r * .42})"/>`;
}
function tub(cx, cy, r) { // 釜揚げ用の木桶
  let staves = '';
  for (let i = 0; i < 28; i++) { const a = (i / 28) * 6.283; staves += `<path d="M${f(cx + r * .86 * Math.cos(a))} ${f(cy + r * .86 * Math.sin(a))}L${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}" stroke="#8a5f2c" stroke-width="2"/>`; }
  return `<ellipse cx="${cx + 12}" cy="${cy + 18}" rx="${r * 1.04}" ry="${r * 1.02}" fill="#000" opacity=".32" filter="url(#blur)"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#e3bd7c"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#b9772f" stroke-width="5"/>${staves}` +
    `<circle cx="${cx}" cy="${cy}" r="${r * .86}" fill="#f4f0e2"/><circle cx="${cx}" cy="${cy}" r="${r * .86}" fill="none" stroke="#b78a4c" stroke-width="4"/>` + noodles(cx, cy, r * .8, 12);
}
const dish = (cx, cy, r, fill, inner = '') =>
  `<ellipse cx="${cx + 5}" cy="${cy + 8}" rx="${r * 1.05}" ry="${r * 1.03}" fill="#000" opacity=".3" filter="url(#blur)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/><circle cx="${cx}" cy="${cy}" r="${r * .86}" fill="#000" opacity=".12"/>${inner}`;
const chopsticks = (x, y, len, rot) =>
  `<g transform="rotate(${rot} ${x} ${y})"><rect x="${x}" y="${y}" width="${len}" height="9" rx="4" fill="#3a1f12"/><rect x="${x}" y="${y + 20}" width="${len}" height="9" rx="4" fill="#4a2a18"/><rect x="${x - 20}" y="${y - 8}" width="44" height="46" rx="10" fill="#e9e2d0"/></g>`;

function save(name, w, h, body) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs><filter id="blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter></defs>${body}</svg>`;
  writeFileSync(join(OUT, name + '.svg'), svg);
  console.log(name + '.svg', (svg.length / 1024).toFixed(0) + 'KB');
}
const scene = (name, s, w, h, draw, woodArgs = []) => { seed = s; uid = 0; save(name, w, h, wood(w, h, ...woodArgs) + draw() + vignette(w, h)); };
const DARK = ['#4a3220', '#2e1d10', '#6a4a2e'];

// ---------- 書き出し ----------
scene('hero', 7, 1600, 1000, () =>
  bowl(560, 560, 330, { top: T.negi(470, 470, 60, 22) + T.egg(640, 600, 62) + T.ginger(520, 660, 20) }) +
  dish(1080, 300, 120, '#e9e2d0', T.kakiage(1080, 300, 78)) + dish(1250, 640, 80, '#2a2420', T.negi(1250, 640, 46, 30)) +
  dish(1020, 760, 70, '#2a2420', `<circle cx="1020" cy="760" r="54" fill="#2b1608"/>`) + chopsticks(900, 880, 560, -8), DARK);

scene('kake', 11, 800, 600, () => bowl(400, 300, 230, { top: T.negi(400, 290, 55, 20) + T.kamaboko(500, 360, 20) }));
scene('kamaage', 12, 1200, 520, () => tub(700, 260, 215) + dish(330, 200, 105, '#f1ebdc', T.negi(330, 195, 52, 34) + T.ginger(350, 230, 18)) + dish(1040, 380, 82, '#201a16', `<circle cx="1040" cy="380" r="64" fill="#2b1608"/>`));
scene('bukkake', 13, 800, 600, () => bowl(400, 300, 230, { broth: ['#b98a4a', '#7a4f22'], level: .8, top: T.egg(430, 300, 50) + T.negi(310, 250, 40, 14) + T.ginger(330, 380, 16) + T.tenkasu(500, 210, 40, 40) }));
scene('niku', 14, 800, 600, () => bowl(400, 300, 230, { top: T.niku(400, 290, 90, 14) + T.egg(470, 360, 40) + T.negi(310, 230, 36, 12) + T.nori(380, 300, 60, 16) }), DARK);
scene('kamo', 15, 800, 600, () => bowl(400, 300, 230, { broth: ['#c08a45', '#8a5a25'], top: T.kamo(410, 270) + T.naganegi(330, 360) + T.negi(500, 380, 30, 10) }), DARK);
scene('curry', 16, 800, 600, () => bowl(400, 300, 230, { broth: ['#d9912f', '#a35f12'], level: .86, top: T.niku(430, 320, 60, 7) + T.negi(330, 250, 40, 14) }));
scene('wakame', 17, 800, 600, () => bowl(400, 300, 230, { top: T.wakame(380, 270, 70) + T.negi(470, 360, 34, 12) + T.kamaboko(300, 350, -15) }));
scene('tempura', 18, 800, 600, () => dish(400, 310, 250, '#efe8d8', T.kakiage(310, 250, 110) + T.ebi(500, 330, 190, -24) + T.ebi(470, 410, 170, -10) + T.imo(300, 430, 14)));
scene('yakumi', 19, 800, 600, () => dish(230, 230, 130, '#f1ebdc', T.negi(230, 230, 78, 60)) + dish(540, 200, 115, '#27211d', T.tenkasu(540, 200, 76, 130)) + dish(400, 440, 110, '#f1ebdc', T.wakame(390, 430, 50)) + dish(650, 440, 80, '#27211d', T.ginger(650, 440, 34)));
scene('gohan', 20, 800, 600, () => {
  const oni = (x, y) => `<path d="M${x} ${y - 85} q95 120 85 150 q-85 26 -170 0 q-10 -30 85 -150z" fill="#fdfbf3" stroke="#e2dccb" stroke-width="4"/><rect x="${x - 34}" y="${y + 6}" width="68" height="62" rx="5" fill="#16211b"/>`;
  return dish(400, 300, 255, '#2a2420', oni(300, 290) + oni(480, 300) + `<ellipse cx="400" cy="440" rx="62" ry="36" fill="#c98a3a" stroke="#9a6220" stroke-width="3"/>`);
}, DARK);
scene('bento', 21, 800, 600, () =>
  `<rect x="96" y="76" width="620" height="460" rx="46" fill="#000" opacity=".3" filter="url(#blur)"/><rect x="80" y="60" width="640" height="480" rx="46" fill="#f7f4ea" stroke="#fff" stroke-width="8"/><rect x="100" y="80" width="600" height="440" rx="34" fill="#efe9d8"/>` +
  noodles(320, 300, 190, 13, 24) + T.kakiage(570, 210, 80) + T.ebi(560, 400, 170, -30) + T.negi(250, 180, 40, 16) + `<rect x="150" y="390" width="92" height="60" rx="8" fill="#f2c94c" stroke="#d6a51f" stroke-width="3"/>`);
scene('dough', 22, 1200, 800, () => {
  let s = `<rect x="110" y="110" width="980" height="580" rx="16" fill="#000" opacity=".3" filter="url(#blur)"/><rect x="90" y="90" width="980" height="580" rx="16" fill="#e7cf9f"/>`;
  [[300, 270], [560, 250], [820, 290], [420, 480], [700, 490]].forEach(([x, y], i) => {
    const id = 'd' + i;
    s += `<defs><radialGradient id="${id}" cx="38%" cy="32%"><stop offset="0" stop-color="#fffaf0"/><stop offset=".7" stop-color="#f1e3c3"/><stop offset="1" stop-color="#d7c092"/></radialGradient></defs><ellipse cx="${x + 8}" cy="${y + 14}" rx="118" ry="104" fill="#7a5a2a" opacity=".3" filter="url(#blur)"/><ellipse cx="${x}" cy="${y}" rx="112" ry="98" fill="url(#${id})"/>`;
  });
  return s + `<path d="M760 420 q170 -60 330 30 v260 h-360z" fill="#f4f1ea" opacity=".96"/><path d="M790 470 q130 -40 300 20M800 540 q140 -30 290 20M790 610 q150 -30 300 10" stroke="#3d4664" stroke-width="5" fill="none" opacity=".55"/>`;
});
scene('nests', 23, 1200, 800, () => {
  let s = `<rect x="70" y="70" width="1060" height="660" rx="24" fill="#d9b876"/>`;
  for (let y = 84; y < 720; y += 13) s += `<rect x="78" y="${y}" width="1044" height="8" rx="4" fill="#c79f58"/>`;
  [[280, 250], [600, 230], [930, 270], [430, 540], [770, 550]].forEach(([x, y]) => { s += `<ellipse cx="${x + 6}" cy="${y + 10}" rx="140" ry="130" fill="#5c4320" opacity=".3" filter="url(#blur)"/>` + noodles(x, y, 140, 12, 17); });
  return s;
});
// ---------- 下層ページ用 ----------
const aburaage = (cx, cy, rot) => {
  let s = `<g transform="rotate(${rot} ${cx} ${cy})"><rect x="${cx - 90}" y="${cy - 62}" width="180" height="124" rx="22" fill="#c98b3c" stroke="#9a6220" stroke-width="3"/>`;
  for (let i = 0; i < 40; i++) s += `<circle cx="${f(rr(cx - 78, cx + 78))}" cy="${f(rr(cy - 50, cy + 50))}" r="${f(rr(2, 5))}" fill="${i % 2 ? '#e0a95a' : '#a96a26'}" opacity=".7"/>`;
  return s + `<rect x="${cx - 80}" y="${cy - 52}" width="160" height="40" rx="14" fill="#fff" opacity=".12"/></g>`;
};
scene('zaru', 31, 800, 600, () => {
  let s = `<rect x="120" y="96" width="460" height="420" rx="18" fill="#000" opacity=".3" filter="url(#blur)"/><rect x="100" y="80" width="460" height="420" rx="18" fill="#2a2420"/><rect x="118" y="98" width="424" height="384" rx="10" fill="#d9b876"/>`;
  for (let y = 104; y < 478; y += 11) s += `<rect x="122" y="${y}" width="416" height="7" rx="3" fill="#c79f58"/>`;
  return s + noodles(330, 290, 170, 14, 18) + T.nori(330, 260, 60, 14) + dish(660, 200, 82, '#f1ebdc', `<circle cx="660" cy="200" r="62" fill="#4a2a12"/><ellipse cx="640" cy="182" rx="22" ry="8" fill="#fff" opacity=".2"/>`) + dish(670, 430, 66, '#27211d', T.negi(670, 430, 36, 18) + T.ginger(690, 450, 13));
});
scene('kitsune', 32, 800, 600, () => bowl(400, 300, 230, { top: aburaage(420, 280, -12) + T.negi(300, 340, 40, 14) + T.kamaboko(500, 390, 25) }));
const single = (name, s, draw) => scene(name, s, 600, 600, () => dish(300, 300, 220, '#efe8d8', draw()));
single('ten-kashiwa', 41, () => {
  let s = '';
  [[240, 260], [360, 240], [300, 360]].forEach(([x, y], i) => {
    s += `<ellipse cx="${x}" cy="${y}" rx="78" ry="60" transform="rotate(${i * 40} ${x} ${y})" fill="#d9a046" stroke="#b97a26" stroke-width="3"/>`;
    for (let k = 0; k < 24; k++) s += `<circle cx="${f(x + rr(-60, 60))}" cy="${f(y + rr(-45, 45))}" r="${f(rr(3, 8))}" fill="${k % 2 ? '#f2cf7a' : '#c4862e'}"/>`;
  });
  return s;
});
single('ten-ebi', 42, () => T.ebi(300, 260, 240, -20) + T.ebi(300, 360, 240, -14));
single('ten-kakiage', 43, () => T.kakiage(300, 300, 140, 120));
single('ten-imo', 44, () => T.imo(260, 250, 20) + T.imo(340, 360, -10));
single('ten-chikuwa', 45, () => {
  let s = '';
  [[300, 240, -18], [300, 360, -8]].forEach(([x, y, r]) => {
    s += `<g transform="rotate(${r} ${x} ${y})"><rect x="${x - 150}" y="${y - 36}" width="300" height="72" rx="36" fill="#d9a046" stroke="#b97a26" stroke-width="3"/>`;
    for (let k = 0; k < 40; k++) s += `<circle cx="${f(x + rr(-140, 140))}" cy="${f(y + rr(-28, 28))}" r="${f(rr(2, 6))}" fill="${k % 3 ? '#9bbf5a' : '#f2cf7a'}"/>`;
    s += `<ellipse cx="${x + 146}" cy="${y}" rx="14" ry="30" fill="#f6ecd2" stroke="#b97a26" stroke-width="3"/></g>`;
  });
  return s;
});
single('ten-tamago', 46, () => {
  let s = `<ellipse cx="300" cy="300" rx="130" ry="105" fill="#d9a046" stroke="#b97a26" stroke-width="3"/>`;
  for (let k = 0; k < 40; k++) s += `<circle cx="${f(300 + rr(-115, 115))}" cy="${f(300 + rr(-90, 90))}" r="${f(rr(3, 8))}" fill="${k % 2 ? '#f2cf7a' : '#c4862e'}"/>`;
  return s + `<path d="M190 300 h220 a110 90 0 0 1 -220 0z" fill="#fffaf0"/><circle cx="300" cy="312" r="54" fill="#f2a516"/><ellipse cx="284" cy="298" rx="16" ry="8" fill="#fff" opacity=".6"/>`;
});
single('inari', 47, () => {
  let s = '';
  [[230, 300, -10], [370, 300, 12]].forEach(([x, y, r]) => { s += aburaage(x, y, r + 90).replace(/width="180" height="124"/, 'width="200" height="118"'); });
  return s;
});
single('onigiri', 48, () => {
  const oni = (x, y, nori) => `<path d="M${x} ${y - 95} q105 130 95 165 q-95 28 -190 0 q-10 -35 95 -165z" fill="#fdfbf3" stroke="#e2dccb" stroke-width="4"/><rect x="${x - 38}" y="${y + 8}" width="76" height="66" rx="5" fill="${nori}"/>`;
  return oni(220, 290, '#16211b') + oni(390, 310, '#16211b') + `<circle cx="390" cy="250" r="16" fill="#c0392b"/><circle cx="220" cy="240" r="18" fill="#f08a5d"/>`;
});
scene('hero-menu', 51, 1600, 900, () =>
  bowl(470, 450, 300, { top: T.niku(470, 440, 110, 16) + T.egg(540, 500, 52) + T.negi(380, 360, 50, 18) }) +
  dish(1060, 280, 170, '#efe8d8', T.kakiage(1010, 240, 70) + T.ebi(1100, 320, 170, -28)) +
  dish(1250, 680, 110, '#27211d', T.negi(1250, 680, 64, 50)) + dish(950, 720, 90, '#f1ebdc', T.ginger(950, 720, 30)) + chopsticks(820, 860, 600, -6), DARK);

// 店構え（正面から見た絵。真上視点の料理とは別の描き方）
seed = 60; uid = 0;
save('storefront', 1600, 900, (() => {
  let s = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d3350"/><stop offset=".6" stop-color="#7a5a6a"/><stop offset="1" stop-color="#e2a46a"/></linearGradient><radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>`;
  s += `<rect width="1600" height="900" fill="url(#sky)"/>`;
  for (let i = 0; i < 40; i++) s += `<circle cx="${f(rr(0, 1600))}" cy="${f(rr(0, 260))}" r="${f(rr(.8, 2))}" fill="#fff" opacity="${f(rr(.3, .8))}"/>`;
  s += `<rect x="0" y="780" width="1600" height="120" fill="#4a3a30"/><rect x="0" y="780" width="1600" height="8" fill="#2c221c"/>`;
  s += `<rect x="260" y="250" width="1080" height="540" fill="#5b3d22"/>`;
  for (let x = 270; x < 1340; x += 26) s += `<rect x="${x}" y="250" width="14" height="540" fill="#4a3019" opacity=".55"/>`;
  s += `<path d="M200 270 L800 150 L1400 270 Z" fill="#2a2522"/><rect x="200" y="262" width="1200" height="26" fill="#1c1917"/>`;
  for (let x = 220; x < 1400; x += 40) s += `<rect x="${x}" y="288" width="30" height="12" rx="4" fill="#1c1917"/>`;
  s += `<rect x="610" y="190" width="380" height="58" rx="4" fill="#efe3c6" stroke="#2a2522" stroke-width="6"/><text x="800" y="234" text-anchor="middle" font-family="serif" font-weight="700" font-size="38" letter-spacing="14" fill="#1a1816">豊史製麺</text>`;
  s += `<rect x="440" y="360" width="720" height="420" fill="url(#glow)"/><rect x="470" y="380" width="660" height="400" fill="#f7d48e" opacity=".85"/>`;
  for (let x = 470; x <= 1130; x += 110) s += `<rect x="${x - 4}" y="380" width="8" height="400" fill="#4a3019"/>`;
  for (let y = 380; y <= 780; y += 50) s += `<rect x="470" y="${y - 2}" width="660" height="4" fill="#4a3019" opacity=".7"/>`;
  s += `<rect x="440" y="340" width="720" height="14" fill="#2c221c"/>`;
  [0, 1, 2, 3].forEach(i => {
    const x = 450 + i * 177;
    s += `<path d="M${x} 352 h170 v200 q-85 14 -170 0z" fill="#3d4664"/><path d="M${x} 352 h170 v200 q-85 14 -170 0z" fill="none" stroke="#2a3048" stroke-width="2"/>`;
  });
  s += `<text x="800" y="470" text-anchor="middle" font-family="serif" font-weight="700" font-size="64" letter-spacing="96" fill="#fbf7ef" dx="48">熟成</text><circle cx="800" cy="510" r="0"/>`;
  const lantern = x => `<rect x="${x - 50}" y="380" width="100" height="160" fill="url(#glow)"/><line x1="${x}" y1="330" x2="${x}" y2="372" stroke="#1c1917" stroke-width="4"/><rect x="${x - 26}" y="372" width="52" height="10" rx="3" fill="#1c1917"/><ellipse cx="${x}" cy="440" rx="38" ry="58" fill="#d8402e"/><path d="M${x - 36} 420h72M${x - 38} 440h76M${x - 36} 460h72" stroke="#9e2a1c" stroke-width="2"/><rect x="${x - 26}" y="494" width="52" height="10" rx="3" fill="#1c1917"/><text x="${x}" y="452" text-anchor="middle" font-family="serif" font-weight="700" font-size="26" fill="#fff6e0">饂</text>`;
  s += lantern(360) + lantern(1240);
  s += `<rect x="310" y="700" width="120" height="80" fill="#6b4a2a"/><rect x="1170" y="700" width="120" height="80" fill="#6b4a2a"/><path d="M300 700h140l-10 -20h-120zM1160 700h140l-10 -20h-120z" fill="#7d5a32"/>`;
  return s + vignette(1600, 900, .5);
})());

// 店舗マップ（実際の地図ではなくイメージ図）
seed = 70; uid = 0;
save('map', 1000, 700, (() => {
  let s = `<rect width="1000" height="700" fill="#dfe8ea"/>`;
  for (let i = 0; i < 30; i++) { const y = rr(500, 700); s += `<path d="M${f(rr(0, 900))} ${f(y)} q20 -8 40 0 t40 0" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>`; }
  s += `<path d="M0 0 H1000 V330 C900 360 820 330 760 380 C700 430 640 420 560 470 C480 520 380 500 300 540 C220 580 120 560 0 600 Z" fill="#f4efe2" stroke="#c9bfa8" stroke-width="3"/>`;
  s += `<path d="M120 40 C200 160 260 260 300 540" stroke="#b9cdd8" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M40 520 L260 470 L520 300 L700 200 L940 90" stroke="#8d877c" stroke-width="5" fill="none" stroke-dasharray="18 10"/>`;
  s += `<path d="M300 520 L420 330 L560 230 L720 120" stroke="#c81432" stroke-width="5" fill="none" stroke-dasharray="18 10" opacity=".55"/>`;
  const pin = (x, y, name, main) => `<g><path d="M${x} ${y} c-22 -30 -26 -40 -26 -50 a26 26 0 0 1 52 0 c0 10 -4 20 -26 50z" fill="${main ? '#c81432' : '#44413c'}"/><circle cx="${x}" cy="${y - 50}" r="9" fill="#fbf7ef"/><rect x="${x + 22}" y="${y - 68}" width="${name.length * 22 + 20}" height="34" rx="4" fill="#fff" stroke="#e3ddd0"/><text x="${x + 32}" y="${y - 44}" font-family="serif" font-weight="700" font-size="20" fill="#1a1816">${name}</text></g>`;
  s += pin(250, 520, '湘南台本店', true) + pin(190, 455, '藤沢', false) + pin(150, 590, '辻堂', false) + pin(530, 310, '日吉', false) + pin(470, 380, '矢上', false) + pin(560, 235, '横浜西口', false).replace('横浜西口', '横浜西口') + pin(760, 175, '三田', false) + pin(800, 100, '信濃町', false);
  s += `<text x="40" y="660" font-family="serif" font-size="18" fill="#8d877c">相模湾</text><text x="760" y="640" font-family="serif" font-size="18" fill="#8d877c">東京湾</text><text x="640" y="40" font-family="serif" font-size="18" fill="#8d877c">東京都</text><text x="60" y="60" font-family="serif" font-size="18" fill="#8d877c">神奈川県</text>`;
  s += `<rect x="760" y="640" width="0" height="0"/><text x="980" y="690" text-anchor="end" font-family="serif" font-size="14" fill="#8d877c">※ 位置関係のイメージ図です</text>`;
  return s;
})());

// サービス用の図案カード（青海波の地紋 + 紋）
const emblem = (name, bg, fg, glyph) => {
  seed = 1; uid = 0;
  let pat = '';
  for (let y = 0; y < 13; y++) for (let x = 0; x < 13; x++) { const px = x * 50 + (y % 2 ? 25 : 0), py = y * 25; pat += `<circle cx="${px}" cy="${py + 25}" r="24" fill="${bg}" stroke="${fg}" stroke-width="1.5" opacity=".28"/><circle cx="${px}" cy="${py + 25}" r="14" fill="none" stroke="${fg}" stroke-width="1.5" opacity=".28"/>`; }
  save(name, 600, 600, `<rect width="600" height="600" fill="${bg}"/>${pat}<circle cx="300" cy="300" r="150" fill="${fg}"/><g fill="none" stroke="${bg}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>`);
};
emblem('svc-gift', '#c81432', '#fbf7ef', '<rect x="225" y="270" width="150" height="110" rx="6"/><path d="M210 270h180v-36h-180zM300 234v146M300 234c-50 -60 -90 -10 0 0c50 -60 90 -10 0 0"/>');
emblem('svc-app', '#3d4664', '#fbf7ef', '<rect x="245" y="205" width="110" height="190" rx="16"/><path d="M285 368h30M272 250h56M272 280h56M272 310h34"/>');
emblem('svc-takeout', '#a8743f', '#fbf7ef', '<path d="M232 262h136l-12 130h-112zM268 262v-22a32 32 0 0 1 64 0v22"/>');
emblem('svc-shop', '#44413c', '#fbf7ef', '<path d="M300 400c-56 -70 -72 -100 -72 -128a72 72 0 0 1 144 0c0 28 -16 58 -72 128z"/><circle cx="300" cy="270" r="26"/>');
emblem('svc-howto', '#6f8f4e', '#fbf7ef', '<path d="M222 290h156a78 78 0 0 1 -156 0zM250 250c0 -20 16 -20 16 -40M296 250c0 -20 16 -20 16 -40M342 250c0 -20 16 -20 16 -40"/>');
emblem('svc-pay', '#b8892b', '#fbf7ef', '<rect x="215" y="240" width="170" height="120" rx="12"/><path d="M215 278h170M240 328h44"/>');
