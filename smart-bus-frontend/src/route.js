import { Routes, Route } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import Signup from './Pages/signup';

export default function AppRoutes({ showWelcome, setShowWelcome }) {
  return (
    <Routes>
      <Route path="/" element={<LandingPage showWelcome={showWelcome} setShowWelcome={setShowWelcome} />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}
