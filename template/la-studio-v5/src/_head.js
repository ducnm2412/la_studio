(function(){
"use strict";
const L = window.LA;
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const vnd = n => n.toLocaleString("vi-VN").replace(/,/g,".") + "đ";
const cById = id => L.concepts.find(c => c.id === id);
const pById = id => L.packs.find(p => p.id === id);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- hero headline: words rise in turn ---------- */
$$(".words").forEach(h => {
  let i = 0;
  const wrap = node => {
    const frag = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach(w => {
      if (!w.trim()){ frag.appendChild(document.createTextNode(w)); return; }
      const s = document.createElement("span"); s.className = "w"; s.textContent = w; s.style.animationDelay = (i++ * 70) + "ms"; frag.appendChild(s);
    });
    node.replaceWith(frag);
  };
  h.setAttribute("aria-label", h.textContent);
  [...h.childNodes].forEach(n => n.nodeType === 3 ? wrap(n) : [...n.childNodes].forEach(c => c.nodeType === 3 && wrap(c)));
});

/* ---------- concept cards: filter + photos cycle on hover ---------- */
$$("#svc-chips .chip").forEach(c => c.addEventListener("click", () => {
  $$("#svc-chips .chip").forEach(x => x.setAttribute("aria-pressed", x === c ? "true" : "false"));
  $$(".card").forEach((card, i) => {
    const show = c.dataset.s === "all" || card.dataset.svc === c.dataset.s;
    card.hidden = !show;
    if (show && !reduce) card.animate([{opacity:0, transform:"translateY(20px)"},{opacity:1, transform:"none"}], {duration:450, delay:i*40, easing:"ease-out", fill:"backwards"});
  });
}));
$$(".card").forEach(card => {
  const imgs = $$(".card-imgs img", card), dots = $$(".card-dots i", card);
  let k = 0, t = null;
  const go = n => { imgs[k].classList.remove("on"); dots[k].classList.remove("on"); k = n % imgs.length; imgs[k].classList.add("on"); dots[k].classList.add("on"); };
  card.addEventListener("mouseenter", () => { if (reduce) return; go(k + 1); t = setInterval(() => go(k + 1), 1100); });
  card.addEventListener("mouseleave", () => { clearInterval(t); });
});

/* ---------- polaroid board: drag and shuffle ---------- */
const board = $("#board");
const pols = $$(".pol", board);
const LAYOUT = [[6,16,-8],[42,13,6],[24,30,-3],[58,34,9],[8,38,4]];
const LAYOUT_M = [[2,15,-8],[46,13,7],[20,28,-3],[50,40,8],[4,44,4]];
let zTop = 10;
function place(pol, x, y, r){ pol.style.left = x + "%"; pol.style.top = y + "%"; pol.style.rotate = r + "deg"; }
const small = () => innerWidth < 640;
pols.forEach((p, i) => { place(p, ...(small() ? LAYOUT_M : LAYOUT)[i]); p.style.zIndex = i + 1; });
$("#shuffle").addEventListener("click", () => {
  pols.forEach(p => { p.classList.add("move"); place(p, Math.random() * (small() ? 50 : 58), 12 + Math.random() * (small() ? 34 : 24), Math.round(Math.random() * 24 - 12)); p.style.zIndex = ++zTop; });
  setTimeout(() => pols.forEach(p => p.classList.remove("move")), 800);
});
pols.forEach(p => {
  let sx, sy, ox, oy, id = null;
  p.addEventListener("pointerdown", e => {
    id = e.pointerId; p.setPointerCapture(id); p.classList.add("drag"); p.style.zIndex = ++zTop;
    sx = e.clientX; sy = e.clientY; ox = p.offsetLeft; oy = p.offsetTop;
  });
  p.addEventListener("pointermove", e => {
    if (id !== e.pointerId) return;
    const bw = board.clientWidth, bh = board.clientHeight;
    const x = Math.max(-10, Math.min(bw - p.offsetWidth + 10, ox + e.clientX - sx));
    const y = Math.max(-10, Math.min(bh - p.offsetHeight + 10, oy + e.clientY - sy));
    p.style.left = (x / bw * 100) + "%"; p.style.top = (y / bh * 100) + "%";
    p.style.rotate = Math.max(-12, Math.min(12, (e.clientX - sx) * .05)) + "deg";
  });
  const end = e => { if (id !== e.pointerId) return; id = null; p.classList.remove("drag"); };
  p.addEventListener("pointerup", end); p.addEventListener("pointercancel", end);
});

/* ---------- gallery + lightbox ---------- */
const chipsG = $$("#g-chips .chip");
const mas = $("#masonry"), gMore = $("#g-more");
$$("#masonry button").forEach((b,i) => { if (i >= 15) b.classList.add("more"); });
function filterGallery(g){
  chipsG.forEach(c => c.setAttribute("aria-pressed", c.dataset.g === g ? "true" : "false"));
  $$("#masonry button").forEach(b => { b.hidden = !(g === "all" || b.dataset.g === g); });
  const all = g === "all";
  mas.classList.toggle("open", !all || mas.dataset.expanded === "1");
  gMore.hidden = !all || mas.dataset.expanded === "1";
}
gMore.addEventListener("click", () => { mas.dataset.expanded = "1"; mas.classList.add("open"); gMore.hidden = true; });
chipsG.forEach(c => c.addEventListener("click", () => filterGallery(c.dataset.g)));
const lb = $("#lb"), lbImg = $("#lb-img");
let lbList = [], lbIdx = 0;
function lbShow(i){
  lbIdx = (i + lbList.length) % lbList.length;
  const img = lbList[lbIdx];
  lbImg.src = img.src; lbImg.alt = img.alt;
  lbImg.classList.remove("swap"); void lbImg.offsetWidth; lbImg.classList.add("swap");
  $("#lb-count").textContent = (lbIdx + 1) + " / " + lbList.length;
}
function lbOpen(list, i){ lbList = list; lbShow(i); if (lb.showModal){ if (!lb.open) lb.showModal(); } else lb.setAttribute("open",""); }
mas.addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  const vis = $$("#masonry button").filter(x => !x.hidden && getComputedStyle(x).display !== "none");
  lbOpen(vis.map(x => x.querySelector("img")), vis.indexOf(b));
});
$("#lb-prev").addEventListener("click", () => lbShow(lbIdx - 1));
$("#lb-next").addEventListener("click", () => lbShow(lbIdx + 1));
lb.addEventListener("keydown", e => { if (e.key === "ArrowLeft") lbShow(lbIdx - 1); if (e.key === "ArrowRight") lbShow(lbIdx + 1); });
let tx = null;
lb.addEventListener("touchstart", e => { tx = e.touches[0].clientX; }, {passive:true});
lb.addEventListener("touchend", e => { if (tx === null) return; const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 40) lbShow(lbIdx + (d < 0 ? 1 : -1)); tx = null; });
$("#lb-close").addEventListener("click", () => lb.close ? lb.close() : lb.removeAttribute("open"));
lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
