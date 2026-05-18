import React from "react";
import "../../css/heroHoneComponents.css";

const HeroSection = () => {
  return (
    <>
      {/* First Section  */}
      <section
        className="
    relative
    h-screen
    bg-fixed
    bg-cover
    bg-no-repeat
    flex
    items-center
    justify-center
    overflow-hidden
  "
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2070&auto=format&fit=crop')",
          backgroundPosition: "center 20%",
        }}
      >
        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/45"></div>

        {/* CONTENT */}
        <div className="relative z-10 text-center px-6">
          {/* TITLE */}
          <h1
            className="
        luxury-title
        text-white
        text-2xl
        md:text-4xl
      "
          >
            Welcome
          </h1>

          {/* LINE */}
          <div className="luxury-line"></div>

          {/* TEXT */}
          <p className="luxury-text text-white text-lg md:text-2xl max-w-5xl mx-auto">
            Imagine waking up to a job that lifts you up and transports you to a
            different world.
          </p>

          <p className="luxury-text text-white/90 text-base md:text-xl mt-8 max-w-6xl mx-auto">
            A world populated with a billion heartfelt feelings and stories
            etched ceremoniously in magic, love and joie de vivre.
          </p>

          <p className="luxury-text text-white/90 text-base md:text-xl mt-8 max-w-6xl mx-auto">
            Perfect with its Disney-like happy endings, sworn vows and the
            promises of forever.
          </p>

          <p className="luxury-text text-white text-lg md:text-2xl mt-8 max-w-5xl mx-auto">
            This is our world. The Wedding Story world!
          </p>
        </div>
      </section>

    
      <section className="bg-[#f4f1eb] py-28 md:py-40 px-6">
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

    {/* What We Love? */}
      <section
        className="
          relative
          h-[75vh]
          bg-fixed
          bg-cover
          bg-center
          flex
          items-center
          justify-center
          overflow-hidden
        "
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1974&auto=format&fit=crop')",
        }}
      >
        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* CONTENT */}
        <div className="relative z-10 text-center px-6">
          <p
            className="
              text-white/80
              uppercase
              tracking-[8px]
              text-xs
              md:text-sm
              mb-6
            "
          >
            Cinematic Wedding Stories
          </p>

          <h1
            className="
              luxury-title
              text-white
              text-4xl
              sm:text-5xl
              md:text-7xl
            "
          >
            What We Love?
          </h1>

          <div className="luxury-line mt-10"></div>
        </div>
      </section>

      {/* Content Section */}
      <section className="section-content">
        <div className="max-w-5xl mx-auto text-center">
          <p className="section-text">
            We are die-hard, hopeless romantics at heart and, photographers by
            qualification.
          </p>

          <p className="section-text ">
            We love travelling all across the world to film the most important
            day of your life. Narrating your wedding story through our lenses is
            a passion we all share as a team.
          </p>
        </div>
      </section>

    {/* What We Believe? */}
      <section
        className="
          relative
          h-[75vh]
          bg-fixed
          bg-cover
          bg-center
          flex
          items-center
          justify-center
          overflow-hidden
        "
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* CONTENT */}
        <div className="relative z-10 text-center px-6">
          <p
            className="
              text-white/80
              uppercase
              tracking-[8px]
              text-xs
              md:text-sm
              mb-6
            "
          >
            Cinematic Wedding Stories
          </p>

          <h1
            className="
              luxury-title
              text-white
              text-4xl
              sm:text-5xl
              md:text-7xl
            "
          >
            What We Believe?
          </h1>

          <div className="luxury-line mt-10"></div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="section-content">
        <div className="max-w-5xl mx-auto text-center">
          <div className="section-divider"></div>

          <p className="section-text">
            We believe that marriages are a promise of forever, synonymous to
            “...and they lived happily ever after.”
          </p>

          <p className="section-text ">
            We are here to encapsulate your "happily ever after" onto the screen
            just as magically as you had imagined.
          </p>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section
        className="
          relative
          h-[75vh]
          bg-fixed
          bg-cover
          bg-center
          flex
          items-center
          justify-center
          overflow-hidden
        "
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* CONTENT */}
        <div className="relative z-10 text-center px-6">
          <p
            className="
              text-white/80
              uppercase
              tracking-[8px]
              text-xs
              md:text-sm
              mb-6
            "
          >
            Cinematic Wedding Stories
          </p>

          <h1
            className="
              luxury-title
              text-white
              text-4xl
              sm:text-5xl
              md:text-7xl
            "
          >
            What We Do?
          </h1>

          <div className="luxury-line mt-10"></div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="section-content">
        <div className="max-w-5xl mx-auto text-center">
          <p className="section-text">
            We document handpicked elements and moments that are packed with
            love to render your wedding film as illustrious as a contemporary
            cinematic record.
          </p>

          <p className="section-text ">
            The footage is edited meticulously to provide you with an
            everlasting treasured testament of your dream story.
          </p>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
