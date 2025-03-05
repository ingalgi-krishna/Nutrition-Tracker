# NutriTrack

A smart nutrition tracking application that integrates Next.js, MongoDB, ESP32-CAM, and Google's Gemini Vision AI to help users track and analyze their food intake.

## Features

- **ESP32-CAM Integration**: Wearable device for easy food image capture
- **AI-Powered Food Recognition**: Using Gemini Vision AI to identify food and extract nutritional information
- **Personal Dashboard**: Track BMI, macronutrients, and food history
- **Personalized Recommendations**: Get food suggestions based on your health goals

## Getting Started

### Prerequisites

- Node.js 18.x or later
- MongoDB (local or Atlas)
- Google Gemini API key
- ESP32-CAM hardware (for complete functionality)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nutritrack.git
   cd nutritrack
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment variables:
   Create a `.env.local` file in the root directory with:
   ```
   MONGODB_URI=your-mongodb-connection-string
   GEMINI_API_KEY=your-gemini-api-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## ESP32-CAM Setup

For instructions on setting up the ESP32-CAM wearable device, see the [ESP32-CAM setup guide](./esp32-cam/README.md).

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Recharts
- **Backend**: Next.js API Routes, MongoDB/Mongoose
- **AI**: Google Gemini Vision AI
- **Hardware**: ESP32-CAM

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.