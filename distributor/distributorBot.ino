#include <avr/interrupt.h>
#include <avr/io.h>
#include <string.h>

#define TIMER1_PRESCALER CS12
#define TIMER1_PRESCALER_VALUE 256
#define TIMER1_TICKS_IN_SECOND (F_CPU / TIMER1_PRESCALER_VALUE)

#define LED_PIN PB5

long packageBotId;
char strPackageBotId[256];  

void init_timer() {
	OCR1A = TIMER1_TICKS_IN_SECOND;
	TCCR1B |= _BV(TIMER1_PRESCALER);
	TIMSK1 = _BV(OCIE1A);
}

void init_board() {
	DDRB |= _BV(LED_PIN);
  
  // if analog input pin 0 is unconnected, random analog
  // noise will cause the call to randomSeed() to generate
  // different seed numbers each time the sketch runs.
  // randomSeed() will then shuffle the random function.
  //randomSeed(analogRead(0)); 
  
  // print a random number from 0 to 299
  packageBotId = random(9999);   
}

int main() {
  
	init_board();
  
	init_timer();

	sei();

	Serial.begin(115200);

	while(1) { //do nothing
	}

}

ISR(TIMER1_COMPA_vect) { // timer compare interrupt service routine
//  Serial.println("test interrupt");
  PORTB ^= _BV(LED_PIN);        
  
  ltoa(packageBotId,strPackageBotId,10);
  strcat(strPackageBotId,"|PackageBotID");
  Serial.println(strPackageBotId);  
}