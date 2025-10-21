import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react';
import "./index.css";
import Navbar from "./Components/MainNavbar";
import About from "./Pages/About";
import WelcomeScreen from "./Pages/WelcomeScreen";
import AnimatedBackground from "./Components/Background";
import { AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import AuthPage from './Components/Auth';
import Footer from './Components/Footer';
import Home from './Pages/Home';
import ClientDashboard from './pages/ClientDashboard';


const LandingPage = ({ showWelcome, setShowWelcome }) => {
  return (
    <>
      <AnimatePresence mode="wait">
        {showWelcome && (
          <WelcomeScreen onLoadingComplete={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      {!showWelcome && (
        <div className="relative">
          {/* Background with lower z-index */}
          <div className="absolute inset-0 z-0">
            <AnimatedBackground />
          </div>
          

          <div className="relative z-10">
            <Navbar />
            <Home />
            <About />
            <Footer />
          </div>
        </div>
      )}
    </>
  );
};

LandingPage.propTypes = {
  showWelcome: PropTypes.bool.isRequired,
  setShowWelcome: PropTypes.func.isRequired,
};

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<LandingPage showWelcome={showWelcome} setShowWelcome={setShowWelcome} />}
        />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/client" element={<ClientDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
