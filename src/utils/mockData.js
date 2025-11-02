// Mock flight data for testing and offline mode
// Mix of past and future flights to demonstrate visual graying feature
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const fiveDaysAgo = new Date(today);
fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

const formatDate = (date) => date.toISOString().split('T')[0];

export const mockFlights = [
  {
    id: 1730000001,
    date: formatDate(today), // Today's flight
    airline: 'KLM Royal Dutch Airlines',
    flightNumber: 'KL692',
    departure: {
      city: 'Amsterdam',
      airport: 'AMS',
      terminal: '2',
      time: '18:30', // Future time (6:30 PM today)
      actualTime: '18:30',
      gate: 'D5',
      checkInCounter: 'Row 10-15'
    },
    arrival: {
      city: 'Calgary',
      airport: 'YYC',
      terminal: 'International',
      time: '21:15', // Future time (9:15 PM today)
      actualTime: '21:15',
      gate: 'C12',
      baggageClaim: 'Belt 3'
    },
    status: 'On Time',
    currentStatus: 'Scheduled',
    delay: null,
    reason: null,
    aircraft: 'Boeing 787-9',
    gateChanges: []
  },
  {
    id: 1730000002,
    date: formatDate(tomorrow), // Tomorrow's flight
    airline: 'KLM Royal Dutch Airlines',
    flightNumber: 'KL693',
    departure: {
      city: 'Calgary',
      airport: 'YYC',
      terminal: 'International',
      time: '15:30', // 3:30 PM tomorrow
      actualTime: '15:30',
      gate: 'C15',
      checkInCounter: 'Row 5-8'
    },
    arrival: {
      city: 'Amsterdam',
      airport: 'AMS',
      terminal: '2',
      time: '09:45', // Next day arrival
      actualTime: '09:45',
      gate: 'D8',
      baggageClaim: 'Belt 7'
    },
    status: 'On Time',
    currentStatus: 'Scheduled',
    delay: null,
    reason: null,
    aircraft: 'Boeing 787-9',
    gateChanges: []
  },
  {
    id: 1730000003,
    date: formatDate(yesterday), // Yesterday's flight (should be grayed)
    airline: 'Scandinavian Airlines',
    flightNumber: 'SK1234',
    departure: {
      city: 'Copenhagen',
      airport: 'CPH',
      terminal: '3',
      time: '14:20', // 2:20 PM yesterday (past)
      actualTime: '15:05',
      gate: 'B22',
      checkInCounter: 'Row 20-25'
    },
    arrival: {
      city: 'Amsterdam',
      airport: 'AMS',
      terminal: '1',
      time: '15:45', // 3:45 PM yesterday (past)
      actualTime: '16:30',
      gate: 'C9',
      baggageClaim: 'Belt 4'
    },
    status: 'Completed',
    currentStatus: 'Landed',
    delay: '45 min',
    reason: 'Air Traffic Control',
    aircraft: 'Airbus A320',
    gateChanges: [
      {
        from: 'B18',
        to: 'B22',
        time: '14:05'
      }
    ]
  },
  {
    id: 1730000004,
    date: formatDate(today), // Today's flight (past time - should be grayed)
    airline: 'Scandinavian Airlines',
    flightNumber: 'SK1235',
    departure: {
      city: 'Amsterdam',
      airport: 'AMS',
      terminal: '1',
      time: '08:15', // 8:15 AM today (past - should be grayed)
      actualTime: '08:15',
      gate: 'C5',
      checkInCounter: 'Row 15-18'
    },
    arrival: {
      city: 'Copenhagen',
      airport: 'CPH',
      terminal: '3',
      time: '09:40', // 9:40 AM today (past)
      actualTime: '09:40',
      gate: 'B15',
      baggageClaim: 'Belt 2'
    },
    status: 'Completed',
    currentStatus: 'Landed',
    delay: null,
    reason: null,
    aircraft: 'Airbus A320',
    gateChanges: []
  },
  {
    id: 1730000005,
    date: formatDate(fiveDaysAgo), // 5 days ago - should be auto-archived on load!
    airline: 'Air Canada',
    flightNumber: 'AC856',
    departure: {
      city: 'Toronto',
      airport: 'YYZ',
      terminal: '1',
      time: '20:30',
      actualTime: '20:30',
      gate: 'E42',
      checkInCounter: 'Row 30-35'
    },
    arrival: {
      city: 'London',
      airport: 'LHR',
      terminal: '2',
      time: '08:15',
      actualTime: '08:15',
      gate: 'B12',
      baggageClaim: 'Belt 8'
    },
    status: 'On Time',
    currentStatus: 'Boarding',
    delay: null,
    reason: null,
    aircraft: 'Boeing 777-300ER',
    gateChanges: []
  },
  {
    id: 1730000006,
    date: formatDate(tomorrow), // Tomorrow's flight (future)
    airline: 'Lufthansa',
    flightNumber: 'LH456',
    departure: {
      city: 'Frankfurt',
      airport: 'FRA',
      terminal: '1',
      time: '11:45',
      actualTime: '11:45',
      gate: 'A15',
      checkInCounter: 'Row 40-45'
    },
    arrival: {
      city: 'New York',
      airport: 'JFK',
      terminal: '1',
      time: '14:30',
      actualTime: '14:30',
      gate: '7',
      baggageClaim: 'Belt 5'
    },
    status: 'On Time',
    currentStatus: 'In Air',
    delay: null,
    reason: null,
    aircraft: 'Airbus A380',
    gateChanges: []
  },
  {
    id: 1730000007,
    date: formatDate(today), // Today's flight (future time)
    airline: 'British Airways',
    flightNumber: 'BA902',
    departure: {
      city: 'London',
      airport: 'LHR',
      terminal: '5',
      time: '22:00', // 10 PM today (future)
      actualTime: '22:00',
      gate: 'B8',
      checkInCounter: 'Row 50-55'
    },
    arrival: {
      city: 'Dubai',
      airport: 'DXB',
      terminal: '3',
      time: '08:30', // Next day arrival
      actualTime: '08:30',
      gate: 'A22',
      baggageClaim: 'Belt 12'
    },
    status: 'On Time',
    currentStatus: 'Scheduled',
    delay: null,
    reason: null,
    aircraft: 'Boeing 777-200',
    gateChanges: [
      {
        from: 'B5',
        to: 'B8',
        time: '08:45'
      }
    ]
  }
];
