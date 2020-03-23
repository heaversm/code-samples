//Code to Run an in-store device which utilizes a proximity sensor, DOTstar LEDs, a battery monitor, and a light sensor

#include <Battery.h>
#include <Adafruit_DotStar.h>
#include <math.h>
#ifdef __AVR__
  #include <avr/power.h>
#endif
#include <Wire.h>
#include "Adafruit_VL6180X.h"

Adafruit_VL6180X vl = Adafruit_VL6180X();

//
#define DATAPIN    5
#define CLOCKPIN   6



//**********************************adjustable Var****************************************
int wait = 50; //time in ms between lighting each pixel
int maxBrightness = 200; //brightest we want the LEDs to go, 0 - 255
int minBrightness = 10; //lowest we want the LEDs to go
int brightnessIncrement = 10; //how much we step up the brightness when fading in and out each cycle
int numLEDs = 167; //change this based on LEDs used in the ring to keep things in synch 167

int rangeMin = 0;
int rangeMax = 15;
float lux = 110;

//********************************************************************************************
int stripBrightness = 200;
Adafruit_DotStar strip = Adafruit_DotStar(
  numLEDs, DATAPIN, CLOCKPIN, DOTSTAR_BRG);

int potPin = 1;

int led1 = 255;
int led2 = 255;
int led3 = 255;


float luxAmb = 0;
float luxRead = 0;
int range = 0;
int sensorValue = 0;
int BattFlag = 0;
int exitLoop = 0;

//*********************battery monitor var *********************
Battery battery(10000, 12000, A2);
int powerLed = 9;
int lowBattPer = 45;
int lowBattVolt = 10000;


void setup() {

  
  Serial.begin(115200);

  //*******Sensor Setup**********
  while (!Serial) {
    delay(1);
  }
  Serial.println("Adafruit VL6180x test!");
  if (! vl.begin()) {
    Serial.println("Failed to find sensor");
    while (1);
  }
  Serial.println("Sensor found!");

  //****************** battery monitor *****************
  pinMode(powerLed, OUTPUT);
  battery.begin(5000, 3.0); // (r1+r2)/r2  
  //****************************************************
  
   range = vl.readRange();
  strip.begin();
  strip.setBrightness(stripBrightness); //set default brightness
  strip.show(); // Initialize all pixels to off
  sensorValue = analogRead(A0);
  int timer = millis();
  
  //*******Dimness Setup**********
  do{
  //dimLight();
  DisplayBattery();
  }while(10000 > millis() - timer);
  delay(1000);
   colorOffImmediate();
   Serial.println("Start");
}


void loop() {  
  range = vl.readRange();
 // Serial.println(range);
  if((rangeMax >= range) && (rangeMin <= range)){ // if object is placed in front of the sensor
    Serial.println("Phone Detected");
delay(500);

// reads photocell to zero value
luxAmb = analogRead(A0);
luxRead = luxAmb; 
delay(250);
 colorOffImmediate();
Serial.print("Looking For Flash");
Serial.println(luxRead  - luxAmb );
exitLoop = 0;

// read photocell until flash is detected
do{
  luxRead = analogRead(A0);
  range = vl.readRange();
   if(!((rangeMax >= range) && (rangeMin <= range))){
    Serial.print("range: ");
    Serial.println(range );
    exitLoop = 1;
    break;
   }
  Serial.println(luxRead  - luxAmb );
}while(luxRead  - luxAmb   <= lux);

// if phone wasen't removed start sequnce
if(exitLoop == 0){
Serial.println("Flash Detected");
    Serial.print("range: ");
    Serial.println(range );
  sequence();

  range = vl.readRange();
}

  } else {
     Serial.println("attract");
    pulseInterrupt();
  }
    battMonitor(); // read battery after one sequence
}

void sequence(){
//flashMillis(delay time, time flash rise, flash stay on time);
//countDownMillis(delay time, 0 = start off 1 = start on, 0 = CW 1 = CCW); 
//processing(delay time, Number of times); //spining rings
//success(delay time); // Three flashes

  flashMillis(2000, 1000, 500);
   range = vl.readRange();
  if(!((rangeMax >= range) && (rangeMin <= range))){
    return;
  }
  colorOffImmediate();
  delay(1000);
  colorOnImmediate();
  delay(8800);
  
   range = vl.readRange();  
    if(!((rangeMax >= range) && (rangeMin <= range))){
     return;
  }
  countDownMillis(5700, 1, 1); //inverse
  flashMillis(3450, 100, 500);
   range = vl.readRange();
    if(!((rangeMax >= range) && (rangeMin <= range))){
     return;
  }
  delay(4000);

   range = vl.readRange();
    if(!((rangeMax >= range) && (rangeMin <= range))){
    return;
  }
  countDownMillis(4850, 1
  , 1); //inverse
  flashMillis(1000, 100, 500);

   range = vl.readRange();
    if(!((rangeMax >= range) && (rangeMin <= range))){
   return;
  }
  delay(1500);
  processing(5750, 5);
  success(2000); 
  delay(5000);
while((rangeMax >= range) && (rangeMin <= range)){
 range = vl.readRange();
 battMonitor(); // read battery after one sequence
}

}


