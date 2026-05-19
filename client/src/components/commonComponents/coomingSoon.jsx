import React from "react";
import { FaClock } from "react-icons/fa";

const ComingSoonCard = ({
  title = "Coming Soon",
  subtitle = "Something beautiful is on the way.",
  image,
}) => {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-sm
        group
        h-[420px]
        w-full
        shadow-xl
        cursor-pointer
      "
    >
      {/* BACKGROUND IMAGE */}
      <div
        className="
          absolute
          inset-0
          bg-cover
          bg-center
          transition-all
          duration-700
          group-hover:scale-110
        "
        style={{
          backgroundImage: `url(${
            image ||
            "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
          })`,
        }}
      ></div>

      {/* DARK OVERLAY */}
      <div
        className="
          absolute
          inset-0
          bg-black/55
          group-hover:bg-black/65
          transition-all
          duration-500
        "
      ></div>

      {/* CONTENT */}
      <div
        className="
          relative
          z-10
          h-full
          flex
          flex-col
          items-center
          justify-center
          text-center
          px-6
        "
      >
        {/* ICON */}
        <div
          className="
            w-16
            h-16
            rounded-full
            border
            border-white/40
            flex
            items-center
            justify-center
            mb-8
            backdrop-blur-sm
          "
        >
          <FaClock className="text-white text-2xl" />
        </div>

        {/* TITLE */}
        <h1
          className="
            text-white
            text-3xl
            md:text-5xl
            tracking-[8px]
            uppercase
            font-extralight
            luxury-title
          "
        >
          {title}
        </h1>

        {/* LINE */}
        <div className="luxury-line mt-8"></div>

        {/* SUBTITLE */}
        <p
          className="
            text-white/90
            text-base
            md:text-xl
            max-w-xl
            mt-8
            leading-relaxed
            luxury-text
          "
        >
          {subtitle}
        </p>

        {/* BADGE */}
        <div
          className="
            mt-10
            border
            border-white/30
            px-6
            py-2
            text-white
            uppercase
            tracking-[4px]
            text-xs
            backdrop-blur-sm
          "
        >
          Launching Soon
        </div>
      </div>
    </div>
  );
};

export default ComingSoonCard;