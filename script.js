// Fragmenten pad en test variabelen
const fragmenten_path = "C:\\Users\\Thierry\\Documents\\Fragmenten";

// Test variabelen
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
const tests_per_room = 10; // Aantal tests per room condition (aanpasbaar)

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
  const roomDisplay = document.getElementById('room-display');
  if (levelDisplay) levelDisplay.textContent = huidig_level;
  if (hoekDisplay) hoekDisplay.textContent = `${huidige_hoek.toFixed(1)}°`;
  if (roomDisplay) roomDisplay.textContent = room_conditions[huidige_room_index];
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
    
    alert(`Test voltooid! Alle ${room_conditions.length} room conditions zijn doorlopen.`);
    return true;
  }
  
  console.log(`Overschakelen naar room condition: ${room_conditions[huidige_room_index]}`);
  
  // Optioneel: reset level en hoek voor nieuwe room condition
  // huidig_level = 0;
  // huidige_hoek = 90;
  
  return false;
}

// Functie om audio fragment af te spelen
function speel_fragment() {
  if (huidige_audio) {
    huidige_audio.pause();
    huidige_audio = null;
  }
  
  // Bepaal de bestandsnaam gebaseerd op fragment, richting, hoek en room
  const hoek_afgerond = Math.round(huidige_hoek);
  const huidige_room = room_conditions[huidige_room_index];
  const bestandsnaam = `fragment${huidig_fragment}_${huidige_richting}_${hoek_afgerond}_reverb_${huidige_room}.wav`;
  const volledige_pad = `${fragmenten_path}/fragment${huidig_fragment}/${bestandsnaam}`;
  
  console.log(`Afspelen: ${bestandsnaam}`);
  
  huidige_audio = new Audio(volledige_pad);
  
  huidige_audio.onerror = function() {
    console.error(`Audio bestand niet gevonden: ${volledige_pad}`);
  };
  
  huidige_audio.play().catch(error => {
    console.error('Fout bij afspelen audio:', error);
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
  
  // Willekeurig fragment kiezen (1-5)
  huidig_fragment = Math.floor(Math.random() * 5) + 1;
  
  // Willekeurige richting kiezen
  huidige_richting = Math.random() < 0.5 ? 'links' : 'rechts';
  
  // Speel het fragment automatisch af
  setTimeout(() => {
    speel_fragment();
  }, 1000); // Vertragging voor betere gebruikerservaring
}

// Functie om antwoord te verwerken
function verwerk_antwoord(gekozen_richting) {
  if (!test_actief) return;
  
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

// Event listeners voor gehoor opties
const radioOptions = document.querySelectorAll('.radio-option');
radioOptions.forEach(option => {
  option.addEventListener('click', function() {
    const radio = this.querySelector('input[type="radio"]');
    radio.checked = true;
    radioOptions.forEach(opt => opt.style.background = 'rgba(255, 255, 255, 0.1)');
    this.style.background = 'rgba(240, 165, 0, 0.3)';
  });
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
  
  document.getElementById('voorafgaand').style.display = 'none';
  document.getElementById('test-interface').style.display = 'flex';
  
  // Reset alle test variabelen
  huidig_level = 0;
  huidige_hoek = 90;
  huidige_room_index = 0;
  room_test_count = 0;
  
  // Start de test
  test_actief = true;
  console.log(`Starting test with room condition: ${room_conditions[huidige_room_index]}`);
  bereid_volgende_vraag_voor();
});

// Event listeners voor test knoppen
document.addEventListener('DOMContentLoaded', function() {
  const testButtons = document.querySelectorAll('#test-interface .button-row .button');
  
  testButtons[0].addEventListener('click', function() {
    verwerk_antwoord('links');
  });
  
  testButtons[1].addEventListener('click', function() {
    verwerk_antwoord('rechts');
  });
});

// Verder knop test (naar evaluatie) - nu ook voor handmatige beëindiging
document.getElementById('verdertest').addEventListener('click', function() {
  test_actief = false;
  
  if (huidige_audio) {
    huidige_audio.pause();
    huidige_audio = null;
  }
  
  document.getElementById('test-interface').style.display = 'none';
  document.getElementById('achteraf').style.display = 'block';
  document.body.style.overflow = 'auto';
});

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