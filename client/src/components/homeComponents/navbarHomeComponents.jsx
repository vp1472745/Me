
import Logo from "../../assets/Logo.webp"
const Navbar = () => {
  return (
    <nav className="w-full bg-[#f4f1eb] border-b border-gray-200">
      
      <div className="max-w-[1920px] mx-auto flex items-center justify-between px-6 lg:px-16 py-6">
        
        {/* LOGO */}
        <div className="flex items-center">
          <img
            src={Logo}
            alt="logo"
            className="w-[125px] lg:w-[150px] object-contain"
          />
        </div>

        {/* MENU */}
        <ul className="hidden lg:flex items-center gap-5 text-[10px] font-semibold tracking-[3px] uppercase text-[#2f2f2f] ">
          <li className="cursor-pointer hover:opacity-70 transition duration-300">
            Stories
          </li>

          <li className="cursor-pointer hover:opacity-70 transition duration-300">
            Photobooks
          </li>

          <li className="cursor-pointer hover:opacity-70 transition duration-300">
            Images
          </li>

          <li className="cursor-pointer hover:opacity-70 transition duration-300">
            Films
          </li>

          <li className="cursor-pointer hover:opacity-70 transition duration-300">
            Pre-Weddings
          </li>

          <li className="cursor-pointer hover:opacity-70 transition duration-300">
            Music
          </li>

          <li className="cursor-pointer hover:opacity-70 transition duration-300">
            FAQ
          </li>

          <li className="cursor-pointer hover:opacity-70 transition duration-300">
            Contact
          </li>
        </ul>

        {/* MOBILE MENU ICON */}
        <div className="lg:hidden">
          <button className="text-3xl text-[#2f2f2f]">
            ☰
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;