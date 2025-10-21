import { useEffect, useRef } from 'react';
import { Sparkles, BookOpen, Users } from 'lucide-react';

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
          className="absolute top-0 -left-4 md:w-96 md:h-96 w-72 h-72 bg-red-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 md:opacity-15 "></div>
        <div
          ref={(ref) => (blobRefs.current[1] = ref)}
          className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 md:opacity-15 hidden sm:block"></div>
        <div
          ref={(ref) => (blobRefs.current[2] = ref)}
          className="absolute -bottom-8 left-[-40%] md:left-20 w-96 h-96 bg-red-700 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 md:opacity-15 "></div>
          <div
          ref={(ref) => (blobRefs.current[3] = ref)}
          className="absolute -bottom-10 right-20 w-96 h-96 bg-gray-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 md:opacity-10 hidden sm:block"></div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </div>
  )
}

const Home = () => {
  const handleExplore = () => {
    window.location.href = '/features';
  };

  const handleAuth = () => {
    window.location.href = '/auth';
  };

  const handleInspiration = () => {
    window.location.href = '#Inspiration';
  };

  return (
  <div id="home" className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <AnimatedBackground />

      {/* Hero Section */}
      <div className="text-center z-10 relative max-w-5xl mx-auto px-[5%] py-20">
        <div className="inline-block relative group mb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-gray-200">
            Smart Bus RFID — Contactless Payments for Public Transport
          </h1>
        </div>

        <p 
          className="mt-6 text-gray-100 max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl font-light flex items-center justify-center gap-2 mb-12 drop-shadow-lg"
        >
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 drop-shadow-md" />
          Fast tap-in/tap-out payments, live validations, and easy top-ups
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 drop-shadow-md" />
        </p>

        <p 
          className="text-gray-400 max-w-4xl mx-auto text-base md:text-lg mb-12"
        >
          Manage fleet validations, rider balances, and transaction history from a centralized dashboard — designed for transit operators and commuters.
        </p>

        {/* Call-to-action buttons */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6 mb-16">
          <button 
            onClick={handleExplore}
            className="
              w-full lg:w-auto px-8 py-4 md:px-12 md:py-5 text-lg md:text-xl font-semibold text-white
              bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-800 hover:from-cyan-600 hover:via-cyan-700 hover:to-cyan-900
              rounded-lg shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105
              relative overflow-hidden group
            "
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-800 rounded-lg blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-lg">
              <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
              Explore Features
            </span>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>
          </button>

          <button 
            onClick={handleAuth}
            type="button"
            className="
              w-full lg:w-auto px-8 py-4 md:px-12 md:py-5 text-lg md:text-xl font-medium 
              rounded-lg border-2 border-gray-400 bg-gradient-to-br from-gray-800/50 to-gray-900/50 text-gray-100 shadow-lg 
              hover:bg-gradient-to-br hover:from-gray-700/60 hover:to-gray-800/60 hover:border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-gray-400/50
              disabled:opacity-50 disabled:pointer-events-none
              transition-all duration-300 hover:scale-105 backdrop-blur-sm
            "
          >
            <Users className="w-5 h-5 md:w-6 md:h-6 inline mr-2 drop-shadow-sm" />
            <span className="drop-shadow-sm">Sign In / Tap Wallet</span>
          </button>
        </div>

        {/* Additional CTA for Inspiration Page */}
        <div className="text-center mt-12">
          <button 
            onClick={handleInspiration}
            className="px-6 py-3 bg-gradient-to-br from-cyan-600 via-cyan-700 to-cyan-800 hover:from-cyan-700 hover:via-cyan-800 hover:to-cyan-900 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-cyan-500/30"
          >
            <span className="drop-shadow-sm">Discover Inspiring Stories</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .gradient-border {
          position: relative;
          border: double 3px transparent;
          border-radius: 20px;
          background-image: linear-gradient(#1f2937, #1f2937), 
                            linear-gradient(to right, #06b6d4, #0891b2);
          background-origin: border-box;
          background-clip: content-box, border-box;
        }
      `}</style>
    </div>
  );
};

export default Home;