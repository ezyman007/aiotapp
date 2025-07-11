# AIoT SensorHub

A mobile-responsive Next.js application that visualizes real-time sensor data from device sensors including accelerometer, microphone, proximity, magnetometer, ambient light, GPS, network info, and user agent data.

## Features

- **Real-time Sensor Visualization**: Charts, gauges, and 3D visualizations for all device sensors
- **Mobile Responsive**: Optimized for mobile devices with touch-friendly interface
- **Theme Switching**: 5 beautiful themes with smooth transitions
- **WebSocket Streaming**: Real-time data streaming over WebSocket connections
- **3D Visualizations**: Fighter jet model that responds to accelerometer data
- **GPS Integration**: Google Maps integration with rate limiting
- **HTTPS Support**: Local HTTPS development for mobile testing

## Rate Limiting

The app implements sophisticated rate limiting for Google API calls to prevent hitting API quotas:

### Rate Limit Configuration
- **Per Minute**: 5 calls (conservative limit)
- **Per Hour**: 50 calls
- **Per Day**: 500 calls

### Features
- **Automatic Cooldown**: Blocks API calls when limits are exceeded
- **Position Change Detection**: Only updates map when location changes significantly (>10m)
- **Real-time Status**: Shows remaining calls and rate limit status
- **Error Handling**: Graceful fallback when rate limited

### Rate Limit Status Display
- **Green**: Normal operation
- **Yellow**: Low remaining calls (< 3)
- **Orange**: Rate limited with countdown timer

## Sensors Supported

- **Accelerometer**: X, Y, Z values with Roll, Pitch, Yaw calculations
- **Microphone**: Volume levels and frequency analysis
- **Proximity**: Distance measurements
- **Magnetometer**: Compass with directional indicators
- **Ambient Light**: Lux measurements with color-coded tank gauge
- **GPS**: Location with Google Maps integration
- **Network**: Connection type, speed, and latency
- **User Agent**: Device and browser information

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- mkcert (for HTTPS development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create .env.local file
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. Set up HTTPS for local development:
   ```bash
   npm run setup-https
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### HTTPS Setup for Mobile Testing

The app includes scripts to set up HTTPS for local development:

```bash
# Install mkcert
npm install --save-dev mkcert

# Generate certificates
npm run setup-https

# Start with HTTPS
npm run dev:https
```

## API Rate Limiting

The app implements intelligent rate limiting for Google Maps API calls:

### Configuration
- Conservative limits to stay well within Google's free tier
- Automatic position change detection to minimize unnecessary API calls
- Real-time status monitoring and user feedback

### Best Practices
- Only updates map when location changes significantly
- Shows rate limit status in the header
- Graceful degradation when limits are exceeded
- Automatic cooldown periods to prevent quota exhaustion

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Chart.js**: Data visualization
- **Three.js**: 3D graphics
- **React Three Fiber**: React Three.js integration
- **WebSocket**: Real-time data streaming

## Mobile Compatibility

- Optimized for mobile sensors
- Touch-friendly interface
- Responsive design
- HTTPS support for secure sensor access
- Permission handling for device sensors

## License

MIT License

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
