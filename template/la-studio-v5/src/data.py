# Dữ liệu nội dung của La studio: liên hệ, concept, gói giá, bộ sưu tập.
import pathlib
from PIL import Image as _I
root = pathlib.Path(__file__).resolve().parent.parent
PHONE = "093 141 95 38"
ZALO = "https://zalo.me/0931419538"
FB = "https://www.facebook.com/profile.php?id=61590492897254"
MESS = "https://m.me/61590492897254"
MAPS = "https://www.google.com/maps/search/?api=1&query=La+STUDIO+-+TI%E1%BB%86M+%E1%BA%A2NH+NH%C3%80+LA&query_place_id=ChIJ3ejJT20vdTER9ivHNB9_n6I"

def im(n): return f"img/p{n:02d}.webp"
def wh(n):
    w,h=_I.open(root/'img'/f'p{n:02d}.webp').size; return f'width="{w}" height="{h}"'

CONCEPTS = [
 dict(id="doi-muoi", name="Đôi mươi rực rỡ", kind="Concept cá nhân · sinh nhật", svc="ca-nhan",
  pics=[4,2,5,7,0], thumb=2, desc="Phông xám nhạt dán đầy miếng vá denim, nút áo nhiều màu và ngôi sao vải. Vương miện denim, gấu bông và đôi boots đỏ cho tuổi hai mươi nghịch ngợm.",
  fit="Sinh nhật 18, 20, 22 tuổi; chụp cùng chữ tên hoặc số tuổi.", has="Vương miện denim, gấu bông, blazer, cà vạt, boots đỏ, chữ dán theo tên.", pack="Gói Thơ"),
 dict(id="bong-bay", name="Bóng bay đỏ", kind="Concept theo chủ đề · mùa đông", svc="chu-de",
  pics=[45,44,61,46,55], thumb=55, desc="Chùm bóng bay đỏ buộc nơ thành chiếc mũ, khăn len kẻ sọc và nền trắng sữa. Tóc búi hai bên, má hồng, ánh nhìn tinh nghịch.",
  fit="Sinh nhật, Giáng sinh, ảnh đại diện vui tươi.", has="Mũ bóng bay, khăn len sọc đỏ trắng, áo len kem.", pack="Gói Xinh"),
 dict(id="cay-thong", name="Cây thông len", kind="Concept theo chủ đề · Giáng sinh", svc="chu-de",
  pics=[22,25,23,24,26], thumb=22, desc="Áo len đan to màu kem, tất len và chiếc mũ cây thông nhỏ xinh. Ánh sáng ấm, nền be mềm như một buổi sáng tháng mười hai.",
  fit="Ảnh Noel, ảnh đại diện, quà tặng cuối năm.", has="Mũ cây thông, áo len oversize, tất len kem.", pack="Gói Xinh"),
 dict(id="hoa-cuc", name="Hoa cúc khăn voan", kind="Concept nghệ thuật · vintage", svc="nghe-thuat",
  pics=[38,37,42,39,48], thumb=39, desc="Khăn voan hoa nhí trùm tóc, hoa cúc trắng cài và cầm tay, váy bèo trắng. Gần như chụp cận, má hồng và đôi mắt to tròn.",
  fit="Ảnh chân dung nhẹ nhàng, phong cách baby.", has="Khăn voan hoa, hoa cúc tươi, váy bèo, nhẫn bạc.", pack="Gói Xinh"),
 dict(id="vuon-reu", name="Vườn rêu nàng thơ", kind="Concept nghệ thuật · khu vườn", svc="nghe-thuat",
  pics=[53,54,58,52,60], thumb=53, desc="Phông xanh rêu vẽ tay, khóm hoa dại và váy lụa trắng. Hoa cài tóc, ánh sáng dịu như bức tranh sơn dầu.",
  fit="Bộ ảnh nghệ thuật, ảnh kỷ niệm, ảnh trưởng thành.", has="Váy lụa trắng, hoa tươi cài tóc, set cây hoa dại.", pack="Gói Nàng thơ"),
 dict(id="co-phong", name="Bạch hoa cổ phong", kind="Chụp ảnh cổ trang", svc="co-trang",
  pics=[30,29,40,31,35], thumb=31, desc="Áo giao lĩnh trắng tay rộng, tóc dài buộc thấp cài hoa đào. Bình gốm, cành hoa hồng phấn và nền xanh oliu trầm.",
  fit="Người yêu cổ phong, ảnh Tết, ảnh nghệ thuật.", has="Áo cổ phong trắng, trâm hoa, bình gốm và hoa đào.", pack="Gói Nàng thơ"),
 dict(id="chan-dung", name="Chân dung trong", kind="Chụp ảnh chân dung", svc="chan-dung",
  pics=[27,28,32,36], thumb=36, desc="Cận mặt, lớp nền mỏng trong veo, tóc rối nhẹ trước trán. Ít đạo cụ, tập trung vào làn da và ánh mắt.",
  fit="Ảnh hồ sơ, ảnh đại diện, ảnh profile nghề nghiệp.", has="Áo trễ vai kem, hoa lan trắng, makeup trong.", pack="Gói Xinh"),
 dict(id="blazer", name="Blazer đen", kind="Concept cá nhân · thời trang", svc="ca-nhan",
  pics=[51,57,59,43,47], thumb=63, desc="Blazer oversize, cà vạt đỏ rượu, tất đen và ghế da. Nền xám studio, dáng đứng thẳng, chất ảnh tạp chí.",
  fit="Ảnh cá tính, ảnh profile thời trang, sinh nhật trưởng thành.", has="Blazer đen, cà vạt đỏ, ghế da, giày cao gót.", pack="Gói Thơ"),
 dict(id="thu-la", name="Thu lá khô", kind="Chụp đôi, nhóm bạn", svc="chu-de",
  pics=[33,41,56,34,49], thumb=34, desc="Thảm lá khô, áo len kem, khăn kẻ và chụp tai lông. Dành cho hai người: cặp đôi, bạn thân hoặc chị em.",
  fit="Kỷ niệm yêu nhau, chụp cùng bạn thân.", has="Lá khô, áo len, khăn kẻ, chụp tai lông, vương miện lá.", pack="Gói Thơ"),
]
SERVICES = [
 ("ca-nhan","Chụp ảnh concept cá nhân","Một bộ ảnh dựng riêng cho bạn: phông, trang phục và đạo cụ đi cùng một câu chuyện.",5,"doi-muoi"),
 ("nghe-thuat","Chụp ảnh nghệ thuật","Ánh sáng, chất liệu và màu như tranh. Hợp với ai muốn bộ ảnh treo được lên tường.",53,"vuon-reu"),
 ("co-trang","Chụp ảnh cổ trang","Áo cổ phong, trâm hoa và bối cảnh trầm. Makeup và làm tóc theo đúng tạo hình.",30,"co-phong"),
 ("chan-dung","Chụp ảnh chân dung","Cận mặt, trong và thật. Cho ảnh hồ sơ, ảnh đại diện hoặc đơn giản là thấy mình xinh.",27,"chan-dung"),
 ("chu-de","Chụp theo chủ đề riêng","Bạn kể ý tưởng, nhà La dựng phông và đạo cụ. Sinh nhật, Noel, chụp đôi, chụp nhóm bạn.",45,"bong-bay"),
]
PACKS = [
 dict(id="xinh", name="Gói Xinh", price=699000, time="60 phút", concepts="1 concept", outfit="1 bộ", mk="Makeup + làm tóc nhẹ", edit="10 ảnh", raw="Toàn bộ ảnh gốc", gift="—"),
 dict(id="tho", name="Gói Thơ", price=1199000, time="90 phút", concepts="1 concept", outfit="2 bộ", mk="Makeup + làm tóc theo concept", edit="20 ảnh", raw="Toàn bộ ảnh gốc", gift="1 ảnh in 13×18"),
 dict(id="nang-tho", name="Gói Nàng thơ", price=1899000, time="150 phút", concepts="2 concept", outfit="3 bộ", mk="Makeup + làm tóc, đổi layout giữa 2 concept", edit="35 ảnh", raw="Toàn bộ ảnh gốc", gift="1 ảnh in 20×30 + 1 video hậu trường"),
]
def vnd(n): return f"{n:,}".replace(",", ".") + "đ"

