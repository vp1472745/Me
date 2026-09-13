import React, { useEffect, useState } from "react";
import { getAllHeroSections } from "../../config/api";
import { getCleanMediaUrl } from "../../utils/cleanUrl";
import HeroNotFound from "../commonComponents/HeroNotFound";

const HeroSection = () => {
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilmHero = async () => {
      try {
        setLoading(true);
        const res = await getAllHeroSections({ category: "films" });
        const list = res?.data?.data || [];
        if (list.length > 0) {
          const item = list[0];
          setHeroData({
            ...item,
            mediaUrl: getCleanMediaUrl(item.mediaUrl),
          });
        } else {
          setHeroData(null);
        }
      } catch (error) {
        console.error("Error fetching films hero:", error);
        setHeroData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchFilmHero();
  }, []);

  if (!loading && !heroData) {
    return (
      <HeroNotFound
        categoryName="Films"
        title="CINEMATIC FILMS"
        subtitle="Every film is a bespoke love story filmed across the globe."
      />
    );
  }

  if (loading && !heroData) {
    return (
      <div className="w-full h-[55vh] sm:h-[65vh] md:h-[75vh] lg:h-[695px] min-h-[360px] bg-black flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#5A7863] border-t-transparent animate-spin" />
      </div>
    );
  }

  const isVideo = heroData.mediaType === "video";

  return (
    <section className="relative w-full h-[55vh] sm:h-[65vh] md:h-[75vh] lg:h-[695px] min-h-[360px] flex items-center justify-center overflow-hidden bg-black">
      {/* Background Media */}
      <div className="absolute inset-0 w-full h-full">
        {isVideo ? (
          <video
            key={heroData.mediaUrl}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover object-center pointer-events-none"
          >
            <source src={heroData.mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={heroData.mediaUrl}
            alt="Films Hero Banner"
            className="w-full h-full object-cover object-center"
          />
        )}
        {/* Dark overlay with luxury gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40 pointer-events-none" />
      </div>

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