void dimLight(){
 int potValue = analogRead(potPin);
 Serial.println(potValue);
if(potValue >= 680){
    led3 = map(potValue,680,1024, 0,255);
    Serial.println(led1);
    Serial.println(led2);
    Serial.println(led3);
}else if(potValue >= 340){
   led2 = map(potValue,340, 679, 0,255);
    led3 = 0;
}else{
      led1 = map(potValue,0, 339, 0,255);
   led2 = 0;
    led3 = 0;
}

    for(uint16_t i=0; i<strip.numPixels(); i++) {
    strip.setPixelColor(i, strip.Color(led1,led2,led3));
 //   strip.show();
  }
  strip.show();
}

void battMonitor(){
  
    Serial.print("Time(min): ");
    Serial.print((millis()/1000)/60);
    Serial.print("  Battery voltage is ");
    Serial.print(battery.voltage());
    Serial.print(" (");
    Serial.print(battery.level());
    Serial.println("%)");
    
  if( battery.level() <= lowBattPer || battery.voltage() <= lowBattVolt ){
    BattFlag = 1;
  }
     if( BattFlag == 1 ){
    digitalWrite(powerLed, HIGH);
    }
  else{
    digitalWrite(powerLed, LOW);
  }
}

void processing(int timeOn, int numTimes){
  int newTime = timeOn/numTimes;
  for(int i = 0; i<numTimes; i++){
  countDownMillis(newTime, 1, 0);
  countDownMillis(newTime, 1, 1);
}
}

void  success(int timeOn){
  int newTime = timeOn/3;
  for(int i = 0; i<3; i++){
  flashMillis(newTime, newTime/2, newTime/4);
  }
}
void pulseInterrupt(){
      Serial.println("attract");
  stripBrightness = minBrightness;
  colorOnImmediate();
  do{
  for(uint16_t i=stripBrightness; i<maxBrightness; i+=brightnessIncrement) {
    strip.setBrightness(i);
    stripBrightness = i;
    strip.show();
    range = vl.readRange();
    if((rangeMax >= range) && (rangeMin <= range)){
      break;
    }
    delay(wait);
  }
      if((rangeMax >= range) &&  (rangeMin <= range)){
      break;
    }
  for(uint16_t i=stripBrightness; i>minBrightness; i-=brightnessIncrement) {
    strip.setBrightness(i);
    stripBrightness = i;
    strip.show();
    range = vl.readRange();
        if((rangeMax >= range) && (rangeMin <= range)){
      break;
    }
    delay(wait);
  }
      if((rangeMax >= range) &&  (rangeMin <= range)){
      break;
    }
     battMonitor(); // read battery after one sequence
     
}while(!(rangeMax >= range) || !(rangeMin <= range));


}





