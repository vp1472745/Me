import React, { useEffect, useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { getAllHeroSections, getCachedData } from "../../../config/api";
import { getCleanMediaUrl } from "../../../utils/cleanUrl";
import HeroNotFound from "../../../components/feedback/HeroNotFound";

const getInitialHeroData = () => {
  const cached = getCachedData("/hero/all", { category: "images" });
  const list = cached?.data?.data || cached?.data || [];
  if (Array.isArray(list) && list.length > 0) {
    const item = list[0];
    return {
      ...item,
      mediaUrl: getCleanMediaUrl(item.mediaUrl),
    };
  }
  return null;
};

const HeroSection = () => {
  const initialHero = getInitialHeroData();
  const [heroData, setHeroData] = useState(initialHero);
  const [loading, setLoading] = useState(!initialHero);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const toggleSound = () => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      if (videoRef.current) {
        videoRef.current.muted = nextMuted;
        if (!nextMuted) {
          videoRef.current.play().catch((err) => console.log("Play audio error:", err));
        }
      }
      return nextMuted;
    });
  };

  useEffect(() => {
    const fetchImagesHero = async () => {
      try {
        if (!heroData) setLoading(true);
        const res = await getAllHeroSections({ category: "images" });
        const list = res?.data?.data || res?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          const item = list[0];
          setHeroData({
            ...item,
            mediaUrl: getCleanMediaUrl(item.mediaUrl),
          });
        } else if (!heroData) {
          setHeroData(null);
        }
      } catch (error) {
        console.error("Error fetching images hero:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchImagesHero();
  }, []);

  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {});
    }
  }, [heroData, isMuted]);

  if (!loading && !heroData) {
    return (
      <HeroNotFound
        categoryName="Images"
        title="VISUAL CHRONICLES"
        subtitle="Capturing eternal emotions, unfiltered moments, and timeless grace."
      />
    );
  }

  if (loading && !heroData) {
    return (
      <div className="w-full h-[55vh] sm:h-[65vh] md:h-[75vh] lg:h-[695px] min-h-[360px] bg-gradient-to-r from-zinc-900 via-neutral-900 to-black animate-pulse flex items-center justify-center" />
    );
  }

  const isVideo = heroData.mediaType === "video";

  return (
    <section className="relative w-full h-[55vh] sm:h-[65vh] md:h-[75vh] lg:h-[695px] min-h-[360px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-900 via-stone-900 to-black">
      {/* Background Media */}
      <div className="absolute inset-0 w-full h-full">
        {isVideo ? (
          <video
            ref={videoRef}
            key={heroData.mediaUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            onLoadedData={() => setIsVideoReady(true)}
            onCanPlay={() => setIsVideoReady(true)}
            className={`w-full h-full object-cover object-center pointer-events-none transition-opacity duration-700 ease-in-out ${
              isVideoReady ? "opacity-100" : "opacity-0"
            }`}
          >
            <source src={heroData.mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={heroData.mediaUrl}
            alt="Images Hero Banner"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-center"
          />
        )}
        {/* Dark overlay with luxury gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50 pointer-events-none" />
      </div>

      {/* Sound Mute / Unmute Toggle Button */}
      {isVideo && (
        <button
          onClick={toggleSound}
          className="absolute bottom-6 right-6 z-30 flex items-center gap-2 bg-black/60 hover:bg-black/90 text-white px-4 py-2 rounded-full border border-white/30 backdrop-blur-md transition-all duration-300 shadow-xl text-xs tracking-widest font-medium cursor-pointer hover:scale-105 active:scale-95"
          aria-label={isMuted ? "Unmute video sound" : "Mute video sound"}
        >
          {isMuted ? (
            <>
              <VolumeX size={16} className="text-white/70" />
              <span className="text-white/90">SOUND OFF</span>
            </>
          ) : (
            <>
              <Volume2 size={16} className="text-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-semibold">SOUND ON</span>
            </>
          )}
        </button>
      )}

      {/* Scroll indicator */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce pointer-events-none">
        <div className="w-5 h-8 md:w-6 md:h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
          <div className="w-1 h-2 md:h-3 rounded-full bg-[#C9A96E] animate-scroll" />
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(8px); opacity: 0; }
        }
        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;