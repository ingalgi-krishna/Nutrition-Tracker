/*
 * Nutrition Tracker - ESP32-CAM Food Recognition
 *
 * This code:
 * 1. Initializes ESP32-CAM hardware
 * 2. Connects to Wi-Fi
 * 3. Sets up a button trigger for image capture
 * 4. Captures food images when triggered
 * 5. Sends the captured image to the server for analysis
 *
 * Hardware requirements:
 * - ESP32-CAM module
 * - Push button connected to GPIO pin (default: GPIO33)
 * - Battery power source for wearable use
 */

#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <base64.h>

// Wi-Fi credentials - replace with your network details
const char *ssid = "YOUR_WIFI_SSID";
const char *password = "YOUR_WIFI_PASSWORD";

// Server endpoint - replace with your actual server
const char *serverUrl = "https://your-nutrition-tracker-app.com/api/upload-image";
// UserID - replace with your actual user ID
const char *userId = "your_user_id";

// Button pin for triggering image capture
const int buttonPin = 33;
bool buttonPressed = false;

// Flash LED control
const int flashLedPin = 4;

// Camera pins for AI Thinker ESP32-CAM
#define PWDN_GPIO_NUM 32
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM 0
#define SIOD_GPIO_NUM 26
#define SIOC_GPIO_NUM 27
#define Y9_GPIO_NUM 35
#define Y8_GPIO_NUM 34
#define Y7_GPIO_NUM 39
#define Y6_GPIO_NUM 36
#define Y5_GPIO_NUM 21
#define Y4_GPIO_NUM 19
#define Y3_GPIO_NUM 18
#define Y2_GPIO_NUM 5
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM 23
#define PCLK_GPIO_NUM 22

// Camera buffer
camera_fb_t *fb = NULL;

void setup()
{
    // Initialize serial communication
    Serial.begin(115200);
    Serial.println("Nutrition Tracker ESP32-CAM starting...");

    // Initialize the camera
    initCamera();

    // Initialize the button and flash LED
    pinMode(buttonPin, INPUT_PULLUP);
    pinMode(flashLedPin, OUTPUT);
    digitalWrite(flashLedPin, LOW);

    // Connect to Wi-Fi
    connectToWiFi();
}

void loop()
{
    // Check if button is pressed (LOW when pressed with INPUT_PULLUP)
    if (digitalRead(buttonPin) == LOW && !buttonPressed)
    {
        buttonPressed = true;

        Serial.println("Button pressed, capturing image...");

        // Turn on flash
        digitalWrite(flashLedPin, HIGH);
        delay(100); // Give time for flash to stabilize

        // Capture image
        captureImage();

        // Turn off flash
        digitalWrite(flashLedPin, LOW);

        // Send image to server
        sendImageToServer();

        // Small delay to avoid bounce
        delay(500);
    }

    // Reset button state when released
    if (digitalRead(buttonPin) == HIGH && buttonPressed)
    {
        buttonPressed = false;
    }

    // Small delay in main loop
    delay(100);
}

