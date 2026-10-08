// ===============================================
// FILE: ContactPage.jsx
// ===============================================

import React, { useState } from "react";
import Navbar from "../../../components/layout/Navbar";
import FounderImage from "../../../assets/founder.jpg";
import CoFounderImage from "../../../assets/cofounder.jpg";
import { toast } from "react-toastify";

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Thank you for reaching out! Our team will get back to you shortly.");
  };

  return (
    <>
      <Navbar textColor="text-black/50" />
      <div className="w-full text-[#8d8175] min-h-screen md:py-30 py-25 px-4 md:px-10">
        
        {/* TOP SECTION */}
        <div className="max-w-6xl mx-auto px-6 pt-5 pb-10">
          
          <div className="border-t border-[#c9c1b7] pt-8">
            <h1 className="text-center tracking-[10px] text-[30px] md:text-[30px] font-semibold uppercase">
              Contact Us
            </h1>
          </div>

          <div className="border-t border-[#c9c1b7] mt-10 pt-10">
            <div className="max-w-4xl mx-auto text-center leading-8 text-[15px]">
              
              <p className="mb-6">
                We love making films and are honoured to be considered by you to
                document your wedding story for posterity.
              </p>

              <p className="mb-6">
                This website best showcases our work - every film, every image and
                every song here represents who we are and what we stand for.
              </p>

              <p className="mb-6">
                If you would like your wedding story to be filmed by us, grab a
                cup of coffee and write in every detail you can think of. Tell us
                your story. This helps us gain insight into your personalities and
                know you better as people.
              </p>

              <p className="mb-6">
                Years later, when you see your films & photographs, not only will
                you begin to relive the priceless moments of these special days
                but also see how beautifully and gracefully your love has matured.
              </p>

              <p className="mb-10">
                We would love to curate this film for you as nothing gives us
                greater pleasure than to make these once-in-a-lifetime films from
                moments that don’t have a second take.
              </p>

              {/* FOUNDER & CO-FOUNDER PROFILES - CLEAN MINIMALIST UI */}
              <div className="mt-14 pt-10 border-t border-[#d8d1c7]/60">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-2xl mx-auto items-center">
                  {/* Founder */}
                  <div className="flex flex-col items-center text-center group">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-[#c9c1b7] shadow-sm mb-4 transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={FounderImage}
                        alt="Harpreet Bachher - Founder"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <h2 className="text-[24px] sm:text-[28px] italic font-light text-[#5a524b]">
                      “Harpreet Bachher”
                    </h2>
                    <p className="tracking-[3px] text-[11px] sm:text-xs mt-2 uppercase text-[#8d8175]">
                      Founder & Creative Director
                    </p>
                  </div>

                  {/* Co-Founder */}
                  <div className="flex flex-col items-center text-center group">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-[#c9c1b7] shadow-sm mb-4 transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={CoFounderImage}
                        alt="Co-Founder"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <h2 className="text-[24px] sm:text-[28px] italic font-light text-[#5a524b]">
                      “Gurpreet Bachher”
                    </h2>
                    <p className="tracking-[3px] text-[11px] sm:text-xs mt-2 uppercase text-[#8d8175]">
                      Co-Founder & Producer
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      {/* FORM SECTION */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        
        <div className=" pt-8">
          <p className=" text-[20px]">Mandatory Details</p>

          <div className="border-t border-[#c9c1b7] pt-8"></div>

          <form className="space-y-8" onSubmit={handleSubmit}>

            {/* BRIDE */}
            <div>
              <h3 className="uppercase text-[22px] mb-4 tracking-wide">
                Bride
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm block mb-2">
                    First Name{" "}
                    <span className="text-[#a79b90]">(required)</span>
                  </label>

                  <input
                    type="text"
                    className="w-full h-[52px] border bg-white  border-[#b8b0a8] px-4 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm block mb-2">
                    Last Name{" "}
                    <span className="text-[#a79b90]">(required)</span>
                  </label>

                  <input
                    type="text"
                    className="w-full h-[52px] bg-white border border-[#b8b0a8] px-4 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* GROOM */}
            <div>
              <h3 className="uppercase text-[22px] mb-4 tracking-wide">
                Groom
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm block mb-2">
                    First Name{" "}
                    <span className="text-[#a79b90]">(required)</span>
                  </label>

                  <input
                    type="text"
                    className="w-full h-[52px] bg-white border border-[#b8b0a8] px-4 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm block mb-2">
                    Last Name{" "}
                    <span className="text-[#a79b90]">(required)</span>
                  </label>

                  <input
                    type="text"
                    className="w-full h-[52px] bg-white border border-[#b8b0a8] px-4 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* WEDDING DATE */}
            <div>
              <label className="uppercase text-[20px] block mb-3">
                Your Wedding Dates{" "}
                <span className="text-[#a79b90] text-sm">(required)</span>
              </label>

              <input
                type="text"
                className="w-full h-[52px] bg-white border border-[#b8b0a8] px-4 outline-none"
              />
            </div>

            {/* EVENT DETAILS */}
            <div>
              <label className="uppercase text-[20px] block mb-2">
                Event Details{" "}
                <span className="text-[#a79b90] text-sm">(required)</span>
              </label>

              <p className="text-sm mb-3">
                What are the tentative events / functions / timings per day
              </p>

              <textarea
                rows={5}
                className="w-full border bg-white border-[#b8b0a8] p-4 outline-none resize-none"
              ></textarea>
            </div>

            {/* VENUE */}
            <div>
              <label className="uppercase text-[20px] block mb-2">
                Venue{" "}
                <span className="text-[#a79b90] text-sm">(required)</span>
              </label>

              <p className="text-sm mb-3">
                Please mention the hotel, city & country
              </p>

              <input
                type="text"
                className="w-full h-[52px] bg-white border border-[#b8b0a8] px-4 outline-none"
              />
            </div>

            {/* CONTACT */}
            <div>
              <label className="uppercase text-[20px] block mb-3">
                Contact Number{" "}
                <span className="text-[#a79b90] text-sm">(required)</span>
              </label>

              <input
                type="text"
                className="w-full h-[52px] bg-white border border-[#b8b0a8] px-4 outline-none"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="uppercase text-[20px] block mb-3">
                Your Email{" "}
                <span className="text-[#a79b90] text-sm">(required)</span>
              </label>

              <input
                type="email"
                className="w-full h-[52px] bg-white  border border-[#b8b0a8] px-4 outline-none"
              />
            </div>

            {/* CHECKBOX */}
            <div>
              <label className="uppercase text-[20px] block mb-4">
                How Did You Hear About Us?{" "}
                <span className="text-[#a79b90] text-sm">(required)</span>
              </label>

              <div className="space-y-3">
                {[
                  "Instagram",
                  "Friend's Wedding",
                  "Magazine",
                  "Facebook",
                  "Through a relative / friend",
                ].map((item, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input type="checkbox" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* STORY SECTION */}
            <div className="border-t border-[#bdb4aa] pt-8 mt-10">
              <p className="mb-8 text-[15px]">
                Now that we have all the mandatory details, we are curious to
                know your story!
              </p>

              <div className="space-y-8">

                <div>
                  <label className="uppercase text-[20px] block mb-3">
                    Your Story
                  </label>

                  <textarea
                    rows={5}
                    placeholder="We are sticklers for stories and would love to hear yours! Tell us every little detail - Your first meeting, what was he / she wearing, how did he/she make you feel, what do you love about each other, how did you decide that he/she was the one etc."
                    className="w-full border bg-white border-[#b8b0a8] p-4 outline-none resize-none placeholder:text-[#b7b0a9]"
                  ></textarea>
                </div>

                <div>
                  <label className="uppercase text-[20px] block mb-3">
                    Your Thoughts
                  </label>

                  <textarea
                    rows={5}
                    placeholder="Let us inside your thoughts and tell us what you imagine your wedding film to be like? What kind of photos do you have in mind? Any dream destination or a place which is close to your heart where you would like to do your pre-wedding shoot?"
                    className="w-full border bg-white border-[#b8b0a8] p-4 outline-none resize-none placeholder:text-[#b7b0a9]"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* BUTTON */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="
                  bg-[#5d5a5b]
                  hover:bg-[#4e4b4c]
                  text-white
                  px-16
                  py-4
                  rounded-full
                  tracking-[6px]
                  uppercase
                  transition
                  duration-300
                  mouse:pointer
                "
              >
                Submit
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
</>
  );
};

export default ContactPage;