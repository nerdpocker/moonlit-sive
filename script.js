// ==============================
// DOM helper and star field
// ==============================
const $ = id => document.getElementById(id);
for (let i = 0; i < 130; i++) {
    let s = document.createElement('i');
    let n = Math.random() * 2.5 + .7;
    Object.assign(s.style, {
        left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', width: n + 'px', height: n + 'px', opacity: Math.random() * .7 + .2, animationDelay: -Math.random() * 5 + 's'
    });
    $('dust').append(s);
}
document.addEventListener('pointermove', e => {
    document.documentElement.style.setProperty('--x', (e.clientX / innerWidth - .5) * 20 + 'px');
    document.documentElement.style.setProperty('--y', (e.clientY / innerHeight - .5) * 20 + 'px');
});
let visited = new Set();
function show(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === id));
    $('back').classList.toggle('hidden', id === 'opening' || id === 'hub');
    $('madeForYou').classList.toggle('hidden', id !== 'opening');
    if (!['opening', 'hub'].includes(id)) {
        visited.add(id);
        document.querySelector(`[data-go="${id}"]`)?.classList.add('done');
        $('progress').textContent = `${visited.size} / 5 stars explored`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => show(b.dataset.go));
$('back').onclick = () => show('hub');
let start = 0, raf = 0;
function tick(t) {
    let p = Math.min(1, (t - start) / 3000);
    $('ring').style.strokeDashoffset = 735.13 * (1 - p);
    $('holdText').textContent = p === 1 ? 'Welcome to our sky' : `Keep holding · ${Math.floor(p * 100)}%`;
    if (p === 1) {
        start = 0;
        $('moonWrap').classList.remove('holding');
        show('hub');
    }
    else
        raf = requestAnimationFrame(tick);
}
function begin() {
    if (start)
        return;
    start = performance.now();
    $('moonWrap').classList.add('holding');
    raf = requestAnimationFrame(tick);
}
function cancel() {
    if (!start)
        return;
    start = 0;
    cancelAnimationFrame(raf);
    $('moonWrap').classList.remove('holding');
    $('ring').style.strokeDashoffset = 735.13;
    $('holdText').textContent = 'Hold the moon to enter';
}
$('moon').onpointerdown = e => {
    $('moon').setPointerCapture(e.pointerId);
    begin();
};
$('moon').onpointerup = cancel;
$('moon').onpointercancel = cancel;
$('moon').onkeydown = e => {
    if ([' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
        begin();
    }
};
$('moon').onkeyup = cancel;
$('moon').onblur = cancel;
// ==============================
// Moments / edit photo captions here
// ==============================
const captions = [
    'Our first little memory', 'A random little moment', 'My favorite', 'Just us', 'A day to remember', 'Your sweetest smile', 'Somewhere together', 'Always my favorite person'
];
captions.forEach((c, i) => {
    let b = document.createElement('button');
    b.className = 'photo glass';
    b.style.setProperty('--tilt', (i % 2 ? 2 : -2) + 'deg');
    let img = document.createElement('img');
    img.src = `images/photo${i + 1}.jpg`;
    img.alt = `Photo ${i + 1}`;
    let s = document.createElement('span');
    s.textContent = c;
    b.append(img, s);
    b.onclick = () => {
        $('bigPhoto').src = img.src;
        $('bigCaption').textContent = c;
        $('modal').classList.add('open');
        $('close').focus();
    };
    $('gallery').append(b);
});
$('close').onclick = () => $('modal').classList.remove('open');
document.addEventListener('keydown', e => {
    if (e.key === 'Escape')
        $('close').click();
});
// ==============================
// Connect the Stars
// ==============================
const pts = [
    [50, 83], [17, 49], [19, 23], [36, 15], [50, 30], [64, 15], [81, 23], [83, 49], [50, 83]
];
let count = 0, drag = false;
const stars = [];
pts.slice(0, 8).forEach((p, i) => {
    let b = document.createElement('button');
    b.className = 'star';
    b.style.left = p[0] + '%';
    b.style.top = p[1] + '%';
    b.textContent = '✦';
    b.setAttribute('aria-label', 'Star ' + (i + 1));
    b.dataset.i = i;
    b.onclick = () => connect(i);
    $('board').append(b);
    stars.push(b);
});
function update() {
    stars.forEach((b, i) => {
        b.classList.toggle('lit', i < count);
        b.classList.toggle('next', count < 9 && i === count % 8);
    });
    $('lines').setAttribute('points', pts.slice(0, count).map(p => p.join(',')).join(' '));
    $('starMessage').textContent = count === 9 ? 'Every path leads me back to you. ♡' : `${count} / 9 stars connected`;
}
function connect(i) {
    if (count < 9 && i === count % 8) {
        count++;
        update();
    }
}
$('reset').onclick = () => {
    count = 0;
    update();
};
$('board').addEventListener('pointerdown', e => {
    if (e.target.classList.contains('star')) {
        drag = true;
        connect(+e.target.dataset.i);
    }
});
window.addEventListener('pointerup', () => {
    drag = false;
    $('trace').setAttribute('visibility', 'hidden');
});
window.addEventListener('pointercancel', () => {
    drag = false;
    $('trace').setAttribute('visibility', 'hidden');
});
$('board').addEventListener('pointermove', e => {
    if (!drag || !count || count === 9)
        return;
    let r = $('board').getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 100, y = (e.clientY - r.top) / r.height * 100;
    let p = pts[count - 1];
    Object.entries({
        x1: p[0], y1: p[1], x2: x, y2: y, visibility: 'visible'
    }).forEach(([k, v]) => $('trace').setAttribute(k, v));
    let n = pts[count];
    if (Math.hypot(n[0] - x, n[1] - y) < 6)
        connect(count % 8);
});
update();
// ==============================
// Words / crystal message
// ==============================
function setLetterOpen(open) {
    $('note').classList.toggle('open', open);
    $('letter').classList.toggle('letter-fullscreen', open);
    $('capsule').classList.toggle('open', open);
    $('capsule').setAttribute('aria-expanded', open);
    $('noteHint').textContent = open ? 'A piece of my heart' : 'Tap to open your letter';
    document.body.classList.toggle('letter-reading', open);
    if (open) {
        $('note').scrollTop = 0;
        $('closeLetter').focus({ preventScroll: true });
    } else {
        $('capsule').focus({ preventScroll: true });
    }
}
$('capsule').onclick = () => setLetterOpen(!$('note').classList.contains('open'));
$('closeLetter').onclick = () => setLetterOpen(false);
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('note').classList.contains('open')) {
        setLetterOpen(false);
    }
});
// ==============================
// Sound / edit Spotify track IDs here
// ==============================
const tracks = [{
        id: '1bYRmNYrXbzbLq1CEBZHRe', label: 'A Piece of You'
    }, {
        id: '7BqBn9nzAq8spo5e7cZ0dJ', label: 'Just The Way You Are'
    }, {
        id: '5y2ijHECwFYWqcAHKTZgzD', label: 'Risk It All'
    }];
