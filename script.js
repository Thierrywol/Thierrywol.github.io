// Fragmenten pad en test variabelen
const fragmenten_path = "processed_fragments";

// Test variabelen
let kalibratie_audio = null;
let huidig_level = 0; // Start level
let huidige_hoek = 90; // Start hoek (90 graden)
let huidige_richting = Math.random() < 0.5 ? 'links' : 'rechts'; // Willekeurige start richting
let huidig_fragment = 1; // Start met fragment 1
let test_actief = false;
let huidige_audio = null;

// Nieuwe variabelen voor room conditions
let huidige_room_index = 0; // 0 = small, 1 = medium, 2 = large
const room_conditions = ['small', 'medium', 'large'];
let room_test_count = 0; // Teller voor aantal tests per room
const tests_per_room = 1; // Aantal tests per room condition (aanpasbaar)

// Functie om kalibratie fragment af te spelen
function speel_kalibratie() {
  if (kalibratie_audio) {
    kalibratie_audio.pause();
    kalibratie_audio = null;
  }
  
  kalibratie_audio = new Audio('processed_fragments/Kalibratie.wav');

  
  kalibratie_audio.onended = function() {
    document.getElementById('speel-kalibratie').style.display = 'flex';
    document.getElementById('stop-kalibratie').style.display = 'none';
  };
  
  kalibratie_audio.play().then(() => {
    document.getElementById('speel-kalibratie').style.display = 'none';
    document.getElementById('stop-kalibratie').style.display = 'flex';
  }).catch(error => {
    console.error('Fout bij afspelen kalibratie audio:', error);
    alert('Er is een probleem met het afspelen van audio. Controleer uw geluidsinstellingen.');
  });
}

// Functie om kalibratie te stoppen
function stop_kalibratie() {
  if (kalibratie_audio) {
    kalibratie_audio.pause();
    kalibratie_audio = null;
  }
  document.getElementById('speel-kalibratie').style.display = 'flex';
  document.getElementById('stop-kalibratie').style.display = 'none';
}

// Functie om knoppen te verbergen/tonen
function toon_knoppen(tonen) {
  const buttonRow = document.querySelector('#test-interface .button-row');
  if (buttonRow) {
    buttonRow.style.visibility = tonen ? 'visible' : 'hidden';
    buttonRow.style.opacity = tonen ? '1' : '0';
  }
}

// Functie om de volgende hoek te berekenen
function bereken_volgende_hoek(correct) {
  if (correct) {
    // Correct antwoord: level omhoog, hoek kleiner maken
    huidig_level++;
    
    // Bepaal stap factor op basis van level
    let stap_factor;
    if (huidig_level <= 3) {
      stap_factor = 2/3;
    } else {
      stap_factor = 3/4;
    }
    
    huidige_hoek = Math.max(1, huidige_hoek * stap_factor); // Minimum 1 graad
  } else {
    // Fout antwoord: level omlaag (minimum 0), hoek groter maken
    if (huidig_level > 0) {
      huidig_level--;
      
      // Bepaal stap factor op basis van het nieuwe level
      let stap_factor;
      if (huidig_level <= 3) {
        stap_factor = 2/3;
      } else {
        stap_factor = 3/4;
      }
      
      huidige_hoek = Math.min(90, huidige_hoek / stap_factor);
    }
  }
  
  console.log(`Level: ${huidig_level}, Hoek: ${huidige_hoek.toFixed(2)}°, Room: ${room_conditions[huidige_room_index]}`);
  
  // DEBUG: Update display elementen - GEMAKKELIJK TE VERWIJDEREN
  const levelDisplay = document.getElementById('level-display');
  const hoekDisplay = document.getElementById('hoek-display');
  if (levelDisplay) levelDisplay.textContent = huidig_level;
  if (hoekDisplay) hoekDisplay.textContent = `${huidige_hoek.toFixed(1)}°`;
  // EINDE DEBUG
}

// Functie om naar de volgende room condition te gaan
function ga_naar_volgende_room() {
  huidige_room_index++;
  room_test_count = 0;

  if (huidige_room_index >= room_conditions.length) {
    // Alle room conditions zijn doorlopen
    console.log('Alle room conditions voltooid!');
    test_actief = false;

    if (huidige_audio) {
      huidige_audio.pause();
      huidige_audio = null;
    }

    // Automatisch naar evaluatie scherm
    document.getElementById('test-interface').style.display = 'none';
    document.getElementById('achteraf').style.display = 'block';
    document.body.style.overflow = 'auto';

    return true;
  }

  // reset variabelen voor nieuwe room
  huidig_level = 0;
  huidige_hoek = 90;

  console.log(`Overschakelen naar room condition: ${room_conditions[huidige_room_index]} (Level & Hoek gereset)`);

  // DEBUG UI update
  const levelDisplay = document.getElementById('level-display');
  const hoekDisplay = document.getElementById('hoek-display');
  if (levelDisplay) levelDisplay.textContent = huidig_level;
  if (hoekDisplay) hoekDisplay.textContent = `${huidige_hoek.toFixed(1)}°`;
  // einde debug

  // Toon instruction page voor volgende room condition
  toon_instruction_page(false);

  return false;
}

