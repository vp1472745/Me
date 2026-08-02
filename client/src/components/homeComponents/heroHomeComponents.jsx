
import  { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../../css/heroHoneComponents.css";
import Footer from "../../components/homeComponents/footerHomeComponents";

// Static Asset Imports (Fallback and sub-sections)
import HeroImage from "../../assets/herosection/girls.jpg";
import WhatWeLove from "../../assets/whatWeLove/firstImage.jpg";
import WhatWeBelive from "../../assets/whatWeBelieve/firstImage.jpg";
import WhatWeDo from "../../assets/whatWeDo/firstImage.jpg";

// API Endpoint Connection
import { getAllHeroSections } from "../../config/api";
import { getCleanMediaUrl } from "../../utils/cleanUrl";

const HeroSection = () => {
  const [heroes, setHeroes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch live background tracking from core API matrix
  const fetchHeroSection = async () => {
    try {
      const res = await getAllHeroSections();
      const rawHeroes = res?.data?.data || [];

      if (rawHeroes.length > 0) {
        const cleaned = rawHeroes.map((hero) => ({
          ...hero,
          mediaUrl: getCleanMediaUrl(hero.mediaUrl),
        }));
        // Sort by sliderOrder
        cleaned.sort((a, b) => (a.sliderOrder || 0) - (b.sliderOrder || 0));
        setHeroes(cleaned);
      }
    } catch (error) {
      console.log("Error fetching hero section content pipeline:", error);
    }
  };

  useEffect(() => {
    fetchHeroSection();
  }, []);

  // Auto transition interval
  useEffect(() => {
    if (heroes.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroes.length);
    }, 6000); // 6 seconds auto-rotate
    return () => clearInterval(interval);
  }, [heroes]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? heroes.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroes.length);
  };

  const defaultHero = {
    mediaUrl: HeroImage,
    mediaType: "image",
    title: "Welcome",
    subtitle: "Creating Timeless Memories",
    paragraph: "Imagine waking up to a job that lifts you up and transports you to a different world. A world populated with a billion heartfelt feelings and stories.",
  };

  const displayHeroes = heroes.length > 0 ? heroes : [defaultHero];

  return (
    <>
      {/* Dynamic Carousel Slide Frame */}
      <section className="relative h-screen overflow-hidden bg-black">
        {displayHeroes.map((hero, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={hero._id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Media Renderer */}
              {hero.mediaType === "video" ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: "center 35%" }}
                >
                  <source src={hero.mediaUrl} type="video/mp4" />
                </video>
              ) : (
                <div
                  className="absolute inset-0 bg-cover bg-no-repeat bg-center"
                  style={{
                    backgroundImage: `url(${hero.mediaUrl})`,
                    backgroundPosition: "center 35%",
                  }}
                />
              )}

              {/* Tint Overlay Screen */}
              <div
                className="absolute inset-0 bg-black pointer-events-none"
                style={{ opacity: hero.backgroundOverlay !== undefined ? hero.backgroundOverlay : 0.45 }}
              />

              {/* Content Panel overlays */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20">
                <div className="max-w-4xl px-4 animate-fadeIn">
                  <h1 className="luxury-title text-white text-2xl md:text-3xl lg:text-4xl tracking-widest mb-2 font-light">
                    {hero.title || "Welcome"}
                  </h1>

                  {hero.subtitle && (
                    <p className="text-white/80 text-xs md:text-sm tracking-[0.25em] uppercase font-medium mb-3">
                      {hero.subtitle}
                    </p>
                  )}

                  <div className="luxury-line"></div>

                  <p className="luxury-text text-white text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                    {hero.paragraph}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                    {hero.primaryButtonText && (
                      <a
                        href={hero.primaryButtonLink || "#"}
                        className="px-6 py-2.5 border border-white text-white text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 rounded font-medium"
                      >
                        {hero.primaryButtonText}
                      </a>
                    )}
                    {hero.secondaryButtonText && (
                      <a
                        href={hero.secondaryButtonLink || "#"}
                        className="px-6 py-2.5 bg-white text-black text-xs uppercase tracking-widest hover:bg-transparent hover:text-white border border-white transition-all duration-300 rounded font-medium"
                      >
                        {hero.secondaryButtonText}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Carousel Chevrons & Bullets */}
        {displayHeroes.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-30 text-white/40 hover:text-white p-3 rounded-full hover:bg-white/10 transition-all duration-300"
              aria-label="Previous slide"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-30 text-white/40 hover:text-white p-3 rounded-full hover:bg-white/10 transition-all duration-300"
              aria-label="Next slide"
            >
              <ChevronRight size={32} />
            </button>

            {/* Bottom dots */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
              {displayHeroes.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? "bg-white scale-125" : "bg-white/30 hover:bg-white/60"
                  }`}
                  aria-label={`Slide index indicator ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
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

