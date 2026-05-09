"use client";

import BlurText from "./BlurText";

export default function AnimatedHeroHeading() {
  return (
    <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
      <BlurText
        text="Financial Architecture"
        as="span"
        delay={150}
        animateBy="words"
        direction="top"
        wordClassName={(word) =>
          word === "Architecture" ? "text-[color:var(--trite-lime-strong)]" : ""
        }
      />
      <br />
      <BlurText
        text="for the Modern Enterprise."
        as="span"
        delay={150}
        animateBy="words"
        direction="top"
        startDelay={300}
      />
    </h1>
  );
}