void initCamera()
{
    // Configure camera
    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer = LEDC_TIMER_0;
    config.pin_d0 = Y2_GPIO_NUM;
    config.pin_d1 = Y3_GPIO_NUM;
    config.pin_d2 = Y4_GPIO_NUM;
    config.pin_d3 = Y5_GPIO_NUM;
    config.pin_d4 = Y6_GPIO_NUM;
    config.pin_d5 = Y7_GPIO_NUM;
    config.pin_d6 = Y8_GPIO_NUM;
    config.pin_d7 = Y9_GPIO_NUM;
    config.pin_xclk = XCLK_GPIO_NUM;
    config.pin_pclk = PCLK_GPIO_NUM;
    config.pin_vsync = VSYNC_GPIO_NUM;
    config.pin_href = HREF_GPIO_NUM;
    config.pin_sscb_sda = SIOD_GPIO_NUM;
    config.pin_sscb_scl = SIOC_GPIO_NUM;
    config.pin_pwdn = PWDN_GPIO_NUM;
    config.pin_reset = RESET_GPIO_NUM;
    config.xclk_freq_hz = 20000000;
    config.pixel_format = PIXFORMAT_JPEG;

    // Image quality and buffer size settings
    // Use lower quality for faster uploads, higher quality for better recognition
    config.jpeg_quality = 12; // 0-63, lower means higher quality
    config.fb_count = 1;

    // Initial buffer size
    if (psramFound())
    {
        config.frame_size = FRAMESIZE_UXGA; // 1600x1200
        config.jpeg_quality = 10;           // Better quality if PSRAM is available
    }
    else
    {
        config.frame_size = FRAMESIZE_SVGA; // 800x600
        config.jpeg_quality = 12;
    }

    // Initialize the camera
    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK)
    {
        Serial.printf("Camera init failed with error 0x%x", err);
        delay(1000);
        ESP.restart();
    }

    // Set camera parameters after init
    sensor_t *s = esp_camera_sensor_get();
    s->set_brightness(s, 0);                 // -2 to 2
    s->set_contrast(s, 0);                   // -2 to 2
    s->set_saturation(s, 0);                 // -2 to 2
    s->set_special_effect(s, 0);             // 0 = No Effect, 1 = Negative, 2 = Grayscale, etc.
    s->set_whitebal(s, 1);                   // 0 = Disable, 1 = Enable
    s->set_awb_gain(s, 1);                   // 0 = Disable, 1 = Enable
    s->set_wb_mode(s, 0);                    // 0 = Auto, 1 = Sunny, 2 = Cloudy, etc.
    s->set_exposure_ctrl(s, 1);              // 0 = Disable, 1 = Enable
    s->set_aec2(s, 0);                       // 0 = Disable, 1 = Enable
    s->set_gain_ctrl(s, 1);                  // 0 = Disable, 1 = Enable
    s->set_agc_gain(s, 0);                   // 0 to 30
    s->set_gainceiling(s, (gainceiling_t)0); // 0 to 6
    s->set_bpc(s, 0);                        // 0 = Disable, 1 = Enable
    s->set_wpc(s, 1);                        // 0 = Disable, 1 = Enable
    s->set_raw_gma(s, 1);                    // 0 = Disable, 1 = Enable
    s->set_lenc(s, 1);                       // 0 = Disable, 1 = Enable
    s->set_hmirror(s, 0);                    // 0 = Disable, 1 = Enable
    s->set_vflip(s, 0);                      // 0 = Disable, 1 = Enable

    Serial.println("Camera initialized successfully");
}

void connectToWiFi()
{
    Serial.printf("Connecting to WiFi: %s\n", ssid);

    WiFi.begin(ssid, password);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20)
    {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED)
    {
        Serial.println("\nWiFi connected!");
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
    }
    else
    {
        Serial.println("\nFailed to connect to WiFi. Will try again in next cycle.");
    }
}

void captureImage()
{
    // Take a photo
    Serial.println("Taking a photo...");

    fb = esp_camera_fb_get();
    if (!fb)
    {
        Serial.println("Camera capture failed");
        return;
    }

    Serial.printf("Image captured! Size: %zu bytes\n", fb->len);
}

void sendImageToServer()
{
    if (!fb)
    {
        Serial.println("No image to send");
        return;
    }

    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("WiFi not connected. Reconnecting...");
        connectToWiFi();

        if (WiFi.status() != WL_CONNECTED)
        {
            Serial.println("Still couldn't connect to WiFi. Aborting image upload.");
            // Free the camera buffer
            esp_camera_fb_return(fb);
            fb = NULL;
            return;
        }
    }

    Serial.println("Converting image to Base64...");

    // Get the image data as base64
    String base64Image = base64::encode(fb->buf, fb->len);

    // Free the camera buffer
    esp_camera_fb_return(fb);
    fb = NULL;

    Serial.printf("Base64 image size: %d\n", base64Image.length());

    // Create JSON document
    DynamicJsonDocument doc(20000); // Adjust size as needed
    doc["userId"] = userId;
    doc["imageBase64"] = "data:image/jpeg;base64," + base64Image;

    String jsonBody;
    serializeJson(doc, jsonBody);

    // Send HTTP POST request
    HTTPClient http;

    Serial.printf("Sending image to server: %s\n", serverUrl);
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Send the request
    int httpResponseCode = http.POST(jsonBody);

    // Check the response
    if (httpResponseCode > 0)
    {
        String response = http.getString();
        Serial.printf("HTTP Response code: %d\n", httpResponseCode);
        Serial.println("Server response: " + response);
    }
    else
    {
        Serial.printf("HTTP Request failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
    }

    // Close the connection
    http.end();
}