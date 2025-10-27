import db from '../config/db.js';

const ticketModel = {
  /**
   * Generate unique ticket number
   */
  generateTicketNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TKT${year}${month}${day}${random}`;
  },

  /**
   * Create a new ticket
   */
  async create(ticketData) {
    const ticketNumber = this.generateTicketNumber();
    const [result] = await db.execute(
      `INSERT INTO tickets 
       (ticket_number, trip_id, card_uid, passenger_name, passenger_phone, 
        travel_date, amount_paid, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'booked')`,
      [
        ticketNumber,
        ticketData.tripId,
        ticketData.cardUid,
        ticketData.passengerName || null,
        ticketData.passengerPhone || null,
        ticketData.travelDate,
        ticketData.amountPaid
      ]
    );
    
    return {
      id: result.insertId,
      ticketNumber
    };
  },

  /**
   * Get ticket by ticket number
   */
  async getByTicketNumber(ticketNumber) {
    const [rows] = await db.execute(
      `SELECT t.*, 
              tr.from_city, tr.to_city, tr.departure_time, tr.arrival_time, 
              tr.bus_type, tr.duration_minutes
       FROM tickets t
       JOIN trips tr ON t.trip_id = tr.id
       WHERE t.ticket_number = ?`,
      [ticketNumber]
    );
    return rows[0];
  },

  /**
   * Get tickets by card UID
   */
  async getByCardUid(cardUid) {
    const [rows] = await db.execute(
      `SELECT t.*, 
              tr.from_city, tr.to_city, tr.departure_time, tr.arrival_time, 
              tr.bus_type
       FROM tickets t
       JOIN trips tr ON t.trip_id = tr.id
       WHERE t.card_uid = ?
       ORDER BY t.purchase_date DESC`,
      [cardUid]
    );
    return rows;
  },

  /**
   * Validate ticket (mark as used)
   */
  async validate(ticketNumber, controllerId) {
    await db.execute(
      `UPDATE tickets 
       SET status = 'used', validation_time = NOW(), validated_by = ?
       WHERE ticket_number = ?`,
      [controllerId, ticketNumber]
    );
  },

  /**
   * Cancel ticket
   */
  async cancel(ticketNumber) {
    await db.execute(
      `UPDATE tickets SET status = 'cancelled' WHERE ticket_number = ?`,
      [ticketNumber]
    );
  }
};

export default ticketModel;
