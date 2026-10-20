import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Bricolage_Grotesque } from "next/font/google";
import "./la.css";
import "./overrides.css";

const text = Be_Vietnam_Pro({
  variable: "--font-bvp",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const display = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "vietnamese"],
  axes: ["opsz", "wdth"],
});

export const metadata: Metadata = {
  title: "La studio Xinh",
  description: "La studio – tiệm ảnh nhà La ở TP.HCM. 9 concept dựng sẵn, trang phục và makeup trọn gói, từ 699k.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // "js" bật các hiệu ứng xuất hiện khi cuộn trong la.css
    <html lang="vi" className={`js ${text.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
