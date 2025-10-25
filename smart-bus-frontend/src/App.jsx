import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react';
import "./index.css";
import Navbar from "./Components/ui/MainNavbar";
import About from "./Pages/static/About";
import WelcomeScreen from "./Pages/static/WelcomeScreen";
import AnimatedBackground from "./Components/ui/Background";
import { AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import AuthPage from './Components/auth/Auth';
import Footer from './Components/ui/Footer';
import Home from './Pages/static/HomePage';
import ClientDashboard from './Pages/client/ClientDashboard';
import AdminDashboard from './Pages/admin/AdminDashboard';
import ControllerDashboard from './Pages/controller/ControllerDashboard';
import OperatorDashboard from './Pages/operator/OperatorDashboard';


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
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/controller" element={<ControllerDashboard />} />
        <Route path="/operator" element={<OperatorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
