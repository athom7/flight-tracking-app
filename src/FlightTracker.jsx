import { useState, useEffect, useRef } from 'react';
import {
  Plane,
  Settings,
  Plus,
  Mic,
  X,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { mockFlights } from './utils/mockData';
import { fetchFlightData, parseFlightNumberFromVoice } from './utils/api';
import useApiKey from './hooks/useApiKey';

// Split-flap character display component
function FlapChar({ char, large = false }) {
  return (
    <span className={`flap-char ${large ? 'flap-char-large' : 'text-sm'}`}>
      {char}
    </span>
  );
}

// Split-flap time display
function FlapTime({ time, large = false }) {
  if (!time) return null;
  const chars = time.split('');
  return (
    <div className="flap-group">
      {chars.map((char, i) => (
        <FlapChar key={i} char={char} large={large} />
      ))}
    </div>
  );
}

// Split-flap gate display
function FlapGate({ gate }) {
  if (!gate) return <span className="text-paper-400 font-typewriter text-sm">---</span>;
  const chars = gate.split('');
  return (
    <div className="flap-group">
      {chars.map((char, i) => (
        <FlapChar key={i} char={char} />
      ))}
    </div>
  );
}

// Countdown timer component
function CountdownTimer({ departureDate, departureTime }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isNegative: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const [hours, minutes] = departureTime.split(':').map(Number);
      const departure = new Date(departureDate);
      departure.setHours(hours, minutes, 0, 0);

      const diff = departure - now;
      const isNegative = diff < 0;
      const absDiff = Math.abs(diff);

      return {
        hours: Math.floor(absDiff / (1000 * 60 * 60)),
        minutes: Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((absDiff % (1000 * 60)) / 1000),
        isNegative
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [departureDate, departureTime]);

  const padZero = (num) => String(num).padStart(2, '0');

  if (timeLeft.isNegative) {
    return (
      <div className="text-center">
        <span className="font-typewriter text-stamp-green text-sm">DEPARTED</span>
      </div>
    );
  }

  return (
    <div className="countdown-display justify-center">
      <div className="countdown-segment">
        <div className="flap-group">
          <FlapChar char={padZero(timeLeft.hours)[0]} />
          <FlapChar char={padZero(timeLeft.hours)[1]} />
        </div>
        <span className="label">hrs</span>
      </div>
      <span className="flap-char text-sm">:</span>
      <div className="countdown-segment">
        <div className="flap-group">
          <FlapChar char={padZero(timeLeft.minutes)[0]} />
          <FlapChar char={padZero(timeLeft.minutes)[1]} />
        </div>
        <span className="label">min</span>
      </div>
      <span className="flap-char text-sm">:</span>
      <div className="countdown-segment">
        <div className="flap-group">
          <FlapChar char={padZero(timeLeft.seconds)[0]} />
          <FlapChar char={padZero(timeLeft.seconds)[1]} />
        </div>
        <span className="label">sec</span>
      </div>
    </div>
  );
}

// Decorative barcode component
function Barcode({ seed = 12345 }) {
  // Generate pseudo-random widths based on seed
  const widths = [];
  let s = seed;
  for (let i = 0; i < 40; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    widths.push((s % 3) + 1);
  }

  return (
    <div className="barcode">
      {widths.map((w, i) => (
        <div key={i} className="barcode-line" style={{ width: `${w}px` }} />
      ))}
    </div>
  );
}

// Status stamp component
function StatusStamp({ status, delay }) {
  const getStampClass = (status) => {
    switch (status.toLowerCase()) {
      case 'on time':
        return 'stamp-ontime';
      case 'boarding':
        return 'stamp-boarding';
      case 'delayed':
        return 'stamp-delayed';
      case 'cancelled':
        return 'stamp-cancelled';
      default:
        return 'stamp-ontime';
    }
  };

  return (
    <div className={`stamp ${getStampClass(status)}`}>
      {status}
      {delay && <span className="ml-1">({delay})</span>}
    </div>
  );
}

// Flight progress indicator
function FlightProgress({ departureDate, departureTime, arrivalTime, status }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      if (status.toLowerCase() === 'cancelled') return 0;

      const now = new Date();
      const [depHours, depMinutes] = departureTime.split(':').map(Number);
      const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);

      const departure = new Date(departureDate);
      departure.setHours(depHours, depMinutes, 0, 0);

      const arrival = new Date(departureDate);
      arrival.setHours(arrHours, arrMinutes, 0, 0);

      // Handle overnight flights
      if (arrival < departure) {
        arrival.setDate(arrival.getDate() + 1);
      }

      if (now < departure) return 0;
      if (now > arrival) return 100;

      const total = arrival - departure;
      const elapsed = now - departure;
      return Math.round((elapsed / total) * 100);
    };

    setProgress(calculateProgress());
    const timer = setInterval(() => setProgress(calculateProgress()), 60000);
    return () => clearInterval(timer);
  }, [departureDate, departureTime, arrivalTime, status]);

  return (
    <div className="relative mt-4 mb-2">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div
        className="progress-plane text-ink-700"
        style={{ left: `${progress}%` }}
      >
        <Plane className="w-4 h-4 transform rotate-0" />
      </div>
    </div>
  );
}