// Functie om instruction page te tonen
function toon_instruction_page(isFirstTime = true) {
  const instructionTitle = document.getElementById('instruction-title');
  const instructionText = document.getElementById('instruction-text');
  
  if (isFirstTime) {
    instructionTitle.textContent = 'Instructies voor de test';
    instructionText.textContent = 'U gaat nu luisteren naar fragmenten, klik op de linker of rechter knop om aan te geven uit welke richting het geluid komt. Als u twijfelt probeer zo goed mogelijk te gokken. Druk op de start knop zodra u klaar bent voor de test.';
  } else {
    instructionTitle.textContent = 'Volgende deel van de test';
    instructionText.textContent = 'Het volgende deel van de test begint zodra u op de start knop drukt.';
  }
  
  document.getElementById('test-interface').style.display = 'none';
  document.getElementById('instruction-page').style.display = 'flex';
}

// Functie om audio fragment af te spelen
function speel_fragment() {
  if (huidige_audio) {
    huidige_audio.pause();
    huidige_audio = null;
  }
  
  // Verberg knoppen tijdens het afspelen
  toon_knoppen(false);
  
  // Bepaal de bestandsnaam gebaseerd op fragment, richting, hoek en room
  const hoek_afgerond = Math.round(huidige_hoek);
  const huidige_room = room_conditions[huidige_room_index];
  const bestandsnaam = `fragment${huidig_fragment}_${huidige_richting}_${hoek_afgerond}_reverb_${huidige_room}.wav`;
  const volledige_pad = `${fragmenten_path}/fragment${huidig_fragment}/${bestandsnaam}`;
  
  console.log(`Afspelen: ${bestandsnaam}`);
  
  huidige_audio = new Audio(volledige_pad);
  
  huidige_audio.onerror = function() {
    console.error(`Audio bestand niet gevonden: ${volledige_pad}`);
    // Toon knoppen ook bij fout
    toon_knoppen(true);
  };
  
  // Toon knoppen wanneer audio klaar is
  huidige_audio.onended = function() {
    console.log('Audio fragment afgelopen - knoppen worden getoond');
    toon_knoppen(true);
  };
  
  huidige_audio.play().catch(error => {
    console.error('Fout bij afspelen audio:', error);
    // Toon knoppen ook bij fout
    toon_knoppen(true);
  });
}

// Functie om de volgende test vraag voor te bereiden
function bereid_volgende_vraag_voor() {
  // Controleer of we genoeg tests hebben gedaan voor de huidige room
  if (room_test_count >= tests_per_room) {
    if (ga_naar_volgende_room()) {
      return; // Test is voltooid
    }
  }
  
  // Willekeurig fragment kiezen (1-4)
  huidig_fragment = Math.floor(Math.random() * 4) + 1;
  
  // Willekeurige richting kiezen
  huidige_richting = Math.random() < 0.5 ? 'links' : 'rechts';
  
  // Speel het fragment automatisch af
  setTimeout(() => {
    speel_fragment();
  }, 1000); // Vertraaging voor betere gebruikerservaring
}

// Functie om antwoord te verwerken
function verwerk_antwoord(gekozen_richting) {
  if (!test_actief) return;
  
  // Verberg knoppen direct na klik
  toon_knoppen(false);
  
  const correct = gekozen_richting === huidige_richting;
  
  // Verhoog test teller voor huidige room
  room_test_count++;
  
  // Bereken volgende hoek
  bereken_volgende_hoek(correct);
  
  // DEBUG: Toon voortgang
  console.log(`Room: ${room_conditions[huidige_room_index]}, Test ${room_test_count}/${tests_per_room}`);
  const progressDisplay = document.getElementById('progress-display');
  if (progressDisplay) {
    progressDisplay.textContent = `${room_conditions[huidige_room_index]} (${room_test_count}/${tests_per_room})`;
  }
  
  // Bereid volgende vraag voor na korte pauze
  setTimeout(() => {
    bereid_volgende_vraag_voor();
  }, 800);
}

// Functie om test te starten vanuit instruction page
function start_test() {
  // Verberg instruction page
  document.getElementById('instruction-page').style.display = 'none';
  
  // Toon test interface
  document.getElementById('test-interface').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Start de test
  test_actief = true;
  console.log(`Starting test with room condition: ${room_conditions[huidige_room_index]}`);
  bereid_volgende_vraag_voor();
}

