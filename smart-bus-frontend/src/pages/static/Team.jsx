import React, { useState, useEffect, useRef } from 'react';
import ProfileCard from '../Components/ui/ProfileCard'; // Adjust the import path as needed

import AOS from 'aos';
import 'aos/dist/aos.css';
import { Sparkles } from "lucide-react"

// Animated Background Component (same as Home page)
const AnimatedBackground = () => {
  const blobRefs = useRef([])
  const initialPositions = [
    { x: -4, y: 0 },
    { x: -4, y: 0 },
    { x: 20, y: -8 },
    { x: 20, y: -8 },
  ]

  useEffect(() => {
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
    <div className="fixed inset-0 ">
      <div className="absolute inset-0">
        <div
          ref={(ref) => (blobRefs.current[0] = ref)}
          className="absolute top-0 -left-4 md:w-96 md:h-96 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 md:opacity-20 "></div>
        <div
          ref={(ref) => (blobRefs.current[1] = ref)}
          className="absolute top-0 -right-4 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 md:opacity-20 hidden sm:block"></div>
        <div
          ref={(ref) => (blobRefs.current[2] = ref)}
          className="absolute -bottom-8 left-[-40%] md:left-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 md:opacity-20 "></div>
          <div
          ref={(ref) => (blobRefs.current[3] = ref)}
          className="absolute -bottom-10 right-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 md:opacity-10 hidden sm:block"></div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </div>
  )
}

const Team = () => {
  const [teamImages, setTeamImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Optimized AOS initialization (same as Home page)
  useEffect(() => {
    const initAOS = () => {
      AOS.init({
        once: false, 
      });
    };

    initAOS();
    
    // Debounced resize handler
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initAOS, 250);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  useEffect(() => {
    const loadTeamImages = async () => {
      try {
        setLoading(true);
        
        const imageModules = import.meta.glob('/public/imgs/team/*.{png,jpg,jpeg,webp,gif}');
        
        const imagePromises = Object.entries(imageModules).map(async ([path, importFunc]) => {
          const module = await importFunc();
          const fileName = path.split('/').pop();
          
          return {
            id: fileName,
            avatarUrl: module.default || path,
            path: path
          };
        });

        const images = await Promise.all(imagePromises);
        

        images.sort((a, b) => a.id.localeCompare(b.id));
        
        setTeamImages(images);
      } catch (err) {
        console.error('Error loading team images:', err);
        

        const fallbackImages = [
          { 
            id: '', 
            avatarUrl: '' 
          },
          // { 
          //   id: 'image2.png', 
          //   avatarUrl: '/imgs/team/image2.png' 
          // },
        ];
        
        setTeamImages(fallbackImages);
        setError('Using fallback images. Make sure images are in /public/imgs/team/');
      } finally {
        setLoading(false);
      }
    };

    loadTeamImages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <AnimatedBackground />
        <div className="text-center z-10 relative max-w-5xl mx-auto px-[5%]">
          {/* Header with Home page styling */}
          <div className="inline-block relative group mb-8">
            <h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-gray-200 leading-tight"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              data-aos="zoom-in-up"
              data-aos-duration="600"
            >
              Our Team
            </h1>
          </div>
          
          <p 
            className="mt-4 text-gray-400 max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl font-light flex items-center justify-center gap-2 mb-12"
            data-aos="zoom-in-up"
            data-aos-duration="800"
          >
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
            Meet the team behind Smart Bus RFID
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
          </p>

          {/* Loading spinner */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-600 border-t-[#f1636f] rounded-full animate-spin"></div>
            <p className="text-gray-400 text-lg">Loading team images...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="Team" className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden py-16">
      <AnimatedBackground />

      {/* Main content container */}
      <div className="text-center z-10 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
        {/* Header with matching Home page style */}
        <div className="inline-block relative group mb-8">
          <h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f1636f] to-[#a855f7] leading-tight"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            data-aos="zoom-in-up"
            data-aos-duration="600"
          >
            Our Team
          </h1>
        </div>

        {/* Subtitle with sparkles matching Home page */}
        <p 
          className="mt-4 text-gray-400 max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl font-light flex items-center justify-center gap-2 mb-12"
          data-aos="zoom-in-up"
          data-aos-duration="800"
        >
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[#f1636f]" />
          Meet The Amazing Team Behind Hikma-Learn
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[#f1636f]" />
        </p>

        {/* Error message */}
        {error && (
          <div 
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-8 text-yellow-400"
            data-aos="fade-in"
          >
            <p>{error}</p>
          </div>
        )}

        {/* Team grid */}
        <div className="team-grid">
          {teamImages.map((image) => (
            <div key={image.id} className="team-member">
              <ProfileCard
                avatarUrl={image.avatarUrl}
                className="team-profile-card-small"
                enableTilt={true}
                showBehindGradient={true}
              />
            </div>
          ))}
        </div>

        {/* Empty state */}
        {teamImages.length === 0 && !loading && (
          <div 
            className="text-center py-16"
            data-aos="fade-in"
          >
            <p className="text-gray-400 text-lg">
              No images found. Make sure images are placed in the /public/imgs/team/ folder.
            </p>
          </div>
        )}


        <div 
          className="mt-16"
          data-aos="fade-up"
          data-aos-duration="1200"
        >
          <div className="flex items-center justify-center gap-8 text-gray-500">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#f1636f]"></div>
            <div className="w-2 h-2 bg-[#f1636f] rounded-full animate-pulse"></div>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#a855f7]"></div>
          </div>
        </div>
      </div>


      <style jsx>{`
        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1.5rem;
          row-gap: 0rem;
          justify-items: center;
          align-items: start;
        }

        .team-member {
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.3s ease;
        }

        .team-member:hover {
          transform: translateY(-5px);
        }

        .team-profile-card-small {
          filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.3));
          transform: scale(0.65);
          transform-origin: center;
          transition: transform 0.3s ease;
        }

        .team-profile-card-small:hover {
          transform: scale(0.7);
        }

        @media (max-width: 768px) {
          .team-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 0.5rem;
          }
          
          .team-profile-card-small {
            transform: scale(0.55);
          }

          .team-profile-card-small:hover {
            transform: scale(0.6);
          }
        }

        @media (max-width: 480px) {
          .team-grid {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          }
          
          .team-profile-card-small {
            transform: scale(0.5);
          }

          .team-profile-card-small:hover {
            transform: scale(0.55);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin-slower {
          to { transform: rotate(360deg); }
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        .animate-pulse-slow {
          animation: pulse 3s infinite;
        }
        .animate-spin-slower {
          animation: spin-slower 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Team;