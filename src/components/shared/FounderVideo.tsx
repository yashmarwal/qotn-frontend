'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimationControls, type PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useBackClose } from '@/hooks/useBackClose';

// Square 224px loop for the 72px bubble (322 KB) and a 720p cut for the opened card (4.9 MB)
const BUBBLE_SRC   = '/videos/founder-bubble.mp4';
const CARD_SRC     = '/videos/founder.mp4';
const FOUNDER_NAME = 'Punit Dhanopia';
const FOUNDER_ROLE = 'Founder, QOTN';

const BUBBLE_SIZE = 72;
const BUBBLE_BORDER = 2.5;
// The card lands on the bubble's inner circle so the bubble's ring stays visible around it
const BUBBLE_INNER = BUBBLE_SIZE - BUBBLE_BORDER * 2;
const CARD_RADIUS = 18;
const CARD_MAX_WIDTH = 360;
// Swipe-down closes the video once it is pulled this far, or flicked this fast
const SWIPE_CLOSE_DISTANCE = 110;
const SWIPE_CLOSE_VELOCITY = 600;

// Fast start, long soft landing: reads as one continuous motion rather than a pop
const EASE_OUT = [0.32, 0.72, 0, 1] as const;
const CLIP_FULL = `inset(0px 0px 0px 0px round ${CARD_RADIUS}px)`;

/**
 * The card is always laid out at full size, centred. This is the transform + clip that
 * shrinks it onto the bubble's inner circle: opening grows out of the bubble, closing
 * settles back into it.
 */
interface Morph { x: number; y: number; scale: number; clip: string }

function morphFromBubble(circle: HTMLElement): Morph {
  const r = circle.getBoundingClientRect();
  const w = Math.min(window.innerWidth * 0.88, CARD_MAX_WIDTH);
  const h = (w * 16) / 9;
  const pad = (h - w) / 2; // clip the 9:16 card to its centre square, rounded into a circle
  return {
    x: r.left + r.width / 2 - window.innerWidth / 2,
    y: r.top + r.height / 2 - window.innerHeight / 2,
    scale: BUBBLE_INNER / w,
    clip: `inset(${pad}px 0px ${pad}px 0px round ${w / 2}px)`,
  };
}

