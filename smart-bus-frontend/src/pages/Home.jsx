import { useEffect, useRef } from 'react';
import { Cpu,  Bus, Users,  Sparkles } from 'lucide-react';

const AnimatedBackground = () => {
  const blobRefs = useRef([])
  useEffect(() => {
    const initialPositions = [
      { x: -4, y: 0 },
      { x: -4, y: 0 },
      { x: 20, y: -8 },
      { x: 20, y: -8 },
    ];
    let requestId

    const handleScroll = () => {
      const newScroll = window.pageYOffset

      blobRefs.current.forEach((blob, index) => {
        const initialPos = initialPositions[index]

        // Calculating movement in both X and Y direction
        const xOffset = Math.sin(newScroll / 100 + index * 0.5) * 340 // Horizontal movement
        const yOffset = Math.cos(newScroll / 100 + index * 0.5) * 40 // Vertical movement

        const x = initialPos.x + xOffset
        const y = initialPos.y + yOffset

        // Apply transformation with smooth transition
        blob.style.transform = `translate(${x}px, ${y}px)`
        blob.style.transition = "transform 1.4s ease-out"
      })

      requestId = requestAnimationFrame(handleScroll)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      cancelAnimationFrame(requestId)
    }
  }, [])

  return (
    <div className="fixed inset-0 animated-bg" id="Home">
      <div className="absolute inset-0">
        <div
          ref={(ref) => (blobRefs.current[0] = ref)}
          className="absolute top-0 -left-4 md:w-96 md:h-96 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 md:opacity-15 "></div>
        <div
          ref={(ref) => (blobRefs.current[1] = ref)}
          className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 md:opacity-15 hidden sm:block"></div>
        <div
          ref={(ref) => (blobRefs.current[2] = ref)}
          className="absolute -bottom-8 left-[-40%] md:left-20 w-96 h-96 bg-cyan-700 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 md:opacity-15 "></div>
          <div
          ref={(ref) => (blobRefs.current[3] = ref)}
          className="absolute -bottom-10 right-20 w-96 h-96 bg-gray-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 md:opacity-10 hidden sm:block"></div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </div>
  )
}

const Home = () => {
  const goAuth = () => (window.location.href = '/auth');

  return (
    <div id="home" className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <AnimatedBackground />

      {/* Hero */}
      <div className="text-center z-10 relative max-w-6xl mx-auto px-[5%] py-20">
  <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-400 to-gray-200 drop-shadow-md">
          Smart Bus RFID System
        </h1>
        <p className="mt-6 text-gray-200 max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl font-light flex items-center justify-center gap-2 mb-8">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          Real-time validation, secure payments, and smart analytics for public transport
          <Sparkles className="w-5 h-5 text-cyan-400" />
        </p>
        <p className="text-gray-400 max-w-4xl mx-auto text-base md:text-lg mb-12">
          We digitalize bus fare collection using RFID cards. Tap-in/tap-out is instant and secure, with live monitoring for conductors and actionable dashboards for admins.
        </p>

        
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6">
          <button 
            onClick={goAuth} 
            className="relative w-full lg:w-auto px-8 py-4 md:px-12 md:py-5 rounded-2xl overflow-hidden group transition-all duration-500 hover:scale-105"
          >
            {/* Animated gradient glow background */}
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 opacity-70 blur-xl animate-pulse" />
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Shine effect on hover */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            
            {/* Border glow */}
            <span className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 rounded-2xl opacity-30 blur-md group-hover:opacity-60 transition-opacity duration-300" />
            
            {/* Button content */}
            <span className="relative z-10 flex items-center justify-center gap-3 text-white font-bold text-lg tracking-wide drop-shadow-lg">
              <svg className="w-6 h-6 text-white drop-shadow-md animate-spin-slow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Access Dashboard
              <svg className="w-5 h-5 text-white/90 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
          
          <a 
            href="#about" 
            className="px-8 py-4 md:px-12 md:py-5 text-lg font-medium rounded-2xl border-2 border-gray-500/60 bg-gradient-to-br from-gray-800/50 to-gray-900/50 text-gray-100 shadow-lg hover:bg-gradient-to-br hover:from-gray-700/60 hover:to-gray-800/60 hover:border-gray-400/70 transition-all duration-300 hover:scale-105"
          >
            Learn more
          </a>
        </div>
        
        <style>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }
        `}</style>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Stat icon={Bus} label="Active Buses" value="42" />
          <Stat icon={Users} label="Daily Riders" value="3.4k" />
          <Stat icon={Cpu} label="Validations/min" value="120+" />
        </div>
      </div>
    </div>
  );
};

const Feature = ({ icon: Icon, title, text }) => (
  <div className="backdrop-blur-lg bg-gray-900/40 rounded-2xl p-5 shadow-xl border border-gray-700/60 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
    <div className="flex items-center gap-3 mb-2">
  <Icon className="w-6 h-6 text-cyan-400" />
      <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
    </div>
    <p className="text-gray-400 text-sm">{text}</p>
  </div>
);

const Stat = ({ icon: Icon, label, value }) => (
  <div className="backdrop-blur-lg bg-gray-900/40 rounded-2xl p-6 shadow-xl border border-gray-700/60 text-center">
  <Icon className="w-7 h-7 text-cyan-400 mx-auto mb-2" />
  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-gray-300">{value}</div>
    <div className="text-gray-400 text-sm">{label}</div>
  </div>
);

export default Home;