// Fragmenten pad en test variabelen
const fragmenten_path = "C:\\Users\\Thierry\\Documents\\Fragmenten";

// Test variabelen
let huidig_level = 0; // Start level
let huidige_hoek = 90; // Start hoek (90 graden)
let huidige_richting = Math.random() < 0.5 ? 'links' : 'rechts'; // Willekeurige start richting
let huidig_fragment = 1; // Start met fragment 1
let test_actief = false;
let huidige_audio = null;

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
  
  console.log(`Level: ${huidig_level}, Hoek: ${huidige_hoek.toFixed(2)}°`);
  
  // DEBUG: Update display elementen - GEMAKKELIJK TE VERWIJDEREN
  const levelDisplay = document.getElementById('level-display');
  const hoekDisplay = document.getElementById('hoek-display');
  if (levelDisplay) levelDisplay.textContent = huidig_level;
  if (hoekDisplay) hoekDisplay.textContent = `${huidige_hoek.toFixed(1)}°`;
  // EINDE DEBUG
}

// Functie om audio fragment af te spelen
function speel_fragment() {
  if (huidige_audio) {
    huidige_audio.pause();
    huidige_audio = null;
  }
  
  // Bepaal de bestandsnaam gebaseerd op fragment, richting en hoek
  const hoek_afgerond = Math.round(huidige_hoek);
  const bestandsnaam = `fragment${huidig_fragment}_${huidige_richting}_${hoek_afgerond}.wav`;
  const volledige_pad = `${fragmenten_path}/fragment${huidig_fragment}/${bestandsnaam}`;
  
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
  
  // Bereken volgende hoek
  bereken_volgende_hoek(correct);
  
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
  
  // Start de test
  test_actief = true;
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

// Verder knop test (naar evaluatie)
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
      eind_hoek: huidige_hoek
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