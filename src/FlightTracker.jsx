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
  AlertCircle
} from 'lucide-react';
import { mockFlights } from './utils/mockData';
import { fetchFlightData, parseFlightNumberFromVoice } from './utils/api';
import useApiKey from './hooks/useApiKey';

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

  // Get status color classes
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'on time':
      case 'boarding':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'delayed':
        return 'text-amber-700 bg-amber-50 border border-amber-200';
      case 'cancelled':
        return 'text-red-700 bg-red-50 border border-red-200';
      default:
        return 'text-stone-700 bg-stone-100 border border-stone-200';
    }
  };

  // Get time color (compare actual vs scheduled)
  const getTimeColor = (actual, scheduled) => {
    if (!actual || !scheduled) return 'text-stone-900';
    return actual !== scheduled ? 'text-amber-700' : 'text-emerald-700';
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 p-5 sticky top-0 z-10 shadow-sm backdrop-blur-sm bg-white/95">
        <div className="max-w-mobile mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plane className="w-6 h-6 text-amber-600" />
            <h1 className="text-xl font-semibold text-stone-900 tracking-tight">Flight Tracker</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-stone-100 rounded-lg transition-all text-stone-600 hover:text-stone-900"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-2 bg-amber-500 hover:bg-amber-600 rounded-lg transition-all text-white shadow-sm"
              aria-label="Add flight"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-mobile mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-900">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors text-stone-500"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-stone-700 mb-2">
                  AviationStack API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="flex-1 px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none bg-white"
                  />
                  {apiKey && (
                    <button
                      onClick={clearApiKey}
                      className="px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm border border-red-200"
                      aria-label="Clear API key"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-sm bg-stone-50 px-4 py-3 rounded-lg border border-stone-200">
                <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                <span className="text-stone-700 font-medium">
                  {apiKey ? 'Using live data' : 'Using mock data'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Flight Form */}
      {showAddForm && (
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-mobile mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-900">Add Flight</h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setError('');
                  setVoiceTranscript('');
                }}
                className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors text-stone-500"
                aria-label="Close form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 leading-relaxed">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="flightNumber" className="block text-sm font-medium text-stone-700 mb-2">
                  Flight Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="flightNumber"
                    value={newFlight.flightNumber}
                    onChange={(e) => setNewFlight({ ...newFlight, flightNumber: e.target.value })}
                    placeholder="e.g., KL692"
                    className="flex-1 px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none bg-white"
                  />
                  <button
                    onClick={handleVoiceInput}
                    disabled={!recognitionRef.current}
                    className={`p-2.5 rounded-lg transition-all shadow-sm ${
                      isListening
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-amber-500 text-white hover:bg-amber-600'
                    } disabled:bg-stone-200 disabled:cursor-not-allowed disabled:text-stone-400`}
                    aria-label="Voice input"
                  >
                    <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
                {voiceTranscript && (
                  <p className="mt-2 text-xs text-stone-600 bg-stone-50 px-3 py-2 rounded border border-stone-200">Heard: "{voiceTranscript}"</p>
                )}
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-stone-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={newFlight.date}
                  onChange={(e) => setNewFlight({ ...newFlight, date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none bg-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddFlight}
                  disabled={isLoading}
                  className="flex-1 bg-amber-500 text-white py-2.5 rounded-lg hover:bg-amber-600 transition-all disabled:bg-stone-200 disabled:cursor-not-allowed disabled:text-stone-400 font-medium shadow-sm"
                >
                  {isLoading ? 'Adding...' : 'Add Flight'}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewFlight({ flightNumber: '', date: new Date().toISOString().split('T')[0] });
                    setError('');
                    setVoiceTranscript('');
                  }}
                  className="flex-1 bg-stone-100 text-stone-700 py-2.5 rounded-lg hover:bg-stone-200 transition-all font-medium border border-stone-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flight List */}
      <div className="max-w-mobile mx-auto p-5 space-y-3">
        {flights.length === 0 ? (
          <div className="text-center py-16 text-stone-500">
            <div className="bg-stone-100 w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center">
              <Plane className="w-10 h-10 text-stone-400" />
            </div>
            <p className="text-stone-900 font-medium text-lg mb-1">No flights added yet</p>
            <p className="text-sm mt-2 text-stone-600">Tap the + button to add your first flight</p>
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
              className="bg-white rounded-xl border border-stone-200 overflow-hidden transition-all hover:shadow-lg hover:border-stone-300 shadow-sm"
            >
              {/* Flight Card Header */}
              <div
                onClick={() => toggleFlightExpansion(flight.id)}
                className="p-5 cursor-pointer select-none"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    <GripVertical className="w-5 h-5 text-stone-400 cursor-grab active:cursor-grabbing hover:text-stone-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Flight number and airline */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-stone-900 tracking-tight">{flight.flightNumber}</h3>
                        <p className="text-sm text-stone-600 mt-0.5">{flight.airline}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFlight(flight.id);
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-stone-400 hover:text-red-600"
                        aria-label="Delete flight"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-sm text-stone-600 mb-4 bg-stone-50 px-3 py-1.5 rounded-lg inline-flex border border-stone-200">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-medium">{new Date(flight.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>

                    {/* Route visualization */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-stone-900 text-base">{flight.departure.city}</p>
                        <p className="text-xs text-stone-500 mt-1">{flight.departure.airport}</p>
                      </div>
                      <div className="px-3">
                        <Plane className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      </div>
                      <div className="flex-1 text-right">
                        <p className="font-semibold text-stone-900 text-base">{flight.arrival.city}</p>
                        <p className="text-xs text-stone-500 mt-1">{flight.arrival.airport}</p>
                      </div>
                    </div>

                    {/* Times and gates */}
                    <div className="flex justify-between text-sm mb-4 pb-4 border-b border-stone-100">
                      <div>
                        <p className="text-stone-500 text-xs uppercase tracking-wide mb-1.5">Departure</p>
                        <p className={`font-semibold text-base ${getTimeColor(flight.departure.actualTime, flight.departure.time)}`}>
                          {flight.departure.actualTime || flight.departure.time}
                        </p>
                        {flight.departure.gate && (
                          <p className="text-stone-500 text-xs mt-1">Gate {flight.departure.gate}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-stone-500 text-xs uppercase tracking-wide mb-1.5">Arrival</p>
                        <p className={`font-semibold text-base ${getTimeColor(flight.arrival.actualTime, flight.arrival.time)}`}>
                          {flight.arrival.actualTime || flight.arrival.time}
                        </p>
                        {flight.arrival.gate && (
                          <p className="text-stone-500 text-xs mt-1">Gate {flight.arrival.gate}</p>
                        )}
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide ${getStatusColor(flight.status)}`}>
                        {flight.status}
                        {flight.delay && ` (${flight.delay})`}
                      </span>
                      {expandedFlightId === flight.id ? (
                        <ChevronUp className="w-5 h-5 text-stone-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-stone-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedFlightId === flight.id && (
                <div className="border-t border-stone-200 bg-stone-50 p-5">
                  {/* Current Status */}
                  <div className="mb-5">
                    <h4 className="font-semibold text-stone-900 mb-3 text-sm uppercase tracking-wide">Current Status</h4>
                    <p className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide ${getStatusColor(flight.currentStatus)}`}>
                      {flight.currentStatus}
                    </p>
                    {flight.reason && (
                      <p className="text-sm text-stone-600 mt-3 leading-relaxed bg-white px-4 py-3 rounded-lg border border-stone-200">{flight.reason}</p>
                    )}
                  </div>

                  {/* Departure Details */}
                  <div className="mb-5 bg-white p-4 rounded-lg border border-stone-200">
                    <h4 className="font-semibold text-stone-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      Departure Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {flight.departure.terminal && (
                        <div>
                          <span className="text-stone-500 text-xs">Terminal</span>
                          <p className="font-medium text-stone-900 mt-0.5">{flight.departure.terminal}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-stone-500 text-xs">Scheduled</span>
                        <p className="font-medium text-stone-900 mt-0.5">{flight.departure.time}</p>
                      </div>
                      <div>
                        <span className="text-stone-500 text-xs">Actual</span>
                        <p className={`font-medium mt-0.5 ${getTimeColor(flight.departure.actualTime, flight.departure.time)}`}>
                          {flight.departure.actualTime}
                        </p>
                      </div>
                      {flight.departure.gate && (
                        <div>
                          <span className="text-stone-500 text-xs">Gate</span>
                          <p className="font-medium text-stone-900 mt-0.5">{flight.departure.gate}</p>
                        </div>
                      )}
                      {flight.departure.checkInCounter && (
                        <div className="col-span-2">
                          <span className="text-stone-500 text-xs">Check-in</span>
                          <p className="font-medium text-stone-900 mt-0.5">{flight.departure.checkInCounter}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrival Details */}
                  <div className="mb-5 bg-white p-4 rounded-lg border border-stone-200">
                    <h4 className="font-semibold text-stone-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      Arrival Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {flight.arrival.terminal && (
                        <div>
                          <span className="text-stone-500 text-xs">Terminal</span>
                          <p className="font-medium text-stone-900 mt-0.5">{flight.arrival.terminal}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-stone-500 text-xs">Scheduled</span>
                        <p className="font-medium text-stone-900 mt-0.5">{flight.arrival.time}</p>
                      </div>
                      <div>
                        <span className="text-stone-500 text-xs">Actual</span>
                        <p className={`font-medium mt-0.5 ${getTimeColor(flight.arrival.actualTime, flight.arrival.time)}`}>
                          {flight.arrival.actualTime}
                        </p>
                      </div>
                      {flight.arrival.gate && (
                        <div>
                          <span className="text-stone-500 text-xs">Gate</span>
                          <p className="font-medium text-stone-900 mt-0.5">{flight.arrival.gate}</p>
                        </div>
                      )}
                      {flight.arrival.baggageClaim && (
                        <div className="col-span-2">
                          <span className="text-stone-500 text-xs">Baggage</span>
                          <p className="font-medium text-stone-900 mt-0.5">{flight.arrival.baggageClaim}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Aircraft */}
                  {flight.aircraft && (
                    <div className="mb-5 bg-white p-4 rounded-lg border border-stone-200">
                      <h4 className="font-semibold text-stone-900 mb-2 text-sm uppercase tracking-wide">Aircraft</h4>
                      <p className="text-sm text-stone-600">{flight.aircraft}</p>
                    </div>
                  )}

                  {/* Gate Changes */}
                  {flight.gateChanges && flight.gateChanges.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-stone-900 mb-3 text-sm uppercase tracking-wide">Gate Changes</h4>
                      <div className="space-y-2">
                        {flight.gateChanges.map((change, idx) => (
                          <div key={idx} className="text-sm bg-amber-50 p-3 rounded-lg border border-amber-200">
                            <span className="font-semibold text-amber-900">
                              {change.from} → {change.to}
                            </span>
                            <span className="text-amber-700 ml-2">at {change.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
