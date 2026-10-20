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
/* ---------- booking summary ---------- */
const form = $("#bk");
const fConcept = $("#f-concept");
function val(name){ const el = form.querySelector(`input[name="${name}"]:checked`); return el ? el.value : ""; }
function setRadio(name, v){ const el = form.querySelector(`input[name="${name}"][value="${v}"]`); if (el) el.checked = true; }
function people(){ const n = parseInt(val("people") || "1", 10); return isNaN(n) ? 1 : n; }
function total(){ const p = pById(val("pack")); return p ? p.price + Math.max(0, people()-1) * 300000 : 0; }
function updatePick(){
  const c = cById(fConcept.value), p = pById(val("pack")), n = people();
  $("#pick-name").textContent = c ? c.name : "Ý tưởng riêng";
  $("#pick-img").src = c ? c.thumb : L.concepts[0].thumb;
  $("#pick-meta").textContent = `${p ? p.name + " · " + p.time : ""} · ${n >= 4 ? "4 người trở lên" : n + " người"}`;
  $("#pick-total").textContent = `Tạm tính ${vnd(total())}${n >= 4 ? " trở lên" : ""}`;
}
form.addEventListener("change", updatePick);
$$("[data-pick]").forEach(a => a.addEventListener("click", () => { fConcept.value = a.dataset.pick; updatePick(); }));
$$("[data-pack]").forEach(a => a.addEventListener("click", () => { setRadio("pack", a.dataset.pack); updatePick(); }));
const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
$("#f-date").min = today.toISOString().slice(0,10);
updatePick();

function fmtDate(s){ if(!s) return ""; const [y,m,d] = s.split("-"); return `${d}/${m}/${y}`; }
function message(b){
  const c = cById(b.concept), p = pById(b.pack);
  return `Chào La studio, mình muốn đặt lịch chụp:\n- Họ tên: ${b.name}\n- SĐT/Zalo: ${b.phone}\n- Ngày: ${fmtDate(b.date)}, lúc ${b.slot}\n- Concept: ${c ? c.name : "Ý tưởng riêng"}\n- Gói: ${p ? p.name : ""} (${b.people === "4" ? "4 người trở lên" : b.people + " người"})\n- Tạm tính: ${vnd(b.total)}` + (b.note ? `\n- Ghi chú: ${b.note}` : "");
}

/* ---------- storage: shared db when the viewer provides it, this browser otherwise ---------- */
let dbP = null;
function getDb(){
  if (!dbP) dbP = (window.claude && window.claude.use) ? window.claude.use("db").catch(() => null) : Promise.resolve(null);
  return dbP;
}
const LS = "la-bookings";
function lsRead(){ try { return JSON.parse(localStorage.getItem(LS) || "[]"); } catch(e){ return []; } }
function lsWrite(a){ try { localStorage.setItem(LS, JSON.stringify(a)); } catch(e){} }

form.addEventListener("submit", async e => {
  e.preventDefault();
  const err = $("#f-err");
  const b = {
    name: $("#f-name").value.trim(), phone: $("#f-phone").value.trim(), date: $("#f-date").value,
    slot: val("slot"), concept: fConcept.value, pack: val("pack"), people: val("people"),
    note: $("#f-note").value.trim().slice(0, 600), status: "new", createdAt: Date.now()
  };
  b.total = total();
  const miss = [];
  if (!b.name) miss.push("họ tên");
  if (!/^[0-9 +().-]{8,15}$/.test(b.phone)) miss.push("số điện thoại hợp lệ");
  if (!b.date) miss.push("ngày chụp");
  if (miss.length){ err.textContent = "Bạn điền giúp " + miss.join(", ") + " nhé."; err.hidden = false; return; }
  err.hidden = true;
  const btn = $("#f-submit"); btn.disabled = true; btn.textContent = "Đang gửi…";
  let saved = false;
  try {
    const db = await getDb();
    if (db){ await db.collection("bookings").add(b); saved = true; }
  } catch(ex){ saved = false; }
  if (!saved){ const a = lsRead(); a.unshift(Object.assign({id: "l" + b.createdAt}, b)); lsWrite(a); renderLocal(); }
  btn.disabled = false; btn.textContent = "Gửi yêu cầu đặt lịch";
  $("#done-title").textContent = saved ? "Nhà La đã nhận yêu cầu" : "Gửi tin nhắn này để giữ lịch";
  $("#done-text").textContent = saved
    ? "Studio sẽ nhắn bạn qua Zalo để xác nhận. Muốn giữ lịch nhanh hơn, gửi luôn tin nhắn dưới đây cho studio."
    : `Yêu cầu chưa tới được studio từ trang này. Bạn sao chép tin nhắn và gửi qua Zalo ${L.phone} hoặc Messenger nhé.`;
  $("#done-msg").textContent = message(b);
  form.hidden = true; $("#done").hidden = false;
  $("#done").scrollIntoView({block:"start", behavior: reduce ? "auto" : "smooth"});
});
$("#again").addEventListener("click", () => { form.reset(); $("#f-date").min = today.toISOString().slice(0,10); updatePick(); $("#done").hidden = true; form.hidden = false; });

function copy(text, btn, label){
  const done = ok => { btn.textContent = ok ? "Đã sao chép" : "Chọn và sao chép thủ công"; setTimeout(() => btn.textContent = label, 2200); };
  try { navigator.clipboard.writeText(text).then(() => done(true), () => done(false)); } catch(e){ done(false); }
}
$("#copy-msg").addEventListener("click", e => copy($("#done-msg").textContent, e.currentTarget, "Sao chép tin nhắn"));
$("#copy-phone").addEventListener("click", e => copy(L.phone.replace(/ /g,""), e.currentTarget, "Sao chép số"));

