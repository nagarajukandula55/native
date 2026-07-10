"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * Full-bleed hero banner slideshow. Each slide tries a dedicated banner
 * asset first (public/hero/slide-N.jpg — drop real photography there),
 * falling back to a real catalogue product photo, then finally to a
 * flat brand-color panel so a missing image never breaks the layout.
 * Autoplays, pauses on hover, supports arrow/dot navigation and swipe.
 */
export default function HeroSlideshow({ slides }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [errored, setErrored] = useState({});
  const touchStartX = useRef(null);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  function go(i) {
    setIndex(((i % slides.length) + slides.length) % slides.length);
  }

  function handleImgError(i) {
    setErrored((prev) => ({ ...prev, [i]: (prev[i] || 0) + 1 }));
  }

  function srcFor(slide, i) {
    const attempt = errored[i] || 0;
    if (attempt === 0) return slide.img;
    if (attempt === 1) return slide.fallback;
    return null; // fall through to the flat-color panel below
  }

  return (
    <section
      className="heroSlideshow"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStartX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (dx > 50) go(index - 1);
        else if (dx < -50) go(index + 1);
        touchStartX.current = null;
      }}
    >
      {slides.map((slide, i) => {
        const src = srcFor(slide, i);
        return (
          <div key={i} className={`slide ${i === index ? "active" : ""}`}>
            {src ? (
              <img
                src={src}
                alt={slide.heading.replace("\n", " ")}
                className="slideImg"
                onError={() => handleImgError(i)}
              />
            ) : (
              <div className="slideFlat" />
            )}
            <div className="slideOverlay" />
            <div className="slideContent">
              <span className="slideEyebrow">{slide.eyebrow}</span>
              <h1>
                {slide.heading.split("\n").map((line, li) => (
                  <span key={li} className="headingLine">
                    {line}
                  </span>
                ))}
              </h1>
              <p className="slideSub">{slide.sub}</p>
              <Link href="/products" className="shopNowBtn">
                SHOP NOW
              </Link>
            </div>
          </div>
        );
      })}

      {slides.length > 1 && (
        <>
          <button
            className="arrow arrowLeft"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            className="arrow arrowRight"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
          >
            ›
          </button>

          <div className="dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === index ? "activeDot" : ""}`}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        .heroSlideshow {
          position: relative;
          width: 100%;
          height: clamp(420px, 62vw, 640px);
          overflow: hidden;
          background: #1f3d2b;
        }

        .slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 900ms ease;
          pointer-events: none;
        }

        .slide.active {
          opacity: 1;
          pointer-events: auto;
        }

        .slideImg {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        .slideFlat {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #2d5016, #1f3d2b 60%, #14261a);
        }

        .slideOverlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(15, 25, 15, 0.72) 0%,
            rgba(15, 25, 15, 0.42) 45%,
            rgba(15, 25, 15, 0.08) 75%
          );
        }

        .slideContent {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: min(560px, 88%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 14px;
          padding: 0 6vw;
          color: #fff;
        }

        .slideEyebrow {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #d9c9a3;
        }

        .slideContent h1 {
          font-family: var(--font-heading, serif);
          font-size: clamp(30px, 5vw, 54px);
          line-height: 1.12;
          margin: 0;
        }

        .headingLine {
          display: block;
        }

        .slideSub {
          font-size: clamp(14px, 1.6vw, 18px);
          color: #ece4d3;
          margin: 0 0 6px;
          max-width: 460px;
        }

        .shopNowBtn {
          display: inline-block;
          width: fit-content;
          background: #c28b45;
          color: #1f1208;
          padding: 13px 34px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 700;
          letter-spacing: 0.5px;
          transition: background 160ms ease, transform 160ms ease;
        }

        .shopNowBtn:hover {
          background: #d9a05f;
          transform: translateY(-1px);
        }

        .arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.85);
          color: #1f3d2b;
          font-size: 26px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          z-index: 2;
        }

        .arrow:hover {
          background: #fff;
        }

        .arrowLeft {
          left: 18px;
        }

        .arrowRight {
          right: 18px;
        }

        .dots {
          position: absolute;
          bottom: 18px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 2;
        }

        .dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          padding: 0;
        }

        .activeDot {
          background: #fff;
          width: 22px;
          border-radius: 5px;
        }

        @media (max-width: 640px) {
          .heroSlideshow {
            height: 480px;
          }

          .slideContent {
            width: 100%;
            padding: 0 20px;
          }

          .slideOverlay {
            background: linear-gradient(
              180deg,
              rgba(15, 25, 15, 0.35) 0%,
              rgba(15, 25, 15, 0.75) 70%
            );
          }

          .arrow {
            width: 36px;
            height: 36px;
            font-size: 20px;
          }
        }
      `}</style>
    </section>
  );
}
