import { memo } from "react";
import PropTypes from 'prop-types';
import { ShieldCheck, Radio, Map, Users, ClipboardList, Wrench, Server } from "lucide-react";


const Header = memo(() => (
  <div className="text-center lg:mb-8 mb-2 px-[5%]">
  <h2 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-gray-200">
      About Smart Bus RFID
    </h2>
    <p className="text-gray-400 mt-3 max-w-3xl mx-auto">
      A modern, secure fare collection and validation system for public transport.
    </p>
  </div>
));
Header.displayName = "Header";
const ProfileImage = memo(() => (
  <div className="flex justify-center items-center p-0 py-2">
    <div className="relative group">
      <div className="relative">
        <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(220,38,38,0.3)]">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-cyan-400/10 to-transparent" />
          <div className="absolute inset-0 border-4 border-white/10 rounded-2xl" />
          <div className="w-full h-full flex items-center justify-center bg-gray-900/40">
            <BusGlyph />
          </div>
        </div>
      </div>
    </div>
  </div>
));
ProfileImage.displayName = "ProfileImage";


const AboutPage = () => {
  return (
    <div id="about" className="h-auto pb-[10%] text-white overflow-hidden px-[5%] sm:px-[5%] lg:px-[10%] mt-10">
      <Header />

      <div className="w-full mx-auto pt-8 sm:pt-12 relative">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed">
              Smart Bus RFID brings contactless fare collection to buses. Riders tap their RFID card to a reader; the system validates balance, logs the trip, and updates dashboards in real-time. Roles include Admin (system management), Conductor (onboard validation), and Passenger (commuter profile and balance).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Info icon={Users} title="Roles" text="Admin, Conductor, Passenger" />
              <Info icon={ShieldCheck} title="Security" text="JWT auth, role-based access" />
              <Info icon={Radio} title="Live Sync" text="Instant validation feedback" />
              <Info icon={Map} title="Operations" text="Routes, trips, stops analytics" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <Badge icon={ClipboardList} label="Card Management" />
              <Badge icon={Wrench} label="Terminal Setup" />
              <Badge icon={Server} label="API Backend" />
            </div>
          </div>

          <ProfileImage />
        </div>

        <div className="mt-16 flex items-center justify-center gap-8 text-gray-500">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-cyan-500" />
          <div className="w-2 h-2 bg-cyan-500 rounded-full" />
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-cyan-500" />
        </div>
      </div>
    </div>
  );
};

const Info = ({ icon: Icon, title, text }) => (
  <div className="backdrop-blur-lg bg-gray-900/40 rounded-2xl p-5 shadow-xl border border-gray-700/60">
    <div className="flex items-center gap-3 mb-1">
  <Icon className="w-6 h-6 text-cyan-400" />
      <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
    </div>
    <p className="text-gray-400 text-sm">{text}</p>
  </div>
);

Info.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

const Badge = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800/60 border border-gray-700/60 text-gray-300 w-full justify-center">
  <Icon className="w-4 h-4 text-cyan-400" />
    <span className="text-sm">{label}</span>
  </div>
);

Badge.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
};

const BusGlyph = () => (
  <svg width="160" height="160" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    {/* Main bus body */}
    <rect x="2" y="5" width="20" height="10" rx="2" ry="2" fill="#083344" />
    {/* Passenger window area - cyan */}
    <rect x="3" y="6" width="12" height="6" rx="1" ry="1" fill="#06b6d4" />
    {/* Wheels - lighter cyan */}
    <circle cx="7" cy="17" r="2" fill="#22d3ee" />
    <circle cx="17" cy="17" r="2" fill="#22d3ee" />
    {/* Door */}
    <rect x="16" y="6" width="5" height="6" rx="1" ry="1" fill="#94a3b8" />
  </svg>
);

const MemoAboutPage = memo(AboutPage);
export default MemoAboutPage;