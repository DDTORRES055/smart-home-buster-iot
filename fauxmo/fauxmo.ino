#include <Arduino.h>
#ifdef ESP32
#include <WiFi.h>
#else
#include <ESP8266WiFi.h>
#endif
#include "fauxmoESP.h"

#include <Firebase_ESP_Client.h>

// Provide the RTDB payload printing info and other helper functions.
#include <addons/RTDBHelper.h>

#define VELOCIDAD_PUERTO_SERIE 115200

/* Network credentials */
#define WIFI_SSID "SSID"
#define WIFI_PASS "PASSWORD"

/* If work with RTDB, define the RTDB URL and database secret */
#define DATABASE_URL "your_database_url" //<databaseName>.firebaseio.com or <databaseName>.<region>.firebasedatabase.app
#define DATABASE_SECRET "your_database_secret"

fauxmoESP fauxmo;

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

void setup()
{
    // Iniciamos puerto serie
    Serial.begin(VELOCIDAD_PUERTO_SERIE);

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

    // By default, fauxmoESP creates it's own webserver on the defined port
    // The TCP port must be 80 for gen3 devices (default is 1901)
    // This has to be done before the call to enable()
    // fauxmo.createServer(true); // not needed, this is the default value
    fauxmo.setPort(80); // This is required for gen3 devices

    // Habilitamos la librería para el descubrimiento y cambio de estado
    // de los dispositivos
    fauxmo.enable(true);

    // Damos de alta los diferentes dispositivos y grupos
    fauxmo.addDevice(DISPOSITIVO_1); // ID0
    fauxmo.addDevice(DISPOSITIVO_2); // ID1
    fauxmo.addDevice(DISPOSITIVO_3); // ID2
    fauxmo.addDevice(DISPOSITIVO_4); // ID3
    fauxmo.addDevice(DISPOSITIVO_5); // ID4
    fauxmo.addDevice(DISPOSITIVO_6); // ID5
    fauxmo.addDevice(GRUPO_1);       // ID6
    fauxmo.addDevice(TODO);          // ID7

    digitalWrite(PIN_1, HIGH);
    digitalWrite(PIN_2, HIGH);
    digitalWrite(PIN_3, HIGH);
    digitalWrite(PIN_4, HIGH);
    digitalWrite(PIN_5, HIGH);
    digitalWrite(PIN_6, HIGH);

    fauxmo.onSetState([](unsigned char device_id, const char *device_name, bool state, unsigned char value)
                      {
                          // Callback when a command from Alexa is received. 
                          // You can use device_id or device_name to choose the element to perform an action onto (relay, LED,...)
                          // State is a boolean (ON/OFF) and value a number from 0 to 255 (if you say "set kitchen light to 50%" you will receive a 128 here).
                          // Just remember not to delay too much here, this is a callback, exit as soon as possible.
                          // If you have to do something more involved here set a flag and process it in your main loop.
                          
                          Serial.printf("[MAIN] Device #%d (%s) state: %s value: %d\n", device_id, device_name, state ? "OFF" : "ON", value);
  
                          // Checking for device_id is simpler if you are certain about the order they are loaded and it does not change.
                          // Otherwise comparing the device_name is safer.
  
                          if (strcmp(device_name, DISPOSITIVO_1)==0) {
                              digitalWrite(PIN_1, state ? LOW : HIGH);
                          } else if (strcmp(device_name, DISPOSITIVO_2)==0) {
                              digitalWrite(PIN_2, state ? LOW : HIGH);
                          } else if (strcmp(device_name, DISPOSITIVO_3)==0) {
                              digitalWrite(PIN_3, state ? LOW : HIGH);
                          } else if (strcmp(device_name, DISPOSITIVO_4)==0) {
                              digitalWrite(PIN_4, state ? LOW : HIGH);
                          } else if (strcmp(device_name, DISPOSITIVO_5)==0) {
                              digitalWrite(PIN_5, state ? LOW : HIGH);
                          } else if (strcmp(device_name, DISPOSITIVO_6)==0) {
                              digitalWrite(PIN_6, state ? LOW : HIGH);
                          } else if (strcmp(device_name, GRUPO_1)==0) {
                              digitalWrite(PIN_1, state ? LOW : HIGH);
                              digitalWrite(PIN_2, state ? LOW : HIGH);
                              digitalWrite(PIN_3, state ? LOW : HIGH);
                              digitalWrite(PIN_4, state ? LOW : HIGH);
                          }  else if (strcmp(device_name, TODO)==0) {
                              digitalWrite(PIN_1, state ? LOW : HIGH);
                              digitalWrite(PIN_2, state ? LOW : HIGH);
                              digitalWrite(PIN_3, state ? LOW : HIGH);
                              digitalWrite(PIN_4, state ? LOW : HIGH);
                              digitalWrite(PIN_5, state ? LOW : HIGH);
                              digitalWrite(PIN_6, state ? LOW : HIGH);
                          }
                          deviceStates[device_id] = state;
                          updateState = device_id;
                       });
}

