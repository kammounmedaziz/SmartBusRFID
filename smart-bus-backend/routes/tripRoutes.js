import express from 'express';
import { 
  getAllTrips, 
  getCities, 
  getTripsByRoute, 
  bookGuestTicket,
  scanCardForGuest,
  getTicketByNumber
} from '../controllers/tripController.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/trips/cities', getCities);
router.get('/trips', getAllTrips);
router.get('/trips/route', getTripsByRoute);
router.get('/trips/search', getTripsByRoute); // Keep old route for compatibility
router.post('/tickets/scan-card', scanCardForGuest);
router.post('/tickets/book-guest', bookGuestTicket);
router.get('/tickets/:ticketNumber', getTicketByNumber);

export default router;
