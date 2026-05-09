"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

const PARTICLES_CONFIG = {
  particles: {
    number: { value: 80, density: { enable: true, value_area: 800 } },
    color: { value: "#ffffff" },
    shape: {
      type: "circle",
      stroke: { width: 0, color: "#000000" },
      polygon: { nb_sides: 5 },
      image: { src: "img/github.svg", width: 100, height: 100 },
    },
    opacity: {
      value: 0.5,
      random: false,
      anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false },
    },
    size: {
      value: 3,
      random: true,
      anim: { enable: false, speed: 40, size_min: 0.1, sync: false },
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#ffffff",
      opacity: 0.4,
      width: 1,
    },
    move: {
      enable: true,
      speed: 6,
      direction: "none",
      random: false,
      straight: false,
      out_mode: "out",
      bounce: false,
      attract: { enable: false, rotateX: 600, rotateY: 1200 },
    },
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: { enable: true, mode: "repulse" },
      onclick: { enable: true, mode: "push" },
      resize: true,
    },
    modes: {
      grab: { distance: 400, line_linked: { opacity: 1 } },
      bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
      repulse: { distance: 200, duration: 0.4 },
      push: { particles_nb: 4 },
      remove: { particles_nb: 2 },
    },
  },
  retina_detect: true,
};

function initParticles() {
  const win = window as any;
  if (!win.particlesJS) return;

  // Destroy existing instance if present to prevent memory leaks
  if (win.pJSDom && win.pJSDom.length > 0) {
    win.pJSDom.forEach((dom: any) => {
      if (dom.pJS && dom.pJS.fn && dom.pJS.fn.vendors) {
        dom.pJS.fn.vendors.destroypJS();
      }
    });
    win.pJSDom = [];
  }

  win.particlesJS("particles-js", PARTICLES_CONFIG);
}

export default function ParticlesBackground() {
  const initialized = useRef(false);

  useEffect(() => {
    // If the script is already loaded from a previous navigation, init immediately
    if ((window as any).particlesJS) {
      initParticles();
      initialized.current = true;
    }

    return () => {
      // Cleanup on unmount
      const win = window as any;
      if (win.pJSDom && win.pJSDom.length > 0) {
        win.pJSDom.forEach((dom: any) => {
          try {
            if (dom.pJS?.fn?.vendors) {
              dom.pJS.fn.vendors.destroypJS();
            }
          } catch (_) {}
        });
        win.pJSDom = [];
      }
    };
  }, []);

  return (
    <>
      <div
        id="particles-js"
        className="absolute inset-0 w-full h-full bg-[#00070f]"
      />
      <Script
        src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (!initialized.current) {
            initParticles();
            initialized.current = true;
          }
        }}
      />
    </>
  );
}
