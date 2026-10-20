
/* ---------- concept detail dialog ---------- */
const dlg = $("#dlg");
function openDetail(id){
  const c = cById(id); if (!c) return;
  $("#dlg-kind").textContent = c.kind; $("#dlg-name").textContent = c.name; $("#dlg-desc").textContent = c.desc;
  $("#dlg-fit").textContent = c.fit; $("#dlg-has").textContent = c.has; $("#dlg-pack").textContent = c.pack;
  $("#dlg-pick").dataset.pick = c.id;
  $("#dlg-photos").innerHTML = c.pics.map((src, i) => `<button type="button" aria-label="Phóng to ảnh ${i+1}"><img src="${src}" alt="${c.name}, ảnh ${i+1}"></button>`).join("");
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open","");
}
$$("[data-detail]").forEach(b => b.addEventListener("click", () => openDetail(b.dataset.detail)));
$$("[data-detail-img]").forEach(b => b.addEventListener("click", () => openDetail(b.dataset.detailImg)));
$("#dlg-x").addEventListener("click", () => dlg.close());
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
$("#dlg-photos").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  const list = $$("#dlg-photos button");
  dlg.close(); lbOpen(list.map(x => x.querySelector("img")), list.indexOf(b));
});

/* ---------- booking wizard ---------- */
const steps = $$(".step", form), stepTabs = $$(".steps li", form);
let cur = 1;
function showStep(n, focus){
  cur = n;
  steps.forEach(s => { const on = +s.dataset.step === n; s.hidden = !on; if (on && !reduce){ s.classList.remove("in"); void s.offsetWidth; s.classList.add("in"); } });
  stepTabs.forEach(t => { const k = +t.dataset.st; t.classList.toggle("on", k === n); t.classList.toggle("done", k < n); });
  if (focus){ const f = $(`.step[data-step="${n}"] input:not([type=radio]), .step[data-step="${n}"] input`, form); if (f) f.focus({preventScroll:true}); }
}
$$("[data-go]", form).forEach(b => b.addEventListener("click", () => {
  const n = +b.dataset.go;
  if (n === 3 && !$("#f-date").value){ $("#f-err2").hidden = false; $("#f-date").focus(); return; }
  $("#f-err2").hidden = true;
  showStep(n, true);
}));
$("#f-date").addEventListener("change", () => { if ($("#f-date").value) $("#f-err2").hidden = true; });
form.addEventListener("change", e => { if (e.target.name === "cpick"){ fConcept.value = e.target.value; updatePick(); } });
function syncPick(){
  const r = $(`input[name="cpick"][value="${fConcept.value}"]`, form); if (r) r.checked = true;
  $("#bb-img").src = $("#pick-img").src;
  $("#bb-name").textContent = $("#pick-name").textContent;
  const p = pById(val("pack"));
  $("#bb-total").textContent = (p ? p.name + " · " : "") + $("#pick-total").textContent.replace("Tạm tính ", "");
}
new MutationObserver(syncPick).observe($("#pick-total"), {childList:true, characterData:true, subtree:true});
new MutationObserver(syncPick).observe($("#pick-name"), {childList:true, characterData:true, subtree:true});
syncPick();
document.addEventListener("click", e => {
  const pick = e.target.closest("[data-pick], #dlg-pick, [data-quiz-pick]");
  if (pick){
    const id = pick.dataset.pick || pick.dataset.quizPick;
    if (id){ fConcept.value = id; updatePick(); }
    if (dlg.open) dlg.close();
    showStep(2); return;
  }
  if (e.target.closest("[data-pack]")) showStep(1);
});
$("#again").addEventListener("click", () => { showStep(1); syncPick(); });

