// src/layout.html（共通のヘッダー・フッター）と src/pages/*.html（各ページの本文）を組み合わせて、
// ルートに公開用の HTML を書き出す。メニューや店舗の一覧は下のデータから作る。
// 使い方: node tools/build.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const layout = readFileSync(join(ROOT, 'src/layout.html'), 'utf8');
const yen = (n) => n.toLocaleString('ja-JP');

// ---------- メニュー（価格はすべて架空・税込） ----------
const MENU = {
  udon: [
    { img: 'kake', name: 'かけうどん', note: 'ひと晩寝かせた麺の甘みを、いちばん素直に。', sizes: [['並', 340], ['大', 470], ['得', 600]] },
    { img: 'bukkake', name: 'ぶっかけうどん', note: '冷たい麺に濃いめのだしをかけて。コシが際立つ。', sizes: [['並', 380], ['大', 510], ['得', 640]], tag: '人気' },
    { img: 'kamaage', name: '釜揚げうどん', note: '茹でたてを桶のまま。つけだしでどうぞ。', sizes: [['並', 340], ['大', 470], ['得', 600]] },
    { img: 'zaru', name: 'ざるうどん', note: '冷水でしめた、つるりとした喉ごし。', sizes: [['並', 380], ['大', 510]] },
    { img: 'niku', name: '肉玉熟成うどん', note: '甘辛い牛肉と月見たまご。', sizes: [['並', 690], ['大', 820]], tag: '期間限定' },
    { img: 'kamo', name: '鴨ねぎ南蛮うどん', note: '焼きねぎが香る、冬のごちそう。', sizes: [['並', 790], ['大', 920]], tag: '期間限定' },
    { img: 'curry', name: 'ふた晩カレーうどん', note: 'ルウもひと晩寝かせた、二日目の味。', sizes: [['並', 650], ['大', 780]] },
    { img: 'kitsune', name: 'きつねうどん', note: 'だしを含んだ、ふっくら甘いお揚げ。', sizes: [['並', 480], ['大', 610]] },
    { img: 'wakame', name: 'わかめうどん', note: '三陸のわかめを、たっぷりと。', sizes: [['並', 520], ['大', 650]] },
  ],
  tempura: [
    { img: 'ten-kashiwa', name: 'かしわ天', note: '鶏むね肉を、しっとり揚げて。', price: 170, tag: '人気' },
    { img: 'ten-ebi', name: 'えび天', note: 'ぷりっと太い、まっすぐな海老。', price: 190 },
    { img: 'ten-kakiage', name: '野菜かき揚げ', note: '玉ねぎと人参の甘さ。', price: 160 },
    { img: 'ten-imo', name: 'さつまいも天', note: 'ほくほくの、厚切り。', price: 150 },
    { img: 'ten-chikuwa', name: 'ちくわ磯辺天', note: '青のりの香る定番。', price: 130 },
    { img: 'ten-tamago', name: '半熟玉子天', note: '割ると、とろり。', price: 140 },
  ],
  gohan: [
    { img: 'onigiri', name: 'おむすび（鮭・梅）', note: '国産米をふっくら炊いて。', price: 150 },
    { img: 'inari', name: 'いなり（2個）', note: 'きつねうどんと同じ、甘いお揚げ。', price: 220 },
    { img: 'gohan', name: 'おむすびセット', note: 'おむすび2個と、季節の小鉢。', price: 380 },
  ],
  bento: [
    { img: 'bento', name: '熟成うどん弁当', note: 'うどんとかき揚げ、えび天、玉子焼き。', price: 390, tag: 'お持ち帰り' },
    { img: 'tempura', name: '天ぷら盛り合わせ弁当', note: '人気の天ぷら4種と、ぶっかけうどん。', price: 590 },
  ],
};
const card = (m) => `
      <li class="item reveal">
        <div class="item__img"><img src="img/${m.img}.svg" alt="${m.name}のイラスト" loading="lazy">${m.tag ? `<span class="item__tag">${m.tag}</span>` : ''}</div>
        <h4 class="item__name">${m.name}</h4>
        <p class="item__note">${m.note}</p>
        <p class="item__price">${m.sizes ? m.sizes.map(([s, p]) => `<span><small>${s}</small>${yen(p)}<small>円</small></span>`).join('') : `<span>${yen(m.price)}<small>円</small></span>`}</p>
      </li>`;

