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

