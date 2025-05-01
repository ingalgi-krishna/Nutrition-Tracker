#include "esp_camera.h"
#include <WiFi.h>

//
// WARNING!!! PSRAM IC required for UXGA resolution and high JPEG quality
//            Ensure ESP32 Wrover Module or other board with PSRAM is selected
//            Partial images will be transmitted if image exceeds buffer size
//
//            You must select partition scheme from the board menu that has at least 3MB APP space.
//            Face Recognition is DISABLED for ESP32 and ESP32-S2, because it takes up from 15
//            seconds to process single frame. Face Detection is ENABLED if PSRAM is enabled as well

// ===================
// Select camera model
// ===================
//#define CAMERA_MODEL_WROVER_KIT // Has PSRAM
// #define CAMERA_MODEL_ESP_EYE  // Has PSRAM
//#define CAMERA_MODEL_ESP32S3_EYE // Has PSRAM
//#define CAMERA_MODEL_M5STACK_PSRAM // Has PSRAM
//#define CAMERA_MODEL_M5STACK_V2_PSRAM // M5Camera version B Has PSRAM
//#define CAMERA_MODEL_M5STACK_WIDE // Has PSRAM
//#define CAMERA_MODEL_M5STACK_ESP32CAM // No PSRAM
//#define CAMERA_MODEL_M5STACK_UNITCAM // No PSRAM
//#define CAMERA_MODEL_M5STACK_CAMS3_UNIT  // Has PSRAM
#define CAMERA_MODEL_AI_THINKER // Has PSRAM
//#define CAMERA_MODEL_TTGO_T_JOURNAL // No PSRAM
//#define CAMERA_MODEL_XIAO_ESP32S3 // Has PSRAM
// ** Espressif Internal Boards **
//#define CAMERA_MODEL_ESP32_CAM_BOARD
//#define CAMERA_MODEL_ESP32S2_CAM_BOARD
//#define CAMERA_MODEL_ESP32S3_CAM_LCD
//#define CAMERA_MODEL_DFRobot_FireBeetle2_ESP32S3 // Has PSRAM
//#define CAMERA_MODEL_DFRobot_Romeo_ESP32S3 // Has PSRAM
#include "camera_pins.h"

// ===========================
// Enter your WiFi credentials
// ===========================
const char *ssid = "Flat 7";
const char *password = "O@8767465446";

void startCameraServer();
void setupLedFlash(int pin);

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();
  
  Serial.println("==================================================");
  Serial.println("ESP32-CAM Initialization Starting...");
  Serial.println("==================================================");
  
  Serial.println("Checking for PSRAM...");
  if(psramFound()) {
    Serial.println("[SUCCESS] PSRAM detected!");
    Serial.print("PSRAM size: ");
    Serial.print(ESP.getFreePsram() / 1024);
    Serial.println(" KB");
  } else {
    Serial.println("[WARNING] No PSRAM detected! Higher resolutions may not work.");
  }

  Serial.println("Configuring camera...");
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
  config.frame_size = FRAMESIZE_UXGA;
  config.pixel_format = PIXFORMAT_JPEG;  // for streaming
  //config.pixel_format = PIXFORMAT_RGB565; // for face detection/recognition
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;
  config.fb_count = 1;

  // if PSRAM IC present, init with UXGA resolution and higher JPEG quality
  //                      for larger pre-allocated frame buffer.
  if (config.pixel_format == PIXFORMAT_JPEG) {
    if (psramFound()) {
      Serial.println("Setting high resolution config with PSRAM...");
      config.jpeg_quality = 10;
      config.fb_count = 2;
      config.grab_mode = CAMERA_GRAB_LATEST;
    } else {
      Serial.println("Setting lower resolution config without PSRAM...");
      // Limit the frame size when PSRAM is not available
      config.frame_size = FRAMESIZE_SVGA;
      config.fb_location = CAMERA_FB_IN_DRAM;
    }
  } else {
    Serial.println("Setting up for face detection/recognition...");
    // Best option for face detection/recognition
    config.frame_size = FRAMESIZE_240X240;
#if CONFIG_IDF_TARGET_ESP32S3
    config.fb_count = 2;
#endif
  }

#if defined(CAMERA_MODEL_ESP_EYE)
  pinMode(13, INPUT_PULLUP);
  pinMode(14, INPUT_PULLUP);
  Serial.println("ESP_EYE specific pin configuration applied");
