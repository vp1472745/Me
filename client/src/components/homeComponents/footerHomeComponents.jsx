import {
  FaInstagram,
  FaYoutube,
  FaFacebookF,
} from "react-icons/fa";
import companyConfig from "../../config/companyConfig";

const Footer = () => {
  return (
    <footer className=" py-16">
      
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center">

        {/* ICONS */}
        <div className="flex items-center gap-8">

          {/* INSTAGRAM */}
          <a
            href={companyConfig.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
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
            href={companyConfig.socials.youtube}
            target="_blank"
            rel="noopener noreferrer"
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
            href={companyConfig.socials.facebook}
            target="_blank"
            rel="noopener noreferrer"
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
          {companyConfig.name} © {companyConfig.established}
        </p>
      </div>
    </footer>
  );
};

export default Footer;