function FlightTracker() {
  // API Key management with localStorage persistence
  const { apiKey, setApiKey, clearApiKey } = useApiKey();

  // State management
  const [flights, setFlights] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [expandedFlightId, setExpandedFlightId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newFlight, setNewFlight] = useState({
    flightNumber: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');

  const recognitionRef = useRef(null);

  // Initialize with mock data
  useEffect(() => {
    setFlights([...mockFlights]);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setVoiceTranscript(transcript);

        // Parse flight number from voice input
        const parsedFlightNumber = parseFlightNumberFromVoice(transcript);
        if (parsedFlightNumber) {
          setNewFlight(prev => ({ ...prev, flightNumber: parsedFlightNumber }));
        } else {
          setNewFlight(prev => ({ ...prev, flightNumber: transcript }));
        }

        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setError('Voice input failed. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Auto-sort flights by departure date and time
  const sortFlights = (flightList) => {
    return [...flightList].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.departure.time}`);
      const dateB = new Date(`${b.date} ${b.departure.time}`);
      return dateA - dateB;
    });
  };

  // Handle voice input
  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        setVoiceTranscript('');
        setError('');
        recognitionRef.current.start();
        setIsListening(true);
      }
    } else {
      setError('Voice input not supported in this browser');
    }
  };

  // Add flight
  const handleAddFlight = async () => {
    if (!newFlight.flightNumber || !newFlight.date) {
      setError('Please enter flight number and date');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let flightData = null;

      // Try to fetch from API if API key is provided
      if (apiKey) {
        try {
          flightData = await fetchFlightData(
            newFlight.flightNumber.toUpperCase(),
            newFlight.date,
            apiKey
          );
        } catch (apiError) {
          console.error('API error, falling back to mock data:', apiError);
          setError('API failed, using mock data');
        }
      }

      // If no API data, check mock data or create new entry
      if (!flightData) {
        const mockFlight = mockFlights.find(
          f => f.flightNumber.toUpperCase() === newFlight.flightNumber.toUpperCase()
        );

        if (mockFlight) {
          flightData = { ...mockFlight, id: Date.now(), date: newFlight.date };
        } else {
          // Create a basic flight entry for unknown flights
          flightData = {
            id: Date.now(),
            date: newFlight.date,
            airline: 'Unknown',
            flightNumber: newFlight.flightNumber.toUpperCase(),
            departure: {
              city: 'Unknown',
              airport: '',
              terminal: '',
              time: '00:00',
              actualTime: '00:00',
              gate: '',
              checkInCounter: ''
            },
            arrival: {
              city: 'Unknown',
              airport: '',
              terminal: '',
              time: '00:00',
              actualTime: '00:00',
              gate: '',
              baggageClaim: ''
            },
            status: 'Not found',
            currentStatus: 'Unknown',
            delay: null,
            reason: 'Flight information not available',
            aircraft: 'Unknown',
            gateChanges: []
          };
        }
      }

      const updatedFlights = sortFlights([...flights, flightData]);
      setFlights(updatedFlights);
      setNewFlight({ flightNumber: '', date: new Date().toISOString().split('T')[0] });
      setShowAddForm(false);
      setVoiceTranscript('');
    } catch (err) {
      setError('Failed to add flight');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete flight
  const handleDeleteFlight = (id) => {
    setFlights(flights.filter(f => f.id !== id));
  };

  // Toggle flight expansion
  const toggleFlightExpansion = (id) => {
    setExpandedFlightId(expandedFlightId === id ? null : id);
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedItem === null || draggedItem === dropIndex) return;

    const newFlights = [...flights];
    const draggedFlight = newFlights[draggedItem];
    newFlights.splice(draggedItem, 1);
    newFlights.splice(dropIndex, 0, draggedFlight);

    setFlights(newFlights);
    setDraggedItem(null);
  };

  return (
    <div className="min-h-screen bg-paper-200 pb-20">
      {/* Vintage Terminal Header */}
      <header className="board-header p-5 sticky top-0 z-20 shadow-lg">
        <div className="max-w-mobile mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-gold/20 p-2 rounded">
              <Plane className="w-6 h-6 text-amber-gold" />
            </div>
            <div>
              <h1 className="font-airline text-2xl text-amber-gold tracking-widest">DEPARTURES</h1>
              <p className="text-paper-400 text-xs font-mono-flap tracking-wider">FLIGHT TRACKER</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2.5 hover:bg-white/10 rounded-lg transition-all text-paper-300 hover:text-amber-gold"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="vintage-btn vintage-btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
              aria-label="Add flight"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Flight</span>
            </button>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="panel-vintage border-b-4 border-perf">
          <div className="max-w-mobile mx-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-airline text-xl text-ink-700 tracking-wide">SETTINGS</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 hover:bg-paper-300 rounded-lg transition-colors text-ink-700"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="apiKey" className="block font-typewriter text-sm text-ink-700 mb-2">
                  AviationStack API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key..."
                    className="vintage-input flex-1 px-4 py-3 rounded-lg"
                  />
                  {apiKey && (
                    <button
                      onClick={clearApiKey}
                      className="vintage-btn vintage-btn-secondary px-4 py-2 rounded-lg text-stamp-red border-stamp-red hover:bg-stamp-redBg"
                      aria-label="Clear API key"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 font-typewriter text-sm bg-paper-100 px-4 py-3 rounded-lg border-2 border-paper-300">
                <div className={`w-3 h-3 rounded-full ${apiKey ? 'bg-stamp-green' : 'bg-paper-400'}`} />
                <span className="text-ink-700">
                  {apiKey ? 'Connected to live data' : 'Using demonstration data'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Flight Form */}
      {showAddForm && (
        <div className="panel-vintage border-b-4 border-perf">
          <div className="max-w-mobile mx-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-airline text-xl text-ink-700 tracking-wide">ADD FLIGHT</h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setError('');
                  setVoiceTranscript('');
                }}
                className="p-1.5 hover:bg-paper-300 rounded-lg transition-colors text-ink-700"
                aria-label="Close form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-stamp-redBg border-2 border-stamp-red rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-stamp-red flex-shrink-0 mt-0.5" />
                <p className="font-typewriter text-sm text-stamp-red">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="flightNumber" className="block font-typewriter text-sm text-ink-700 mb-2">
                  Flight Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="flightNumber"
                    value={newFlight.flightNumber}
                    onChange={(e) => setNewFlight({ ...newFlight, flightNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g., KL692"
                    className="vintage-input flex-1 px-4 py-3 rounded-lg uppercase"
                  />
                  <button
                    onClick={handleVoiceInput}
                    disabled={!recognitionRef.current}
                    className={`p-3 rounded-lg transition-all ${
                      isListening
                        ? 'bg-stamp-red text-white listening-pulse'
                        : 'vintage-btn-primary'
                    } disabled:bg-paper-300 disabled:cursor-not-allowed disabled:text-paper-400`}
                    aria-label="Voice input"
                  >
                    <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
                {voiceTranscript && (
                  <p className="mt-2 font-typewriter text-xs text-ink-700 bg-paper-100 px-3 py-2 rounded border-2 border-paper-300">
                    Heard: "{voiceTranscript}"
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="date" className="block font-typewriter text-sm text-ink-700 mb-2">
                  Departure Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={newFlight.date}
                  onChange={(e) => setNewFlight({ ...newFlight, date: e.target.value })}
                  className="vintage-input w-full px-4 py-3 rounded-lg"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddFlight}
                  disabled={isLoading}
                  className="vintage-btn vintage-btn-primary flex-1 py-3 rounded-lg disabled:bg-paper-300 disabled:cursor-not-allowed disabled:text-paper-400 disabled:border-paper-300"
                >
                  {isLoading ? 'Adding...' : 'Add to Board'}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewFlight({ flightNumber: '', date: new Date().toISOString().split('T')[0] });
                    setError('');
                    setVoiceTranscript('');
                  }}
                  className="vintage-btn vintage-btn-secondary flex-1 py-3 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flight List */}
      <div className="max-w-mobile mx-auto p-5 space-y-4">
        {flights.length === 0 ? (
          <div className="text-center py-16">
            <div className="empty-state-icon w-24 h-24 rounded-2xl mx-auto mb-5 flex items-center justify-center">
              <Plane className="w-12 h-12 text-perf" />
            </div>
            <p className="font-airline text-2xl text-ink-700 tracking-wide mb-2">NO FLIGHTS</p>
            <p className="font-typewriter text-sm text-perf">Add your first flight to the board</p>
          </div>
        ) : (
          flights.map((flight, index) => (
            <div
              key={flight.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className="paper-texture rounded-xl overflow-hidden shadow-ticket transition-all hover:shadow-lg border-2 border-paper-300"
            >
              {/* Boarding Pass Main Section */}
              <div
                onClick={() => toggleFlightExpansion(flight.id)}
                className="p-5 cursor-pointer select-none relative"
              >
                {/* Grip Handle */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                  <GripVertical className="w-4 h-4 text-paper-400 cursor-grab active:cursor-grabbing hover:text-perf" />
                </div>

                {/* Header: Airline & Flight Number */}
                <div className="flex items-start justify-between mb-4 pl-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="airline-badge text-2xl text-ink-700">{flight.flightNumber}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFlight(flight.id);
                        }}
                        className="p-1.5 hover:bg-stamp-redBg rounded transition-colors text-paper-400 hover:text-stamp-red"
                        aria-label="Delete flight"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-typewriter text-sm text-perf mt-1">{flight.airline}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-paper-200 px-3 py-1.5 rounded border border-paper-300">
                    <Calendar className="w-3.5 h-3.5 text-perf" />
                    <span className="font-mono-flap text-xs text-ink-700">
                      {new Date(flight.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Route */}
                <div className="flex items-center gap-4 mb-4 pl-5">
                  <div className="flex-1">
                    <p className="font-airline text-xl text-ink-700 tracking-wide">{flight.departure.city}</p>
                    <p className="font-mono-flap text-xs text-perf mt-0.5">{flight.departure.airport}</p>
                  </div>
                  <div className="flex flex-col items-center px-4">
                    <Plane className="w-5 h-5 text-ink-700 mb-1" />
                    <div className="w-16 h-px bg-paper-400" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-airline text-xl text-ink-700 tracking-wide">{flight.arrival.city}</p>
                    <p className="font-mono-flap text-xs text-perf mt-0.5">{flight.arrival.airport}</p>
                  </div>
                </div>

                {/* Split-Flap Display Section */}
                <div className="bg-flap-dark rounded-lg p-4 mb-4 ml-5">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-paper-400 text-xs uppercase tracking-wider mb-2 font-body">Depart</p>
                      <FlapTime time={flight.departure.actualTime || flight.departure.time} large />
                    </div>
                    <div className="text-center">
                      <p className="text-paper-400 text-xs uppercase tracking-wider mb-2 font-body">Gate</p>
                      <FlapGate gate={flight.departure.gate} />
                    </div>
                    <div className="text-center">
                      <p className="text-paper-400 text-xs uppercase tracking-wider mb-2 font-body">Arrive</p>
                      <FlapTime time={flight.arrival.actualTime || flight.arrival.time} large />
                    </div>
                  </div>

                  {/* Flight Progress */}
                  <FlightProgress
                    departureDate={flight.date}
                    departureTime={flight.departure.time}
                    arrivalTime={flight.arrival.time}
                    status={flight.status}
                  />
                </div>

                {/* Status and Countdown */}
                <div className="flex items-center justify-between pl-5">
                  <StatusStamp status={flight.status} delay={flight.delay} />

                  <div className="flex items-center gap-2">
                    {expandedFlightId === flight.id ? (
                      <ChevronUp className="w-5 h-5 text-perf" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-perf" />
                    )}
                  </div>
                </div>
              </div>

              {/* Perforated Tear Line with Notches */}
              <div className="ticket-notch perforation perforation-top h-0" />

              {/* Expanded Details - Ticket Stub */}
              {expandedFlightId === flight.id && (
                <div className="bg-paper-100 p-5 border-t-0">
                  {/* Countdown Timer */}
                  <div className="bg-flap-dark rounded-lg p-4 mb-5">
                    <p className="text-paper-400 text-xs uppercase tracking-wider mb-3 text-center font-body">Time to Departure</p>
                    <CountdownTimer
                      departureDate={flight.date}
                      departureTime={flight.departure.time}
                    />
                  </div>

                  {/* Current Status */}
                  {flight.reason && (
                    <div className="mb-5">
                      <h4 className="font-airline text-sm text-ink-700 tracking-wide mb-2">STATUS NOTE</h4>
                      <p className="font-typewriter text-sm text-perf bg-paper-50 px-4 py-3 rounded-lg border-2 border-paper-300">
                        {flight.reason}
                      </p>
                    </div>
                  )}

                  {/* Departure & Arrival Details */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-paper-50 p-4 rounded-lg border-2 border-paper-300">
                      <h4 className="font-airline text-sm text-ink-700 tracking-wide mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-ink-700" />
                        DEPARTURE
                      </h4>
                      <div className="space-y-2 font-typewriter text-sm">
                        {flight.departure.terminal && (
                          <div className="flex justify-between">
                            <span className="text-perf">Terminal</span>
                            <span className="text-ink-700">{flight.departure.terminal}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-perf">Scheduled</span>
                          <span className="text-ink-700">{flight.departure.time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-perf">Actual</span>
                          <span className={flight.departure.actualTime !== flight.departure.time ? 'text-stamp-red' : 'text-stamp-green'}>
                            {flight.departure.actualTime}
                          </span>
                        </div>
                        {flight.departure.checkInCounter && (
                          <div className="flex justify-between">
                            <span className="text-perf">Check-in</span>
                            <span className="text-ink-700">{flight.departure.checkInCounter}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-paper-50 p-4 rounded-lg border-2 border-paper-300">
                      <h4 className="font-airline text-sm text-ink-700 tracking-wide mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-ink-700" />
                        ARRIVAL
                      </h4>
                      <div className="space-y-2 font-typewriter text-sm">
                        {flight.arrival.terminal && (
                          <div className="flex justify-between">
                            <span className="text-perf">Terminal</span>
                            <span className="text-ink-700">{flight.arrival.terminal}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-perf">Scheduled</span>
                          <span className="text-ink-700">{flight.arrival.time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-perf">Actual</span>
                          <span className={flight.arrival.actualTime !== flight.arrival.time ? 'text-stamp-red' : 'text-stamp-green'}>
                            {flight.arrival.actualTime}
                          </span>
                        </div>
                        {flight.arrival.baggageClaim && (
                          <div className="flex justify-between">
                            <span className="text-perf">Baggage</span>
                            <span className="text-ink-700">{flight.arrival.baggageClaim}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Aircraft */}
                  {flight.aircraft && (
                    <div className="mb-5">
                      <h4 className="font-airline text-sm text-ink-700 tracking-wide mb-2">AIRCRAFT</h4>
                      <p className="font-typewriter text-sm text-perf">{flight.aircraft}</p>
                    </div>
                  )}

                  {/* Gate Changes */}
                  {flight.gateChanges && flight.gateChanges.length > 0 && (
                    <div className="mb-5">
                      <h4 className="font-airline text-sm text-ink-700 tracking-wide mb-3">GATE CHANGES</h4>
                      <div className="space-y-2">
                        {flight.gateChanges.map((change, idx) => (
                          <div key={idx} className="stamp stamp-delayed text-xs">
                            {change.from} → {change.to} at {change.time}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Decorative Barcode */}
                  <div className="flex justify-center pt-4 border-t-2 border-dashed border-paper-300">
                    <div className="text-center">
                      <Barcode seed={flight.id} />
                      <p className="font-mono-flap text-xs text-paper-400 mt-2">PASSENGER COPY</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FlightTracker;
