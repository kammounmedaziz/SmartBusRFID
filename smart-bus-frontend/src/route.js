import { Routes, Route } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import Signup from './Pages/signup';
import GuestBooking from './Pages/booking/GuestBooking';

export default function AppRoutes({ showWelcome, setShowWelcome }) {
  return (
    <Routes>
      <Route path="/" element={<LandingPage showWelcome={showWelcome} setShowWelcome={setShowWelcome} />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/book-ticket" element={<GuestBooking />} />
    </Routes>
  );
}
