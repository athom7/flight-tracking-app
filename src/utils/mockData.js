// Mock flight data for testing and offline mode
export const mockFlights = [
  {
    id: 1730000001,
    date: '2025-10-26',
    airline: 'KLM Royal Dutch Airlines',
    flightNumber: 'KL692',
    departure: {
      city: 'Amsterdam',
      airport: 'AMS',
      terminal: '2',
      time: '10:30',
      actualTime: '10:30',
      gate: 'D5',
      checkInCounter: 'Row 10-15'
    },
    arrival: {
      city: 'Calgary',
      airport: 'YYC',
      terminal: 'International',
      time: '13:15',
      actualTime: '13:15',
      gate: 'C12',
      baggageClaim: 'Belt 3'
    },
    status: 'On Time',
    currentStatus: 'Boarding',
    delay: null,
    reason: null,
    aircraft: 'Boeing 787-9',
    gateChanges: []
  },
  {
    id: 1730000002,
    date: '2025-10-27',
    airline: 'KLM Royal Dutch Airlines',
    flightNumber: 'KL693',
    departure: {
      city: 'Calgary',
      airport: 'YYC',
      terminal: 'International',
      time: '15:30',
      actualTime: '15:30',
      gate: 'C15',
      checkInCounter: 'Row 5-8'
    },
    arrival: {
      city: 'Amsterdam',
      airport: 'AMS',
      terminal: '2',
      time: '09:45',
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
    date: '2025-10-26',
    airline: 'Scandinavian Airlines',
    flightNumber: 'SK1234',
    departure: {
      city: 'Copenhagen',
      airport: 'CPH',
      terminal: '3',
      time: '14:20',
      actualTime: '15:05',
      gate: 'B22',
      checkInCounter: 'Row 20-25'
    },
    arrival: {
      city: 'Amsterdam',
      airport: 'AMS',
      terminal: '1',
      time: '15:45',
      actualTime: '16:30',
      gate: 'C9',
      baggageClaim: 'Belt 4'
    },
    status: 'Delayed',
    currentStatus: 'In Air',
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
    date: '2025-10-27',
    airline: 'Scandinavian Airlines',
    flightNumber: 'SK1235',
    departure: {
      city: 'Amsterdam',
      airport: 'AMS',
      terminal: '1',
      time: '17:15',
      actualTime: '17:15',
      gate: 'C5',
      checkInCounter: 'Row 15-18'
    },
    arrival: {
      city: 'Copenhagen',
      airport: 'CPH',
      terminal: '3',
      time: '18:40',
      actualTime: '18:40',
      gate: 'B15',
      baggageClaim: 'Belt 2'
    },
    status: 'On Time',
    currentStatus: 'Scheduled',
    delay: null,
    reason: null,
    aircraft: 'Airbus A320',
    gateChanges: []
  },
  {
    id: 1730000005,
    date: '2025-10-26',
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
    date: '2025-10-26',
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
    date: '2025-10-26',
    airline: 'British Airways',
    flightNumber: 'BA902',
    departure: {
      city: 'London',
      airport: 'LHR',
      terminal: '5',
      time: '09:00',
      actualTime: '09:35',
      gate: 'B8',
      checkInCounter: 'Row 50-55'
    },
    arrival: {
      city: 'Dubai',
      airport: 'DXB',
      terminal: '3',
      time: '19:30',
      actualTime: '20:15',
      gate: 'A22',
      baggageClaim: 'Belt 12'
    },
    status: 'Delayed',
    currentStatus: 'Landed',
    delay: '45 min',
    reason: 'Technical Issue',
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
