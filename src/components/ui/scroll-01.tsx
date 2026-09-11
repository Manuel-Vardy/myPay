"use client";

import { motion, useScroll, useTransform, useMotionValueEvent, useMotionValue, useSpring, MotionValue, useInView, AnimatePresence } from "motion/react";
import { useRef, useState } from "react";

type Scroll01Item = {
  title: string;
  description: string;
  media: string;
  /** Optional second image shown alongside the primary for index 0 */
  mediaExtra?: string;
};

export interface Scroll01Props {
  items: Scroll01Item[];
}

/**
 * Dual-image panel — laptop + phone, both raw transparent PNGs.
 * phonePosition "right": phone anchors right, slides from right (even indices)
 * phonePosition "left":  phone anchors left,  slides from left  (odd indices)
 * Laptop always slides in from the left.
 */
function SalesImagePanel({
  laptopSrc,
  phoneSrc,
  isActive,
  phonePosition = "right",
}: {
  laptopSrc: string;
  phoneSrc: string;
  isActive: boolean;
  phonePosition?: "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });

  const phoneInitialX = phonePosition === "right" ? 60 : -60;
  const phoneExitX   = phonePosition === "right" ? 40 : -40;

  return (
    <div
      ref={ref}
      className="relative w-full overflow-visible"
      style={{ minHeight: "clamp(180px, 40vw, 420px)" }}
    >
      {/* ── Laptop: 82% wide, natural height, slides in from left ── */}
      <motion.img
        src={laptopSrc}
        alt="laptop view"
        initial={{ opacity: 0, x: -60 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }}
        transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        className="block object-contain will-change-transform"
        style={{
          width: "82%",
          height: "auto",
          filter: "drop-shadow(0 20px 48px rgba(0,0,0,0.13))",
          position: "relative",
          marginLeft: phonePosition === "left" ? "18%" : "0%",
          zIndex: 10,
        }}
      />

      {/* ── Phone: alternates right / left based on phonePosition ── */}
      <AnimatePresence>
        {isActive && (
          <motion.img
            key="phone"
            src={phoneSrc}
            alt="mobile view"
            initial={{ opacity: 0, x: phoneInitialX }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: phoneInitialX }}
            exit={{ opacity: 0, x: phoneExitX, transition: { duration: 0.28, ease: "easeIn" } }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1], delay: 0.22 }}
            className="absolute object-contain will-change-transform"
            style={{
              width: "36%",
              height: "auto",
              top: "8%",
              ...(phonePosition === "right" ? { right: "-2%" } : { left: "-2%" }),
              filter: "drop-shadow(0 20px 48px rgba(0,0,0,0.22))",
              zIndex: 20,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ScrollItem({
  item,
  index,
  registerRef,
}: {
  item: Scroll01Item;
  index: number;
  registerRef: (index: number, el: HTMLDivElement | null) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const setRef = (el: HTMLDivElement | null) => {
    ref.current = el;
    registerRef(index, el);
  };

  const { scrollYProgress: localProgress } = useScroll({
    target: ref,
    offset: ["start 95%", "start 8%"],
  });

  const y = useTransform(localProgress, [0, 0.15, 0.85, 1], [60, 0, 0, -40]);

  const opacity = useTransform(
    localProgress,
    [0, 0.15, 0.88, 1],
    index === 0 ? [1, 1, 1, 0] : [0, 1, 1, 0],
  );

  return (
    <motion.article
      ref={setRef}
      style={{ opacity, y }}
      className="flex min-h-[40vh] items-center justify-start"
    >
      <div className="w-full space-y-3.5">
        <h3 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-black leading-[1.1]">
          {item.title}
        </h3>
        <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed max-w-xl">
          {item.description}
        </p>
        <div className="pt-3 flex items-center text-xs font-bold text-[#16a34a] gap-1.5">
          <span>Powered by TMOS</span>
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </motion.article>
  );
}

export function Scroll01({ items }: Readonly<Scroll01Props>) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const imagePanelRef = useRef<HTMLDivElement | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const lastItemWrapperRef = useRef<HTMLDivElement | null>(null);

  const lastIndex = items.length - 1;

  const { scrollY } = useScroll();

  // Scroll direction tracking (numeric: 1 = down, -1 = up)
  const scrollDirection = useRef<1 | -1>(1);
  const prevScrollY = useRef<number>(-1);

  // Hysteresis guard for activeIndex:
  // When switching to index N, don't switch back to N-1 until we're 30px above the midline
  const lastSwitchDirection = useRef<1 | -1 | 0>(0);
  const HYSTERESIS_PX = 32;

  // Lock state stored in a MotionValue so transforms react synchronously per scroll frame,
  // not tied to React state re-renders. Value of -1 means "not locked".
  const lockedScrollY = useMotionValue<number>(-1);
  // React state copy for conditional rendering decisions (if needed later)
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const registerRef = (index: number, el: HTMLDivElement | null) => {
    itemRefs.current[index] = el;
    if (index === lastIndex) {
      lastItemRef.current = el;
    }
  };

  const { scrollYProgress: sectionProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // ── Active index with hysteresis ───────────────────────────────────────
  // Swap trigger line is near the BOTTOM of the image panel (~72% down),
  // so the image changes EARLY as soon as the next text reaches the lower
  // portion of the image (not waiting until midpoint-of-panel overlap).
  useMotionValueEvent(sectionProgress, "change", () => {
    const panel = imagePanelRef.current?.getBoundingClientRect();
    if (!panel) return;
    const TRIGGER_FROM_TOP = 0.85; // higher = swap happens earlier (closer to panel bottom)
    const triggerY = panel.top + panel.height * TRIGGER_FROM_TOP;

    let candidate = 0;
    for (let i = 0; i < items.length; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const itemMid = rect.top + rect.height / 2;
      // itemMid <= triggerY  →  item has risen past the trigger, advance index
      if (itemMid <= triggerY) candidate = i;
      else break;
    }

    const current = activeIndex;
    if (candidate !== current) {
      const advancing = candidate > current;
      if (advancing) {
        // Going DOWN / forward through list → accept immediately (we crossed trigger)
        setActiveIndex(candidate);
        lastSwitchDirection.current = 1;
      } else {
        // Going UP / regressing → require hysteresis: current-active item must have
        // moved at least HYSTERESIS_PX back DOWN the screen past the trigger before
        // we allow it to drop back to the previous image (avoids flip-flop jitter).
        const currentEl = itemRefs.current[current];
        if (currentEl) {
          const crect = currentEl.getBoundingClientRect();
          const currentMid = crect.top + crect.height / 2;
          const distancePastTriggerBelow = currentMid - (triggerY + HYSTERESIS_PX);
          if (distancePastTriggerBelow > 0) {
            setActiveIndex(candidate);
            lastSwitchDirection.current = -1;
          }
        } else {
          setActiveIndex(candidate);
        }
      }
    }
  });

  // ── Image panel transform: lock-on on the way down, spring back on way up
  // Clamp translate to >= 0 so on upward scrolls we never push the panel
  // up faster than its sticky container moves (that causes double-velocity shake).
  const imageTranslateY = useTransform(
    scrollY,
    (currentScrollY) => {
      const locked = lockedScrollY.get();
      if (locked < 0) return 0;
      // delta > 0 when scrolling DOWN past lock (we want to push image up = negative Y)
      // delta < 0 when scrolling UP past lock → clamp image to 0 (don't apply transform)
      const delta = currentScrollY - locked;
      if (delta <= 0) return 0;
      return -delta;
    }
  );

  // Smooth spring so the Y transition isn't frame-jumpy on release
  const imageTranslateYSmooth = useSpring(imageTranslateY, {
    stiffness: 280,
    damping: 36,
    mass: 0.4,
  });

  // ── Scroll lock trigger + scroll direction tracking ────────────────────
  useMotionValueEvent(scrollY, "change", (currentScrollY) => {
    // ── 1. Direction tracking ────────────────────────────────────────────
    if (prevScrollY.current >= 0) {
      const dy = currentScrollY - prevScrollY.current;
      if (dy > 0.5) scrollDirection.current = 1;      // down
      else if (dy < -0.5) scrollDirection.current = -1; // up
    }
    prevScrollY.current = currentScrollY;

    const goingDown = scrollDirection.current === 1;
    const goingUp = scrollDirection.current === -1;

    const lastEl = lastItemRef.current;
    if (!lastEl) return;

    const rect = lastEl.getBoundingClientRect();
    const itemCenter = rect.top + rect.height / 2;
    const vpCenter = window.innerHeight / 2;
    // distance > 0  →  item still BELOW viewport center (hasn't reached trigger going down)
    // distance == 0 → at trigger
    // distance < 0  → item ABOVE viewport center (passed trigger going down)
    const distance = itemCenter - vpCenter;

    const isCurrentlyLocked = lockedScrollY.get() >= 0;

    if (!isCurrentlyLocked) {
      // Only ever lock when scrolling DOWNWARD. Never lock on the way up.
      if (goingDown) {
        // Trigger: item crosses viewport center from below to above
        // Use a small positive threshold (10px) below the exact mid so we
        // don't accidentally fire from jitter
        if (distance <= 0 && distance > -120) {
          lockedScrollY.set(currentScrollY);
          setIsLocked(true);
        }
      }
    } else {
      // ── 2. Release conditions ──────────────────────────────────────────
      // Release if:
      //   a) user scrolls UP at all (immediately release so image snaps back naturally)
      //   b) user has scrolled DOWN well past the lock point (> ~ a full viewport)
      const scrolledWayPast = distance < -220;
      if (goingUp || scrolledWayPast) {
        lockedScrollY.set(-1);
        setIsLocked(false);
      }
    }
  });

  return (
    <>
      {/* ── MOBILE layout: no container card, dual images above text ── */}
      <div className="md:hidden flex flex-col" style={{ gap: "100px" }}>
        {items.map((item, index) => {
          const phonePos: "left" | "right" = index % 2 === 0 ? "right" : "left";
          return (
            <div key={`${item.title}-${index}`} className="space-y-5">
              {/* Text first on mobile */}
              <div className="space-y-2.5">
                <h3 className="text-2xl font-extrabold text-black tracking-tight leading-tight">
                  {item.title}
                </h3>
                <p className="text-base text-gray-600 font-medium leading-relaxed">
                  {item.description}
                </p>
                <div className="pt-1 flex items-center text-xs font-bold text-[#16a34a] gap-1">
                  <span>Powered by TMOS</span>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Images below text */}
              {item.mediaExtra ? (
                <SalesImagePanel
                  laptopSrc={item.media}
                  phoneSrc={item.mediaExtra}
                  isActive={true}
                  phonePosition={phonePos}
                />
              ) : (
                <div className="w-full aspect-[16/10] rounded-[20px] overflow-hidden shadow-sm">
                  <img
                    src={item.media}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="hidden gap-8 lg:gap-12 md:grid md:grid-cols-[55fr_45fr] items-start">
        <div className="order-1 sticky top-28 shrink-0 self-start z-20">
          <motion.div
            style={{ y: imageTranslateYSmooth }}
            className="will-change-transform"
          >
            {/* ── Image panel: dual for items with mediaExtra, single crossfade for the rest ── */}
            {items.some(item => item.mediaExtra) ? (
              <div className="relative w-full" style={{ minHeight: 520 }}>
                {/* imagePanelRef anchor — sized to fill the container for correct trigger bounding rect */}
                <div
                  ref={imagePanelRef}
                  className="absolute inset-0 pointer-events-none"
                  aria-hidden="true"
                />

                {/* ── Dual panel for any item with mediaExtra ── */}
                {items.map((item, index) =>
                  item.mediaExtra ? (
                    <motion.div
                      key={`dual-${index}`}
                      className={index === 0 ? "w-full" : "absolute top-0 left-0 w-full"}
                      animate={{ opacity: activeIndex === index ? 1 : 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      style={{ pointerEvents: activeIndex === index ? "auto" : "none", zIndex: activeIndex === index ? 25 : 1 }}
                    >
                      <SalesImagePanel
                        laptopSrc={item.media}
                        phoneSrc={item.mediaExtra}
                        isActive={activeIndex === index}
                        phonePosition={index % 2 === 0 ? "right" : "left"}
                      />
                    </motion.div>
                  ) : null
                )}

                {/* ── Standard crossfade panel for items without mediaExtra ── */}
                <motion.div
                  className="absolute top-0 left-0 w-full h-full rounded-[24px] overflow-hidden border border-gray-200 shadow-[0_14px_44px_-18px_rgba(0,0,0,0.15)] bg-gray-100"
                  animate={{ opacity: items[activeIndex]?.mediaExtra ? 0 : 1 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  style={{ pointerEvents: items[activeIndex]?.mediaExtra ? "none" : "auto", zIndex: 30 }}
                >
                  {items.map((item, index) =>
                    !item.mediaExtra ? (
                      <motion.img
                        key={`${item.title}-${index}`}
                        src={item.media}
                        alt={item.title}
                        className="absolute inset-0 h-full w-full object-cover backface-hidden"
                        initial={{ opacity: 0, zIndex: 0 }}
                        animate={{
                          opacity: activeIndex === index ? 1 : 0,
                          zIndex: activeIndex === index ? 1 : 0,
                        }}
                        transition={{
                          opacity: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                          zIndex: { duration: 0 },
                        }}
                      />
                    ) : null
                  )}
                </motion.div>
              </div>
            ) : (
              /* ── Standard single-image panel (no mediaExtra on any item) ── */
              <div
                ref={imagePanelRef}
                className="relative w-full max-w-[440px] aspect-[4/5] max-h-[68vh] rounded-[28px] overflow-hidden border border-gray-200 shadow-[0_16px_50px_-20px_rgba(0,0,0,0.15)] bg-gray-100 isolation-isolate"
              >
                {items.map((item, index) => (
                  <motion.img
                    key={`${item.title}-${index}`}
                    src={item.media}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover backface-hidden"
                    initial={{ opacity: index === 0 ? 1 : 0, zIndex: index === 0 ? 1 : 0 }}
                    animate={{
                      opacity: activeIndex === index ? 1 : 0,
                      zIndex: activeIndex === index ? 1 : 0,
                    }}
                    transition={{
                      opacity: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                      zIndex: { duration: 0 },
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <div ref={sectionRef} className="order-2 relative">
          <div className="pt-[20vh] pb-[60vh]">
            <div className="space-y-[20vh]">
              {items.map((item, index) => (
                <div
                  key={`wrap-${item.title}-${index}`}
                  ref={index === lastIndex ? lastItemWrapperRef : undefined}
                >
                  <ScrollItem
                    key={`${item.title}-${index}`}
                    item={item}
                    index={index}
                    registerRef={registerRef}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Scroll01;
