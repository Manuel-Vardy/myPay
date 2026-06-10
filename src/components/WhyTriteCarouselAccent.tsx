export default function WhyTriteCarouselAccent() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 bottom-[3px] z-[1]" aria-hidden>
      {/* Solid green — left panel */}
      <div
        className="absolute inset-0 bg-[#22c55e]"
        style={{ clipPath: "polygon(0 0, 78% 0, 64% 100%, 0 100%)" }}
      />
      {/* Parallelogram stripes — full color left, fading right */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon points="73,0 75.5,0 61.5,100 59,100" fill="#4ade80" />
        <polygon points="75.5,0 78,0 64,100 61.5,100" fill="#86efac" />
        <polygon points="78,0 80.5,0 66.5,100 64,100" fill="#bbf7d0" />
        <polygon points="80.5,0 83,0 69,100 66.5,100" fill="#dcfce7" />
        <polygon points="83,0 85.5,0 71.5,100 69,100" fill="#ecfdf5" />
        <polygon points="85.5,0 88,0 74,100 71.5,100" fill="#f0fdf4" />
        <polygon points="88,0 91,0 77,100 74,100" fill="#f7fef9" />
      </svg>
    </div>
  );
}
