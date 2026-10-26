'use client';

import { useEffect, useRef } from 'react';

const MARKER = 'qotnOverlay';
const CLEANUP_DELAY_MS = 250;
let activeOverlays = 0;

/**
 * Ties an overlay (modal, drawer, search) to the browser Back button:
 * opening pushes one history entry, Back closes the overlay instead of leaving the page.
 * Closing by any other route (X, swipe, link) drops that entry again.
 */
export function useBackClose(open: boolean, onClose: () => void) {
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });

  useEffect(() => {
    if (!open) return;

    activeOverlays++;
    window.history.pushState({ ...window.history.state, [MARKER]: true }, '');

    let closedByBack = false;
    const onPop = () => {
      closedByBack = true;
      closeRef.current();
    };
    window.addEventListener('popstate', onPop);

    return () => {
      activeOverlays--;
      window.removeEventListener('popstate', onPop);
      if (closedByBack) return;
      // Delayed so a link tapped inside the overlay can finish navigating first: calling
      // back() mid-navigation would undo it. If the page already changed, the marker is gone
      // and nothing happens (useSkipStaleOverlayEntries cleans any leftover entry).
      setTimeout(() => {
        if (activeOverlays === 0 && window.history.state?.[MARKER]) window.history.back();
      }, CLEANUP_DELAY_MS);
    };
  }, [open]);
}

/**
 * Mount once in the root layout. If a navigation races an overlay closing and leaves
 * a stale overlay entry behind, Back would land on it and look like a dead press;
 * this skips straight past it.
 */
export function useSkipStaleOverlayEntries() {
  useEffect(() => {
    const onPop = () => {
      if (window.history.state?.[MARKER] && activeOverlays === 0) window.history.back();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
}
