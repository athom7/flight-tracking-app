# Flight Tracker

A modern, mobile-first flight tracking application built with React, featuring voice input, real-time API data, and offline support.

## Features

- **Voice Input**: Add flights using voice commands with Web Speech API
- **Real-time Data**: Integration with AviationStack API for live flight information
- **Offline Support**: Comprehensive mock data for testing and offline use
- **Mobile-First Design**: Optimized for mobile devices with touch-friendly interface
- **Drag-to-Reorder**: Manually organize flights by dragging
- **Auto-Sorting**: Flights automatically sort by departure date and time
- **Tap-to-Expand**: View detailed flight information with a single tap
- **PWA Ready**: Install as a Progressive Web App on mobile and desktop

## Tech Stack

- **React 18+**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling with mobile-first approach
- **Lucide React**: Beautiful icon library
- **Web Speech API**: Browser-based voice recognition

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd flight-tracking-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Adding Flights

1. Click the **+** button in the header
2. Enter flight number manually or use the microphone button for voice input
3. Select the date
4. Click **Add Flight**

### Voice Input

Speak flight numbers in formats like:
- "KL six nine two"
- "Lufthansa four fifty six"
- "KL 692"

### API Configuration

1. Click the **Settings** icon in the header
2. Enter your AviationStack API key
3. The app will fetch live data for new flights

Without an API key, the app uses mock data for demonstration.

### Managing Flights

- **Expand**: Tap any flight card to view detailed information
- **Delete**: Click the trash icon to remove a flight
- **Reorder**: Drag flights using the grip handle

## Project Structure

```
flight-tracking-app/
├── public/
│   └── manifest.json          # PWA manifest
├── src/
│   ├── utils/
│   │   ├── api.js            # AviationStack API integration
│   │   └── mockData.js       # Sample flight data
│   ├── App.jsx               # Root component
│   ├── FlightTracker.jsx     # Main application component
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles with Tailwind
├── index.html                # HTML template
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind configuration
├── vite.config.js            # Vite configuration
└── README.md                 # This file
```

## Features in Detail

### State Management
All state is managed using React hooks (useState, useEffect). No external state management libraries required.

### Mock Data
The app includes 7 sample flights:
- KL 692 (Amsterdam → Calgary)
- KL 693 (Calgary → Amsterdam)
- SK 1234 (Copenhagen → Amsterdam) - Delayed with gate change
- SK 1235 (Amsterdam → Copenhagen)
- AC 856 (Toronto → London) - Boarding
- LH 456 (Frankfurt → New York) - In Air
- BA 902 (London → Dubai) - Delayed, Landed

### Browser Compatibility
- Chrome/Edge (full support)
- Safari (iOS and macOS)
- Firefox (limited voice input support)
- Modern browsers with ES6+ support

### Mobile Support
- Touch-optimized interface
- 44px minimum tap targets
- Mobile-first responsive design
- PWA installation support on iOS and Android

## API Integration

### AviationStack

Sign up for a free API key at [aviationstack.com](https://aviationstack.com)

**Free Tier Limits:**
- 100 requests per month
- Basic flight information
- No HTTPS on free tier (HTTP only)

**Alternative Approach:**
For production use, consider implementing a backend proxy to:
- Hide API keys from client
- Cache responses
- Add rate limiting
- Provide HTTPS support

## Performance

- Initial load: < 2 seconds
- Add flight (API): < 1 second
- Add flight (mock): < 100ms
- Voice recognition start: < 500ms
- 60fps animations

## Security Considerations

**Current Implementation:**
- API key stored in component state (memory only)
- Not persisted (no localStorage in this version)
- Never committed to version control

**Production Recommendations:**
- Use backend API proxy
- Implement authentication
- Add request signing
- Enable rate limiting

## Future Enhancements

### v1.1
- [ ] localStorage support for persistent state
- [ ] Individual flight refresh
- [ ] Better error messages
- [ ] Loading skeletons
- [ ] Flight search functionality

### v2.0
- [ ] Backend API proxy
- [ ] User authentication
- [ ] Cloud sync between devices
- [ ] Push notifications for flight updates
- [ ] Multiple trip management
- [ ] Sharing flight information

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with React and Vite
- Icons by Lucide
- Flight data from AviationStack API
- Inspired by modern flight tracking apps

## Support

For issues and questions:
- Open an issue on GitHub
- Check the technical specification document
- Review the code comments

## Deployment

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure redirects for SPA

### Vercel

1. Connect your repository to Vercel
2. Vercel will auto-detect Vite
3. Deploy with default settings

### GitHub Pages

1. Update `vite.config.js` with base path
2. Build: `npm run build`
3. Deploy `dist` folder to gh-pages branch

---

**Made with React and Tailwind CSS**