// DOM Content Loaded - Setup alle event listeners
document.addEventListener('DOMContentLoaded', function() {
  
  // Event listeners voor leeftijdsopties
  const ageOptions = document.querySelectorAll('.age-option');
  ageOptions.forEach(option => {
    option.addEventListener('click', function() {
      ageOptions.forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
      const radio = this.querySelector('input[type="radio"]');
      radio.checked = true;
    });
  });

  // Event listeners voor gehoor opties - UPDATED to match age selection behavior
  const radioOptions = document.querySelectorAll('.radio-option');
  radioOptions.forEach(option => {
    option.addEventListener('click', function() {
      // Remove selected class from all options
      radioOptions.forEach(opt => opt.classList.remove('selected'));
      
      // Add selected class to clicked option
      this.classList.add('selected');
      
      // Check the radio button
      const radio = this.querySelector('input[type="radio"]');
      radio.checked = true;
    });
  });
   // Event listeners voor kalibratie
  document.getElementById('speel-kalibratie').addEventListener('click', function() {
    speel_kalibratie();
  });

  document.getElementById('stop-kalibratie').addEventListener('click', function() {
    stop_kalibratie();
  });

  document.getElementById('verder-kalibratie').addEventListener('click', function() {
    // Stop kalibratie audio als het nog speelt
    if (kalibratie_audio) {
      kalibratie_audio.pause();
      kalibratie_audio = null;
    }
    
    // Verberg kalibratie pagina
    document.getElementById('kalibratie').style.display = 'none';
    
    // Toon vragenlijst
    document.getElementById('voorafgaand').style.display = 'flex';
  });

  // Verder knop eerste vragenlijst
  document.getElementById('verdervoor').addEventListener('click', function() {
    const ageSelected = document.querySelector('input[name="age"]:checked');
    const hearingSelected = document.querySelector('input[name="hearing"]:checked');
    
    if (!ageSelected) {
      alert('Selecteer alstublieft uw leeftijd.');
      return;
    }
    
    if (!hearingSelected) {
      alert('Beantwoord alstublieft de vraag over gehoorvermindering.');
      return;
    }
    
    // Verberg voorafgaand formulier
    document.getElementById('voorafgaand').style.display = 'none';
    
    // Reset alle test variabelen
    huidig_level = 0;
    huidige_hoek = 90;
    huidige_room_index = 0;
    room_test_count = 0;
    
    // Toon instruction page voor eerste keer
    toon_instruction_page(true);
  });

  // Start test knop op instruction page
  document.getElementById('start-test').addEventListener('click', function() {
    start_test();
  });

  // Event listeners voor test knoppen (links/rechts)
  const testButtons = document.querySelectorAll('#test-interface .button-row .button');
  
  if (testButtons.length >= 2) {
    testButtons[0].addEventListener('click', function() {
      verwerk_antwoord('links');
    });
    
    testButtons[1].addEventListener('click', function() {
      verwerk_antwoord('rechts');
    });
  }

  // Verder knop na test (verzenden)
  document.getElementById('verderachteraf').addEventListener('click', function() {
    const formData = {
      age: document.querySelector('input[name="age"]:checked')?.value,
      hearing: document.querySelector('input[name="hearing"]:checked')?.value,
      test_resultaten: {
        eind_level: huidig_level,
        eind_hoek: huidige_hoek,
        voltooide_rooms: huidige_room_index,
        laatste_room: room_conditions[Math.min(huidige_room_index, room_conditions.length - 1)]
      },
      evaluations: {}
    };
    
    for (let i = 1; i <= 9; i++) {
      const slider = document.getElementById(`vraag${i}`);
      if (slider) {
        formData.evaluations[`vraag${i}`] = slider.value;
      }
    }
    
    const feedback = document.getElementById('feedback');
    if (feedback) {
      formData.feedback = feedback.value;
    }
    
    console.log('Test Data:', formData);
    
    alert('Test verzonden! Bedankt voor uw deelname.');
    
    // Optioneel: Reset naar begin
    // location.reload();
  });

  // Toetsenbord navigatie (alleen voor vragenlijsten)
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const activeElement = document.activeElement;
      
      if (activeElement.classList.contains('age-option')) {
        activeElement.click();
      }
      
      if (activeElement.classList.contains('radio-option')) {
        activeElement.click();
      }
    }
  });

  // Focus styling voor toegankelijkheid
  document.querySelectorAll('.age-option, .radio-option').forEach(element => {
    element.setAttribute('tabindex', '0');
    
    element.addEventListener('focus', function() {
      this.style.outline = '2px solid #f0a500';
      this.style.outlineOffset = '2px';
    });
    
    element.addEventListener('blur', function() {
      this.style.outline = 'none';
    });
  });
});