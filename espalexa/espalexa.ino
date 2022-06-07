#include <Arduino.h>
#ifdef ARDUINO_ARCH_ESP32
#include <WiFi.h>
#else
#include <ESP8266WiFi.h>
#endif
#include <Espalexa.h>

#include <Firebase_ESP_Client.h>

// Provide the RTDB payload printing info and other helper functions.
#include <addons/RTDBHelper.h>

/* Network credentials */
#define WIFI_SSID "SSID"
#define WIFI_PASS "PASSWORD"

/* If work with RTDB, define the RTDB URL and database secret */
#define DATABASE_URL "your_database_url" //<databaseName>.firebaseio.com or <databaseName>.<region>.firebasedatabase.app
#define DATABASE_SECRET "your_database_secret"

Espalexa espalexa;

/* Define the Firebase Data object */
FirebaseData stream;
FirebaseData fbdo;

/* Define the FirebaseAuth data for authentication data */
FirebaseAuth auth;

/* Define the FirebaseConfig data for config data */
FirebaseConfig config;

volatile bool dataChanged = false;
int updateState = -1;

bool deviceStates[8]= {false, false, false, false, false, false, false, false};
String devicePaths[8]= {"/devices/D0/state", "/devices/D1/state", "/devices/D4/state", "/devices/D3/state", "/devices/D5/state", "/devices/D6/state", "/devices/G0/state",  "/devices/G1/state"};

int delayTime = 5000;

#define PIN_1 D0
#define PIN_2 D1
#define PIN_3 D4
#define PIN_4 D3
#define PIN_5 D5
#define PIN_6 D6

#define DISPOSITIVO_1 "Luz de afuera"
#define DISPOSITIVO_2 "Luz principal"
#define DISPOSITIVO_3 "Luz de la recamara"
#define DISPOSITIVO_4 "Luz del baño"
#define DISPOSITIVO_5 "Ventilador"
#define DISPOSITIVO_6 "Cafetera"
#define GRUPO_1 "Luces"
#define TODO "TODO"

//callback functions
void device1Changed(uint8_t brightness);
void device2Changed(uint8_t brightness);
void device3Changed(uint8_t brightness);
void device4Changed(uint8_t brightness);
void device5Changed(uint8_t brightness);
void device6Changed(uint8_t brightness);
void group1Changed(uint8_t brightness);
void group2Changed(uint8_t brightness);

void setup()
{
    // Iniciamos puerto serie
    Serial.begin(115200);

    // Configuramos como pines de salida
    pinMode(PIN_1, OUTPUT);
    pinMode(PIN_2, OUTPUT);
    pinMode(PIN_3, OUTPUT);
    pinMode(PIN_4, OUTPUT);
    pinMode(PIN_5, OUTPUT);
    pinMode(PIN_6, OUTPUT);

    // Iniciamos wifi
    wifiSetup();
    
    /* Assign the database URL and database secret(required) */
    config.database_url = DATABASE_URL;
    config.signer.tokens.legacy_token = DATABASE_SECRET;

    Firebase.reconnectWiFi(true);

    /* Initialize the library with the Firebase authen and config */
    Firebase.begin(&config, &auth);
    /* Initialize the library with the Firebase authen and config */
    //Firebase.begin(DATABASE_URL, DATABASE_SECRET);

    stream.setBSSLBufferSize(2048 /* Rx in bytes, 512 - 16384 */, 512 /* Tx in bytes, 512 - 16384 */);

    if (!Firebase.RTDB.beginStream(&stream, "/devices"))
      Serial.printf("stream begin error, %s\n\n", stream.errorReason().c_str());

    Firebase.RTDB.setStreamCallback(&stream, streamCallback, streamTimeoutCallback);

    Firebase.RTDB.setString(&fbdo, "/devices/D0/name", DISPOSITIVO_1);
    Firebase.RTDB.setBool(&fbdo, "/devices/D0/state", false);
    Firebase.RTDB.setString(&fbdo, "/devices/D1/name", DISPOSITIVO_2);
    Firebase.RTDB.setBool(&fbdo, "/devices/D1/state", false);
    Firebase.RTDB.setString(&fbdo, "/devices/D4/name", DISPOSITIVO_3);
    Firebase.RTDB.setBool(&fbdo, "/devices/D4/state", false);
    Firebase.RTDB.setString(&fbdo, "/devices/D3/name", DISPOSITIVO_4);
    Firebase.RTDB.setBool(&fbdo, "/devices/D3/state", false);
    Firebase.RTDB.setString(&fbdo, "/devices/D5/name", DISPOSITIVO_5);
    Firebase.RTDB.setBool(&fbdo, "/devices/D5/state", false);
    Firebase.RTDB.setString(&fbdo, "/devices/D6/name", DISPOSITIVO_6);
    Firebase.RTDB.setBool(&fbdo, "/devices/D6/state", false);
    Firebase.RTDB.setString(&fbdo, "/devices/G0/name", GRUPO_1);
    Firebase.RTDB.setBool(&fbdo, "/devices/G0/state", false);

    // Define your devices here. 
    espalexa.addDevice(DISPOSITIVO_1, device1Changed); //simplest definition, default state off
    espalexa.addDevice(DISPOSITIVO_2, device2Changed); //simplest definition, default state off
    espalexa.addDevice(DISPOSITIVO_3, device3Changed); //simplest definition, default state off
    espalexa.addDevice(DISPOSITIVO_4, device4Changed); //simplest definition, default state off
    espalexa.addDevice(DISPOSITIVO_5, device5Changed); //simplest definition, default state off
    espalexa.addDevice(DISPOSITIVO_6, device6Changed); //simplest definition, default state off
    espalexa.addDevice(GRUPO_1, group1Changed); //simplest definition, default state off
    espalexa.addDevice(TODO, group2Changed); //simplest definition, default state off
    espalexa.begin();

    digitalWrite(PIN_1, HIGH);
    digitalWrite(PIN_2, HIGH);
    digitalWrite(PIN_3, HIGH);
    digitalWrite(PIN_4, HIGH);
    digitalWrite(PIN_5, HIGH);
    digitalWrite(PIN_6, HIGH);
}

