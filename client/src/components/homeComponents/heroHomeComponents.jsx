
import "../../css/heroHoneComponents.css";
import Footer from "../../components/homeComponents/footerHomeComponents";
import HeroImage from "../../assets/herosection/girls.jpg"
import WhatWeLove from "../../assets/whatWeLove/firstImage.jpg"
import WhatWeBelive from "../../assets/whatWeBelieve/firstImage.jpg"
import WhatWeDo from "../../assets/whatWeDo/firstImage.jpg"

const HeroSection = () => {
  return (
    <>
      {/* Hero  Section  */}
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
          backgroundImage: `url(${HeroImage})`,
          backgroundPosition: "center 35%",
        }}
      >
 

        {/* CONTENT */}
        <div className="relative z-10 text-center px-6">
          {/* TITLE */}
          <h1
            className="
        luxury-title
        text-white
        text-2xl
        md:text-2xl
  md:mt-65
      "
          >
            Welcome
          </h1>

          {/* LINE */}
          <div className="luxury-line"></div>

          {/* TEXT */}
          <p className="luxury-text text-white text-lg md:text-1xl max-w-5xl mx-auto">
            Imagine waking up to a job that lifts you up and transports you to a
            different world.
          </p>

          <p className="luxury-text text-white/90 text-base md:text-xl  max-w-6xl mx-auto">
            A world populated with a billion heartfelt feelings and stories
            etched ceremoniously in magic, love and joie de vivre.
          </p>

          <p className="luxury-text text-white/90 text-base md:text-xl  max-w-6xl mx-auto">
            Perfect with its Disney-like happy endings, sworn vows and the
            promises of forever.
          </p>

          <p className="luxury-text text-white text-lg md:text-2xl max-w-5xl mx-auto">
            This is our world. The Wedding Story world!
          </p>

          <div className="luxury-line"></div>
        </div>
      </section>

      <section className=" py-10 px-6">
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
          h-[25vh]
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
            `url(${WhatWeLove})`,
             backgroundPosition: "center 30%",
        }}
      >


        {/* CONTENT */}
        <div className="relative z-10 text-center px-6">


          <h1
            className="
              luxury-title
              text-white
              text-lg
              sm:text-1xl
              md:text-2xl
              font-semibold
            "
          >
            What We Love?
          </h1>

    
        </div>
      </section>

      {/* Content Section */}
      <section className="section-content">
        <div className="max-w-5xl mx-auto text-center">
          <div className="section-divider"></div>
          
          <p className="section-text">
            We are die-hard, hopeless romantics at heart and, photographers by
            qualification.
          </p>

          <p className="section-text ">
            We love travelling all across the world to film the most important
            day of your life. Narrating your wedding story through our lenses is
            a passion we all share as a team.
          </p>
          <div className="section-divider"></div>
        </div>
      </section>

      {/* What We Believe? */}
      <section
        className="
          relative
          h-[25vh]
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
            `url(${WhatWeBelive})`,
             backgroundPosition: "center 35%",
        }}
      >
    

        {/* CONTENT */}
        <div className="relative z-10 text-center px-6">


          <h1
            className="
              luxury-title
              text-white
              text-lg
              sm:text-1xl
              md:text-2xl
            "
          >
            What We Believe?
          </h1>

         
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

          <div className="section-divider"></div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section
        className="
          relative
          h-[25vh]
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
            `url(${WhatWeDo})`,
             backgroundPosition: "center 35%",
        }}
      >


        {/* CONTENT */}
        <div className="relative z-10 text-center px-6">


          <h1
            className="
              luxury-title
              text-white
              text-lg
              sm:text-1xl
              md:text-3xl
            "
          >
            What We Do?
          </h1>

   
        </div>
      </section>

      {/* CONTENT */}
      <section className="section-content">
        <div className="max-w-5xl mx-auto text-center">
          <div className="section-divider"></div>
          <p className="section-text">
            We document handpicked elements and moments that are packed with
            love to render your wedding film as illustrious as a contemporary
            cinematic record.
          </p>

          <p className="section-text ">
            The footage is edited meticulously to provide you with an
            everlasting treasured testament of your dream story.
          </p>
          <div className="section-divider"></div></div>
      </section>


      {/* footer */}
      <Footer />
    </>
  );
};

export default HeroSection;
