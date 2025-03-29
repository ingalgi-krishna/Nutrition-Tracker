#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <base64.h>

// ===========================
// Wi-Fi Credentials
// ===========================
const char *ssid = "OMKAR";
const char *password = "00000000";

// Server endpoint - replace with your actual server
const char *serverUrl = "http://localhost:3000/api/upload-image";
// UserID - replace with your actual user ID
const char *userId = "your_user_id";

// ===========================
// Camera Model Selection
// ===========================
#define CAMERA_MODEL_AI_THINKER  // Has PSRAM
#include "camera_pins.h"

// ===========================
// Button & Flash LED Setup
// ===========================
const int buttonPin = 33;
bool buttonPressed = false;
const int flashLedPin = 4;

// ===========================
// Function Declarations
// ===========================
void startCameraServer();
void setupLedFlash(int pin);
void initCamera();
void captureImage();
void sendImageToServer();
void connectToWiFi();

// ===========================
// Setup Function
// ===========================
void setup() {
    Serial.begin(115200);
    Serial.setDebugOutput(true);
    Serial.println("\nESP32-CAM Food Tracker & Streamer Starting...");

    // Initialize Camera
    initCamera();

    // Setup button & flash LED
    pinMode(buttonPin, INPUT_PULLUP);
    pinMode(flashLedPin, OUTPUT);
    digitalWrite(flashLedPin, LOW);

    // Connect to Wi-Fi
    connectToWiFi();

    // Start Camera Web Streaming Server
    startCameraServer();

    Serial.print("Camera Ready! Access stream at: http://");
    Serial.println(WiFi.localIP());
}

// ===========================
// Main Loop
// ===========================
void loop() {
    // Check if button is pressed
    if (digitalRead(buttonPin) == LOW && !buttonPressed) {
        buttonPressed = true;
        Serial.println("Button pressed, capturing image...");

        // Turn on flash
        digitalWrite(flashLedPin, HIGH);
        delay(100);

        // Capture image
        captureImage();

        // Turn off flash
        digitalWrite(flashLedPin, LOW);

        // Send image to server
        sendImageToServer();

        delay(500);  // Debounce delay
    }

    // Reset button state when released
    if (digitalRead(buttonPin) == HIGH && buttonPressed) {
        buttonPressed = false;
    }

    delay(100);
}

// ===========================
// Camera Initialization
// ===========================
void initCamera() {
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
    config.pin_sccb_sda = SIOD_GPIO_NUM;
    config.pin_sccb_scl = SIOC_GPIO_NUM;
    config.pin_pwdn = PWDN_GPIO_NUM;
    config.pin_reset = RESET_GPIO_NUM;
    config.xclk_freq_hz = 20000000;
    config.pixel_format = PIXFORMAT_JPEG;
    config.fb_location = CAMERA_FB_IN_PSRAM;
    config.grab_mode = CAMERA_GRAB_LATEST;
    config.jpeg_quality = 12;
    config.fb_count = psramFound() ? 2 : 1;

    if (psramFound()) {
        config.frame_size = FRAMESIZE_UXGA;
        config.jpeg_quality = 10;
    } else {
        config.frame_size = FRAMESIZE_SVGA;
    }

    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) {
        Serial.printf("Camera init failed with error 0x%x\n", err);
        delay(1000);
        ESP.restart();
    }

    Serial.println("Camera initialized successfully");
}

// ===========================
// Wi-Fi Connection
// ===========================
void connectToWiFi() {
    Serial.printf("Connecting to WiFi: %s\n", ssid);
    WiFi.begin(ssid, password);
    WiFi.setSleep(false);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi connected!");
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\nFailed to connect to WiFi.");
    }
}

// ===========================
// Capture Image Function
// ===========================
void captureImage() {
    Serial.println("Taking a photo...");
    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("Camera capture failed");
        return;
    }
    Serial.printf("Image captured! Size: %zu bytes\n", fb->len);
    esp_camera_fb_return(fb);
}

// ===========================
// Send Image to Server
// ===========================
void sendImageToServer() {
    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("No image captured");
        return;
    }

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi disconnected, reconnecting...");
        connectToWiFi();
        if (WiFi.status() != WL_CONNECTED) {
            Serial.println("Still disconnected, aborting image upload.");
            esp_camera_fb_return(fb);
            return;
        }
    }

    Serial.println("Converting image to Base64...");
    String base64Image = base64::encode(fb->buf, fb->len);
    esp_camera_fb_return(fb);

    Serial.printf("Base64 image size: %d\n", base64Image.length());

    // Create JSON payload
    DynamicJsonDocument doc(20000);
    doc["userId"] = userId;
    doc["imageBase64"] = "data:image/jpeg;base64," + base64Image;

    String jsonBody;
    serializeJson(doc, jsonBody);

    // Send HTTP POST request
    HTTPClient http;
    Serial.printf("Sending image to server: %s\n", serverUrl);
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(jsonBody);

    if (httpResponseCode > 0) {
        Serial.printf("HTTP Response code: %d\n", httpResponseCode);
        String response = http.getString();
        Serial.println("Server response: " + response);
    } else {
        Serial.printf("HTTP Request failed: %s\n", http.errorToString(httpResponseCode).c_str());
    }

    http.end();
}