void loop()
{
    if (dataChanged)
    {
      dataChanged = false;
      // When stream data is available, do anything here...
    }

    if (updateState >= 0) {
      if (updateState == 6) {
        for (int i = 0; i < 4; i++)
        {
          Firebase.RTDB.setBool(&fbdo, devicePaths[i], deviceStates[i]);
        }
      } else if (updateState == 7) {
        for (int i = 0; i < 7; i++)
        {
          Firebase.RTDB.setBool(&fbdo, devicePaths[i], deviceStates[i]);
        }
      }
      
      Firebase.RTDB.setBool(&fbdo, devicePaths[updateState], deviceStates[updateState]);
      updateState = -1;
    }

    espalexa.loop();
    delay(1);
}

//our callback functions
void device1Changed(uint8_t brightness) {
    Serial.printf("Device 1 changed to %i", brightness);
    
    //do what you need to do here
    if (brightness) {
      Serial.print(" ON, brightness ");
      Serial.println(brightness);
      digitalWrite(PIN_1, LOW);
      deviceStates[0] = true;
    } else {
      Serial.println(" OFF");
      digitalWrite(PIN_1, HIGH);
      deviceStates[0] = false;
    }
    updateState = 0;
}

void device2Changed(uint8_t brightness) {
    Serial.printf("Device 2 changed to %i", brightness);
    
    //do what you need to do here
    if (brightness) {
      Serial.print(" ON, brightness ");
      Serial.println(brightness);
      digitalWrite(PIN_2, LOW);
      deviceStates[1] = true;
    } else {
      Serial.println(" OFF");
      digitalWrite(PIN_2, HIGH);
      deviceStates[1] = false;
    }
    updateState = 1;
}

void device3Changed(uint8_t brightness) {
    Serial.printf("Device 3 changed to %i", brightness);
    
    //do what you need to do here
    if (brightness) {
      Serial.print(" ON, brightness ");
      Serial.println(brightness);
      digitalWrite(PIN_3, LOW);
      deviceStates[2] = true;
    } else {
      Serial.println(" OFF");
      digitalWrite(PIN_3, HIGH);
      deviceStates[2] = false;
    }
    updateState = 2;
}

void device4Changed(uint8_t brightness) {
    Serial.printf("Device 4 changed to %i", brightness);
    
    //do what you need to do here
    if (brightness) {
      Serial.print(" ON, brightness ");
      Serial.println(brightness);
      digitalWrite(PIN_4, LOW);
      deviceStates[3] = true;
    } else {
      Serial.println(" OFF");
      digitalWrite(PIN_4, HIGH);
      deviceStates[3] = false;
    }
    updateState = 3;
}

void device5Changed(uint8_t brightness) {
    Serial.printf("Device 5 changed to %i", brightness);
    
    //do what you need to do here
    if (brightness) {
      Serial.print(" ON, brightness ");
      Serial.println(brightness);
      digitalWrite(PIN_5, LOW);
      deviceStates[4] = true;
    } else {
      Serial.println(" OFF");
      digitalWrite(PIN_5, HIGH);
      deviceStates[4] = false;
    }
    updateState = 4;
}

void device6Changed(uint8_t brightness) {
    Serial.printf("Device 6 changed to %i", brightness);
    
    //do what you need to do here
    if (brightness) {
      Serial.print(" ON, brightness ");
      Serial.println(brightness);
      digitalWrite(PIN_6, LOW);
      deviceStates[5] = true;
    } else {
      Serial.println(" OFF");
      digitalWrite(PIN_6, HIGH);
      deviceStates[5] = false;
    }
    updateState = 5;
}

