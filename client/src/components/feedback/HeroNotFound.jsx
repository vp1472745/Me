import React from "react";
import { Sparkles, Camera, Film } from "lucide-react";

const HeroNotFound = ({
  categoryName = "Hero Section",
  title = "CREATING TIMELESS MEMORIES",
  subtitle = "No hero media uploaded yet for this section. Upload from the admin dashboard to go live.",
  height = "h-[55vh] sm:h-[65vh] md:h-[75vh] lg:h-[695px] min-h-[380px]",
}) => {
  return (
    <section
      className={`relative w-full ${height} flex items-center justify-center overflow-hidden bg-[#0A0D0B] text-white select-none`}
    >
      {/* Ambient Deep Radial Glow */}
      <div className="absolute inset-0 bg-radial from-[#1E2B21]/60 via-[#0E1410] to-[#0A0D0B] pointer-events-none" />

      {/* Decorative Grid Mesh */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(201, 169, 110, 0.4) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 pointer-events-none" />

      {/* Animated Orbiting Rings and Aperture Lens */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Cinematic Animated Camera Lens Icon Container */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-4 flex items-center justify-center">
          {/* Pulsing Outer Aura */}
          <div className="absolute inset-0 rounded-full bg-[#5A7863]/20 animate-ping opacity-30" />

          {/* Rotating Dashed Outer Ring */}
          <svg
            className="absolute inset-0 w-full h-full animate-spin"
            style={{ animationDuration: "20s" }}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="#C9A96E"
              strokeWidth="1.5"
              strokeDasharray="6 8"
              opacity="0.6"
            />
          </svg>

          {/* Reverse Rotating Middle Ring */}
          <svg
            className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] animate-spin"
            style={{ animationDuration: "14s", animationDirection: "reverse" }}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#5A7863"
              strokeWidth="1.2"
              strokeDasharray="4 6"
              opacity="0.8"
            />
          </svg>

          {/* Inner Glowing Lens Core */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#1A261D] to-[#0A0D0B] border border-[#C9A96E]/40 flex items-center justify-center shadow-[0_0_30px_rgba(90,120,99,0.3)] relative">
            <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-[#C9A96E] animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#C9A96E] animate-ping" />
          </div>
        </div>

        {/* Category Pill */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.2 rounded-full bg-[#162018]/90 border border-[#5A7863]/50 text-[#C9A96E] text-[10px] sm:text-xs font-bold uppercase tracking-[3px] mb-3 shadow-lg backdrop-blur-md">
          <Sparkles size={12} className="text-[#C9A96E]" />
          <span>{categoryName}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-[6px] sm:tracking-[10px] uppercase text-white/95 font-serif">
          {title}
        </h1>

        {/* Luxury Gold Trim Divider */}
        <div className="flex items-center justify-center gap-3 my-4 sm:my-5 w-full max-w-xs">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#C9A96E]/60 to-[#C9A96E]" />
          <span className="text-[#C9A96E] text-xs">❖</span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#C9A96E]/60 to-[#C9A96E]" />
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-gray-300/80 font-light max-w-lg leading-relaxed mb-6 italic">
          "{subtitle}"
        </p>
      </div>

      {/* Subtle Bottom Bounce Scroll Indicator */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-60">
        <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-[#C9A96E] animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroNotFound;
