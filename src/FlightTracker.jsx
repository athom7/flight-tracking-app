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

  // Pull-to-refresh state
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(0);

  const recognitionRef = useRef(null);
  const scrollContainerRef = useRef(null);

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
        return 'text-green-600 bg-green-50';
      case 'delayed':
        return 'text-orange-600 bg-orange-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Get time color (compare actual vs scheduled)
  const getTimeColor = (actual, scheduled) => {
    if (!actual || !scheduled) return 'text-gray-900';
    return actual !== scheduled ? 'text-orange-600' : 'text-green-600';
  };

  // Pull-to-refresh handlers
  const handleTouchStart = (e) => {
    if (scrollContainerRef.current && scrollContainerRef.current.scrollTop === 0) {
      setTouchStart(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (touchStart === 0) return;
    if (scrollContainerRef.current && scrollContainerRef.current.scrollTop > 0) {
      setTouchStart(0);
      return;
    }

    const touchCurrent = e.touches[0].clientY;
    const distance = touchCurrent - touchStart;

    if (distance > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(distance, 150));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 80) {
      setIsRefreshing(true);
      await refreshFlights();
      setIsRefreshing(false);
    }

    setIsPulling(false);
    setPullDistance(0);
    setTouchStart(0);
  };

  // Refresh flights data
  const refreshFlights = async () => {
    // Simulate API refresh delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Refresh all flights with API data if available
    if (apiKey) {
      const refreshedFlights = await Promise.all(
        flights.map(async (flight) => {
          try {
            const refreshedData = await fetchFlightData(
              flight.flightNumber,
              flight.date,
              apiKey
            );
            return refreshedData || flight;
          } catch (error) {
            console.error(`Failed to refresh flight ${flight.flightNumber}:`, error);
            return flight;
          }
        })
      );
      setFlights(sortFlights(refreshedFlights));
    } else {
      // Just re-sort if no API key
      setFlights(sortFlights([...flights]));
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      className="min-h-screen bg-gray-100 pb-20 overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div
          className="fixed top-16 left-0 right-0 flex justify-center items-center z-20 transition-all duration-300"
          style={{
            transform: `translateY(${isPulling ? pullDistance * 0.5 : 0}px)`,
            opacity: pullDistance > 30 ? 1 : pullDistance / 30
          }}
        >
          <div className="bg-white rounded-full p-4 shadow-lg">
            <Plane
              className={`w-8 h-8 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`}
              style={{
                transform: isPulling && !isRefreshing ? `rotate(${pullDistance * 2}deg)` : undefined
              }}
            />
          </div>
          {pullDistance > 80 && !isRefreshing && (
            <span className="absolute -bottom-8 text-sm text-gray-600 font-medium">
              Release to refresh
            </span>
          )}
        </div>
      )}

      {/* Header */}
      <header className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-mobile mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-6 h-6" />
            <h1 className="text-xl font-bold">Flight Tracker</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              aria-label="Add flight"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-mobile mx-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                  AviationStack API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {apiKey && (
                    <button
                      onClick={clearApiKey}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                      aria-label="Clear API key"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${apiKey ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-gray-600">
                  {apiKey ? 'Using live data' : 'Using mock data'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Flight Form */}
      {showAddForm && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-mobile mx-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Add Flight</h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setError('');
                  setVoiceTranscript('');
                }}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Close form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Flight Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="flightNumber"
                    value={newFlight.flightNumber}
                    onChange={(e) => setNewFlight({ ...newFlight, flightNumber: e.target.value })}
                    placeholder="e.g., KL692"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleVoiceInput}
                    disabled={!recognitionRef.current}
                    className={`p-2 rounded-lg transition-colors ${
                      isListening
                        ? 'bg-red-500 text-white'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                    aria-label="Voice input"
                  >
                    <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
                {voiceTranscript && (
                  <p className="mt-1 text-xs text-gray-500">Heard: "{voiceTranscript}"</p>
                )}
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={newFlight.date}
                  onChange={(e) => setNewFlight({ ...newFlight, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddFlight}
                  disabled={isLoading}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
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
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flight List */}
      <div className="max-w-mobile mx-auto p-4 space-y-3">
        {flights.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Plane className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No flights added yet</p>
            <p className="text-sm mt-2">Tap the + button to add your first flight</p>
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
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
            >
              {/* Flight Card Header */}
              <div
                onClick={() => toggleFlightExpansion(flight.id)}
                className="p-4 cursor-pointer select-none"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 pt-1">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Flight number and airline */}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{flight.flightNumber}</h3>
                        <p className="text-sm text-gray-600">{flight.airline}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFlight(flight.id);
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                        aria-label="Delete flight"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(flight.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>

                    {/* Route visualization */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900">{flight.departure.city}</p>
                        <p className="text-sm text-gray-500">{flight.departure.airport}</p>
                      </div>
                      <Plane className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 text-right">
                        <p className="font-semibold text-gray-900">{flight.arrival.city}</p>
                        <p className="text-sm text-gray-500">{flight.arrival.airport}</p>
                      </div>
                    </div>

                    {/* Times and gates */}
                    <div className="flex justify-between text-sm mb-3">
                      <div>
                        <p className="text-gray-500">Departure</p>
                        <p className={`font-semibold ${getTimeColor(flight.departure.actualTime, flight.departure.time)}`}>
                          {flight.departure.actualTime || flight.departure.time}
                        </p>
                        {flight.departure.gate && (
                          <p className="text-gray-500">Gate {flight.departure.gate}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500">Arrival</p>
                        <p className={`font-semibold ${getTimeColor(flight.arrival.actualTime, flight.arrival.time)}`}>
                          {flight.arrival.actualTime || flight.arrival.time}
                        </p>
                        {flight.arrival.gate && (
                          <p className="text-gray-500">Gate {flight.arrival.gate}</p>
                        )}
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(flight.status)}`}>
                        {flight.status}
                        {flight.delay && ` (${flight.delay})`}
                      </span>
                      {expandedFlightId === flight.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedFlightId === flight.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  {/* Current Status */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Current Status</h4>
                    <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(flight.currentStatus)}`}>
                      {flight.currentStatus}
                    </p>
                    {flight.reason && (
                      <p className="text-sm text-gray-600 mt-2">{flight.reason}</p>
                    )}
                  </div>

                  {/* Departure Details */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Departure Details
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {flight.departure.terminal && (
                        <div>
                          <span className="text-gray-500">Terminal:</span>
                          <span className="ml-1 font-medium">{flight.departure.terminal}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Scheduled:</span>
                        <span className="ml-1 font-medium">{flight.departure.time}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Actual:</span>
                        <span className={`ml-1 font-medium ${getTimeColor(flight.departure.actualTime, flight.departure.time)}`}>
                          {flight.departure.actualTime}
                        </span>
                      </div>
                      {flight.departure.gate && (
                        <div>
                          <span className="text-gray-500">Gate:</span>
                          <span className="ml-1 font-medium">{flight.departure.gate}</span>
                        </div>
                      )}
                      {flight.departure.checkInCounter && (
                        <div className="col-span-2">
                          <span className="text-gray-500">Check-in:</span>
                          <span className="ml-1 font-medium">{flight.departure.checkInCounter}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrival Details */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Arrival Details
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {flight.arrival.terminal && (
                        <div>
                          <span className="text-gray-500">Terminal:</span>
                          <span className="ml-1 font-medium">{flight.arrival.terminal}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Scheduled:</span>
                        <span className="ml-1 font-medium">{flight.arrival.time}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Actual:</span>
                        <span className={`ml-1 font-medium ${getTimeColor(flight.arrival.actualTime, flight.arrival.time)}`}>
                          {flight.arrival.actualTime}
                        </span>
                      </div>
                      {flight.arrival.gate && (
                        <div>
                          <span className="text-gray-500">Gate:</span>
                          <span className="ml-1 font-medium">{flight.arrival.gate}</span>
                        </div>
                      )}
                      {flight.arrival.baggageClaim && (
                        <div className="col-span-2">
                          <span className="text-gray-500">Baggage:</span>
                          <span className="ml-1 font-medium">{flight.arrival.baggageClaim}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Aircraft */}
                  {flight.aircraft && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-1">Aircraft</h4>
                      <p className="text-sm text-gray-600">{flight.aircraft}</p>
                    </div>
                  )}

                  {/* Gate Changes */}
                  {flight.gateChanges && flight.gateChanges.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Gate Changes</h4>
                      <div className="space-y-1">
                        {flight.gateChanges.map((change, idx) => (
                          <div key={idx} className="text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
                            <span className="font-medium">
                              {change.from} → {change.to}
                            </span>
                            <span className="text-gray-500 ml-2">at {change.time}</span>
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