// ---------- 店舗（住所・電話はすべて架空） ----------
const SHOPS = [
  { area: 'kanagawa', name: '湘南台本店', addr: '神奈川県藤沢市湘南台0-0-0', hours: '10:30〜22:00', seats: 48, takeout: true, parking: true, main: true },
  { area: 'kanagawa', name: '藤沢', addr: '神奈川県藤沢市藤沢0-0-0', hours: '11:00〜22:00', seats: 36, takeout: true, parking: false },
  { area: 'kanagawa', name: '辻堂', addr: '神奈川県藤沢市辻堂0-0-0', hours: '11:00〜21:30', seats: 40, takeout: true, parking: true, isNew: true },
  { area: 'kanagawa', name: '日吉', addr: '神奈川県横浜市港北区日吉0-0-0', hours: '10:30〜22:00', seats: 42, takeout: true, parking: false, isNew: true },
  { area: 'kanagawa', name: '矢上', addr: '神奈川県横浜市港北区日吉0-0-0', hours: '11:00〜21:00', seats: 28, takeout: false, parking: false },
  { area: 'kanagawa', name: '横浜西口', addr: '神奈川県横浜市西区南幸0-0-0', hours: '10:30〜23:00', seats: 56, takeout: true, parking: false },
  { area: 'tokyo', name: '三田', addr: '東京都港区三田0-0-0', hours: '10:30〜22:00', seats: 38, takeout: true, parking: false, isNew: true },
  { area: 'tokyo', name: '信濃町', addr: '東京都新宿区信濃町0-0-0', hours: '11:00〜21:00', seats: 30, takeout: true, parking: false },
];
const shopList = SHOPS.map((s) => `
      <li class="shop reveal" data-area="${s.area}">
        <div class="shop__head"><h3>豊史製麺 ${s.name}</h3>${s.main ? '<span class="tag tag--fill">本店</span>' : ''}${s.isNew ? '<span class="tag">NEW</span>' : ''}</div>
        <dl>
          <dt>住所</dt><dd>${s.addr}</dd>
          <dt>営業時間</dt><dd>${s.hours}（L.O. 閉店30分前）</dd>
          <dt>席数</dt><dd>${s.seats}席</dd>
        </dl>
        <ul class="shop__icons">
          <li class="${s.takeout ? 'on' : ''}">お持ち帰り</li><li class="on">キャッシュレス</li><li class="${s.parking ? 'on' : ''}">駐車場</li>
        </ul>
      </li>`).join('');

// ---------- 寝かせ番（架空の人物。js/main.js の「本日ご紹介する」と同じ顔ぶれ） ----------
const CRAFT = [
  ['三つ星', '粉川　千代', '辻堂', '待つのも、仕事', '熟成庫の温度を0.5℃単位で見てきた、最古参。'],
  ['二つ星', '須田　豊史', '湘南台本店', '急がば、寝かせ', '創業者。毎晩いちばん最後に熟成庫の扉を閉める。'],
  ['二つ星', '出汁本　薫', '矢上', 'いつでも、もっちり', 'だしの担当も兼ねる、二刀流。'],
  ['一つ星', '麦野　こはる', '日吉', '生地の声をきく', '手のひらで生地の張りを確かめる名人。'],
  ['一つ星', '塩見　航', '三田', '昨日の自分に、今日勝つ', '塩水の濃さを、季節ごとに書き留める。'],
  ['一つ星', '湯浅　大地', '藤沢', 'ひと晩を、裏切らない', '茹で時間の秒数に、いちばんうるさい。'],
];
const craftList = CRAFT.map(([rank, name, shop, word, desc]) => `
      <li class="person reveal">
        <div class="person__avatar" aria-hidden="true"><svg viewBox="0 0 120 120"><use href="#ic-person"/></svg></div>
        <p class="person__rank"><span class="star">${'★'.repeat(rank === '三つ星' ? 3 : rank === '二つ星' ? 2 : 1)}</span>${rank}寝かせ番</p>
        <h3 class="person__name">${name}</h3>
        <p class="person__shop">豊史製麺 ${shop}</p>
        <p class="person__word">「${word}」</p>
        <p class="person__desc">${desc}</p>
      </li>`).join('');

const PARTS = {
  'menu:udon': MENU.udon.map(card).join(''),
  'menu:tempura': MENU.tempura.map(card).join(''),
  'menu:gohan': MENU.gohan.map(card).join(''),
  'menu:bento': MENU.bento.map(card).join(''),
  shops: shopList,
  craft: craftList,
};

for (const file of readdirSync(join(ROOT, 'src/pages')).filter((f) => f.endsWith('.html'))) {
  let src = readFileSync(join(ROOT, 'src/pages', file), 'utf8');
  const meta = JSON.parse(src.match(/^<!--meta (.*?) -->/)[1]);
  src = src.replace(/^<!--meta .*? -->\n/, '');
  const crumb = meta.crumb ? `<a href="./">トップ</a><span aria-hidden="true">／</span><span aria-current="page">${meta.crumb}</span>` : '<span>トップ</span>';
  let html = layout
    .replace('{{content}}', () => src)
    .replaceAll('{{title}}', meta.title)
    .replaceAll('{{desc}}', meta.desc)
    .replaceAll('{{nav}}', meta.nav)
    .replaceAll('{{logoTag}}', meta.nav === 'top' ? 'h1' : 'div')
    .replace('{{crumb}}', crumb)
    .replace(/\{\{cur:(\w+)\}\}/g, (_, k) => (k === meta.nav ? ' aria-current="page"' : ''))
    .replace(/\{\{part:([\w:]+)\}\}/g, (_, k) => PARTS[k] ?? `<!-- unknown part ${k} -->`);
  if (/\{\{/.test(html)) throw new Error(`${file}: 置き換えていない {{ }} が残っています`);
  writeFileSync(join(ROOT, file), html);
  console.log('built', file);
}
