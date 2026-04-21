# ☀️ SunSync

A modern, privacy-first UV index forecasting app that helps users find the perfect time to tan. Get real-time personalized UV forecasts for your location with zero data collection.

**[Live Demo](https://sunsync99.vercel.app)** | **[GitHub](https://github.com/petervannord/SunSync)**

## 🌟 Features

- **Real-Time UV Forecasting**: Get accurate UV index predictions for your specific location
- **Personalized Tanning Windows**: Discover optimal tanning times based on your preferred UV range
- **Privacy First**: All data is stored locally on your device. No tracking, no data collection, no servers storing your information
- **Progressive Web App**: Install on your home screen for quick, offline-ready access
- **Responsive Design**: Beautiful, modern UI that works seamlessly on mobile, tablet, and desktop
- **Smart Notifications**: 
  - Browser push notifications for optimal tanning conditions
  - Daily SMS alerts with your best tanning windows (optional)
- **Customizable Preferences**: Set your ideal UV range for personalized recommendations
- **Free Service**: Completely free to use with optional small ad banners planned for future versions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/petervannord/SunSync.git
cd SunSync
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

### Build for Production

```bash
npm run build
npm run start
```

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- **Next.js 14** - React framework with App Router for server and client components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality React component library
- **Lucide Icons** - Beautiful, accessible SVG icons

**APIs:**
- **Open-Meteo** - Free weather and UV data API (no authentication required)
- **Nominatim** - OpenStreetMap reverse geocoding for location names

**Deployment:**
- **Vercel** - Fast, reliable Next.js hosting

### Project Structure

```
├── app/
│   ├── page.tsx              # Main home page with UV display
│   ├── settings/
│   │   └── page.tsx          # User preferences and notifications
│   ├── api/
│   │   ├── send-sms/        # SMS notification endpoint
│   │   ├── subscribe/       # SMS subscription management
│   │   ├── uv/              # UV data endpoint
│   │   └── cron/            # Scheduled tasks
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/
│   ├── uv-display.tsx       # Current UV display card
│   ├── uv-scale.tsx         # UV scale bar visualization
│   ├── uv-forecast.tsx      # Hourly forecast cards
│   ├── tanning-windows.tsx  # Optimal tanning time windows
│   ├── notification-settings.tsx  # Push & SMS configuration
│   ├── welcome-modal.tsx    # First-time user onboarding
│   ├── location-picker.tsx  # Location search and geolocation
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── uv-types.ts          # TypeScript interfaces and utilities
│   ├── storage.ts           # LocalStorage management
│   ├── push-notifications.ts # Push notification logic
│   └── utils.ts             # Utility functions
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── sw.js               # Service worker
│   └── icons/              # App icons
└── scripts/
    └── sql/                # Database migrations
```

## 🔒 Privacy & Data

**SunSync respects your privacy:**

- ✅ **No data collection** - We don't store any of your personal information on our servers
- ✅ **Local storage only** - All preferences and data are stored exclusively on your device using browser localStorage
- ✅ **No tracking** - We use no analytics, trackers, or third-party monitoring
- ✅ **Device-controlled** - Location permissions are managed entirely by your browser and device
- ✅ **Open source** - Review the code yourself to verify our privacy practices

The only external calls are to:
- **Open-Meteo API** - To fetch weather and UV data (no personal data sent)
- **Nominatim API** - To convert coordinates to location names (no personal data sent)

Both services have their own privacy policies available on their respective websites.

## 🎯 Use Cases

- **Tanning Enthusiasts**: Find the perfect UV conditions for an efficient, safe tan
- **Outdoor Fitness**: Plan workouts during low UV times to protect skin
- **General UV Awareness**: Understand daily UV levels and sun exposure risks
- **Family Planning**: Know when to keep kids indoors during extreme UV

## 📱 Features in Detail

### Current UV Display
See real-time UV levels with color-coded severity indicators and protective recommendations.

### UV Scale Visualization
An interactive bar showing the spectrum from "Low" to "Extreme" with your preferred tanning range highlighted.

### Hourly Forecast
24-hour breakdown of UV levels with optimal tanning windows highlighted.

### Best Times to Tan
Smart algorithm identifies 2-4 hour windows each day when UV levels are in your target range.

### Customizable Alerts
- Set your UV range preferences
- Receive browser notifications
- Daily SMS alerts with best tanning windows (optional)
- Choose notification times

### Progressive Web App
- Install on any device's home screen
- Works offline with cached data
- Native app-like experience

## 🚀 Getting Started for Users

1. **Visit the App**: Navigate to [SunSync](https://sunsync-app.vercel.app)
2. **Enable Location**: Grant location permission for real-time UV data
3. **Customize Range**: Set your ideal UV range in settings (default: 4-7 UV)
4. **Setup Alerts** (Optional): Enable push notifications or daily SMS alerts
5. **View Forecasts**: Check today's tanning windows and hourly breakdown

## 📊 UV Index Guide

| UV Level | Range  | Description | Recommendation |
|----------|--------|-------------|-----------------|
| Low | 0-2 | Minimal tanning benefit | No protection needed |
| Moderate | 3 | Low tanning benefit | Apply sunscreen |
| Good | 4-5 | Good for tanning | Apply sunscreen, 15-20 min |
| Optimal | 6-7 | Best tanning conditions | Apply sunscreen, 10-15 min |
| Very High | 8-10 | Risk of burn | Limit exposure, sunscreen |
| Extreme | 11+ | Severe burn risk | Avoid outdoors |

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file (if using SMS features):

```env
# Optional: Twilio for SMS (if implementing SMS feature)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### Customization

Edit preferences in `lib/uv-types.ts`:
```typescript
export const DEFAULT_PREFERENCES: UserPreferences = {
  uvMinRange: 4,      // Default minimum UV
  uvMaxRange: 7,      // Default maximum UV
  notificationTime: '08:00',  // Default alert time
  // ...
}
```

## 🧪 Testing

The app uses static UV data for development/demo purposes. To use real API data:

1. Replace `staticUVData` in `app/page.tsx` with API calls to Open-Meteo
2. Implement location-based API routes in `app/api/uv/route.ts`

## 📦 Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Deploy to Other Platforms

The project is a standard Next.js app and can be deployed to:
- Netlify
- AWS Amplify
- Self-hosted servers
- Docker containers

## 🤝 Contributing

This is a personal portfolio project, but suggestions and feedback are welcome!

Feel free to:
- Report bugs via GitHub issues
- Suggest features
- Fork and experiment
- Share ideas for improvements

## 📄 License

This project is open source and available under the MIT License. See the LICENSE file for details.

## 👨‍💻 Developer

**Peter Van Nord**
- GitHub: [@petervannord](https://github.com/petervannord)

## 🙏 Acknowledgments

- **Open-Meteo** for providing free, reliable weather and UV data
- **Nominatim/OSM** for geocoding services
- **shadcn/ui** for beautiful, accessible components
- **Vercel** for excellent Next.js hosting

## 📚 Resources

- [UV Index Information - EPA](https://www.epa.gov/sunwise/uv-index)
- [Open-Meteo API Docs](https://open-meteo.com/en/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Progressive Web Apps](https://developers.google.com/web/progressive-web-apps)

---

**Made with 😏 and ❤️**

Built as a portfolio project showcasing modern web development practices: responsive design, progressive web apps, privacy-first architecture, and clean code.
