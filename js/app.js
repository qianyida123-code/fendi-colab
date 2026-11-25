/* ==========================================================================
   FENDI — CROISSANT CO-LAB
   Interaction layer
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Data ---------- */

  // NOTE ON PREVIEW ACCURACY
  // The five product shots are finished photographs; they cannot be
  // re-rendered in the browser.  The preview therefore reacts in two
  // approximated ways, both driven from the same selection state:
  //   1. Material -> swaps to the shot whose surface reads closest
  //      (basket weave, scales, satin, ...) and adds a tonal filter.
  //   2. Hardware -> shifts the overall metal cast of the shot.
  // It is a visual approximation of the chosen configuration, not a
  // true material/hardware render.

  // Body colours — each maps to a rendered preview
  const BODIES = [
    { id: 'black',  name: 'Black',   code: 'CR-001', img: 'assets/bag-hero.png',   preview: 'assets/bag-hero.png' },
    { id: 'butter', name: 'Butter',  code: 'CR-002', img: 'assets/bag-butter.png', preview: 'assets/bag-butter.png' },
    { id: 'cacao',  name: 'Cacao',   code: 'CR-003', img: 'assets/bag-cocoa.png',  preview: 'assets/bag-cocoa.png' },
    { id: 'ivory',  name: 'Ivory',   code: 'CR-004', img: 'assets/bag-silk.png',   preview: 'assets/bag-silk.png' }
  ];

  // Materials — swatch image = real macro texture.
  // `shot` picks the product photo whose surface reads closest to the material;
  // `filter` tints that shot so the choice is legible at a glance.
  // sat / con / bri grade the surface; `shot` is the photo whose texture
  // reads closest to that material.
  // `body` is the colour that photograph actually shows.  When a material
  // is chosen the preview follows the material's own shot, so the body
  // readout is updated to match — the label never contradicts the image.
  const MATERIALS = [
    { id: 'calf',  name: 'Calfskin',  sub: 'Basket Weave',        code: 'MT-101', img: 'assets/mat-calf.jpg',
      shot: 'assets/bag-hero.png',   body: 'black',  sat: 1.02, con: 1.06, bri: 1 },
    { id: 'croc',  name: 'Crocodile', sub: 'Alligator Black',     code: 'MT-102', img: 'assets/mat-croc.jpg',
      shot: 'assets/bag-croc.png',    body: 'cacao',  sat: 1.14, con: 1.18, bri: .95 },
    { id: 'silk',  name: 'Silk',      sub: 'Duchess Satin Ivory', code: 'MT-103', img: 'assets/mat-silk.jpg',
      shot: 'assets/bag-silk.png',    body: 'ivory',  sat: .84,  con: .92,  bri: 1.16 },
    { id: 'suede', name: 'Suede',     sub: 'Velvet Cacao',        code: 'MT-104', img: 'assets/mat-suede.jpg',
      shot: 'assets/bag-cocoa.png',   body: 'cacao',  sat: .88,  con: .9,   bri: .97 },
    { id: 'brass', name: 'Brass',     sub: 'Brushed Antique',     code: 'MT-105', img: 'assets/mat-brass.jpg',
      shot: 'assets/bag-cocoa.png',   body: 'cacao',  sat: 1.06, con: 1.05, bri: 1.02 },
    { id: 'nappa', name: 'Nappa',     sub: 'Soft Grain Cream',    code: 'MT-106', img: 'assets/mat-nappa.jpg',
      shot: 'assets/bag-butter.png',  body: 'butter', sat: .68,  con: .95,  bri: 1.12 }
  ];

  // Hardware — rendered as metal chips (swatch img + tonal gradient).
  // `cast` tints the product shot so the metal finish reads on the bag.
  // tintR / tintS / tintH describe the metal cast applied over the material:
  // sepia gives the warm hue, saturate and hue-rotate tune it per finish.
  const HARDWARE = [
    { id: 'silver', name: 'Silver', sub: 'Brushed FF Clasp', code: 'HW-201',
      tint: 'linear-gradient(145deg,#F7F7F5 0%,#D8D8D4 26%,#A9A9A4 50%,#CFCFC9 68%,#8E8E89 100%)',
      tintR: .18, tintS: .5,  tintH: 0 },
    { id: 'gold',   name: 'Gold', sub: 'Antique FF Clasp', code: 'HW-202',
      tint: 'linear-gradient(145deg,#F6E7B4 0%,#E2C56C 24%,#C39B2C 50%,#E7D089 66%,#96731F 100%)',
      tintR: .46, tintS: 1.7, tintH: -12 },
    { id: 'ruth',   name: 'Ruthenium', sub: 'Matte Dark FF', code: 'HW-203',
      tint: 'linear-gradient(145deg,#6B6B68 0%,#3C3C3A 26%,#1C1C1B 52%,#4E4E4B 68%,#141413 100%)',
      tintR: .1,  tintS: .22, tintH: 0 }
  ];

  const GALLERY = [
    {
      no: '001', img: 'assets/bag-hero.png',
      title: 'The Midnight Basket',
      by: 'Elena R.', region: 'Milano',
      insp: 'Inspired by the weaving stalls of old Milano. Black calfskin gathered by hand, the crescent profile like a moon just risen.',
      tags: ['Calfskin', 'Black', 'FF Clasp']
    },
    {
      no: '002', img: 'assets/bag-silk.png',
      title: 'Ivory Duchesse',
      by: 'Chen Y.', region: 'Shanghai',
      insp: 'Duchess satin reinterprets the softness of the arc, light moving through the folds like an old letter creased shut.',
      tags: ['Silk Satin', 'Ivory', 'Chain']
    },
    {
      no: '003', img: 'assets/bag-croc.png',
      title: 'Nocturne Alligator',
      by: 'Marco V.', region: 'Roma',
      insp: 'Scales for the night walker. Matte alligator against the central strap keeps the structure legible even in low light.',
      tags: ['Alligator', 'Matte Black', 'Gold']
    },
    {
      no: '004', img: 'assets/bag-cocoa.png',
      title: 'Terra Cotta',
      by: 'Amélie D.', region: 'Paris',
      insp: 'Raw cacao woven by hand — a reprint of one early-summer afternoon in the studio.',
      tags: ['Suede', 'Cacao', 'Antique Brass']
    }
  ];

  // ---------- State ----------
  const state = {
    screen: 'cover',
    mode: 'customize',     // 'compete' | 'customize'
    drawer: null,          // 'body' | 'material' | 'hardware'
    pending: null,         // staged selection in drawer
    body: BODIES[0],
    material: MATERIALS[0],
    hardware: HARDWARE[0],
    galleryIndex: 0,
    voted: false,
    busy: false
  };

  // ---------- Co-lab meta ----------
  // Design numbers are issued in sequence; each submission takes the next one.
  let designCounter = 4;   // 001–003 are already in the gallery
  const EDITIONS = [
    { no: '01', delivery: '8–10 weeks', price: '€ 4,800' },
    { no: '02', delivery: '9–12 weeks', price: '€ 5,200' },
    { no: '03', delivery: '10–14 weeks', price: '€ 5,600' }
  ];
  const MODE_META = {
    compete:   { label: 'Design & Compete', note: 'Entered into the Community Edition vote.' },
    customize: { label: 'Customize',        note: 'Made to your specification, exclusively yours.' }
  };
  // Titles available to new submissions.  The first four belong to the
  // gallery entries (001–004), so new designs start from index 4.
  const GALLERY_TITLES = 4;
  const TITLES = [
    'The Midnight Basket', 'Ivory Duchesse', 'Nocturne Alligator', 'Terra Cotta',
    'Crescent Study', 'Half Light', 'Quiet Form', 'After Hours',
    'Meridian', 'Soft Geometry', 'Night Weave', 'The Long Arc'
  ];

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  /* ---------- Screen navigation ---------- */
  const SCREENS = {
    cover:   '#screen-cover',
    atelier: '#screen-atelier',
    review:  '#screen-review',
    confirm: '#screen-confirm',
    gallery: '#screen-gallery'
  };

  function go(name) {
    if (!SCREENS[name] || state.busy) return;
    closeDrawer(true);
    state.screen = name;
    $$('.screen').forEach(s => s.classList.remove('is-active'));
    $(SCREENS[name]).classList.add('is-active');

    // Tab bar only on the cover; every other screen has its own footer
    $('#tabbar').style.display = (name === 'cover') ? 'grid' : 'none';

    $$('.tabbar__item').forEach(t => t.classList.toggle('is-active', t.dataset.nav === name));
    $$('.cover__actions .btn-hair').forEach(b => b.classList.toggle('is-active', b.dataset.nav === name));

    const stage = $('.gallery__stage');
    if (stage) stage.scrollTop = 0;
  }

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-nav]');
    if (t) {
      e.preventDefault();
      // The two cover entries both open the atelier but carry a different mode
      if (t.dataset.mode) setMode(t.dataset.mode);
      go(t.dataset.nav);
    }
  });

  // ---------- Mode ----------
  function setMode(mode) {
    state.mode = (mode === 'compete') ? 'compete' : 'customize';
    const tag = $('#modeTag');
    if (tag) tag.textContent = MODE_META[state.mode].label;
  }

  /* ---------- Drawer ---------- */
  const drawer    = $('#drawer');
  const scrim     = $('#scrim');
  const drawerBody= $('#drawerBody');
  const drawerTitle = $('#drawerTitle');
  const drawerHint = $('#drawerHint');

  const GROUP_META = {
    body:     { title: 'Body',     hint: 'Select one', list: BODIES },
    material: { title: 'Material', hint: 'Select one', list: MATERIALS },
    hardware: { title: 'Hardware', hint: 'Select one', list: HARDWARE }
  };

  function currentId(group) {
    return group === 'body' ? state.body.id
         : group === 'material' ? state.material.id
         : state.hardware.id;
  }

  function openDrawer(group) {
    const meta = GROUP_META[group];
    if (!meta) return;
    state.drawer = group;
    state.pending = currentId(group);

    drawerTitle.textContent = meta.title;
    drawerHint.textContent = meta.hint;

    // Body / hardware use wide cards; material uses a 3-column swatch grid
    const wide = group !== 'material';
    drawerBody.innerHTML = '<div class="swatches' + (wide ? ' swatches--wide' : '') + '"></div>';
    const grid = $('.swatches', drawerBody);

    meta.list.forEach(item => {
      const sel = item.id === state.pending;
      const el = document.createElement('button');
      el.className = 'swatch' + (sel ? ' is-selected' : '');
      el.type = 'button';
      el.setAttribute('data-id', item.id);
      el.setAttribute('aria-pressed', sel ? 'true' : 'false');

      // Hardware renders as a pure metal chip — the base photo would drag every
      // finish back toward brass, so the tint gradient replaces it entirely.
      const visual = item.tint
        ? '<div class="swatch__frame swatch__frame--metal" style="background:' + item.tint + '"></div>'
        : '<div class="swatch__frame"><img class="swatch__img" src="' + item.img + '" alt=""></div>';

      el.innerHTML = visual +
        '<div class="swatch__meta">' +
          '<span class="swatch__name">' + item.name + '</span>' +
          '<span class="swatch__code">' + (item.code + (item.sub ? ' · ' + item.sub : '')) + '</span>' +
        '</div>';
      grid.appendChild(el);
    });

    // Mark the active tab
    $$('.atelier__tab').forEach(tab => tab.classList.toggle('is-active', tab.dataset.drawer === group));

    drawer.classList.add('is-open');
    scrim.classList.add('is-open');
  }

  function closeDrawer(immediate) {
    if (!state.drawer && !drawer.classList.contains('is-open')) return;
    state.drawer = null;
    state.pending = null;
    drawer.classList.remove('is-open');
    scrim.classList.remove('is-open');
    if (!immediate) {
      $$('.atelier__tab').forEach(tab => tab.classList.toggle('is-active', tab.dataset.drawer === 'body'));
    }
  }

  // Swatch selection: hairline metal ring, no checkmark
  drawerBody.addEventListener('click', e => {
    const sw = e.target.closest('.swatch');
    if (!sw || !state.drawer) return;
    state.pending = sw.dataset.id;
    $$('.swatch', drawerBody).forEach(s => {
      const on = s === sw;
      s.classList.toggle('is-selected', on);
      s.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  });

  // Commit the staged selection
  $('#drawerConfirm').addEventListener('click', function () {
    const group = state.drawer;
    if (!group || !state.pending) { closeDrawer(); return; }

    const meta = GROUP_META[group];
    const item = meta.list.filter(x => x.id === state.pending)[0];
    if (!item) { closeDrawer(); return; }

    if (group === 'body') {
      state.body = item;
      $('#specBody').textContent = item.name + ' Woven';
      $('#tabBody').textContent = item.name;
    } else if (group === 'material') {
      state.material = item;
      // The photograph that now represents this material carries its own
      // colour, so the body readout follows it to stay truthful.
      const match = BODIES.filter(b => b.id === item.body)[0];
      if (match) {
        state.body = match;
        $('#specBody').textContent = match.name + ' Woven';
        $('#tabBody').textContent = match.name;
      }
      $('#specMaterial').textContent = item.sub;
      $('#tabMaterial').textContent = item.name;
    } else {
      state.hardware = item;
      $('#specHardware').innerHTML = item.name + ' <small>' + item.sub + '</small>';
      $('#tabHardware').textContent = item.name;
    }
    applyPreview();
    closeDrawer();
  });

  scrim.addEventListener('click', () => closeDrawer());

  // Drag-to-dismiss on the handle
  (function () {
    const handle = $('#drawerHandle');
    let startY = 0, dragging = false;
    handle.addEventListener('pointerdown', e => {
      dragging = true; startY = e.clientY;
      drawer.style.transition = 'none';
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dy = Math.max(0, e.clientY - startY);
      drawer.style.transform = 'translateY(' + dy + 'px)';
    });
    const end = e => {
      if (!dragging) return;
      dragging = false;
      drawer.style.transition = '';
      drawer.style.transform = '';
      const dy = e.clientY - startY;
      if (dy > 70) closeDrawer();
    };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  })();

  // Tab bar of the configurator opens the drawer
  $$('.atelier__tab').forEach(tab => {
    tab.addEventListener('click', () => {
      if (state.drawer === tab.dataset.drawer && drawer.classList.contains('is-open')) {
        closeDrawer();
      } else {
        openDrawer(tab.dataset.drawer);
      }
    });
  });

  /* ---------- Preview ----------
     The preview reacts to all three selections.  Because the shots are
     photographs rather than renders, material swaps the photo and
     hardware only shifts the metal cast — an approximation by design.
  */
  function currentShot() {
    // A material's characteristic surface wins over the body colour,
    // but the body colour decides the photo when the material is neutral.
    const mat = state.material;
    if (mat && mat.shot) return mat.shot;
    return state.body.preview;
  }

  function applyPreview(opts) {
    const img = $('#atelierImg');
    const src = (opts && opts.src) || currentShot();
    const paint = () => {
      img.style.filter = 'drop-shadow(0 20px 28px rgba(17,17,17,.09)) ' + previewFilter();
    };

    if (img.getAttribute('src') === src) { paint(); return; }

    img.classList.add('is-swapping');
    setTimeout(() => {
      img.src = src;
      img.onload = () => { img.classList.remove('is-swapping'); paint(); };
      // safety net in case the image is already cached and onload never fires
      setTimeout(() => { img.classList.remove('is-swapping'); paint(); }, 600);
    }, 260);
  }

  /* ==========================================================================
     REVIEW → SUBMIT → CONFIRM
     ========================================================================== */

  const reviewImg = $('#reviewImg');
  const confirmImg = $('#confirmImg');

  // Material drives which product photo is shown; the body colour and the
  // hardware finish are applied as tonal filters on top of it.
  // Material and hardware each describe a tone, but CSS filters are applied
  // in sequence, so two independent filter strings would cancel each other
  // out.  The two are therefore merged into a single coherent grade:
  //   material  -> the surface (saturation / contrast / brightness)
  //   hardware  -> the metal cast (sepia / grayscale tint)
  // The hardware tint is applied last and slightly softened, so the metal
  // reads without erasing the material underneath.
  function previewFilter() {
    const mat = state.material || {};
    const hw = state.hardware || {};

    const sat = mat.sat !== undefined ? mat.sat : 1;
    const con = mat.con !== undefined ? mat.con : 1;
    const bri = mat.bri !== undefined ? mat.bri : 1;

    let f = 'saturate(' + sat + ') contrast(' + con + ') brightness(' + bri + ')';

    if (hw.tintR !== undefined) {
      f += ' sepia(' + hw.tintR + ') saturate(' + hw.tintS + ') hue-rotate(' + (hw.tintH || 0) + 'deg)';
    }
    return f;
  }

  function specSummary() {
    return {
      body: state.body.name + ' Woven',
      material: state.material.sub,
      hardware: state.hardware.name,
      hardwareSub: state.hardware.sub
    };
  }

  function fillReview() {
    const sp = specSummary();
    const edition = EDITIONS[(designCounter - 4) % EDITIONS.length] || EDITIONS[0];

    $('#reviewEdition').textContent = 'Edition No. ' + edition.no;
    $('#rvBody').textContent = sp.body;
    $('#rvMaterial').textContent = sp.material;
    $('#rvHardware').innerHTML = sp.hardware + ' <small>' + sp.hardwareSub + '</small>';
    $('#rvDelivery').textContent = edition.delivery;
    $('#rvPrice').textContent = edition.price;

    reviewImg.src = currentShot();
    reviewImg.style.filter = previewFilter();
  }

  // Continue from the atelier to the order sheet
  $('#toReview').addEventListener('click', function () {
    fillReview();
    go('review');
  });

  // Submit — hand the design over to the co-lab
  $('#submitDesign').addEventListener('click', function () {
    const no = String(designCounter).padStart(3, '0');
    // TITLES[0..3] are taken by the gallery entries, so a new design
    // starts from index 4 — use the pre-increment counter to pick it.
    const title = TITLES[
      GALLERY_TITLES + ((designCounter - 4) % (TITLES.length - GALLERY_TITLES))
    ];
    designCounter += 1;

    const sp = specSummary();

    $('#cfTitle').textContent = title;
    $('#cfNo').textContent = 'Design No. ' + no;
    $('#cfSpec').textContent =
      state.body.name + ' · ' + state.material.name + ' · ' + state.hardware.name;

    confirmImg.src = currentShot();
    confirmImg.style.filter = previewFilter();

    $('#saveHint').classList.remove('is-on');
    go('confirm');
  });

  /* ---------- Share poster ----------
     The on-screen card is exported through canvas so it can be saved
     as a real image file.  The drawing mirrors the DOM card 1:1.
  */
  $('#saveCard').addEventListener('click', function () {
    const W = 750, H = 1000;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');

    // paper ground
    ctx.fillStyle = '#F9F6F0';
    ctx.fillRect(0, 0, W, H);

    // inner keyline
    ctx.strokeStyle = '#D9D4CA';
    ctx.lineWidth = 1;
    ctx.strokeRect(28.5, 28.5, W - 57, H - 57);

    ctx.textAlign = 'center';

    // masthead
    ctx.fillStyle = '#111111';
    ctx.font = '400 34px "Playfair Display", Times New Roman, serif';
    ctx.fillText('FENDI', W / 2, 118);

    // gold rule
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(W / 2 - 18, 142, 36, 1);

    ctx.fillStyle = '#666666';
    ctx.font = '400 14px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText('C R O I S S A N T   C O - L A B', W / 2, 172);

    // the piece
    const img = new Image();
    const shot = currentShot();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const maxW = W - 150, maxH = 430;
      let w = maxW, h = (ih / iw) * maxW;
      if (h > maxH) { h = maxH; w = (iw / ih) * maxH; }
      ctx.save();
      ctx.filter = previewFilter();
      ctx.drawImage(img, (W - w) / 2, 205, w, h);
      ctx.restore();

      ctx.fillStyle = '#1C1C1C';
      ctx.font = 'italic 400 30px "Playfair Display", Times New Roman, serif';
      ctx.fillText($('#cfTitle').textContent, W / 2, 700);

      ctx.fillStyle = '#666666';
      ctx.font = '400 14px "Helvetica Neue", Arial, sans-serif';
      ctx.fillText($('#cfNo').textContent.toUpperCase(), W / 2, 736);

      ctx.fillStyle = '#9A9A9A';
      ctx.font = '400 13px "Helvetica Neue", Arial, sans-serif';
      ctx.fillText($('#cfSpec').textContent.toUpperCase(), W / 2, 764);

      // foot rule + edition
      ctx.fillStyle = '#D9D4CA';
      ctx.fillRect(W / 2 - 18, 800, 36, 1);

      ctx.fillStyle = '#9A9A9A';
      ctx.font = '400 12px "Helvetica Neue", Arial, sans-serif';
      ctx.fillText('VOLUME I — THE ATELIER EDITION', W / 2, 836);

      ctx.fillStyle = '#B99A45';
      ctx.font = '400 13px "Helvetica Neue", Arial, sans-serif';
      ctx.fillText('SCAN TO VOTE · CROISSANT CO-LAB', W / 2, 906);

      // export
      const a = document.createElement('a');
      a.download = 'fendi-croissant-colab.png';
      a.href = cv.toDataURL('image/png');
      a.click();

      const hint = $('#saveHint');
      hint.classList.add('is-on');
      setTimeout(() => hint.classList.remove('is-on'), 2600);
    };
    img.src = shot;
  });

  /* ---------- Gallery ---------- */
  const stage = $('#galleryStage');

  GALLERY.forEach((item, i) => {
    const plate = document.createElement('article');
    plate.className = 'plate' + (i === 0 ? ' is-active' : '');
    plate.innerHTML =
      '<div class="plate__frame">' +
        '<span class="plate__no">Design No.' + item.no + '</span>' +
        '<div class="plate__plate"><img class="plate__img" src="' + item.img + '" alt="' + item.title + '"></div>' +
        '<span class="plate__corner">Croissant Co-Lab</span>' +
      '</div>' +
      '<div class="plate__caption">' +
        '<h2>' + item.title + '</h2>' +
        '<p class="by">Design No.' + item.no + ' by <b>' + item.by + '</b> · ' + item.region + '</p>' +
        '<p class="insp">' + item.insp + '</p>' +
        '<div class="plate__tags">' +
          item.tags.map(t => '<span class="tag">' + t + '</span>').join('') +
        '</div>' +
      '</div>';
    stage.appendChild(plate);
  });

  const plates = $$('.plate', stage);
  const dotsEl = $('#galleryDots');
  GALLERY.forEach((_, i) => {
    const d = document.createElement('i');
    if (i === 0) d.className = 'is-active';
    dotsEl.appendChild(d);
  });
  const dots = $$('i', dotsEl);

  // Turn the page: `fromIdx` is the plate currently shown, `dir` is the direction
  function renderPlate(fromIdx, dir) {
    const total = GALLERY.length;
    const toIdx = (fromIdx + 1) % total;
    const from = plates[fromIdx];
    const to   = plates[toIdx];
    const d = dir > 0 ? 'is-exiting-left' : 'is-exiting-right';

    from.classList.remove('is-active');
    from.classList.add(d);
    to.classList.remove('is-exiting-left', 'is-exiting-right');
    to.classList.add('is-active');

    setTimeout(() => from.classList.remove(d), 850);

    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === toIdx));
    state.galleryIndex = toIdx;
  }

  /* ---------- Wax-seal voting ---------- */
  const sealBtn   = $('#sealBtn');
  const stamp     = $('#stamp');
  const stampFlash= $('#stampFlash');

  sealBtn.addEventListener('click', () => {
    if (state.busy) return;
    state.busy = true;

    sealBtn.classList.add('is-stamping');
    stamp.classList.remove('is-on');
    stampFlash.classList.remove('is-on');
    // force reflow so the animation restarts
    void stamp.offsetWidth;

    setTimeout(() => {
      stamp.classList.add('is-on');
      stampFlash.classList.add('is-on');
    }, 180);

    setTimeout(() => {
      sealBtn.classList.remove('is-stamping');
    }, 700);

    // Flip to the next design after the seal settles
    setTimeout(() => {
      renderPlate(state.galleryIndex, 1);
      state.busy = false;
    }, 900);

    setTimeout(() => {
      stamp.classList.remove('is-on');
      stampFlash.classList.remove('is-on');
    }, 1450);
  });

  /* ---------- Init ---------- */
  setMode('customize');
  applyPreview();
  go('cover');
})();
