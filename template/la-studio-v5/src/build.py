import json, html, pathlib, sys
H = html.escape
root = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root/'src'))
from data import PHONE, ZALO, FB, MESS, MAPS, CONCEPTS, PACKS, GALLERY, CNAME, im, wh, vnd
css = (root/'src/style.css').read_text()
js = (root/'src/app.js').read_text()
PRICE = {p["name"]: p["price"] for p in PACKS}
def k(n): return f"{n//1000:,}".replace(",", ".") + "k"

POLS = [(2,"đôi mươi"),(45,"bóng bay"),(22,"cây thông"),(38,"hoa cúc"),(53,"vườn rêu")]
TICK = [("Concept cá nhân",5),("Sinh nhật đôi mươi",45),("Cổ trang",30),("Chân dung",27),("Nghệ thuật",53),("Chủ đề riêng",22),("Chụp đôi",33)]
QUIZ = [
 dict(q="Bạn chụp ảnh để làm gì?", o=[("Mừng sinh nhật",2,["doi-muoi","bong-bay"]),("Đổi ảnh đại diện",27,["chan-dung","hoa-cuc"]),("Kỷ niệm với người thương",33,["thu-la"]),("Có bộ ảnh nghệ thuật",53,["vuon-reu","co-phong"])]),
 dict(q="Màu nào làm bạn mê nhất?", o=[("Đỏ rực",45,["bong-bay","blazer"]),("Xanh denim",4,["doi-muoi"]),("Trắng kem",23,["cay-thong","co-phong","chan-dung"]),("Xanh rêu",58,["vuon-reu","hoa-cuc"])]),
 dict(q="Vibe của bạn hôm nay?", o=[("Nghịch ngợm đáng yêu",55,["doi-muoi","bong-bay","cay-thong"]),("Dịu dàng mơ màng",37,["hoa-cuc","vuon-reu"]),("Cá tính sang chảnh",57,["blazer","chan-dung"]),("Cổ điển thanh lịch",31,["co-phong","thu-la"])]),
]
SVC = [("all","Tất cả"),("ca-nhan","Concept cá nhân"),("nghe-thuat","Nghệ thuật"),("co-trang","Cổ trang"),("chan-dung","Chân dung"),("chu-de","Chủ đề riêng")]

def tick():
    one="".join(f'<span>{H(t)} <img src="{im(n)}" alt="" loading="lazy"></span>' for t,n in TICK)
    return f'<div class="tick" aria-hidden="true"><div class="tick-in">{one}{one}</div></div>'

def cards():
    out=[]
    for c in CONCEPTS:
        imgs="".join(f'<img src="{im(p)}" alt="{H(c["name"])}, ảnh {i+1}"{" class=\"on\"" if i==0 else ""} loading="lazy">' for i,p in enumerate(c["pics"]))
        dots="".join(f'<i{" class=\"on\"" if i==0 else ""}></i>' for i,_ in enumerate(c["pics"]))
        out.append(f'''<article class="card rv" data-svc="{c["svc"]}">
  <div class="card-imgs" data-detail-img="{c["id"]}">{imgs}</div>
  <div class="card-dots" aria-hidden="true">{dots}</div>
  <span class="price-tag">từ {k(PRICE[c["pack"]])}</span>
  <div class="card-info"><h3>{H(c["name"])}</h3><p>{H(c["kind"])}</p>
  <div class="cta-row"><a class="btn btn-pink btn-sm" href="#dat-lich" data-pick="{c["id"]}">Đặt concept này</a><button class="btn btn-ghost btn-sm" type="button" data-detail="{c["id"]}">Chi tiết</button></div></div>
</article>''')
    return "\n".join(out)

def plans():
    out=[]
    for p in PACKS:
        li="".join(f'<li>{H(x)}</li>' for x in [p["time"], p["concepts"], "Trang phục: "+p["outfit"], p["mk"], "Ảnh chỉnh kỹ: "+p["edit"], p["raw"], ("Quà: "+p["gift"]) if p["gift"]!="—" else None] if x)
        star = p["id"]=="tho"
        out.append(f'<div class="plan{" star" if star else ""} rv">{"<span class=\"badge\">Được chọn nhiều</span>" if star else ""}<h3>{H(p["name"])}</h3><p class="plan-price">{vnd(p["price"])}<small>một người · {H(p["time"])}</small></p><ul>{li}</ul><a class="btn {"btn-pink" if star else "btn-ghost"}" href="#dat-lich" data-pack="{p["id"]}">Chọn {H(p["name"])}</a></div>')
    return "".join(out)