/* ---------- quiz ---------- */
const quiz = $("#quiz");
let score = {}, qi = 0;
function renderQ(){
  const q = L.quiz[qi];
  quiz.innerHTML = `<p class="q-step"><span class="q-dots">${L.quiz.map((_, i) => `<i class="${i <= qi ? "on" : ""}"></i>`).join("")}</span> Câu ${qi+1} / ${L.quiz.length}</p>
  <p class="q-title q-anim">${q.q}</p>
  <div class="q-opts q-anim">${q.o.map((o, j) => `<button class="q-opt" type="button" data-o="${j}"><img src="${o.img}" alt="">${o.t}</button>`).join("")}</div>`;
}
function renderResult(){
  const best = Object.keys(score).sort((a, b) => score[b] - score[a])[0] || "doi-muoi";
  const c = cById(best);
  quiz.innerHTML = `<p class="q-step"><span class="q-dots">${L.quiz.map(() => `<i class="on"></i>`).join("")}</span> Kết quả</p>
  <div class="q-res q-anim"><img src="${c.pics[0]}" alt="${c.name}"><div style="display:grid;gap:8px"><p>Concept dành cho bạn là</p><p class="q-title">${c.name}</p><p>${c.desc}</p></div></div>
  <div class="cta-row q-anim"><a class="btn btn-pink" href="#dat-lich" data-quiz-pick="${c.id}">Đặt concept này</a><button class="btn btn-ghost" type="button" data-quiz-detail="${c.id}">Xem chi tiết</button><button class="btn btn-ghost btn-sm" type="button" data-quiz-again>Làm lại</button></div>`;
  const r = quiz.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + 80, 60);
}
quiz.addEventListener("click", e => {
  const o = e.target.closest(".q-opt");
  if (o){
    L.quiz[qi].o[+o.dataset.o].c.forEach((id, k) => { score[id] = (score[id] || 0) + (k === 0 ? 2 : 1); });
    o.style.background = "var(--pink-soft)";
    setTimeout(() => { qi++; qi < L.quiz.length ? renderQ() : renderResult(); }, reduce ? 0 : 240);
    return;
  }
  const d = e.target.closest("[data-quiz-detail]");
  if (d){ openDetail(d.dataset.quizDetail); return; }
  if (e.target.closest("[data-quiz-again]")){ score = {}; qi = 0; renderQ(); }
});

/* ---------- summary bump ---------- */
const ticket = $("#ticket");
const bump = () => { if (reduce) return; ticket.classList.remove("bump"); void ticket.offsetWidth; ticket.classList.add("bump"); };
form.addEventListener("change", bump);

/* ---------- confetti ---------- */
const cv = $("#confetti"), cx = cv.getContext("2d");
let parts = [], running = false;
const COLORS = ["#FF5FA2","#3D6BFF","#FFE27A","#FFB3D1","#B9D0FF"];
function burst(x, y, n){
  if (reduce) return;
  cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio;
  for (let i = 0; i < n; i++){
    const a = Math.random() * Math.PI * 2, v = 3 + Math.random() * 8;
    parts.push({x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 5, r: 4 + Math.random() * 5, c: COLORS[i % COLORS.length], rot: Math.random() * 6, vr: Math.random() * .3 - .15, life: 0, sq: Math.random() > .5});
  }
  if (!running){ running = true; requestAnimationFrame(tick); }
}
function tick(){
  const d = devicePixelRatio;
  cx.clearRect(0, 0, cv.width, cv.height);
  parts.forEach(p => {
    p.vy += .28; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
    cx.save(); cx.translate(p.x * d, p.y * d); cx.rotate(p.rot); cx.fillStyle = p.c;
    if (p.sq) cx.fillRect(-p.r * d / 2, -p.r * d / 4, p.r * d, p.r * d / 2); else { cx.beginPath(); cx.arc(0, 0, p.r * d / 2, 0, 7); cx.fill(); }
    cx.restore();
  });
  parts = parts.filter(p => p.y < innerHeight + 40 && p.life < 220);
  if (parts.length) requestAnimationFrame(tick); else { running = false; cx.clearRect(0, 0, cv.width, cv.height); }
}
new MutationObserver(() => { if (!$("#done").hidden) burst(innerWidth / 2, innerHeight * .35, 130); }).observe($("#done"), {attributes:true, attributeFilter:["hidden"]});

/* ---------- nav shadow + booking bar visibility ---------- */
const nav = $("#nav"), bbar = $("#bbar"), book = $("#dat-lich");
let bookIn = false;
function onScroll(){
  nav.classList.toggle("scrolled", scrollY > 10);
  bbar.classList.toggle("off", scrollY < innerHeight * .6 || bookIn);
}
if ("IntersectionObserver" in window) new IntersectionObserver(es => { bookIn = es[0].isIntersecting; onScroll(); }, {rootMargin: "-20% 0px -20% 0px"}).observe(book);
addEventListener("scroll", onScroll, {passive:true}); onScroll();

/* ---------- reveal ---------- */
if (!reduce && "IntersectionObserver" in window){
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, sib = $$(".rv", el.parentElement), i = Math.max(0, sib.indexOf(el));
    el.style.transitionDelay = (Math.min(i, 5) * 80) + "ms";
    el.classList.remove("pre"); io.unobserve(el);
  }), {rootMargin: "0px 0px -8% 0px"});
  $$(".rv").forEach(el => { if (el.getBoundingClientRect().top > innerHeight * 0.95){ el.classList.add("pre"); io.observe(el); } });
}

/* ---------- ripple ---------- */
document.addEventListener("pointerdown", e => {
  const b = e.target.closest(".btn"); if (!b || reduce) return;
  const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
  const d = document.createElement("span");
  d.className = "ripple"; d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s/2}px;top:${e.clientY - r.top - s/2}px`;
  b.appendChild(d); setTimeout(() => d.remove(), 650);
});
})();
