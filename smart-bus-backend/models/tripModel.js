import db from '../config/db.js';

const tripModel = {
  /**
   * Get all active trips
   */
  async getAll() {
    const [rows] = await db.execute(
      `SELECT * FROM trips WHERE status = 'active' ORDER BY from_city, to_city, departure_time`
    );
    return rows;
  },

  /**
   * Get unique cities (for dropdowns)
   */
  async getCities() {
    const [rows] = await db.execute(
      `SELECT DISTINCT from_city as city FROM trips 
       UNION 
       SELECT DISTINCT to_city as city FROM trips 
       ORDER BY city`
    );
    return rows.map(row => row.city);
  },

  /**
   * Get trips by route
   */
  async getByRoute(fromCity, toCity) {
    const [rows] = await db.execute(
      `SELECT * FROM trips 
       WHERE from_city = ? AND to_city = ? AND status = 'active'
       ORDER BY departure_time`,
      [fromCity, toCity]
    );
    return rows;
  },

  /**
   * Get trip by ID
   */
  async getById(id) {
    const [rows] = await db.execute(
      `SELECT * FROM trips WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  /**
   * Update available seats
   */
  async updateSeats(tripId, newSeatCount) {
    await db.execute(
      `UPDATE trips SET available_seats = ? WHERE id = ?`,
      [newSeatCount, tripId]
    );
  },

  /**
   * Check if trip is full
   */
  async isFull(tripId) {
    const trip = await this.getById(tripId);
    return trip && trip.available_seats <= 0;
  }
};

export default tripModel;