function selectTrack(t) {
    $('player').src = 'https://open.spotify.com/embed/track/' + t.id + '?theme=0';
}
tracks.forEach(t => {
    let b = document.createElement('button');
    b.className = 'pill';
    b.textContent = t.label;
    b.onclick = () => selectTrack(t);
    $('songs').append(b);
});
selectTrack(tracks[0]);
// ==============================
// The Perfect Eclipse
// ==============================
const es = $('eclipseStage'), em = $('eclipseMoon');
let ex = 19, ey = 72, done = false, eclipseDrag = null;
const initialDistance = Math.hypot(31, 29);
function placeMoon(x, y) {
    if (done)
        return;
    ex = Math.max(0, Math.min(100, x));
    ey = Math.max(0, Math.min(100, y));
    let d = Math.hypot(ex - 50, ey - 43);
    if (d < 4) {
        done = true;
        ex = 50;
        ey = 43;
        es.classList.add('aligned');
        $('eclipseProgress').textContent = 'Perfect alignment · 100%';
        $('eclipseHint').textContent = 'Some things are simply meant to align.';
        $('eclipseMessage').hidden = false;
    }
    else {
        $('eclipseProgress').textContent = 'Celestial alignment · ' + Math.max(0, Math.min(99, Math.round(100 * (1 - d / initialDistance)))) + '%';
    }
    em.style.left = ex + '%';
    em.style.top = ey + '%';
}
em.addEventListener('pointerdown', e => {
    if (done)
        return;
    e.preventDefault();
    em.setPointerCapture(e.pointerId);
    let r = es.getBoundingClientRect();
    eclipseDrag = {
        id: e.pointerId, x: e.clientX, y: e.clientY, ex, ey, w: r.width, h: r.height
    };
});
em.addEventListener('pointermove', e => {
    if (eclipseDrag && eclipseDrag.id === e.pointerId)
        placeMoon(eclipseDrag.ex + (e.clientX - eclipseDrag.x) * 100 / eclipseDrag.w, eclipseDrag.ey + (e.clientY - eclipseDrag.y) * 100 / eclipseDrag.h);
});
for (const event of ['pointerup', 'pointercancel', 'lostpointercapture'])
    em.addEventListener(event, () => {
        eclipseDrag = null;
    });
em.addEventListener('keydown', e => {
    let v = {
        ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2]
    }[e.key];
    if (v) {
        e.preventDefault();
        placeMoon(ex + v[0], ey + v[1]);
    }
});
function resetEclipse() {
    done = false;
    eclipseDrag = null;
    es.classList.remove('aligned');
    $('eclipseMessage').hidden = true;
    $('eclipseHint').textContent = 'Drag the moon until it meets the sun.';
    placeMoon(19, 72);
}
$('eclipseReset').onclick = resetEclipse;
