# ESP32-CAM Setup for NutriTrack

This guide will help you set up the ESP32-CAM component of the NutriTrack system.

## Hardware Requirements

1. ESP32-CAM module (AI-Thinker or similar)
2. FTDI programmer or USB-to-Serial adapter for programming
3. Push button
4. 10K resistor (for button)
5. LEDs (optional for status indicators)
6. Battery or power source (3.3V)
7. Small breadboard and jumper wires

## Wiring Diagram

For programming:
```
ESP32-CAM      FTDI Adapter
---------      ------------
5V/VCC    -->  VCC (5V or 3.3V depending on your model)
GND       -->  GND
U0R (GPIO3) --> TX
U0T (GPIO1) --> RX
```

Don't forget to connect GPIO0 to GND during programming, then disconnect for normal operation.

For operation:
```
ESP32-CAM      Components
---------      ----------
GPIO33    -->  Push Button (other end to GND)
           |
           -->  10K resistor (other end to 3.3V) - Pull-up resistor
GND       -->  GND
5V/VCC    -->  Power source positive terminal
```

## Software Setup

1. Install Arduino IDE (version 1.8.13 or later recommended)

2. Add ESP32 board support:
   - Go to File > Preferences
   - Add `https://dl.espressif.com/dl/package_esp32_index.json` to Additional Boards Manager URLs
   - Go to Tools > Board > Boards Manager
   - Search for ESP32 and install "ESP32 by Espressif Systems"

3. Install required libraries:
   - Go to Sketch > Include Library > Manage Libraries
   - Install the following libraries:
     - ArduinoJson (version 6.x)
     - Base64 (by Arturo Guadalupi)

4. Configure Arduino IDE:
   - Board: "AI Thinker ESP32-CAM"
   - CPU Frequency: "240MHz"
   - Flash Frequency: "80MHz"
   - Flash Mode: "QIO"
   - Flash Size: "4MB (32Mb)"
   - Partition Scheme: "Default"
   - Core Debug Level: "None"
   - PSRAM: "Enabled"

5. Configure the Code:
   - Open `NutritionTracker.ino`
   - Update the following variables:
     - `ssid` and `password` with your WiFi credentials
     - `serverUrl` with your application's API endpoint (e.g., "http://your-server.com/api/upload-image")
     - `userId` with the user ID from your application database

6. Upload the Code:
   - Connect GPIO0 to GND (puts the ESP32-CAM in programming mode)
   - Connect the ESP32-CAM to your computer via the FTDI adapter
   - Select the correct COM port in Arduino IDE
   - Click Upload
   - After uploading, disconnect GPIO0 from GND and reset the board

## Usage

1. Power on the ESP32-CAM
2. The device will automatically connect to WiFi
3. Place the device close to food items
4. Press the push button to capture an image
5. The ESP32-CAM will send the image to your server for analysis
6. The results will be displayed in your NutriTrack application

## Troubleshooting

- **Cannot upload sketch**: Make sure GPIO0 is connected to GND during programming
- **WiFi connection issues**: Verify your SSID and password are correct
- **Camera initialization failure**: Check all camera connections, try resetting the board
- **Server connection issues**: Ensure your server is running and accessible, check the URL format
- **Image quality problems**: Adjust camera settings in the `initCamera()` function

## Extending the Project

- **Power Management**: Add sleep mode functionality to extend battery life
- **Multiple Buttons**: Add buttons for different functions (e.g., one for breakfast, one for lunch)
- **Status LEDs**: Add LEDs to indicate WiFi connection, successful upload, etc.
- **Local Display**: Connect a small OLED display to show immediate feedback
- **Enclosure**: Design a 3D-printable case to make the device wearable and weather-resistant

For more information, consult the [ESP32-CAM documentation](https://github.com/espressif/arduino-esp32/tree/master/libraries/ESP32/examples/Camera).