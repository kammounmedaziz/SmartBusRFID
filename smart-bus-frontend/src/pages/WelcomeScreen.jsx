import  { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import AOS from 'aos';
import 'aos/dist/aos.css';

const TypewriterEffect = ({ text }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 260);
    
    return () => clearInterval(timer);
  }, [text]);

  return (
    <span className="inline-block">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const BackgroundEffect = () => (
  <div className="absolute inset-0 overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 to-cyan-400/10 blur-3xl animate-pulse" />
  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/8 via-transparent to-cyan-400/8 blur-2xl animate-float" />
  </div>
);

const IconButton = ({ Icon }) => (
  <div className="relative group hover:scale-110 transition-transform duration-300">
  <div className="absolute -inset-2 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full blur opacity-30 group-hover:opacity-75 transition duration-300" />
    <div className="relative p-2 sm:p-3 bg-black/50 backdrop-blur-sm rounded-full border border-white/10">
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
    </div>
  </div>
);

const WelcomeScreen = ({ onLoadingComplete }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: false,
    });

    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => {
        onLoadingComplete?.();
      }, 1000);
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  const containerVariants = {
    exit: {
      opacity: 0,
      scale: 1.1,
      filter: "blur(10px)",
      transition: {
        duration: 0.8,
        ease: "easeInOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const childVariants = {
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 bg-[#030014]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit="exit"
          variants={containerVariants}
        >
          <BackgroundEffect />
          
          <div className="relative min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-4xl mx-auto">
              

              {/* Welcome Text */}
              <motion.div 
                className="text-center mb-6 sm:mb-8 md:mb-12"
                variants={childVariants}
              >
                <div>
                    <img data-aos="fade-in" 
                      data-aos-delay="800" 
                      className="inline-block px-2 bg-gradient-to-r from-cyan-600 to-cyan-400 bg-clip-text text-transparent"
                      src="src/assets/media/Welcome to.png" 
                      alt="Welcome"
                      loading="lazy"
                      />

                  </div>
                  <div>
                    <img data-aos="fade-up" 
                      data-aos-delay="800" 
                      className="inline-block px-2 bg-gradient-to-r from-cyan-600 to-cyan-400 bg-clip-text text-transparent"
                      src="src/assets/media/side logo.png" 
                      alt="Smart Bus RFID Logo"
                      loading="lazy"
                      />

                  </div>

              </motion.div>

              {/* Website Link */}
              <motion.div 
                className="text-center"
                variants={childVariants}
                data-aos="fade-up"
                data-aos-delay="1200"
              >
                
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;