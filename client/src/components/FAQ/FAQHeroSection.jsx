// src/components/HeroSection/HeroSection.jsx
import React from "react";
import { Link } from "react-router-dom";
import { MdPhotoCamera } from "react-icons/md";
import Image from "../../assets/herosectionImage/faqherosection.jpg";

const HeroSection = () => {
  return (
    <section className="relative w-full  min-h-[695px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={Image}
          alt="Hero Photography"
          className="w-full h-[695px] object-cover"
        />
        {/* Dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/20 to-black/10" />
      </div>



      {/* Scroll indicator (optional) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
          <div className="w-1 h-3 rounded-full bg-[#C9A96E] animate-scroll" />
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