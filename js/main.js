// 豊史製麺 — ライブラリなしの素の JavaScript だけで動かす

// 1. スクロールでふわっと出す
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  io.observe(el);
});

// 2. 横スクロールのスライダー（前へ・次へ）
document.querySelectorAll('[data-slider]').forEach((slider) => {
  const track = slider.querySelector('.slider__track');
  const prev = slider.querySelector('.slider__btn--prev');
  const next = slider.querySelector('.slider__btn--next');
  const step = () => (track.firstElementChild?.getBoundingClientRect().width || 300) + 12;
  const update = () => {
    prev.disabled = track.scrollLeft < 8;
    next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
});

// 3. ヒーローの一時停止
const hero = document.getElementById('hero');
const pause = hero?.querySelector('.hero__pause');
pause?.addEventListener('click', () => {
  const paused = hero.classList.toggle('paused');
  pause.setAttribute('aria-pressed', paused);
  pause.textContent = paused ? '再生' : '一時停止';
});

// 4. 「本日ご紹介する寝かせ番」— 日付で毎日入れ替える（架空の人物）
const CRAFTSMEN = [
  { rank: '二つ星寝かせ番', name: '須田　豊史', roman: 'Suda Toyofumi', shop: '豊史製麺 湘南台本店', word: '急がば、寝かせ' },
  { rank: '一つ星寝かせ番', name: '麦野　こはる', roman: 'Mugino Koharu', shop: '豊史製麺 日吉', word: '生地の声をきく' },
  { rank: '一つ星寝かせ番', name: '塩見　航', roman: 'Shiomi Wataru', shop: '豊史製麺 三田', word: '昨日の自分に、今日勝つ' },
  { rank: '三つ星寝かせ番', name: '粉川　千代', roman: 'Konakawa Chiyo', shop: '豊史製麺 辻堂', word: '待つのも、仕事' },
  { rank: '一つ星寝かせ番', name: '湯浅　大地', roman: 'Yuasa Daichi', shop: '豊史製麺 藤沢', word: 'ひと晩を、裏切らない' },
  { rank: '二つ星寝かせ番', name: '出汁本　薫', roman: 'Dashimoto Kaoru', shop: '豊史製麺 矢上', word: 'いつでも、もっちり' },
  { rank: '一つ星寝かせ番', name: '釜田　ひかり', roman: 'Kamata Hikari', shop: '豊史製麺 信濃町', word: '笑顔も、熟成中' },
];
const now = new Date();
const today = document.getElementById('today');
if (today) {
  const reiwa = now.getFullYear() - 2018;
  const tcy = (n) => `<span class="tcy">${n}</span>`; // 縦書きの中で数字を横に並べる
  today.innerHTML = `令和${tcy(reiwa)}年<br>${tcy(now.getMonth() + 1)}月<br>${tcy(now.getDate())}日`;
  const c = CRAFTSMEN[Math.floor(now.getTime() / 86400000) % CRAFTSMEN.length];
  for (const [id, key] of [['c-rank', 'rank'], ['c-name', 'name'], ['c-roman', 'roman'], ['c-shop', 'shop'], ['c-word', 'word']]) {
    document.getElementById(id).textContent = c[key];
  }
}

// 5. スマホのメニュー（ハンバーガー）
const burger = document.querySelector('.burger');
const drawer = document.getElementById('drawer');
const setDrawer = (open) => {
  // ヘッダーの下端から開く（ページ冒頭の課題表示が見えているときは、その分だけ下げる）
  drawer.style.top = `${document.getElementById('header').getBoundingClientRect().bottom}px`;
  drawer.hidden = !open;
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
};
burger?.addEventListener('click', () => setDrawer(drawer.hidden));
drawer?.addEventListener('click', (e) => { if (e.target.closest('a')) setDrawer(false); });

// 6. 動画モーダル
const modal = document.getElementById('modal');
document.querySelectorAll('[data-movie]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.getElementById('modal-img').src = btn.dataset.movie;
    modal.showModal();
  });
});
modal?.querySelector('.modal__close').addEventListener('click', () => modal.close());
modal?.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

// 7. 店舗一覧のエリア絞り込み
const filterBtns = document.querySelectorAll('[data-filter]');
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const area = btn.dataset.filter;
    filterBtns.forEach((b) => {
      b.classList.toggle('is-on', b === btn);
      b.setAttribute('aria-pressed', b === btn);
    });
    document.querySelectorAll('.shop[data-area]').forEach((shop) => {
      shop.hidden = area !== 'all' && shop.dataset.area !== area;
    });
  });
});

// 8. お問い合わせフォーム（課題用のため送信はしない。入力チェックと完了表示だけ）
const form = document.getElementById('contact-form');
if (form) {
  const error = document.getElementById('contact-error');
  const done = document.getElementById('contact-done');
  document.querySelectorAll('[data-subject]').forEach((a) => {
    a.addEventListener('click', () => { form.subject.value = a.dataset.subject; });
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = [...form.querySelectorAll('[required]')].filter((el) => !el.checkValidity());
    form.querySelectorAll('[required]').forEach((el) => el.setAttribute('aria-invalid', bad.includes(el)));
    if (bad.length) {
      const names = bad.map((el) => form.querySelector(`label[for="${el.id}"]`).firstChild.textContent.trim());
      error.textContent = `「${names.join('」「')}」を正しく入力してください。`;
      error.hidden = false;
      done.hidden = true;
      bad[0].focus();
      return;
    }
    error.hidden = true;
    done.hidden = false;
    form.reset();
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
    done.focus();
  });
}
