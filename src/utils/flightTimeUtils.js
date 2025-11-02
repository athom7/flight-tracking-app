/**
 * Utility functions for flight time calculations and comparisons
 */

/**
 * Creates a Date object from a flight's date and time
 * @param {string} date - Flight date in YYYY-MM-DD format
 * @param {string} time - Flight time in HH:MM format
 * @returns {Date} Combined date and time as Date object
 */
export const createFlightDateTime = (date, time) => {
  if (!date || !time) return null;

  // Combine date and time into a single string
  // This will create the date in the user's local timezone
  const dateTimeString = `${date}T${time}:00`;
  return new Date(dateTimeString);
};

/**
 * Checks if a flight's departure time has passed
 * @param {string} date - Flight date in YYYY-MM-DD format
 * @param {string} time - Flight time in HH:MM format
 * @returns {boolean} True if the flight has already departed
 */
export const hasFlightPassed = (date, time) => {
  const flightDateTime = createFlightDateTime(date, time);
  if (!flightDateTime) return false;

  const now = new Date();
  return flightDateTime < now;
};

/**
 * Checks if a flight should be archived (3+ days after departure)
 * @param {string} date - Flight date in YYYY-MM-DD format
 * @param {string} time - Flight time in HH:MM format
 * @returns {boolean} True if the flight should be archived
 */
export const shouldArchiveFlight = (date, time) => {
  const flightDateTime = createFlightDateTime(date, time);
  if (!flightDateTime) return false;

  const now = new Date();
  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
  const timeSinceDeparture = now - flightDateTime;

  return timeSinceDeparture >= threeDaysInMs;
};

/**
 * Filters out flights that should be archived (3+ days old)
 * @param {Array} flights - Array of flight objects
 * @returns {Array} Filtered array with only recent flights
 */
export const filterArchivableFlights = (flights) => {
  if (!Array.isArray(flights)) return [];

  return flights.filter(flight => {
    const departureTime = flight.departure?.time || '00:00';
    return !shouldArchiveFlight(flight.date, departureTime);
  });
};

/**
 * Gets a human-readable time difference string
 * @param {string} date - Flight date in YYYY-MM-DD format
 * @param {string} time - Flight time in HH:MM format
 * @returns {string} Human-readable time difference (e.g., "2 hours ago", "in 3 days")
 */
export const getTimeDifference = (date, time) => {
  const flightDateTime = createFlightDateTime(date, time);
  if (!flightDateTime) return '';

  const now = new Date();
  const diffMs = flightDateTime - now;
  const diffMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const isPast = diffMs < 0;

  if (diffMinutes < 60) {
    return isPast ? `${diffMinutes} minutes ago` : `in ${diffMinutes} minutes`;
  } else if (diffHours < 24) {
    return isPast ? `${diffHours} hours ago` : `in ${diffHours} hours`;
  } else {
    return isPast ? `${diffDays} days ago` : `in ${diffDays} days`;
  }
};