def gallery():
    chips='<button class="chip" aria-pressed="true" data-g="all">Tất cả</button>'+"".join(f'<button class="chip" aria-pressed="false" data-g="{c["id"]}">{H(c["name"])}</button>' for c in CONCEPTS)
    items="".join(f'<button data-g="{g}" aria-label="Phóng to ảnh {H(CNAME[g])}"><img src="{im(n)}" {wh(n)} alt="{H(CNAME[g])}" loading="lazy"></button>' for n,g in GALLERY)
    return chips, items

def options(name, values, checked):
    return "".join(f'<label><input type="radio" name="{name}" id="{name}-{v}" value="{v}"{" checked" if v==checked else ""}><span>{H(t)}</span></label>' for v,t in values)

chips, gitems = gallery()
data = dict(
  concepts=[dict(id=c["id"],name=c["name"],kind=c["kind"],desc=c["desc"],fit=c["fit"],has=c["has"],pack=c["pack"],svc=c["svc"],thumb=im(c["thumb"]),pics=[im(p) for p in c["pics"]]) for c in CONCEPTS],
  packs=[dict(id=p["id"],name=p["name"],price=p["price"],time=p["time"]) for p in PACKS],
  quiz=[dict(q=q["q"],o=[dict(t=t,img=im(n),c=cs) for t,n,cs in q["o"]]) for q in QUIZ],
  phone=PHONE, zalo=ZALO, mess=MESS)

