// AviationStack API integration
const AVIATION_STACK_BASE_URL = 'https://api.aviationstack.com/v1/flights';

/**
 * Fetches flight data from AviationStack API
 * @param {string} flightNumber - IATA flight number (e.g., "KL692")
 * @param {string} date - Flight date in YYYY-MM-DD format
 * @param {string} apiKey - AviationStack API key
 * @returns {Promise<Object|null>} Flight data or null if not found
 */
export async function fetchFlightData(flightNumber, date, apiKey) {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  try {
    const url = `${AVIATION_STACK_BASE_URL}?access_key=${apiKey}&flight_iata=${flightNumber}&flight_date=${date}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'API error occurred');
    }

    if (!data.data || data.data.length === 0) {
      return null; // Flight not found
    }

    // Map the API response to our flight object schema
    const flight = data.data[0];
    return mapApiResponseToFlight(flight);
  } catch (error) {
    console.error('Error fetching flight data:', error);
    throw error;
  }
}

/**
 * Maps AviationStack API response to our flight object schema
 * @param {Object} apiResponse - Raw API response object
 * @returns {Object} Mapped flight object
 */
function mapApiResponseToFlight(apiResponse) {
  const departure = apiResponse.departure || {};
  const arrival = apiResponse.arrival || {};
  const flight = apiResponse.flight || {};
  const airline = apiResponse.airline || {};
  const aircraft = apiResponse.aircraft || {};

  // Calculate delay
  let delay = null;
  if (departure.delay && departure.delay > 0) {
    delay = `${departure.delay} min`;
  }

  // Determine status
  const flightStatus = apiResponse.flight_status || 'Unknown';
  let status = 'On Time';
  let currentStatus = 'Scheduled';

  if (flightStatus === 'cancelled') {
    status = 'Cancelled';
    currentStatus = 'Cancelled';
  } else if (delay) {
    status = 'Delayed';
  }

  // Map current status
  if (flightStatus === 'scheduled') {
    currentStatus = 'Scheduled';
  } else if (flightStatus === 'active') {
    currentStatus = 'In Air';
  } else if (flightStatus === 'landed') {
    currentStatus = 'Landed';
  }

  // Format times (API returns ISO timestamps, we need HH:MM)
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toTimeString().substring(0, 5);
  };

  return {
    id: Date.now(),
    date: departure.scheduled ? departure.scheduled.split('T')[0] : '',
    airline: airline.name || 'Unknown Airline',
    flightNumber: flight.iata || flight.number || '',
    departure: {
      city: departure.timezone ? departure.timezone.split('/')[1]?.replace('_', ' ') : '',
      airport: departure.iata || '',
      terminal: departure.terminal || '',
      time: formatTime(departure.scheduled),
      actualTime: formatTime(departure.actual || departure.scheduled),
      gate: departure.gate || '',
      checkInCounter: ''
    },
    arrival: {
      city: arrival.timezone ? arrival.timezone.split('/')[1]?.replace('_', ' ') : '',
      airport: arrival.iata || '',
      terminal: arrival.terminal || '',
      time: formatTime(arrival.scheduled),
      actualTime: formatTime(arrival.actual || arrival.scheduled),
      gate: arrival.gate || '',
      baggageClaim: arrival.baggage || ''
    },
    status,
    currentStatus,
    delay,
    reason: delay ? 'Check with airline' : null,
    aircraft: aircraft.registration || aircraft.iata || 'Unknown',
    gateChanges: []
  };
}

/**
 * Parse flight number from voice input
 * Handles various formats like "KL six nine two", "lufthansa four fifty six"
 * @param {string} transcript - Voice input transcript
 * @returns {string|null} Parsed flight number or null
 */
export function parseFlightNumberFromVoice(transcript) {
  if (!transcript) return null;

  const cleaned = transcript.toUpperCase().trim();

  // Try to match pattern: LETTERS + NUMBERS (e.g., "KL 692", "LH 456")
  const directMatch = cleaned.match(/([A-Z]{2,3})\s*(\d{2,4})/);
  if (directMatch) {
    return directMatch[1] + directMatch[2];
  }

  // Handle spelled out numbers (basic implementation)
  const numberWords = {
    'ZERO': '0', 'ONE': '1', 'TWO': '2', 'THREE': '3', 'FOUR': '4',
    'FIVE': '5', 'SIX': '6', 'SEVEN': '7', 'EIGHT': '8', 'NINE': '9'
  };

  // Try to find airline code
  const words = cleaned.split(/\s+/);
  let airlineCode = '';
  let numbers = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Check if word is 2-3 letters (airline code)
    if (word.match(/^[A-Z]{2,3}$/)) {
      airlineCode = word;
      continue;
    }

    // Check if word is a number
    if (word.match(/^\d+$/)) {
      numbers += word;
      continue;
    }

    // Check if word is a spelled number
    if (numberWords[word]) {
      numbers += numberWords[word];
    }
  }

  if (airlineCode && numbers) {
    return airlineCode + numbers;
  }

  return null;
}
