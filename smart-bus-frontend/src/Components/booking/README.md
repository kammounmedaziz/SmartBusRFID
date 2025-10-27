# Guest Ticket Booking System

This folder contains all components and pages for the guest ticket booking feature, allowing users to book bus tickets without logging in by paying with their RFID cards.

## Folder Structure

```
booking/
├── Components/
│   ├── RouteSelector.jsx      - Select departure and destination cities
│   ├── TripList.jsx            - Display available trips for selected route
│   ├── CardPayment.jsx         - Handle card scanning and payment
│   └── TicketConfirmation.jsx  - Display booking confirmation
│
└── Pages/
    └── GuestBooking.jsx        - Main booking page with step-by-step flow
```

## Features

### 1. Route Selection
- Select departure and destination cities
- Fetches available cities from the API
- Validates that departure and destination are different

### 2. Trip Selection
- Displays all available trips for the selected route
- Shows departure/arrival times, duration, price, available seats
- Highlights bus types (standard, express, luxury)
- Shows low seat availability warnings

### 3. Travel Date Selection
- Select future travel date
- Minimum date is today

### 4. Card Payment
- Optional passenger name and phone number
- Scan RFID card using ESP32 reader
- Display card balance and trip cost
- Validate sufficient balance
- Process payment and create ticket

### 5. Ticket Confirmation
- Display ticket number and all booking details
- Show travel information
- Option to print ticket
- Option to book another ticket

## API Endpoints Used

### GET `/api/trips/cities`
Fetch all available cities

### GET `/api/trips/route?from={city}&to={city}`
Fetch trips for a specific route

### POST `/api/tickets/scan-card`
Scan RFID card and get card info
```json
{
  "timeout": 30000
}
```

### POST `/api/tickets/book-guest`
Book ticket with card payment
```json
{
  "tripId": 1,
  "travelDate": "2025-10-27",
  "passengerName": "John Doe",
  "passengerPhone": "+216123456789",
  "timeout": 30000
}
```

## User Flow

1. **Access**: User clicks "Pay with Your Card" button on homepage
2. **Route**: User selects departure and destination cities → Search
3. **Trip**: User views available trips and selects one
4. **Date**: User selects travel date
5. **Payment**: User enters optional details → Scans RFID card → Confirms payment
6. **Confirmation**: User receives ticket confirmation with all details

## ESP32 Integration

The booking system integrates with the ESP32 RFID reader service:

- Card scanning is handled through the backend API
- ESP32 enters registration mode when scanning is initiated
- 30-second timeout for card scanning
- Real-time balance checking before payment
- Automatic balance deduction upon successful payment

## Error Handling

- ESP32 not connected
- Card scan timeout
- Card not found/registered
- Card blocked
- Insufficient balance
- Trip full (no seats available)
- Invalid route selection

## Styling

- Glassmorphism design with backdrop blur
- Animated gradient backgrounds
- Responsive layout for mobile and desktop
- Progress indicator showing current step
- Color-coded bus types and status indicators
- Smooth transitions and hover effects

## Future Enhancements

- QR code for ticket
- Email/SMS ticket confirmation
- Seat selection
- Multi-passenger booking
- Return trip booking
- Payment history for card
- Ticket cancellation
