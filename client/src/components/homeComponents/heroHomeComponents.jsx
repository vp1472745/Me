
// ======================================================
// FILE: HeroSection.jsx - Supporting Adaptive Dynamic Media Stream
// ======================================================
import  { useEffect, useState } from "react";
import "../../css/heroHoneComponents.css";
import Footer from "../../components/homeComponents/footerHomeComponents";

// Static Asset Imports (Fallback and sub-sections)
import HeroImage from "../../assets/herosection/girls.jpg";
import WhatWeLove from "../../assets/whatWeLove/firstImage.jpg";
import WhatWeBelive from "../../assets/whatWeBelieve/firstImage.jpg";
import WhatWeDo from "../../assets/whatWeDo/firstImage.jpg";

// API Endpoint Connection
import { getAllHeroSections } from "../../config/api";

const HeroSection = () => {
  const [heroMedia, setHeroMedia] = useState(null);

  // Fetch live background tracking from core API matrix
  const fetchHeroSection = async () => {
    try {
      const res = await getAllHeroSections();
      const heroes = res?.data?.data || [];

      if (heroes.length > 0) {
        // Fetching the first configuration item entry setup
        setHeroMedia(heroes[0]);
      }
    } catch (error) {
      console.log("Error fetching hero section content pipeline:", error);
    }
  };

  useEffect(() => {
    fetchHeroSection();
  }, []);

  return (
    <>
      {/* Dynamic Main Entry Hero Section Layer */}
      <section
        className="relative h-screen flex items-center justify-center overflow-hidden bg-fixed bg-cover bg-no-repeat"
        style={
          !heroMedia || heroMedia.mediaType === "image"
            ? {
                backgroundImage: `url(${heroMedia ? heroMedia.mediaUrl : HeroImage})`,
                backgroundPosition: "center 35%",
              }
            : {}
        }
      >
        {/* Kinetic Motion Loop Stream Renderer (Video Mode Only) */}
        {heroMedia && heroMedia.mediaType === "video" && (
          <video
            key={heroMedia.mediaUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center 35%" }}
          >
            <source src={heroMedia.mediaUrl} type="video/mp4" />
          </video>
        )}

        {/* Global Cinematic Contrast Tint Overlay Veil */}
        <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none"></div>

        {/* LUXURY LAYOUT CONTENT */}
        <div className="relative z-10 text-center px-6">
          {/* TITLE */}
          <h1 className="luxury-title text-white text-2xl md:text-2xl md:mt-65">
            Welcome
          </h1>

          {/* LINE */}
          <div className="luxury-line"></div>

          {/* TEXT */}
          <p className="luxury-text text-white text-lg md:text-1xl max-w-5xl mx-auto">
            Imagine waking up to a job that lifts you up and transports you to a
            different world.
          </p>

          <p className="luxury-text text-white/90 text-base md:text-xl max-w-6xl mx-auto">
            A world populated with a billion heartfelt feelings and stories
            etched ceremoniously in magic, love and joie de vivre.
          </p>

          <p className="luxury-text text-white/90 text-base md:text-xl max-w-6xl mx-auto">
            Perfect with its Disney-like happy endings, sworn vows and the
            promises of forever.
          </p>

          <p className="luxury-text text-white text-lg md:text-2xl max-w-5xl mx-auto">
            This is our world. The Wedding Story world!
          </p>

          <div className="luxury-line"></div>
        </div>
      </section>

      {/* Quote Section Block Frame */}
      <section className="py-10 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="wedding-quote">
            Without stories of love, our lives would pass by in the blink of an
            eye.
            <br />
            These stories have the power to stop the world for a moment.
          </h2>

          <p className="wedding-author">— HARPREET BACHHER</p>
        </div>
      </section>

      {/* What We Love? Frame Layer */}
      <section
        className="relative h-[25vh] bg-fixed bg-cover bg-center flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${WhatWeLove})`,
          backgroundPosition: "center 30%",
        }}
      >
        <div className="relative z-10 text-center px-6">
          <h1 className="luxury-title text-white text-lg sm:text-1xl md:text-2xl font-semibold">
            What We Love?
          </h1>
        </div>
      </section>

      {/* What We Love Content Segment */}
      <section className="section-content">
        <div className="max-w-5xl mx-auto text-center">
          <div className="section-divider"></div>
          <p className="section-text">
            We are die-hard, hopeless romantics at heart and, photographers by
            qualification.
          </p>
          <p className="section-text">
            We love travelling all across the world to film the most important
            day of your life. Narrating your wedding story through our lenses is
            a passion we all share as a team.
          </p>
          <div className="section-divider"></div>
        </div>
      </section>

      {/* What We Believe? Frame Layer */}
      <section
        className="relative h-[25vh] bg-fixed bg-cover bg-center flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${WhatWeBelive})`,
          backgroundPosition: "center 35%",
        }}
      >
        <div className="relative z-10 text-center px-6">
          <h1 className="luxury-title text-white text-lg sm:text-1xl md:text-2xl">
            What We Believe?
          </h1>
        </div>
      </section>

      {/* What We Believe Content Segment */}
      <section className="section-content">
        <div className="max-w-5xl mx-auto text-center">
          <div className="section-divider"></div>
          <p className="section-text">
            We believe that marriages are a promise of forever, synonymous to
            “...and they lived happily ever after.”
          </p>
          <p className="section-text">
            We are here to encapsulate your "happily ever after" onto the screen
            just as magically as you had imagined.
          </p>
          <div className="section-divider"></div>
        </div>
      </section>

      {/* WHAT WE DO? Frame Layer */}
      <section
        className="relative h-[25vh] bg-fixed bg-cover bg-center flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${WhatWeDo})`,
          backgroundPosition: "center 35%",
        }}
      >
        <div className="relative z-10 text-center px-6">
          <h1 className="luxury-title text-white text-lg sm:text-1xl md:text-3xl">
            What We Do?
          </h1>
        </div>
      </section>

      {/* What We Do Content Segment */}
      <section className="section-content">
        <div className="max-w-5xl mx-auto text-center">
          <div className="section-divider"></div>
          <p className="section-text">
            We document handpicked elements and moments that are packed with
            love to render your wedding film as illustrious as a contemporary
            cinematic record.
          </p>
          <p className="section-text">
            The footage is edited meticulously to provide you with an
            everlasting treasured testament of your dream story.
          </p>
          <div className="section-divider"></div>
        </div>
      </section>

      {/* Footer Ecosystem */}
      <Footer />
    </>
  );
};

export default HeroSection;