GALLERY = [(2, 'doi-muoi'), (22, 'cay-thong'), (27, 'chan-dung'), (30, 'co-phong'), (33, 'thu-la'), (38, 'hoa-cuc'), (51, 'blazer'), (45, 'bong-bay'), (53, 'vuon-reu'), (0, 'doi-muoi'), (24, 'cay-thong'), (32, 'chan-dung'), (31, 'co-phong'), (50, 'thu-la'), (39, 'hoa-cuc'), (57, 'blazer'), (46, 'bong-bay'), (60, 'vuon-reu'), (4, 'doi-muoi'), (25, 'cay-thong'), (28, 'chan-dung'), (35, 'co-phong'), (56, 'thu-la'), (48, 'hoa-cuc'), (47, 'blazer'), (55, 'bong-bay'), (58, 'vuon-reu'), (7, 'doi-muoi'), (23, 'cay-thong'), (36, 'chan-dung'), (29, 'co-phong'), (34, 'thu-la'), (37, 'hoa-cuc'), (62, 'blazer'), (44, 'bong-bay'), (52, 'vuon-reu'), (1, 'doi-muoi'), (26, 'cay-thong'), (40, 'co-phong'), (41, 'thu-la'), (42, 'hoa-cuc'), (43, 'blazer'), (61, 'bong-bay'), (54, 'vuon-reu'), (3, 'doi-muoi'), (49, 'thu-la'), (59, 'blazer'), (5, 'doi-muoi'), (63, 'blazer'), (6, 'doi-muoi'), (8, 'doi-muoi')]
MQ1=[2,45,22,38,53,30,27,51,33,4,61,24]
MQ2=[39,60,46,31,57,0,56,58,26,36,44,35]
def marquee(arr):
    one=''.join(f'<img class="{["a","c","r"][i%3]}" src="{im(n)}" alt="" loading="lazy">' for i,n in enumerate(arr))
    return one+one.replace('alt=""','alt="" aria-hidden="true"')
CNAME = {c["id"]:c["name"] for c in CONCEPTS}

