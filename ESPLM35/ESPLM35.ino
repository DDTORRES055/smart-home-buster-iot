#include <Arduino.h>
#ifdef ARDUINO_ARCH_ESP32
#include <WiFi.h>
#else
#include <ESP8266WiFi.h>
#endif

#include <Firebase_ESP_Client.h>

// Provide the RTDB payload printing info and other helper functions.
#include <addons/RTDBHelper.h>

/* Network credentials */
const char *ssid = "SSID";
const char *password = "PASSWORD";

/* If work with RTDB, define the RTDB URL and database secret */
#define DATABASE_URL "your_database_url" //<databaseName>.firebaseio.com or <databaseName>.<region>.firebasedatabase.app
#define DATABASE_SECRET "your_database_secret"

/* Define the Firebase Data object */
FirebaseData stream;
FirebaseData fbdo;

/* Define the FirebaseAuth data for authentication data */
FirebaseAuth auth;

/* Define the FirebaseConfig data for config data */
FirebaseConfig firebaseConfig;

#define LM35 A0
#define MOTION_SENSOR D0

bool motionActive = true;
bool lastMotionState = false;

void setup()
{
  Serial.begin(115200);
  pinMode(MOTION_SENSOR, INPUT);

  wifiSetup();

  firebaseSetup();
}

void loop()
{
  static unsigned long lastTimeMotion = 0;
  static unsigned long lastTimeTemperature = 0;
  static unsigned long timeDelayMotion = 1000;
  unsigned long currentTimeMotion = millis();
  unsigned long currentTimeTemperature = millis();

  if (currentTimeMotion - lastTimeMotion > timeDelayMotion && motionActive)
  {
    lastTimeMotion = currentTimeMotion;
    bool motionState = digitalRead(MOTION_SENSOR);
    if (motionState != lastMotionState)
    {
      lastMotionState = motionState;
      if (motionState)
      {
        Serial.println("Motion detected");
        Firebase.RTDB.setBool(&fbdo, "/devices/D0/state", true);
        timeDelayMotion = 15000;
      }
      else
      {
        Serial.println("Motion ended");
        Firebase.RTDB.setBool(&fbdo, "/devices/D0/state", false);
        timeDelayMotion = 1000;
      }
    }
  }

  if (currentTimeTemperature - lastTimeTemperature > (1 * 60 * 1000))
  {
    lastTimeTemperature = currentTimeTemperature;
    int anologValue = analogRead(LM35);
    float millivolts = (anologValue / 1024.0) * 3300;
    float celsius = millivolts / 10;
    Serial.print("Gados Celsius = ");
    Serial.println(celsius);
    FirebaseJson json;
    json.set("Ts/.sv", "timestamp"); // .sv is the required place holder for sever value which currently supports only string "timestamp" as a value
    json.set("temperature", celsius); 
    
    if (Firebase.RTDB.pushJSON(&fbdo, "/sensors/S3/data", &json))
    {
      Serial.println(fbdo.dataPath());

      Serial.println(fbdo.pushName());

      Serial.println(fbdo.dataPath() + "/" + fbdo.pushName());
    }
    else
    {
      Serial.println(fbdo.errorReason());
    }
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

void firebaseSetup()
{
  /* Assign the database URL and database secret(required) */
  firebaseConfig.database_url = DATABASE_URL;
  firebaseConfig.signer.tokens.legacy_token = DATABASE_SECRET;

  Firebase.reconnectWiFi(true);

  /* Initialize the library with the Firebase authen and config */
  Firebase.begin(&firebaseConfig, &auth);
  
  stream.setBSSLBufferSize(2048 /* Rx in bytes, 512 - 16384 */, 512 /* Tx in bytes, 512 - 16384 */);
  
  if (!Firebase.RTDB.beginStream(&stream, "/sensors/S0/active"))
    Serial.printf("stream begin error, %s\n\n", stream.errorReason().c_str());

  Firebase.RTDB.setStreamCallback(&stream, streamCallback, streamTimeoutCallback);

  Serial.println("Firebase RTDB connected");
}

void streamCallback(FirebaseStream data)
{
  Serial.printf("sream path, %s\nevent path, %s\ndata type, %s\nevent type, %s\n\n",
                data.streamPath().c_str(),
                data.dataPath().c_str(),
                data.dataType().c_str(),
                data.eventType().c_str());
  printResult(data); // see addons/RTDBHelper.h
  Serial.println();

  // This is the size of stream payload received (current and max value)
  // Max payload size is the payload size under the stream path since the stream connected
  // and read once and will not update until stream reconnection takes place.
  // This max value will be zero as no payload received in case of ESP8266 which
  // BearSSL reserved Rx buffer size is less than the actual stream payload.

  motionActive = data.to<bool>();
  Serial.print("Montion active changed to ");
  Serial.println(motionActive ? "Active" : "Inactive");
}

void streamTimeoutCallback(bool timeout)
{
  if (timeout)
    Serial.println("stream timed out, resuming...\n");

  if (!stream.httpConnected())
    Serial.printf("error code: %d, reason: %s\n\n", stream.httpCode(), stream.errorReason().c_str());
}
