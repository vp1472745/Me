// ======================================================
// FILE: WeddingFAQ.jsx
// ======================================================

import { useState } from "react";

import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import Navbar from "../homeComponents/navbarHomeComponents";
import FAQHeroSection from "./FAQHeroSection"

const faqData = [

  {
    question:
      "Where is The Wedding Story based? Do you travel worldwide?",

    answer:
      "We are based in Mumbai (India) and Boston (USA), and we travel all across the world to shoot weddings. Some of our best weddings have been shot in locations like Istanbul, Puerto Rico, Barcelona, Dubai, Montreux, Seychelles and Marrakech.",
  },

  {
    question:
      "What is the typical team strength for wedding coverage?",

    answer:
      "We usually work with 3-4 cinematographers, 2-3 photographers along with a director, production manager and drone operator to capture weddings beautifully from multiple angles.",
  },

  {
    question:
      "Do you only provide wedding coverage or planning too?",

    answer:
      "Currently we are only into wedding coverage including photos and films. However, we can suggest some of the best planners and décor teams.",
  },

  {
    question:
      "Can we hire additional photographers or videographers?",

    answer:
      "We generally do not recommend it because multiple teams can obstruct frames and affect the cinematic experience of the final film.",
  },

  {
    question:
      "What additional costs should we keep in mind?",

    answer:
      "Travel, food, accommodation and hard drives for delivery are usually borne by the client unless already included in the package.",
  },

  {
    question:
      "What is a pre-wedding shoot?",

    answer:
      "A pre-wedding shoot is a romantic photo/video session before the wedding where couples spend relaxed time together creating memorable visuals for films and social media.",
  },

  {
    question:
      "Can we book only a pre-wedding shoot?",

    answer:
      "We usually undertake pre-wedding shoots only for clients whose weddings we are commissioned to film.",
  },

  {
    question:
      "What deliverables are included in the package?",

    answer:
      "The package includes trailers, highlight films, full wedding films and edited photographs delivered digitally and on hard drives.",
  },

  {
    question:
      "Can we choose only photography or only videography?",

    answer:
      "We usually recommend both together for perfect coordination between teams and seamless storytelling.",
  },

  {
    question:
      "How many photographs will we receive?",

    answer:
      "Typically around 3000-4500 edited high-resolution images are delivered for a 3-day wedding.",
  },

  {
    question:
      "Can you create customized music tracks for our film?",

    answer:
      "Yes. We love creating customized music tracks based on your personality and story as a couple.",
  },

  {
    question:
      "Do you provide Instagram teaser edits?",

    answer:
      "Yes, we create short cinematic Instagram edits called Cold Coffee Instacuts for selected weddings.",
  },

  {
    question:
      "Do you design albums or coffee table books?",

    answer:
      "We can recommend premium album designers and printers for beautiful wedding albums.",
  },

  {
    question:
      "Can you create same day edits for the reception?",

    answer:
      "Yes. Same Day Edits are available and are showcased during wedding events or receptions.",
  },

  {
    question:
      "Who coordinates with us during the wedding?",

    answer:
      "The Wedding Director or Director of Photography remains the primary point of contact throughout the events.",
  },

  {
    question:
      "What lighting setup is ideal for best wedding photos?",

    answer:
      "Natural lighting and well-lit stages are extremely important for cinematic visuals and stunning portraits.",
  },

  {
    question:
      "What are audio bytes in wedding films?",

    answer:
      "Audio bytes are emotional interviews and conversations recorded with couples and families that help create a strong story narrative.",
  },

  {
    question:
      "Can highlight films be shared on social media?",

    answer:
      "Trailers are often shared publicly while highlight films are generally password protected unless clients approve public release.",
  },

  {
    question:
      "Can we see RAW footage before editing?",

    answer:
      "No. Due to the huge amount of footage and editing workflow, raw footage selection is handled entirely by our creative team.",
  },

  {
    question:
      "How long does delivery usually take?",

    answer:
      "Wedding films usually take around 75-95 days because editing is a detailed and highly creative process.",
  },

];

const WeddingFAQ = () => {

  const [openIndex,
    setOpenIndex] =
    useState(0);

  const toggleFAQ = (index) => {

    if (openIndex === index) {

      setOpenIndex(null);

    } else {

      setOpenIndex(index);
    }
  };

  return (

  <>
< Navbar textColor="text-black/50" />
<FAQHeroSection />

    <div className="min-h-screen  py-16 px-4 md:px-10">

      {/* ======================================================
          HEADER
      ====================================================== */}
        {/* Header */}
        <div className="text-center mb-12 ">
          <div className="border-t border-[#cfc6bb] w-full max-w-4xl mx-auto"></div>
          <h1 className="text-4xl md:text-3xl font-light tracking-[8px] text-[#6f655d] mt-6 px-2">
            FREQUENTLY ASKED QUESTIONS
          </h1>
          <p className="text-[#b1a79d] italic mt-3 text-xl max-w-2xl mx-auto px-3">
            “ The Beauty lies in the Details”
          </p>
          <div className="border-b border-[#cfc6bb] w-full max-w-4xl mx-auto mt-6"></div>
        </div>


      {/* ======================================================
          FAQ CONTAINER
      ====================================================== */}

      <div className="max-w-5xl mx-auto space-y-5">

        {faqData.map(
          (faq, index) => (

            <div
              key={index}
              className="bg-white rounded-[30px] overflow-hidden shadow-sm border border-[#ddd4ca]"
            >

              {/* QUESTION */}

              <button
                onClick={() =>
                  toggleFAQ(index)
                }
                className="w-full flex items-center justify-between gap-5 px-6 md:px-10 py-5 text-left"
              >

                <h2 className="text-lg md:text-2xl text-[#3d3128] font-light leading-10">

                  {faq.question}

                </h2>

                <div className="min-w-12.5 min-h-12.5 rounded-full flex items-center justify-center">

                  {openIndex ===
                  index ? (

                    <ChevronUp
                      size={24}
                      className="text-[#3d3128]"
                    />

                  ) : (

                    <ChevronDown
                      size={24}
                      className="text-[#3d3128]"
                    />
                  )}

                </div>

              </button>

              {/* ANSWER */}

              <div
                className={`transition-all duration-500 overflow-hidden ${
                  openIndex === index
                    ? "max-h-250 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >

                <div className="px-6 md:px-10 pb-8">

                  <div className="w-full h-px mb-6" />

                  <p className="text-[#6b5c50] text-lg leading-9.5 font-light">

                    {faq.answer}

                  </p>

                </div>

              </div>

            </div>
          )
        )}

      </div>

    </div>
  </>
  );
};

export default WeddingFAQ;