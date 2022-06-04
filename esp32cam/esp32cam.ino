#include "Arduino.h"
#include "esp_camera.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"
#include "driver/rtc_io.h"
#include "Base64.h"
// #include <base64.h>
// #include <HTTPClient.h>
// #include <ArduinoJson.h>

#include <Firebase_ESP_Client.h>

// Provide the RTDB payload printing info and other helper functions.
#include <addons/RTDBHelper.h>

// Select camera model
//#define CAMERA_MODEL_WROVER_KIT // Has PSRAM
//#define CAMERA_MODEL_ESP_EYE // Has PSRAM
//#define CAMERA_MODEL_M5STACK_PSRAM // Has PSRAM
//#define CAMERA_MODEL_M5STACK_WIDE  // Has PSRAM
#define CAMERA_MODEL_AI_THINKER // Has PSRAM
//#define CAMERA_MODEL_TTGO_T_JOURNAL // No PSRAM

// CAMERA_MODEL_AI_THINKER
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
#define flash 4

/* If work with RTDB, define the RTDB URL and database secret */
#define DATABASE_URL "your_database_url" //<databaseName>.firebaseio.com or <databaseName>.<region>.firebasedatabase.app
#define DATABASE_SECRET "your_database_secret"

const char *ssid = "SSID";
const char *password = "PASSWORD";

/* Define the Firebase Data object */
FirebaseData fbdo;

/* Define the FirebaseAuth data for authentication data */
FirebaseAuth auth;

/* Define the FirebaseConfig data for config data */
FirebaseConfig firebaseConfig;

bool active = false;

String imageFile = "";

void setup()
{
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); // disable brownout detector
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();
  pinMode(flash, OUTPUT);

  cameraSetup();

  takePhoto();

  wifiSetup();

  firebaseSetup();

  // Check if the motion sensor is active
  Firebase.RTDB.getBool(&fbdo, "/sensors/S1/active", &active);

  if (active)
  {
    Serial.println("Device is active");
    uploadImage();
  }
  else
  {
    Serial.println("Device is not active");
  }

  // Print the wakeup reason for ESP32
  print_wakeup_reason();

  // Turns off the ESP32-CAM white on-board LED (flash) connected to GPIO 4
  rtc_gpio_hold_en(GPIO_NUM_4);

  esp_sleep_enable_ext0_wakeup(GPIO_NUM_13, 1);

  Serial.println("Going to sleep now");
  delay(1000);
  esp_deep_sleep_start();
}

void loop()
{
}

void takePhoto()
{
  String response;

  // Capture picture
  camera_fb_t *fb = NULL;

  digitalWrite(flash, HIGH);
  delay(100);

  fb = esp_camera_fb_get();

  digitalWrite(flash, LOW);
  delay(100);

  if (!fb)
  {
    Serial.println("Camera capture failed");
    return;
  }
  else
  {
    Serial.println("Camera capture OK");
  }

  char *input = (char *)fb->buf;
  char output[base64_enc_len(3)];

  imageFile = "";
  for (int i = 0; i < fb->len; i++)
  {
    base64_encode(output, (input++), 3);
    if (i % 3 == 0)
      imageFile += urlencode(String(output));
  }

  esp_camera_fb_return(fb);
}

void uploadImage()
{
  // To set and push data with timestamp, requires the JSON data with .sv placeholder
  FirebaseJson json;
  json.set("Ts/.sv", "timestamp"); // .sv is the required place holder for sever value which currently supports only string "timestamp" as a value

  if (Firebase.RTDB.pushJSON(&fbdo, "/sensors/S2", &json))
  {
    Serial.println(fbdo.dataPath());

    Serial.println(fbdo.pushName());

    Serial.println(fbdo.dataPath() + "/" + fbdo.pushName());
  }
  else
  {
    Serial.println(fbdo.errorReason());
  }

  if (Firebase.RTDB.setString(&fbdo, "/sensors/S2/" + fbdo.pushName() + "/image", imageFile))
  {
    Serial.print("Uploaded image to /sensors/S2/");
    Serial.print(fbdo.pushName());
    Serial.println("/image");
  }
  else
  {
    Serial.println(fbdo.errorReason());
  }
  imageFile = "";
}

