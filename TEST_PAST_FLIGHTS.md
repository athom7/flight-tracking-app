# Past Flights Visual Cleanup - Testing Guide

## Features Implemented

### 1. Immediate Visual Graying
- **Purpose**: Flights with departure times that have already passed are displayed with reduced opacity (50%)
- **Location**: `src/FlightTracker.jsx:486-497`
- **Logic**: Uses `hasFlightPassed()` from `src/utils/flightTimeUtils.js:22-31`

### 2. Three-Day Auto-Archive
- **Purpose**: Automatically removes flights 3+ days after departure when the app loads
- **Location**: `src/FlightTracker.jsx:45-87`
- **Logic**: Uses `shouldArchiveFlight()` and `filterArchivableFlights()` from `src/utils/flightTimeUtils.js:33-59`

### 3. localStorage Persistence
- **Purpose**: Saves all flights to localStorage for persistence across sessions
- **Storage Key**: `flightTracker_flights`
- **Location**: `src/FlightTracker.jsx:78-87`

## How It Works

### Timezone Handling
All flight times are interpreted in the **user's local timezone**:
- Flight date + time are combined into a JavaScript Date object: `new Date('YYYY-MM-DDTHH:MM:00')`
- This creates a date in the user's current timezone
- Comparisons use `new Date()` which also reflects the user's local time

### Visual Graying Logic
```javascript
// Check if departure time has passed
const isPast = hasFlightPassed(flight.date, flight.departure.time);
// Apply opacity-50 CSS class if past
className={`... ${isPast ? 'opacity-50' : ''}`}
```

### Auto-Archive Logic
```javascript
// On app load, filter out flights older than 3 days
const cleanedFlights = filterArchivableFlights(parsedFlights);
// Flights are kept if: (now - departureTime) < 3 days
```

## Testing Instructions

### Test 1: Visual Graying of Past Flights

1. **Start the app**:
   ```bash
   npm run dev
   ```

2. **Add test flights**:
   - Add a flight with today's date and a time 1 hour in the past
   - Add a flight with today's date and a time 1 hour in the future
   - Add a flight with yesterday's date

3. **Expected Results**:
   - Past flights (time already passed) should appear with 50% opacity (grayed out)
   - Future flights should appear normal
   - The graying updates dynamically based on current time vs. departure time

### Test 2: Three-Day Auto-Archive

1. **Create old flights manually** (using browser console):
   ```javascript
   // Open browser console and run:
   const oldFlight = {
     id: Date.now(),
     date: '2025-10-28', // 5 days ago from Nov 2, 2025
     airline: 'Test Airlines',
     flightNumber: 'TEST123',
     departure: { city: 'TestCity', airport: 'TST', time: '10:00', actualTime: '10:00', terminal: '1', gate: 'A1', checkInCounter: '' },
     arrival: { city: 'TestDest', airport: 'DST', time: '12:00', actualTime: '12:00', terminal: '1', gate: 'B1', baggageClaim: '' },
     status: 'Completed',
     currentStatus: 'Landed',
     delay: null,
     reason: null,
     aircraft: 'Test Aircraft',
     gateChanges: []
   };

   const flights = JSON.parse(localStorage.getItem('flightTracker_flights') || '[]');
   flights.push(oldFlight);
   localStorage.setItem('flightTracker_flights', JSON.stringify(flights));
   location.reload();
   ```

2. **Expected Results**:
   - Flights older than 3 days should be automatically removed on page reload
   - Check console for message: "Automatically archived X flight(s) older than 3 days"

### Test 3: localStorage Persistence

1. **Add some flights** to the app
2. **Close and reopen** the browser
3. **Expected Results**:
   - All flights should still be visible (unless they're 3+ days old)
   - Past flights should still appear grayed out

### Test 4: Edge Cases

#### Test exactly at 3-day boundary:
- Flight at exactly 72 hours (3 days) ago should be archived
- Flight at 71 hours 59 minutes ago should remain visible (but grayed)

#### Test timezone accuracy:
- Add flight with time "23:59" for today
- Wait until midnight
- Flight should immediately become grayed out after midnight

## Implementation Files

### Core Files Modified/Created:

1. **src/utils/flightTimeUtils.js** (NEW)
   - `createFlightDateTime()`: Combines date and time
   - `hasFlightPassed()`: Checks if departure time < now
   - `shouldArchiveFlight()`: Checks if flight > 3 days old
   - `filterArchivableFlights()`: Filters array of flights

2. **src/FlightTracker.jsx** (MODIFIED)
   - Lines 19: Import time utilities
   - Lines 22: Add localStorage key constant
   - Lines 45-87: Initialize with localStorage + auto-cleanup
   - Lines 294-298: Add `isFlightPast()` helper
   - Lines 485-498: Apply visual graying to past flights

## Verification Commands

```bash
# Check if utility file exists
ls -la src/utils/flightTimeUtils.js

# Check for syntax errors
npm run build

# Start development server
npm run dev
```

## Expected Console Output

When flights are archived on app load:
```
Automatically archived 2 flight(s) older than 3 days
```

## Notes

- The opacity effect is CSS-based: `opacity-50` (Tailwind CSS)
- localStorage is updated whenever flights change
- Auto-cleanup runs only on app initialization
- All mock flights older than 3 days are filtered on first load
- Time calculations account for user's local timezone automatically
