import Script from "next/script";
import markup from "./markup";
import Motion from "./motion";

// Giao diện + hiệu ứng lấy từ template/la-studio-v5: markup tĩnh render sẵn trên server,
// public/la-app.js (dữ liệu + JS gốc) gắn hiệu ứng sau khi trang tải xong.
export default function Home() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: markup }} />
      <Script src="/la-app.js" strategy="afterInteractive" />
      <Motion />
    </>
  );
}