#endif

  // camera init
  Serial.println("Initializing camera...");
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("[ERROR] Camera init failed with error 0x%x\n", err);
    Serial.println("Common issues:");
    Serial.println("1. Camera module not connected properly");
    Serial.println("2. Power supply issues (camera requires stable power)");
    Serial.println("3. GPIO configuration mismatch");
    Serial.println("4. Not enough memory/PSRAM for selected resolution");
    Serial.println("Restarting in 5 seconds...");
    delay(5000);
    ESP.restart();
    return;
  }
  Serial.println("[SUCCESS] Camera initialized!");

  Serial.println("Configuring camera settings...");
  sensor_t *s = esp_camera_sensor_get();
  // initial sensors are flipped vertically and colors are a bit saturated
  if (s->id.PID == OV3660_PID) {
    Serial.println("OV3660 sensor detected, applying specific settings");
    s->set_vflip(s, 1);        // flip it back
    s->set_brightness(s, 1);   // up the brightness just a bit
    s->set_saturation(s, -2);  // lower the saturation
  }
  // drop down frame size for higher initial frame rate
  if (config.pixel_format == PIXFORMAT_JPEG) {
    Serial.print("Setting initial frame size to QVGA for higher frame rate... ");
    s->set_framesize(s, FRAMESIZE_QVGA);
    Serial.println("Done!");
  }

#if defined(CAMERA_MODEL_M5STACK_WIDE) || defined(CAMERA_MODEL_M5STACK_ESP32CAM)
  Serial.println("M5STACK model detected, flipping image");
  s->set_vflip(s, 1);
  s->set_hmirror(s, 1);
#endif

#if defined(CAMERA_MODEL_ESP32S3_EYE)
  Serial.println("ESP32S3_EYE model detected, flipping image");
  s->set_vflip(s, 1);
#endif

// Setup LED FLash if LED pin is defined in camera_pins.h
#if defined(LED_GPIO_NUM)
  Serial.print("Setting up LED flash on pin ");
  Serial.print(LED_GPIO_NUM);
  Serial.println("...");
  setupLedFlash(LED_GPIO_NUM);
  Serial.println("LED flash setup complete");
#else
  Serial.println("No LED flash pin defined, skipping LED setup");
#endif

  Serial.print("Connecting to WiFi network: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  WiFi.setSleep(false);

  Serial.print("WiFi connecting");
  int timeout_counter = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    timeout_counter++;
    if (timeout_counter >= 60) { // 30 seconds timeout
      Serial.println("");
      Serial.println("[ERROR] WiFi connection timed out!");
      Serial.println("1. Check if your WiFi credentials are correct");
      Serial.println("2. Check if your WiFi router is working");
      Serial.println("3. Check if your ESP32 is within range of the router");
      Serial.println("Restarting in 5 seconds...");
      delay(5000);
      ESP.restart();
    }
  }
  Serial.println("");
  Serial.println("[SUCCESS] WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Signal strength (RSSI): ");
  Serial.print(WiFi.RSSI());
  Serial.println(" dBm");

  Serial.println("Starting camera web server...");
  startCameraServer();
  Serial.println("[SUCCESS] Camera server started!");

  Serial.println("==================================================");
  Serial.println("ESP32-CAM is now running!");
  Serial.print("Camera Ready! Use 'http://");
  Serial.print(WiFi.localIP());
  Serial.println("' to connect");
  Serial.println("==================================================");
  Serial.println("Available commands on the web interface:");
  Serial.println("- Stream: View live video stream");
  Serial.println("- Capture: Take a still photo");
  Serial.println("- Settings: Adjust camera parameters");
  Serial.println("==================================================");
}

void loop() {
  // Status reporting
  static unsigned long lastStatusTime = 0;
  unsigned long currentTime = millis();
  
  if (currentTime - lastStatusTime >= 30000) { // Report every 30 seconds
    lastStatusTime = currentTime;
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.print("Status: Running OK | IP: ");
      Serial.print(WiFi.localIP());
      Serial.print(" | RSSI: ");
      Serial.print(WiFi.RSSI());
      Serial.print(" dBm | Uptime: ");
      Serial.print(currentTime / 1000);
      Serial.println(" seconds");
    } else {
      Serial.println("[WARNING] WiFi disconnected! Attempting to reconnect...");
      WiFi.reconnect();
    }
  }
  
  // Check for potential issues
  if (WiFi.status() != WL_CONNECTED && (currentTime % 5000) == 0) {
    Serial.println("[ERROR] WiFi connection lost, reconnecting...");
    WiFi.reconnect();
  }
  
  // Small delay
  delay(1000);
}