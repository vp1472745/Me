import React from "react";

const ContainSection = () => {
  return (
    <>
      {/* TOP QUOTE SECTION */}
      <section className=" py-20 md:py-28 px-6">
        
        <div className="max-w-6xl mx-auto text-center">
          
          {/* TOP LINE */}
          <div className="w-[180px] md:w-[300px] h-[1px]  mx-auto mb-12"></div>

          {/* QUOTE */}
          <h2
            className="
              text-[#8d8479]
              text-2xl
              sm:text-3xl
              md:text-5xl
              leading-relaxed
              font-light
              italic
              max-w-5xl
              mx-auto
            "
          >
            Without stories of love, our lives would pass by
            in the blink of an eye. These stories have the
            power to stop the world for a moment.
          </h2>

          {/* AUTHOR */}
          <p
            className="
              mt-10
              text-[#8d8479]
              tracking-[6px]
              uppercase
              text-xs
              sm:text-sm
              md:text-lg
            "
          >
            — HARPREET BACHHER
          </p>

          {/* BOTTOM LINE */}
          <div className="w-[180px] md:w-[300px] h-[1px]  mx-auto mt-12"></div>
        </div>
      </section>

      {/* PARALLAX IMAGE SECTION */}
      <section
        className="
          relative
          h-[45vh]
          md:h-[70vh]
          overflow-hidden
        "
      >
        {/* FIXED BACKGROUND IMAGE */}
        <div
          className="
            absolute
            inset-0
            bg-cover
            bg-center
            bg-fixed
            scale-110
          "
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop')",

            /*
              CONTAIN EFFECT
            */
            backgroundSize: "contain",

            /*
              IMAGE POSITION
            */
            backgroundPosition: "center center",

            /*
              REPEAT REMOVE
            */
            backgroundRepeat: "no-repeat",
          }}
        ></div>

    

        {/* CONTENT */}
        <div
          className="
            relative
            z-10
            h-full
            flex
            items-center
            justify-center
            px-6
          "
        >
          <div className="text-center">
            
            {/* SMALL TITLE */}
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

            {/* MAIN TITLE */}
            <h1
              className="
                text-white
                text-4xl
                sm:text-5xl
                md:text-7xl
                lg:text-8xl
                font-extralight
                tracking-[10px]
                md:tracking-[18px]
                uppercase
              "
            >
              What We Love?
            </h1>

            {/* LINE */}
            <div className="w-[180px] md:w-[260px] h-[1px] mx-auto mt-10"></div>
          </div>
        </div>
      </section>

      {/* SCROLL CONTENT SECTION */}
      <section
        className="
          relative
          z-20
        
          py-20
          md:py-28
          px-6
        "
      >
        <div className="max-w-5xl mx-auto text-center">

          {/* TOP LINE */}
          <div className="w-full h-[1px] mb-16"></div>

          {/* CONTENT */}
          <p
            className="
              text-[#8d8479]
              text-base
              sm:text-lg
              md:text-2xl
              leading-relaxed
              font-light
            "
          >
            We are die-hard, hopeless romantics at heart and,
            photographers by qualification.
          </p>

          <p
            className="
              mt-10
              text-[#8d8479]
              text-base
              sm:text-lg
              md:text-2xl
              leading-relaxed
              font-light
            "
          >
            We love travelling all across the world to film the
            most important day of your life. Narrating your
            wedding story through our lenses is a passion we
            all share as a team.
          </p>
        </div>
      </section>
    </>
  );
};

export default ContainSection;