void loop()
{
    if (dataChanged)
    {
      dataChanged = false;
      // When stream data is available, do anything here...
    }

    if (updateState >= 0) {
      Firebase.RTDB.setBool(&fbdo, devicePaths[updateState], deviceStates[updateState]);
      updateState = -1;
    }

    // Nos quedamos esperando peticiones todo el tiempo...
    fauxmo.handle();
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
    fauxmo.setState(DISPOSITIVO_1, data.to<bool>(), data.to<bool>() ? 255 : 0);
  } 
  else if (strcmp(data.dataPath().c_str(), "/D1/state")==0)
  {
    Serial.printf("Enter to change %s", DISPOSITIVO_2);
    Serial.println();
    digitalWrite(PIN_2, data.to<bool>() ? LOW : HIGH);
    fauxmo.setState(DISPOSITIVO_2, data.to<bool>(), data.to<bool>() ? 255 : 0);
  }
  else if (strcmp(data.dataPath().c_str(), "/D4/state")==0)
  {
    Serial.printf("Enter to change %s", DISPOSITIVO_3);
    Serial.println();
    digitalWrite(PIN_3, data.to<bool>() ? LOW : HIGH);
    fauxmo.setState(DISPOSITIVO_3, data.to<bool>(), data.to<bool>() ? 255 : 0);
  }
  else if (strcmp(data.dataPath().c_str(), "/D3/state")==0)
  {
    Serial.printf("Enter to change %s", DISPOSITIVO_4);
    Serial.println();
    digitalWrite(PIN_4, data.to<bool>() ? LOW : HIGH);
    fauxmo.setState(DISPOSITIVO_4, data.to<bool>(), data.to<bool>() ? 255 : 0);
  }
  else if (strcmp(data.dataPath().c_str(), "/D5/state")==0)
  {
    Serial.printf("Enter to change %s", DISPOSITIVO_5);
    Serial.println();
    digitalWrite(PIN_5, data.to<bool>() ? LOW : HIGH);
    fauxmo.setState(DISPOSITIVO_5, data.to<bool>(), data.to<bool>() ? 255 : 0);
  }
  else if (strcmp(data.dataPath().c_str(), "/D6/state")==0)
  {
    Serial.printf("Enter to change %s", DISPOSITIVO_6);
    Serial.println();
    digitalWrite(PIN_6, data.to<bool>() ? LOW : HIGH);
    fauxmo.setState(DISPOSITIVO_6, data.to<bool>(), data.to<bool>() ? 255 : 0);
  }
  else if (strcmp(data.dataPath().c_str(), "/G0/state")==0)
  {
    Serial.printf("Enter to change %s", GRUPO_1);
    Serial.println();
    digitalWrite(PIN_1, data.to<bool>() ? LOW : HIGH);
    digitalWrite(PIN_2, data.to<bool>() ? LOW : HIGH);
    digitalWrite(PIN_3, data.to<bool>() ? LOW : HIGH);
    digitalWrite(PIN_4, data.to<bool>() ? LOW : HIGH);
    fauxmo.setState(GRUPO_1, data.to<bool>(), data.to<bool>() ? 255 : 0);
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