String urlencode(String str)
{
  String encodedString = "";
  char c;
  char code0;
  char code1;
  char code2;
  for (int i = 0; i < str.length(); i++)
  {
    c = str.charAt(i);
    if (c == ' ')
    {
      encodedString += '+';
    }
    else if (isalnum(c))
    {
      encodedString += c;
    }
    else
    {
      code1 = (c & 0xf) + '0';
      if ((c & 0xf) > 9)
      {
        code1 = (c & 0xf) - 10 + 'A';
      }
      c = (c >> 4) & 0xf;
      code0 = c + '0';
      if (c > 9)
      {
        code0 = c - 10 + 'A';
      }
      code2 = '\0';
      encodedString += '%';
      encodedString += code0;
      encodedString += code1;
      // encodedString+=code2;
    }
    yield();
  }
  return encodedString;
}

void print_wakeup_reason()
{
  esp_sleep_wakeup_cause_t wakeup_reason;

  wakeup_reason = esp_sleep_get_wakeup_cause();

  switch (wakeup_reason)
  {
  case ESP_SLEEP_WAKEUP_EXT0:
    Serial.println("Wakeup caused by external signal using RTC_IO");
    break;
  case ESP_SLEEP_WAKEUP_EXT1:
    Serial.println("Wakeup caused by external signal using RTC_CNTL");
    break;
  case ESP_SLEEP_WAKEUP_TIMER:
    Serial.println("Wakeup caused by timer");
    break;
  case ESP_SLEEP_WAKEUP_TOUCHPAD:
    Serial.println("Wakeup caused by touchpad");
    break;
  case ESP_SLEEP_WAKEUP_ULP:
    Serial.println("Wakeup caused by ULP program");
    break;
  default:
    Serial.printf("Wakeup was not caused by deep sleep: %d\n", wakeup_reason);
    break;
  }
}

void wifiSetup()
{
  WiFi.begin(ssid, password);

  long int StartTime = millis();
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    if ((StartTime + 10000) < millis())
      break;
  }

  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.println("");
    Serial.println("Connected to WiFi!");
    Serial.println(WiFi.localIP());
  }
  else
  {
    Serial.println("Connection failed");
    return;
  }
}

void cameraSetup()
{
  // Initialize the camera
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

  // if PSRAM IC present, init with UXGA resolution and higher JPEG quality
  //                      for larger pre-allocated frame buffer.
  rtc_gpio_hold_dis(GPIO_NUM_4);

  if (psramFound())
  {
    config.frame_size = FRAMESIZE_UXGA;
    config.jpeg_quality = 10;
    config.fb_count = 2;
  }
  else
  {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  // camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK)
  {
    Serial.printf("Camera init failed with error 0x%x", err);
    Serial.println();
    delay(1000);
    ESP.restart();
  }

  // drop down frame size for higher initial frame rate
  sensor_t *s = esp_camera_sensor_get();
  s->set_framesize(s, FRAMESIZE_VGA); // VGA|CIF|QVGA|HQVGA|QQVGA   ( UXGA? SXGA? XGA? SVGA? )

  Serial.println("Camera Ready!");
}

void firebaseSetup()
{
  /* Assign the database URL and database secret(required) */
  firebaseConfig.database_url = DATABASE_URL;
  firebaseConfig.signer.tokens.legacy_token = DATABASE_SECRET;

  Firebase.reconnectWiFi(true);

  /* Initialize the library with the Firebase authen and config */
  Firebase.begin(&firebaseConfig, &auth);

  Serial.println("Firebase RTDB connected");
}
