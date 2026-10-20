"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

// Cuộn mượt (Lenis) + hiệu ứng theo cuộn, chạy chồng lên JS gốc của template.
// Dùng các thuộc tính translate/scale riêng để không đụng transform/hover sẵn có.
const REVEAL = [
  ".head", ".h2:not(.rv)", ".lead:not(.rv)", ".chips", ".card", ".plan", ".notes p",
  ".gallery button", ".faq details", ".fact:not(.rv)", ".quiz-card", ".sum", "form.bk",
].join(",");

export default function Motion() {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    // Hero: ngôi sao lấp lánh + ảnh ghép lệch theo chuột
    const collage = document.querySelector<HTMLElement>(".collage");
    const sparks = [
      ["8%", "12%", "", "0s", "26px"], ["92%", "6%", "b", ".8s", "18px"], ["4%", "58%", "y", "1.6s", "20px"],
      ["70%", "94%", "", "2.2s", "16px"], ["48%", "-3%", "y", "1.1s", "14px"], ["97%", "60%", "b", "2.6s", "22px"],
    ].map(([left, top, c, d, sz]) => {
      const el = document.createElement("span");
      el.className = `hero-spark ${c}`;
      el.textContent = "✦";
      el.setAttribute("aria-hidden", "true");
      Object.assign(el.style, { left, top });
      el.style.setProperty("--d", d);
      el.style.setProperty("--s", sz);
      collage?.append(el);
      return el;
    });
    const hero = document.querySelector<HTMLElement>(".hero");
    const onMove = (e: PointerEvent) => {
      if (!collage || e.pointerType !== "mouse") return;
      collage.style.setProperty("--mx", ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
      collage.style.setProperty("--my", ((e.clientY / innerHeight) * 2 - 1).toFixed(3));
    };
    const onLeave = () => { collage?.style.setProperty("--mx", "0"); collage?.style.setProperty("--my", "0"); };
    hero?.addEventListener("pointermove", onMove);
    hero?.addEventListener("pointerleave", onLeave);

    const lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), anchors: { offset: -80 } });
    let raf = 0;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);

    // Hộp thoại & bảng cuộn ngang tự cuộn bên trong, không qua Lenis
    document.querySelectorAll("dialog, .adm-scroll, .chips").forEach((el) => el.setAttribute("data-lenis-prevent", ""));
    // Dừng cuộn trang khi hộp thoại mở
    const dialogs = Array.from(document.querySelectorAll("dialog"));
    const mo = new MutationObserver(() => (dialogs.some((d) => d.open) ? lenis.stop() : lenis.start()));
    dialogs.forEach((d) => mo.observe(d, { attributes: true, attributeFilter: ["open"] }));

    // Hiện dần khi cuộn xuống, ẩn lại khi phần tử ra khỏi màn hình phía dưới để cuộn lên vẫn có hiệu ứng
    const els = Array.from(document.querySelectorAll<HTMLElement>(REVEAL));
    els.forEach((el) => {
      const sib = Array.from(el.parentElement?.children ?? []).filter((x) => x.matches(REVEAL));
      el.style.setProperty("--mv-d", `${Math.min(sib.indexOf(el), 5) * 70}ms`);
      el.classList.add("mv");
    });
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting) en.target.classList.add("mv-in");
      else if (en.boundingClientRect.top > 0) en.target.classList.remove("mv-in");
    }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));

    // Parallax, thanh tiến trình, ẩn/hiện menu, nút lên đầu trang
    const para = Array.from(document.querySelectorAll<HTMLElement>(".cl img, .strip img, .quiz-photos img, .ct-pics img, .faq-side img"));
    const nav = document.getElementById("nav");
    const bar = document.createElement("div");
    bar.className = "mv-progress";
    const top = document.createElement("button");
    top.className = "mv-top";
    top.type = "button";
    top.setAttribute("aria-label", "Lên đầu trang");
    top.textContent = "↑";
    top.onclick = () => lenis.scrollTo(0);
    document.body.append(bar, top);

    let lastY = 0;
    const onScroll = ({ scroll, progress }: { scroll: number; progress: number }) => {
      bar.style.scale = `${progress} 1`;
      top.classList.toggle("on", scroll > innerHeight);
      nav?.classList.toggle("mv-hide", scroll > 300 && scroll > lastY);
      lastY = scroll;
      const vh = innerHeight;
      para.forEach((img) => {
        const r = img.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const k = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.translate = `0 ${(k * -40).toFixed(1)}px`;
      });
    };
    lenis.on("scroll", onScroll);
    onScroll({ scroll: scrollY, progress: 0 });

    return () => {
      cancelAnimationFrame(raf); lenis.destroy(); io.disconnect(); mo.disconnect(); bar.remove(); top.remove();
      sparks.forEach((el) => el.remove());
      hero?.removeEventListener("pointermove", onMove); hero?.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return null;
}