export default function FounderVideo() {
  const isMobile  = useIsMobile();
  const [visible,  setVisible]  = useState(false);
  const [expanded, setExpanded] = useState(false);
  // True from the moment the card starts opening until it has finished settling back
  const [shown, setShown] = useState(false);
  const bubbleVideoRef = useRef<HTMLVideoElement>(null);
  const cardVideoRef = useRef<HTMLVideoElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const morphRef = useRef<Morph | null>(null);
  const wasExpanded = useRef(false);
  const controls = useAnimationControls();

  useBackClose(expanded, () => setExpanded(false));

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 3200);
    return () => clearTimeout(t);
  }, []);

  // Freeze the page behind the open video so scrolling can't move it
  useEffect(() => {
    if (!expanded) return;
    const html = document.documentElement;
    const prev = { html: html.style.overflow, body: document.body.style.overflow };
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prev.html;
      document.body.style.overflow = prev.body;
    };
  }, [expanded]);

  // Closing, however it was triggered (X, backdrop, Back, swipe): settle back into the bubble
  useEffect(() => {
    if (expanded) { wasExpanded.current = true; return; }
    if (!wasExpanded.current) return;
    wasExpanded.current = false;

    const m = morphRef.current;
    const card = cardVideoRef.current;
    const bubble = bubbleVideoRef.current;
    if (!m) return;
    // Hand over on the same frame so swapping card for bubble is invisible
    if (card && bubble) { try { bubble.currentTime = card.currentTime; } catch { /* not seekable */ } }

    // Every close, including a swipe down, flows back into the bubble from wherever the card is
    controls.start({ x: m.x, y: m.y, scale: m.scale, clipPath: m.clip, transition: { duration: 0.4, ease: EASE_OUT } }).then(() => {
      setShown(false);
      if (card) { card.pause(); card.currentTime = 0; }
    });
  }, [expanded, controls]);

  const openVideo = () => {
    const circle = circleRef.current;
    const card = cardVideoRef.current;
    if (!circle || !card) return;
    const m = morphFromBubble(circle);
    morphRef.current = m;
    controls.stop();
    controls.set({ x: m.x, y: m.y, scale: m.scale, clipPath: m.clip });
    setShown(true);
    setExpanded(true);
    // Always from the start. Called inside the tap so sound is allowed to play.
    card.currentTime = 0;
    card.play().catch(() => { /* autoplay policy: controls still let the user press play */ });
    controls.start({ x: 0, y: 0, scale: 1, clipPath: CLIP_FULL, transition: { duration: 0.46, ease: EASE_OUT } });
  };
  // The card file is only fetched when someone shows intent, so the page itself stays light
  const warmCard = () => { if (cardVideoRef.current) cardVideoRef.current.preload = "auto"; };
  const closeVideo = () => setExpanded(false);
  const onCardDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > SWIPE_CLOSE_DISTANCE || info.velocity.y > SWIPE_CLOSE_VELOCITY) {
      setExpanded(false);
    }
  };

  // Ensure bubble video plays whenever bubble is shown (browsers may pause after modal closes)
  useEffect(() => {
    if (visible && !expanded && bubbleVideoRef.current) {
      bubbleVideoRef.current.play().catch(() => {/* autoplay policy — silent fail */});
    }
  }, [visible, expanded]);

  const bottom = isMobile ? 86 : 24;
  const right  = isMobile ? 14 : 28;

  return (
    <>
      {/* ── Floating bubble: stays put underneath, so the card has something to land on ── */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', damping: 18, stiffness: 240 }}
            style={{
              position: 'fixed', bottom, right, zIndex: 250,
              cursor: 'pointer', userSelect: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}
          >
            {/* Relative wrapper holds circle + X + dot so positioning is from circle edge */}
            <div style={{ position: 'relative', width: BUBBLE_SIZE, height: BUBBLE_SIZE }}>
              {/* Dismiss X — top-left of wrapper, outside overflow:hidden */}
              <button
                onClick={(e) => { e.stopPropagation(); setVisible(false); }}
                style={{
                  position: 'absolute', top: -5, left: -5, zIndex: 3,
                  width: 18, height: 18, minHeight: 'unset', borderRadius: '50%',
                  background: 'var(--black)', border: '1.5px solid var(--cream)',
                  color: 'var(--cream)', fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', lineHeight: 1, padding: 0,
                }}
                aria-label="Dismiss"
              >
                ×
              </button>

              {/* Notification dot — top-right of wrapper, outside overflow:hidden */}
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.55, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', top: 0, right: 0, zIndex: 3,
                  width: 10, height: 10, borderRadius: '50%',
                  background: '#C1440E',
                  border: '1.5px solid var(--cream)',
                }}
              />

              {/* Circle — click to expand */}
              <div
                ref={circleRef}
                onClick={openVideo}
                onPointerDown={warmCard}
                onPointerEnter={warmCard}
                style={{
                  width: BUBBLE_SIZE, height: BUBBLE_SIZE, borderRadius: '50%', overflow: 'hidden',
                  border: `${BUBBLE_BORDER}px solid var(--black)`,
                  boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
                }}
              >
                <video
                  ref={bubbleVideoRef}
                  src={BUBBLE_SRC}
                  autoPlay muted loop playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>

            {/* Name + role */}
            <div
              onClick={openVideo}
              style={{ textAlign: 'center', marginTop: 7 }}
            >
              <p style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--black)', letterSpacing: '0.03em', lineHeight: 1.3 }}>
                {FOUNDER_NAME}
              </p>
              <p style={{ fontSize: 8.5, color: 'var(--dust)', letterSpacing: '0.05em', marginTop: 1 }}>
                {FOUNDER_ROLE}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Expanded card: mounted (metadata only) once the bubble shows, hidden until opened ── */}
      {visible && (
        <>
          {/* Backdrop: touch-action/overscroll stop touches from scrolling the page behind */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: expanded ? 1 : 0 }}
            transition={{ duration: expanded ? 0.3 : 0.35, ease: 'easeOut' }}
            onClick={closeVideo}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 600,
              touchAction: 'none', overscrollBehavior: 'contain',
              pointerEvents: expanded ? 'auto' : 'none',
              visibility: shown ? 'visible' : 'hidden',
            }}
          />

          {/* 9:16 card — flex wrapper avoids CSS transform conflict with framer-motion */}
          <div style={{
            position: 'fixed', inset: 0, zIndex: 601,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
            visibility: shown ? 'visible' : 'hidden',
          }}>
            <motion.div
              animate={controls}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={onCardDragEnd}
              style={{
                width: `min(88vw, ${CARD_MAX_WIDTH}px)`,
                aspectRatio: '9 / 16',
                overflow: 'hidden',
                background: '#000',
                position: 'relative',
                pointerEvents: 'auto',
                willChange: 'transform, clip-path',
              }}
            >
              <video
                ref={cardVideoRef}
                src={CARD_SRC}
                playsInline controls preload="metadata"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />

              {/* Founder info + close fade in once the card has landed */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: expanded ? 1 : 0, transition: { delay: expanded ? 0.28 : 0, duration: expanded ? 0.2 : 0.1 } }}
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
              >
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '48px 20px 28px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.78))',
                }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '0.04em', marginBottom: 3 }}>
                    {FOUNDER_NAME}
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
                    {FOUNDER_ROLE}
                  </p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 6 }}>
                    Pure Cotton. Nothing Else.
                  </p>
                </div>

                <button
                  onClick={closeVideo}
                  aria-label="Close video"
                  style={{
                    position: 'absolute', top: 14, right: 14,
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.52)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', pointerEvents: 'auto',
                  }}
                >
                  <X size={15} strokeWidth={1.5} />
                </button>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </>
  );
}