void group1Changed(uint8_t brightness) {
    Serial.printf("Group 1 changed to %i", brightness);
    
    //do what you need to do here
    if (brightness) {
      Serial.print(" ON, brightness ");
      Serial.println(brightness);
      digitalWrite(PIN_1, LOW);
      digitalWrite(PIN_2, LOW);
      digitalWrite(PIN_3, LOW);
      digitalWrite(PIN_4, LOW);
      deviceStates[0] = true;
      deviceStates[1] = true;
      deviceStates[2] = true;
      deviceStates[3] = true;
      deviceStates[6] = true;
    } else {
      Serial.println(" OFF");
      digitalWrite(PIN_1, HIGH);
      digitalWrite(PIN_2, HIGH);
      digitalWrite(PIN_3, HIGH);
      digitalWrite(PIN_4, HIGH);
      deviceStates[0] = false;
      deviceStates[1] = false;  
      deviceStates[2] = false;
      deviceStates[3] = false;
      deviceStates[6] = false;
    }
    updateState = 6;
}

void group2Changed(uint8_t brightness) {
    Serial.printf("Group 2 changed to %i", brightness);
    
    //do what you need to do here
    if (brightness) {
      Serial.print(" ON, brightness ");
      Serial.println(brightness);
      digitalWrite(PIN_1, LOW);
      digitalWrite(PIN_2, LOW);
      digitalWrite(PIN_3, LOW);
      digitalWrite(PIN_4, LOW);
      digitalWrite(PIN_5, LOW);
      digitalWrite(PIN_6, LOW);
      deviceStates[0] = true;
      deviceStates[1] = true;
      deviceStates[2] = true;
      deviceStates[3] = true;
      deviceStates[4] = true;
      deviceStates[5] = true;
      deviceStates[6] = true;
      deviceStates[7] = true;
    } else {
      Serial.println(" OFF");
      digitalWrite(PIN_1, HIGH);
      digitalWrite(PIN_2, HIGH);
      digitalWrite(PIN_3, HIGH);
      digitalWrite(PIN_4, HIGH);
      digitalWrite(PIN_5, HIGH);
      digitalWrite(PIN_6, HIGH);
      deviceStates[0] = false;
      deviceStates[1] = false;
      deviceStates[2] = false;
      deviceStates[3] = false;
      deviceStates[4] = false;
      deviceStates[5] = false;
      deviceStates[6] = false;
      deviceStates[7] = false;
    }
    updateState = 7;
}

void wifiSetup()
{
    // Set WIFI module to STA mode
    WiFi.mode(WIFI_STA);

    // Connect
    Serial.printf("[WIFI] Connecting to %s ", WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASS);

    // Wait
    while (WiFi.status() != WL_CONNECTED)
    {
      Serial.print(".");
      delay(100);
    }
    Serial.println();

    // Connected!
    Serial.printf("[WIFI] STATION Mode, SSID: %s, IP address: %s\n", WiFi.SSID().c_str(), WiFi.localIP().toString().c_str());
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

  if (strcmp(data.dataPath().c_str(), "/D0/state")==0)
  {
    Serial.printf("Enter to change %s", DISPOSITIVO_1);
    Serial.println();
    digitalWrite(PIN_1, data.to<bool>() ? LOW : HIGH);
  } 
  else if (strcmp(data.dataPath().c_str(), "/D1/state")==0)
  {
    Serial.printf("Enter to change %s", DISPOSITIVO_2);
    Serial.println();
    digitalWrite(PIN_2, data.to<bool>() ? LOW : HIGH);
  }
  else if (strcmp(data.dataPath().c_str(), "/D4/state")==0)
  {
    Serial.printf("Enter to change %s", DISPOSITIVO_3);
    Serial.println();
    digitalWrite(PIN_3, data.to<bool>() ? LOW : HIGH);
  }
  else if (strcmp(data.dataPath().c_str(), "/D3/state")==0)
  {
    Serial.printf("Enter to change %s", DISPOSITIVO_4);
    Serial.println();
    digitalWrite(PIN_4, data.to<bool>() ? LOW : HIGH);
  }
  else if (strcmp(data.dataPath().c_str(), "/D5/state")==0)
  {
    Serial.printf("Enter to change %s", DISPOSITIVO_5);
    Serial.println();
    digitalWrite(PIN_5, data.to<bool>() ? LOW : HIGH);
  }
  else if (strcmp(data.dataPath().c_str(), "/D6/state")==0)
  {
    Serial.printf("Enter to change %s", DISPOSITIVO_6);
    Serial.println();
    digitalWrite(PIN_6, data.to<bool>() ? LOW : HIGH);
  }
  else if (strcmp(data.dataPath().c_str(), "/G0/state")==0)
  {
    Serial.printf("Enter to change %s", GRUPO_1);
    Serial.println();
    digitalWrite(PIN_1, data.to<bool>() ? LOW : HIGH);
    digitalWrite(PIN_2, data.to<bool>() ? LOW : HIGH);
    digitalWrite(PIN_3, data.to<bool>() ? LOW : HIGH);
    digitalWrite(PIN_4, data.to<bool>() ? LOW : HIGH);
  }

  // Due to limited of stack memory, do not perform any task that used large memory here especially starting connect to server.
  // Just set this flag and check it status later.
  dataChanged = true;
}

void streamTimeoutCallback(bool timeout)
{
  if (timeout)
    Serial.println("stream timed out, resuming...\n");

  if (!stream.httpConnected())
    Serial.printf("error code: %d, reason: %s\n\n", stream.httpCode(), stream.errorReason().c_str());
}
