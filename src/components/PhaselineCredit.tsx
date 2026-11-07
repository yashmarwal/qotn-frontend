"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./phaseline-credit.css";

const WA_NUMBER = "918595475007";
const WA_FALLBACK = `https://wa.me/${WA_NUMBER}?text=Hi%20Phaseline%2C%20I%27d%20like%20to%20book%20a%20consultation.`;

/** "Built by Phaseline" footer credit: an outlined pill that opens a small contact card. */
export default function PhaselineCredit() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const waRef = useRef<HTMLAnchorElement>(null);

  // Pre-fill the WhatsApp message with this site's hostname (client only).
  useEffect(() => {
    if (waRef.current) {
      waRef.current.href =
        `https://wa.me/${WA_NUMBER}?text=` +
        encodeURIComponent(
          `Hi Phaseline, I'd like to book a consultation. I found you through ${location.hostname}.`,
        );
    }
  }, []);

  // Keep the card fully on screen (8px margin) and move focus into it when it opens.
  useLayoutEffect(() => {
    const pop = popRef.current;
    const root = rootRef.current;
    if (!open || !pop || !root) return;
    // Measure from layout (not the animated transform): the card is right-aligned to the pill.
    const fit = () => {
      pop.style.left = pop.style.right = "";
      const b = root.getBoundingClientRect();
      const left = b.right - pop.offsetWidth;
      const right = b.right;
      let s = 0;
      if (left < 8) s = 8 - left;
      else if (right > window.innerWidth - 8) s = window.innerWidth - 8 - right;
      if (s) {
        pop.style.right = "auto";
        pop.style.left = left - b.left + s + "px";
      }
    };
    fit();
    pop.querySelector<HTMLAnchorElement>("a")?.focus();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [open]);

  // Close on a click outside or on Escape (Escape returns focus to the pill).
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
        <symbol id="pl-mark" viewBox="0 0 256 256">
          <rect width="256" height="256" rx="58" fill="#1F2A3A" />
          <g transform="translate(17.92 17.92) scale(.86)">
            <path fill="#F5EFE3" transform="translate(-13 0)" d="M28.18 122A100 100 0 0 1 227.82 122Z" />
            <path fill="#B08D57" transform="translate(13 0)" d="M28.18 134A100 100 0 0 0 227.82 134Z" />
          </g>
        </symbol>
      </svg>
      <span className="pl-built-by" ref={rootRef}>
        <span>Built by</span>
        <button
          type="button"
          className="pl-trigger"
          ref={btnRef}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls="pl-pop"
          aria-label="Phaseline, website builder: open contact options"
          onClick={() => setOpen((v) => !v)}
        >
          <svg className="pl-mark" aria-hidden="true" focusable="false">
            <use href="#pl-mark" />
          </svg>
          <span>Phaseline</span>
        </button>
        <div className="pl-pop" id="pl-pop" role="dialog" aria-label="Phaseline" data-open={open} ref={popRef}>
          <div className="pl-head">
            <svg className="pl-mark" aria-hidden="true" focusable="false">
              <use href="#pl-mark" />
            </svg>
            <span>Phaseline</span>
          </div>
          <p>Websites, business systems and custom software for Indian B2B businesses.</p>
          <a className="pl-visit" href="https://www.phaseline.in/" target="_blank" rel="noopener">
            Visit phaseline.in
          </a>
          <a className="pl-wa" href={WA_FALLBACK} target="_blank" rel="noopener" ref={waRef}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Book a consultation on WhatsApp
          </a>
        </div>
      </span>
    </>
  );
}
