import {
  FaInstagram,
  FaYoutube,
  FaFacebookF,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className=" py-16">
      
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center">

        {/* ICONS */}
        <div className="flex items-center gap-8">

          {/* INSTAGRAM */}
          <a
            href="#"
            className="
              text-[#2d2d2d]
              text-[30px]
              transition-all
              duration-300
              hover:opacity-70
            "
          >
            <FaInstagram />
          </a>

          {/* YOUTUBE */}
          <a
            href="#"
            className="
              text-[#2d2d2d]
              text-[30px]
              transition-all
              duration-300
              hover:opacity-70
            "
          >
            <FaYoutube />
          </a>

          {/* FACEBOOK */}
          <a
            href="#"
            className="
              text-[#2d2d2d]
              text-[30px]
              transition-all
              duration-300
              hover:opacity-70
            "
          >
            <FaFacebookF />
          </a>
        </div>

        {/* COPYRIGHT */}
        <p
          className="
            mt-5
            text-[#8d8479]
            text-sm
            md:text-lg
            font-light
            tracking-wide
          "
        >
          The Wedding Story © 2023
        </p>
      </div>
    </footer>
  );
};

export default Footer;