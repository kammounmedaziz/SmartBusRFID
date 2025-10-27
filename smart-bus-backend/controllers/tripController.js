import tripModel from '../models/tripModel.js';
import ticketModel from '../models/ticketModel.js';
import cardModel from '../models/cardModel.js';
import transactionModel from '../models/transactionModel.js';
import esp32Service from '../services/esp32SerialService.js';

/**
 * Get all trips
 */
export const getAllTrips = async (req, res) => {
  try {
    const trips = await tripModel.getAll();
    res.json({ success: true, trips });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trips' });
  }
};

/**
 * Get available cities
 */
export const getCities = async (req, res) => {
  try {
    const cities = await tripModel.getCities();
    res.json({ success: true, cities });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cities' });
  }
};

/**
 * Get trips by route
 */
export const getTripsByRoute = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing from or to city' 
      });
    }

    const trips = await tripModel.getByRoute(from, to);
    res.json({ success: true, trips });
  } catch (error) {
    console.error('Error fetching trips by route:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trips' });
  }
};

/**
 * Book ticket with card payment (no login required)
 */
export const bookGuestTicket = async (req, res) => {
  try {
    const { tripId, travelDate, passengerName, passengerPhone, timeout = 30000 } = req.body;

    // Validate required fields
    if (!tripId || !travelDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: tripId, travelDate' 
      });
    }

    // Get trip details
    const trip = await tripModel.getById(tripId);
    if (!trip) {
      return res.status(404).json({ 
        success: false, 
        message: 'Trip not found' 
      });
    }

    // Check if trip is full
    if (trip.available_seats <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Trip is full. No seats available.' 
      });
    }

    // Check ESP32 connection
    if (!esp32Service.isConnected) {
      return res.status(503).json({ 
        success: false, 
        message: 'ESP32 card reader not connected' 
      });
    }

    // Exit any existing registration mode first
    if (esp32Service.registrationMode) {
      console.log('⚠️  Clearing existing registration mode...');
      esp32Service.exitRegistrationMode();
    }

    // Enter registration mode to scan card
    console.log('\n🎫 Starting guest ticket booking - waiting for card scan...');
    
    let cardUid;
    try {
      cardUid = await esp32Service.enterRegistrationMode(timeout);
      console.log('✅ Card scanned:', cardUid);
    } catch (error) {
      if (error.message === 'Registration timeout') {
        return res.status(408).json({ 
          success: false, 
          message: 'Card scan timeout. Please try again.' 
        });
      }
      throw error;
    }

    // Get card from database
    const card = await cardModel.findByUid(cardUid);
    if (!card) {
      return res.status(404).json({ 
        success: false, 
        message: 'Card not found. Please register your card first.' 
      });
    }

    // Check card status
    if (card.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Card is blocked. Please contact support.' 
      });
    }

    // Check card balance
    if (parseFloat(card.balance) < parseFloat(trip.price)) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient balance. Required: ${trip.price} TND, Available: ${card.balance} TND` 
      });
    }

    // Deduct amount from card
    const newBalance = parseFloat(card.balance) - parseFloat(trip.price);
    await cardModel.updateBalanceByUid(cardUid, newBalance);

    // Debug: Log card object to verify id field
    console.log('🔍 Card object before transaction:', {
      id: card.id,
      uid: card.uid,
      balance: card.balance,
      fullCard: card
    });

    // Create transaction - NOTE: transaction model uses card_id (underscore) not cardId (camelCase)
    await transactionModel.create({
      card_id: card.id,  // Fixed: was cardId, now card_id to match model
      amount: -trip.price,
      type: 'payment',
      description: `Ticket: ${trip.from_city} → ${trip.to_city}`
    });

    // Create ticket
    const ticket = await ticketModel.create({
      tripId: trip.id,
      cardUid: cardUid,
      passengerName,
      passengerPhone,
      travelDate,
      amountPaid: trip.price
    });

    // Update available seats
    await tripModel.updateSeats(trip.id, trip.available_seats - 1);

    // Get full ticket details
    const fullTicket = await ticketModel.getByTicketNumber(ticket.ticketNumber);

    console.log('✅ Ticket booked successfully:', ticket.ticketNumber);

    res.json({ 
      success: true, 
      message: 'Ticket booked successfully',
      ticket: fullTicket,
      newBalance,
      cardUid
    });

  } catch (error) {
    console.error('Error booking guest ticket:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to book ticket: ' + error.message 
    });
  }
};

/**
 * Scan card for guest booking (returns UID and card info)
 */
export const scanCardForGuest = async (req, res) => {
  try {
    const { timeout = 30000 } = req.body;

    // Check ESP32 connection
    if (!esp32Service.isConnected) {
      return res.status(503).json({ 
        success: false, 
        message: 'ESP32 card reader not connected' 
      });
    }

    // Check if already scanning
    if (esp32Service.registrationMode) {
      return res.status(409).json({ 
        success: false, 
        message: 'Card scan already in progress' 
      });
    }

    console.log('\n🎴 Scanning card for guest booking...');
    
    let cardUid;
    try {
      cardUid = await esp32Service.enterRegistrationMode(timeout);
      console.log('✅ Card scanned:', cardUid);
    } catch (error) {
      if (error.message === 'Registration timeout') {
        return res.status(408).json({ 
          success: false, 
          message: 'Card scan timeout. Please try again.' 
        });
      }
      throw error;
    }

    // Get card details
    const card = await cardModel.findByUid(cardUid);
    if (!card) {
      return res.status(404).json({ 
        success: false, 
        message: 'Card not found. Please register your card first.',
        cardUid
      });
    }

    // Check card status
    if (card.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Card is blocked. Please contact support.',
        cardUid
      });
    }

    res.json({ 
      success: true, 
      cardUid,
      balance: card.balance,
      status: card.status
    });

  } catch (error) {
    console.error('Error scanning card:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to scan card: ' + error.message 
    });
  }
};

/**
 * Get ticket by ticket number
 */
export const getTicketByNumber = async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    
    const ticket = await ticketModel.getByTicketNumber(ticketNumber);
    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ticket not found' 
      });
    }

    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch ticket' });
  }
};
