import React from "react";
import { GlobeIcon } from "@radix-ui/react-icons";
import { BsFacebook, BsGithub, BsInstagram, BsLinkedin } from "react-icons/bs";

const Footer = () => {
  return (
  <footer className="px-8 py-10 md:px-20 md:py-16 bg-[#041018] text-[#cffafe]">
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
        {/* Logo */}
        <div className="lg:col-span-2 flex justify-center lg:justify-start items-center">
          <img
            src="/src/assets/media/logo.png"
            alt="Smart Bus RFID Logo"
            className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 object-contain filter hue-rotate-150 saturate-150 brightness-95"
          />
        </div>

        {/* Features Section */}
        <div className="flex flex-col">
          <h4 className="font-semibold text-white mb-4 text-lg">Product</h4>
          <ul className="space-y-3 text-gray-400">
            <li className="hover:text-white transition-colors cursor-pointer">RFID Card Wallet</li>
            <li className="hover:text-white transition-colors cursor-pointer">Top-up & Payments</li>
            <li className="hover:text-white transition-colors cursor-pointer">Live Validation</li>
          </ul>
        </div>

        {/* Our Vision & Connect Combined */}
        <div className="flex flex-col space-y-8">
          <div>
            <h4 className="font-semibold text-white mb-4 text-lg">Company</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="hover:text-white transition-colors cursor-pointer">About Smart Bus RFID</li>
              <li className="hover:text-white transition-colors cursor-pointer">Case Studies</li>
              <li className="hover:text-white transition-colors cursor-pointer">Partners</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4 text-lg">Connect</h4>
            <div className="flex space-x-4 text-white">
              <a
                href=""
                aria-label="Facebook"
                className="hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-blue-400/10"
              >
                <BsFacebook className="w-5 h-5" />
              </a>
              <a
                href=""
                aria-label="Instagram"
                className="hover:text-cyan-500 transition-colors p-2 rounded-full hover:bg-cyan-500/10"
              >
                <BsInstagram className="w-5 h-5" />
              </a>
              <a
                href=""
                aria-label="LinkedIn"
                className="hover:text-blue-300 transition-colors p-2 rounded-full hover:bg-blue-300/10"
              >
                <BsLinkedin className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                aria-label="GitHub" 
                className="hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-gray-300/10"
              >
                <BsGithub className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-700 pt-6 mt-10 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 gap-6">
        {/* Legal Info */}
          <div className="text-center md:text-left">
          © {new Date().getFullYear()} Smart Bus RFID ·{" "}
          <a href="#" className="underline hover:text-white transition-colors">
            Privacy
          </a>{" "}
          ·{" "}
          <a href="#" className="underline hover:text-white transition-colors">
            Terms
          </a>{" "}
          ·{" "}
          <a href="#" className="underline hover:text-white transition-colors">
            Sitemap
          </a>
        </div>

      
      </div>
    </footer>
  );
};

export default Footer;