void countDownMillis(int countdownTime, int directionPulse, int inverse){

  Serial.print("CountDown ");
  
  unsigned long millisStartTime = millis();
  int newStripBrightness = maxBrightness;
  int i = 0;
  int jump = 0;
 
  if(inverse == 1){
    for(uint16_t i=0; i<strip.numPixels(); i++) {
    strip.setPixelColor(i, strip.Color(led1, led2, led3));
  }
  strip.show();
  }else   if(inverse == 0){
    for(uint16_t i=0; i<strip.numPixels(); i++) {
    strip.setPixelColor(i, strip.Color(0, 0, 0));
  }
  strip.show();
  }
 // int st =0;
 // Serial.println(st);
  //countdownTime = countdownTime - st;
  int increment =  (countdownTime / (strip.numPixels()));
do{
jump++;
increment =  (countdownTime / (strip.numPixels()) * jump);

}while(increment < 30);
  
   int incrementDelay = countdownTime - ((increment * strip.numPixels()) / jump);


   unsigned long millisFadeTime = millis();
    
 if(directionPulse == 1){
  i = strip.numPixels();
 }else if(directionPulse == 1){
  i = 0;
 }
 int k = 0;
//countdownTime = countdownTime + st ;
 //  countdownTime = countdownTime + 260;
     
      do {
        
        if(inverse == 1){
if(directionPulse == 1 ){
       
    //  Serial.println(i);
  if((increment + millisFadeTime) < millis()){
    millisFadeTime = millis();
 
    
    for(int j = i + jump; j > i; j--){
    strip.setPixelColor(j, strip.Color(0, 0, 0));
    }
    
    strip.show();
    if(i >= 0){
    i = i - jump;
    if(i < 0){
      jump = i + jump;
     
    }
    }else{
 //      Serial.println("IL ");
      k = 1;

    }
   
  }
}else if(directionPulse == 0){

  
   if((increment + millisFadeTime) < millis()){
    millisFadeTime = millis();
    
    for(int j = i; j < jump + i; j++){
    strip.setPixelColor(j, strip.Color(0, 0, 0));
    }
    
    strip.show();
    
    if(i < strip.numPixels()){
    i = i + jump;
        if(i > strip.numPixels()){
      jump = i - jump;
       
    }
    }else{
  //         Serial.println("IR ");
      k = 1;
   
    }
  }
}
        }else if(inverse == 0){
if(directionPulse == 1 ){
        
     // Serial.println(i);
  if((increment + millisFadeTime) < millis()){
    millisFadeTime = millis();
 
    
    for(int j = i + jump; j > i; j--){
    strip.setPixelColor(j, strip.Color(led1, led2, led3));
    }
    
    strip.show();
    if(i > 0){
    i = i - jump;
   
      if(i < 0){
      jump = i + jump; 
       if(i > 0){
      jump = i - jump;
       Serial.println(i);    
    }   
    }
    }else{
     k = 1;
//Serial.println("NL ");
    }
   
  }
}else if(directionPulse == 0){
        
     
   if((increment + millisFadeTime) < millis()){
    millisFadeTime = millis();
    
    for(int j = i; j < jump + i; j++){
    strip.setPixelColor(j, strip.Color(led1, led2, led3));
    }
    
    strip.show();
    
    if(i < strip.numPixels()){
    i = i + jump;
      if(i > strip.numPixels()){
      jump = i - jump;
      // Serial.println(i);    
    }
    }else{
      k = 1;
//Serial.println("NR ");
    }
  }
}
        }
      //   Serial.println(k);
    
        }while(k == 0 );//&& countdownTime > (millis() - millisStartTime));

//        Serial.print("++++++++++++++++++++++++++++++++++++++++++++++++++++++");
//  Serial.println(k);
//Serial.println(millis() - millisStartTime);

}


void flashMillis(int flashTimeDelay, int flashRiseTime,int flashOnTime ){
  Serial.println("FLASH");
  unsigned long millisStartTime = millis();
  int newStripBrightness = minBrightness;
  int increment = 10;
  
    for(uint16_t i=0; i<strip.numPixels(); i++) {
    strip.setPixelColor(i, strip.Color(led1, led2, led3));
  }
  
  int fadeAmount =  (flashRiseTime / (maxBrightness - minBrightness)) * (increment/2); //how much to pulse

   unsigned long millisFadeTime = millis();
      do {
if(((fadeAmount + millisFadeTime) < millis()) && ((millisStartTime + flashRiseTime) >= millis())){
//  Serial.print("FLASH2 ");

  millisFadeTime = millis();
  if(newStripBrightness < maxBrightness){
  newStripBrightness += increment;
  }
  strip.setBrightness(newStripBrightness);
    strip.show();
}else if(((flashOnTime + millisStartTime) <= millis())&& ((millisStartTime +flashRiseTime + flashOnTime) >= millis())){
//  Serial.println("FLASH3");

  millisFadeTime = millis();
    strip.setBrightness(maxBrightness);
    strip.show();
}else if(((flashRiseTime+flashOnTime) <= (millis() - millisStartTime))){
// Serial.print("FLASH4 ");


    for(uint16_t i=0; i<strip.numPixels(); i++) {
    strip.setPixelColor(i, strip.Color(0, 0, 0));
  }
    strip.show();
}
  }while(flashTimeDelay >= millis() - millisStartTime);
}

void colorOffImmediate(){
  for(uint16_t i=0; i<strip.numPixels(); i++) {
    strip.setPixelColor(i, strip.Color(0,0,0));
 //   strip.show();
  }
  strip.show();
}

void colorOnImmediate(){
  for(uint16_t i=0; i<strip.numPixels(); i++) {
    strip.setPixelColor(i, strip.Color(led1, led2, led3));
   // strip.show();
  }
   strip.show();
}

void DisplayBattery(){
 int batPer =  map(battery.level(), 30,100, 0,strip.numPixels());
  strip.setBrightness(maxBrightness);
   dimLight();
    for(uint16_t i=0; i<batPer; i++) {
    strip.setPixelColor(i, strip.Color(led1,led2,led3));
  }
  strip.show();
}