page = f'''<title>La studio Xinh</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="La studio – tiệm ảnh nhà La ở TP.HCM. 9 concept dựng sẵn, trang phục và makeup trọn gói, từ 699k.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800&display=swap">
<style>{css}</style>
<script>document.documentElement.classList.add('js')</script>
<canvas id="confetti" aria-hidden="true"></canvas>

<header class="nav band" id="nav"><div class="wrap">
  <a class="brand" href="#top"><i aria-hidden="true">✦</i>La studio</a>
  <nav class="nav-links" aria-label="Chính"><a href="#concept">Concept</a><a href="#tim-concept">Tìm concept</a><a href="#bang-gia">Bảng giá</a><a href="#anh">Ảnh</a><a href="#lien-he">Liên hệ</a></nav>
  <a class="btn btn-pink btn-sm" href="#dat-lich">Đặt lịch</a>
</div></header>

<main id="top">
<section class="hero band"><div class="wrap">
  <div class="hero-copy">
    <h1 class="words">Đôi mươi phải có <span class="hl">bộ ảnh xịn</span></h1>
    <p class="lead">La studio có sẵn 9 concept dựng tay, trang phục và makeup trọn gói. Bạn chỉ việc đến, tạo dáng theo hướng dẫn và nhận ảnh gốc ngay trong ngày.</p>
    <div class="cta-row"><a class="btn btn-pink" href="#dat-lich">Đặt lịch chụp</a><a class="btn btn-ghost" href="#concept">Xem 9 concept</a></div>
    <p class="hero-facts"><span>Từ <b>699k</b> một buổi</span><span>Ảnh gốc <b>trong ngày</b></span><span>8:00–20:00 mỗi ngày</span></p>
  </div>
  <div class="collage" aria-label="Ảnh chụp tại La studio">
    <div class="cl cl-1"><img src="{im(2)}" alt="Concept Đôi mươi rực rỡ" fetchpriority="high"></div>
    <div class="cl cl-2"><img src="{im(45)}" alt="Concept Bóng bay đỏ"></div>
    <div class="cl cl-3"><img src="{im(53)}" alt="Concept Vườn rêu nàng thơ"></div>
    <div class="cl-tag"><img src="{im(39)}" alt=""><div><b>9 concept dựng sẵn</b><small>makeup + đồ có sẵn</small></div></div>
  </div>
</div></section>

{tick()}

<section class="sec band" id="concept"><div class="wrap">
  <div class="head"><div><h2 class="h2 rv">Chọn concept của bạn</h2><p class="lead rv">Rê chuột lên thẻ để xem thêm ảnh. Giá đã gồm makeup, trang phục và đạo cụ.</p></div></div>
  <div class="chips scroll" role="group" aria-label="Lọc theo kiểu chụp" id="svc-chips">{"".join(f'<button class="chip" aria-pressed="{"true" if s=="all" else "false"}" data-s="{s}">{H(t)}</button>' for s,t in SVC)}</div>
  <div class="cards" id="cards">{cards()}</div>
</div></section>

<div class="strip" aria-hidden="true">{"".join(f'<img src="{im(n)}" alt="" loading="lazy">' for n in (38,57,30,46,60))}</div>

<section class="sec band why"><div class="wrap">
  <div>
    <h2 class="h2 rv">Đến tay không, <span class="hl">về tay ảnh</span></h2>
    <div class="facts">
      <div class="fact rv"><b>9</b><h3>concept dựng sẵn</h3><p>Từ denim nghịch ngợm tới cổ phong thanh lịch.</p></div>
      <div class="fact rv"><b>100%</b><h3>makeup + tóc</h3><p>Có trong mọi gói, làm theo tạo hình concept.</p></div>
      <div class="fact rv"><b>0đ</b><h3>tiền thuê đồ</h3><p>Trang phục, đạo cụ có sẵn nhiều size.</p></div>
      <div class="fact rv"><b>24h</b><h3>có ảnh gốc</h3><p>Ảnh chỉnh kỹ gửi sau 5–7 ngày.</p></div>
    </div>
  </div>
  <div class="board rv" id="board">
    {"".join(f'<figure class="pol" data-i="{i}"><img src="{im(n)}" alt="Concept {H(c)}" draggable="false" loading="lazy"><figcaption>{H(c)}</figcaption></figure>' for i,(n,c) in enumerate(POLS))}
    <div class="board-hint"><button class="btn btn-ghost btn-sm" type="button" id="shuffle">Xáo ảnh</button><span>hoặc kéo thử từng tấm</span></div>
  </div>
</div></section>

<section class="quiz sec band" id="tim-concept"><div class="wrap">
  <div>
    <h2 class="h2 rv">Bạn hợp concept nào?</h2>
    <p class="lead rv" style="margin-top:16px">Trả lời 3 câu, nhà La gợi ý concept dành cho bạn.</p>
    <div class="quiz-photos" aria-hidden="true"><img src="{im(46)}" alt="" loading="lazy"><img src="{im(60)}" alt="" loading="lazy"><img src="{im(25)}" alt="" loading="lazy"></div>
  </div>
  <div class="quiz-card" id="quiz" aria-live="polite">
    <p class="q-step"><span class="q-dots"><i class="on"></i><i></i><i></i></span> Câu 1 / 3</p>
    <p class="q-title">Bạn chụp ảnh để làm gì?</p>
    <div class="q-opts">{"".join(f'<button class="q-opt" type="button" data-o="{j}"><img src="{im(n)}" alt="">{H(t)}</button>' for j,(t,n,cs) in enumerate(QUIZ[0]["o"]))}</div>
  </div>
</div></section>

<dialog class="lb dlg" id="dlg" aria-labelledby="dlg-name" style="max-width:min(1000px,94vw);background:var(--surface);color:var(--ink);border-radius:30px;padding:0">
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;padding:clamp(18px,3vw,32px);max-height:90vh;overflow:auto">
    <div id="dlg-photos" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;align-content:start"></div>
    <div style="display:grid;gap:16px;align-content:start"><span class="muted" id="dlg-kind" style="font-weight:600;color:var(--pink-d)"></span><h3 id="dlg-name" style="font-size:clamp(36px,4vw,56px)"></h3><p id="dlg-desc" class="muted"></p>
    <dl style="margin:0;display:grid;gap:10px"><div><dt style="font-weight:600">Hợp với</dt><dd class="muted" id="dlg-fit" style="margin:0"></dd></div><div><dt style="font-weight:600">Nhà La có sẵn</dt><dd class="muted" id="dlg-has" style="margin:0"></dd></div><div><dt style="font-weight:600">Gói gợi ý</dt><dd class="muted" id="dlg-pack" style="margin:0"></dd></div></dl>
    <div class="cta-row"><a class="btn btn-pink" href="#dat-lich" id="dlg-pick">Đặt concept này</a><button class="btn btn-ghost" type="button" id="dlg-x">Đóng</button></div></div>
  </div>
</dialog>

<section class="sec band" id="bang-gia"><div class="wrap">
  <div class="head"><div><h2 class="h2 rv">Bảng giá rõ ràng</h2><p class="lead rv">Không phát sinh phí phông nền, trang phục hay makeup.</p></div></div>
  <div class="plans">{plans()}</div>
  <div class="notes"><p class="rv"><b>Chụp đôi, chụp nhóm</b>Thêm 300k mỗi người, đã gồm makeup riêng.</p><p class="rv"><b>Giữ lịch</b>Cọc 30% sau khi studio xác nhận. Dời lịch miễn phí một lần nếu báo trước 24 giờ.</p><p class="rv"><b>Thêm ảnh chỉnh</b>50k mỗi ảnh, chọn từ ảnh gốc.</p></div>
</div></section>

<section class="sec band" id="anh" style="padding-top:0"><div class="wrap">
  <div class="head"><h2 class="h2 rv">Ảnh từ nhà La</h2></div>
  <div class="chips scroll" role="group" aria-label="Lọc ảnh theo concept" id="g-chips">{chips}</div>
  <div class="gallery" id="masonry">{gitems}</div>
  <div class="cta-row" style="justify-content:center;margin-top:24px"><button class="btn btn-ghost" type="button" id="g-more">Xem thêm ảnh</button></div>
  <dialog class="lb" id="lb" aria-label="Ảnh phóng to"><img id="lb-img" src="{im(2)}" alt=""><button class="btn btn-pink btn-sm lb-close" id="lb-close" type="button">Đóng</button><button class="lb-nav lb-prev" id="lb-prev" type="button" aria-label="Ảnh trước">‹</button><button class="lb-nav lb-next" id="lb-next" type="button" aria-label="Ảnh sau">›</button><p class="lb-count" id="lb-count"></p></dialog>
</div></section>

<section class="sec band faq" id="hoi-dap" style="background:var(--pink-soft)"><div class="wrap">
  <div class="faq-side"><h2 class="h2 rv">Hỏi nhanh đáp gọn</h2><img class="rv" src="{im(56)}" alt="Concept Thu lá khô" loading="lazy"></div>
  <div class="faq-list">
    <details class="rv" open><summary>Chưa chụp bao giờ, không biết tạo dáng?</summary><p>Đa số khách của nhà La cũng vậy. Thợ chụp chỉ từng dáng, từng hướng mặt và cho bạn xem ảnh ngay trên máy trong lúc chụp.</p></details>
    <details class="rv"><summary>Có cần mang trang phục không?</summary><p>Không cần. Mỗi concept có sẵn trang phục nhiều size. Muốn mặc đồ riêng thì gửi ảnh qua Zalo để studio tư vấn phối với phông.</p></details>
    <details class="rv"><summary>Đặt cọc và dời lịch thế nào?</summary><p>Sau khi bạn gửi yêu cầu, studio nhắn xác nhận qua Zalo và gửi thông tin cọc 30%. Được dời lịch miễn phí một lần nếu báo trước 24 giờ.</p></details>
    <details class="rv"><summary>Bao lâu thì có ảnh?</summary><p>Ảnh gốc gửi qua Google Drive ngay trong ngày. Ảnh chỉnh kỹ gửi sau 5–7 ngày.</p></details>
    <details class="rv"><summary>Chụp cùng bạn thân, người yêu được không?</summary><p>Được. Concept Thu lá khô làm cho hai người, các concept khác thêm người với phụ thu 300k mỗi người.</p></details>
    <details class="rv"><summary>Có ý tưởng riêng thì sao?</summary><p>Gửi ảnh tham khảo qua Zalo hoặc Messenger. Studio báo lại đạo cụ cần dựng, thời gian chuẩn bị và chi phí trước khi chốt lịch.</p></details>
  </div>
</div></section>

<section class="sec band book" id="dat-lich"><div class="wrap">
  <div class="book-side">
    <h2 class="h2 rv">Đặt lịch trong 3 bước</h2>
    <p class="lead">Studio nhắn lại qua Zalo trong vòng 2 giờ để xác nhận giờ chụp.</p>
    <div class="sum" id="ticket" aria-live="polite"><img id="pick-img" src="{im(2)}" alt=""><div class="sum-in"><small>Lịch chụp của bạn</small><p class="pick-name" id="pick-name">Đôi mươi rực rỡ</p><p class="pick-meta" id="pick-meta">Gói Thơ · 90 phút · 1 người</p><p class="pick-total" id="pick-total">Tạm tính 1.199.000đ</p></div></div>
  </div>
  <div>
  <form class="bk" id="bk" novalidate>
    <ol class="steps" aria-label="Các bước đặt lịch"><li class="on" data-st="1">Concept &amp; gói</li><li data-st="2">Ngày giờ</li><li data-st="3">Liên hệ</li></ol>
    <div class="step" data-step="1">
      <h3>Chọn concept và gói</h3>
      <fieldset class="field"><legend>Concept</legend><div class="cpick">{"".join(f'<label><input type="radio" name="cpick" value="{c["id"]}"{" checked" if i==0 else ""}><span><img src="{im(c["thumb"])}" alt="" loading="lazy">{H(c["name"])}</span></label>' for i,c in enumerate(CONCEPTS))}</div></fieldset>
      <label class="sr" for="f-concept">Concept</label><select id="f-concept" name="concept" class="sr" tabindex="-1" aria-hidden="true">{"".join(f'<option value="{c["id"]}">{H(c["name"])}</option>' for c in CONCEPTS)}<option value="rieng">Ý tưởng riêng</option></select>
      <fieldset class="field"><legend>Gói chụp</legend><div class="opts">{options("pack",[(p["id"],f'{p["name"]} · {k(p["price"])}') for p in PACKS],"tho")}</div></fieldset>
      <fieldset class="field"><legend>Số người</legend><div class="opts">{options("people",[("1","1 người"),("2","2 người"),("3","3 người"),("4","4 người trở lên")],"1")}</div></fieldset>
      <div class="step-nav"><span></span><button class="btn btn-pink" type="button" data-go="2">Tiếp: chọn ngày giờ</button></div>
    </div>
    <div class="step" data-step="2" hidden>
      <h3>Chọn ngày và giờ</h3>
      <div class="field"><label for="f-date">Ngày chụp</label><input id="f-date" name="date" type="date" required></div>
      <fieldset class="field"><legend>Khung giờ</legend><div class="opts">{options("slot",[("08:30","8:30"),("10:30","10:30"),("13:30","13:30"),("15:30","15:30"),("18:00","18:00")],"10:30")}</div></fieldset>
      <p class="err" id="f-err2" hidden>Bạn chọn giúp ngày chụp nhé.</p>
      <div class="step-nav"><button class="btn btn-ghost" type="button" data-go="1">Quay lại</button><button class="btn btn-pink" type="button" data-go="3">Tiếp: thông tin liên hệ</button></div>
    </div>
    <div class="step" data-step="3" hidden>
      <h3>Để lại thông tin liên hệ</h3>
      <div class="row2">
        <div class="field"><label for="f-name">Họ và tên</label><input id="f-name" name="name" autocomplete="name" placeholder="Nguyễn Ngọc Anh" required></div>
        <div class="field"><label for="f-phone">Số điện thoại / Zalo</label><input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="09xx xxx xxx" required></div>
      </div>
      <div class="field"><label for="f-note">Ghi chú</label><textarea id="f-note" name="note" placeholder="Ví dụ: chụp sinh nhật 20 tuổi, muốn có chữ dán tên Ngọc Anh"></textarea></div>
      <p class="err" id="f-err" hidden></p>
      <div class="step-nav"><button class="btn btn-ghost" type="button" data-go="2">Quay lại</button><button class="btn btn-pink" type="submit" id="f-submit">Gửi yêu cầu đặt lịch</button></div>
    </div>
  </form>
  <div class="done" id="done" hidden aria-live="polite">
    <h3 id="done-title">Nhà La đã nhận yêu cầu!</h3>
    <p id="done-text">Studio sẽ nhắn bạn qua Zalo để xác nhận. Muốn giữ lịch nhanh hơn, gửi luôn tin nhắn dưới đây cho studio.</p>
    <p class="msg" id="done-msg"></p>
    <div class="cta-row"><button class="btn btn-pink" type="button" id="copy-msg">Sao chép tin nhắn</button><a class="btn btn-ghost" href="{ZALO}" target="_blank" rel="noopener">Mở Zalo</a><a class="btn btn-ghost" href="{MESS}" target="_blank" rel="noopener">Mở Messenger</a></div>
    <button class="btn btn-ghost btn-sm" type="button" id="again" style="justify-self:start">Đặt thêm lịch khác</button>
  </div>
  </div>
</div></section>

<section class="sec band contact" id="lien-he" style="padding-top:0"><div class="wrap">
  <div>
    <h2 class="h2 rv">Ghé nhà La chơi</h2>
    <ul class="ct-list">
      <li class="rv"><b>Điện thoại và Zalo</b><div class="ct-row"><span class="ct-big" id="phone-text">{PHONE}</span><button class="btn btn-ghost btn-sm" type="button" id="copy-phone">Sao chép số</button></div></li>
      <li class="rv"><b>Giờ mở cửa</b><span class="ct-big">8:00 – 20:00 mỗi ngày</span><span class="muted">Chụp theo lịch hẹn trước.</span></li>
      <li class="rv"><b>Địa chỉ</b><span class="ct-big">TP. Hồ Chí Minh</span><a href="{MAPS}" target="_blank" rel="noopener">Xem đường đi trên Google Maps</a></li>
      <li class="rv"><div class="ct-row"><a class="btn btn-blue btn-sm" href="{FB}" target="_blank" rel="noopener">Facebook La studio</a><a class="btn btn-ghost btn-sm" href="{ZALO}" target="_blank" rel="noopener">Zalo</a><a class="btn btn-ghost btn-sm" href="{MESS}" target="_blank" rel="noopener">Messenger</a></div></li>
    </ul>
  </div>
  <div class="ct-pics rv" aria-hidden="true"><img src="{im(40)}" alt="" loading="lazy"><img src="{im(61)}" alt="" loading="lazy"></div>
</div></section>

<section class="sec band" id="quan-ly" style="padding-top:0"><div class="wrap">
  <div class="head"><div><h2 class="h2" style="font-size:clamp(34px,4vw,56px)">Quản lý đặt lịch</h2><p class="muted" id="adm-note" style="margin-top:10px">Khu vực dành cho chủ studio. Yêu cầu mới hiện ở đây ngay khi khách gửi.</p></div><div class="adm-stats" id="adm-stats"></div></div>
  <div class="chips" role="group" aria-label="Lọc theo trạng thái" id="adm-filter"><button class="chip" aria-pressed="true" data-s="all">Tất cả</button><button class="chip" aria-pressed="false" data-s="new">Mới</button><button class="chip" aria-pressed="false" data-s="ok">Đã xác nhận</button><button class="chip" aria-pressed="false" data-s="done">Đã chụp</button><button class="chip" aria-pressed="false" data-s="cancel">Đã huỷ</button></div>
  <div class="adm-scroll"><table class="adm"><thead><tr><th>Gửi lúc</th><th>Khách</th><th>Ngày &amp; giờ chụp</th><th>Concept · gói</th><th>Ghi chú</th><th>Trạng thái</th><th></th></tr></thead><tbody id="adm-body"><tr><td colspan="7" class="adm-empty">Chưa có yêu cầu nào. Khi khách gửi form Đặt lịch, yêu cầu sẽ xuất hiện ở đây.</td></tr></tbody></table></div>
</div></section>
</main>

<footer class="foot band"><div class="wrap">
  <p class="foot-name" aria-hidden="true">La studio<span>.</span></p>
  <div class="foot-row"><span>Tiệm ảnh nhà La · chụp ảnh nàng thơ ở TP.HCM</span><nav aria-label="Chân trang"><a href="#concept">Concept</a><a href="#bang-gia">Bảng giá</a><a href="#dat-lich">Đặt lịch</a><a href="{FB}" target="_blank" rel="noopener">Facebook</a><a href="#quan-ly">Quản lý đặt lịch</a></nav></div>
  <div class="foot-row"><span>© 2026 La studio</span><span>Toàn bộ ảnh do La studio thực hiện</span></div>
</div></footer>

<div class="bbar" id="bbar">
  <img id="bb-img" src="{im(2)}" alt="">
  <div class="bbar-info"><b id="bb-name">Đôi mươi rực rỡ</b><span id="bb-total">Gói Thơ · 1.199.000đ</span></div>
  <a class="chat z" href="{ZALO}" target="_blank" rel="noopener">Zalo</a><a class="chat" href="{MESS}" target="_blank" rel="noopener">Messenger</a>
  <a class="btn btn-pink" href="#dat-lich" id="bb-go">Đặt lịch</a>
</div>

<script>window.LA={json.dumps(data, ensure_ascii=False)};
{js}</script>
'''
(root/'index.html').write_text('<!doctype html>\n<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>\n' + page + '</body></html>\n')
print(len(page))