/* ---------- admin ---------- */
const ST = {new:["Mới","st-new"], ok:["Đã xác nhận","st-ok"], done:["Đã chụp","st-done"], cancel:["Đã huỷ","st-cancel"]};
let rows = [], stFilter = "all", mode = "local", dbRef = null;
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
function renderAdmin(){
  const body = $("#adm-body");
  const list = rows.filter(r => stFilter === "all" || r.status === stFilter);
  const count = k => rows.filter(r => r.status === k).length;
  $("#adm-stats").innerHTML = `<span>${rows.length} yêu cầu</span><span>${count("new")} mới</span><span>${count("ok")} đã xác nhận</span>`;
  if (!list.length){
    body.innerHTML = `<tr><td colspan="7" class="adm-empty">${rows.length ? "Không có yêu cầu ở trạng thái này." : "Chưa có yêu cầu nào. Khi khách gửi form Đặt lịch, yêu cầu sẽ xuất hiện ở đây."}</td></tr>`;
    return;
  }
  body.innerHTML = list.map(r => {
    const c = cById(r.concept), p = pById(r.pack), when = new Date(r.createdAt || 0);
    const opts = Object.keys(ST).map(k => `<option value="${k}"${r.status===k?" selected":""}>${ST[k][0]}</option>`).join("");
    const st = ST[r.status] || ST.new;
    return `<tr><td>${when.toLocaleDateString("vi-VN")}<br><span class="muted">${when.toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})}</span></td>
<td><b>${esc(r.name)}</b><br>${esc(r.phone)}</td>
<td>${esc(fmtDate(r.date))}<br>${esc(r.slot)} · ${esc(r.people === "4" ? "4+" : r.people)} người</td>
<td>${esc(c ? c.name : "Ý tưởng riêng")}<br><span class="muted">${esc(p ? p.name : "")} · ${vnd(Number(r.total)||0)}</span></td>
<td>${esc(r.note || "")}</td>
<td><span class="st ${st[1]}">${st[0]}</span><br><label class="sr" for="s-${esc(r.id)}">Đổi trạng thái</label><select id="s-${esc(r.id)}" data-id="${esc(r.id)}" style="margin-top:8px">${opts}</select></td>
<td><button class="del" type="button" data-del="${esc(r.id)}">Xoá</button></td></tr>`;
  }).join("");
}
$("#adm-body").addEventListener("change", async e => {
  const s = e.target.closest("select[data-id]"); if (!s) return;
  const id = s.dataset.id;
  if (mode === "db"){ try { await dbRef.doc(id).update({status: s.value}); } catch(ex){ $("#adm-note").textContent = "Chưa lưu được trạng thái. Thử lại sau ít phút."; } }
  else { const a = lsRead(); const r = a.find(x => x.id === id); if (r){ r.status = s.value; lsWrite(a); renderLocal(); } }
});
let pendingDel = null;
$("#adm-body").addEventListener("click", async e => {
  const b = e.target.closest("[data-del]"); if (!b) return;
  const id = b.dataset.del;
  if (pendingDel !== id){ pendingDel = id; b.textContent = "Bấm lần nữa để xoá"; setTimeout(() => { if (pendingDel === id){ pendingDel = null; b.textContent = "Xoá"; } }, 3000); return; }
  pendingDel = null;
  if (mode === "db"){ try { await dbRef.doc(id).delete(); } catch(ex){} }
  else { lsWrite(lsRead().filter(x => x.id !== id)); renderLocal(); }
});
$$("#adm-filter .chip").forEach(c => c.addEventListener("click", () => {
  stFilter = c.dataset.s;
  $$("#adm-filter .chip").forEach(x => x.setAttribute("aria-pressed", x === c ? "true" : "false"));
  renderAdmin();
}));
function renderLocal(){ if (mode !== "local") return; rows = lsRead(); renderAdmin(); }
renderLocal();

(async function initAdmin(){
  const db = await getDb();
  if (!db){ $("#adm-note").textContent = "Bản xem thử: yêu cầu gửi từ trình duyệt này được lưu tại đây để bạn thử quy trình quản lý."; return; }
  let canSee = true;
  try {
    const user = await window.claude.use("user");
    if (user){ const ce = await user.canEdit(); canSee = !!(ce || await user.isOwner()); }
  } catch(e){}
  if (!canSee){
    $("#adm-note").textContent = "Khu vực dành cho chủ studio. Đăng nhập bằng tài khoản quản lý để xem yêu cầu đặt lịch.";
    $("#adm-body").innerHTML = `<tr><td colspan="7" class="adm-empty">Danh sách yêu cầu chỉ hiển thị cho chủ studio.</td></tr>`;
    $("#adm-stats").innerHTML = "";
    return;
  }
  mode = "db"; dbRef = db.collection("bookings");
  $("#adm-note").textContent = "Yêu cầu mới hiện ở đây ngay khi khách gửi. Đổi trạng thái sau khi đã nhắn xác nhận qua Zalo.";
  dbRef.orderBy("createdAt","desc").limit(500).onSnapshot(snap => {
    rows = snap.docs.map(d => Object.assign({}, d.data(), {id: d.id}));
    renderAdmin();
  }, () => { $("#adm-note").textContent = "Mất kết nối tới danh sách. Tải lại trang để xem yêu cầu mới."; });
})();


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
