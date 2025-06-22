// Fragmenten pad en test variabelen
const fragmenten_path = "processed_fragments";

// CSV data storage
let csv_data = {
  participant_id: Date.now(), 
  questionnaire_data: {},
  test_data: []
};

// Test variabelen
let kalibratie_audio = null;
let huidig_level = 0; // Start level
let huidige_hoek = 90; // Start hoek (90 graden)
let huidige_richting = Math.random() < 0.5 ? 'links' : 'rechts'; // Willekeurige start richting
let huidig_fragment = 1; // Start met fragment 1
let test_actief = false;
let huidige_audio = null;

// Transitie/omslag tracking variabelen 
let transitions = 0; // Aantal omslagen/transities  
let stage = 0; // 0 = aanloopfase, 1 = testfase
let attempts = 0; // Aantal pogingen in huidige fase
let required_attempts = 1; // Start met 1 voor aanloopfase
let previous_correct = null; // Houdt vorige antwoord juistheid bij voor omslag detectie
let test_phase_count = 0; // Tel tests in fase 2 (na 3 omslagen)
const TESTS_IN_PHASE_2 = 15; // 15 fragmenten in testfase

// Nieuwe variabelen voor room conditions
let huidige_room_index = 0; // 0 = small, 1 = medium, 2 = large
const base_room_conditions = ['small', 'medium', 'large'];
let room_conditions = [];
let room_test_count = 0;

// Nieuwe variabelen voor oefenronde
let is_oefenronde = false;
let oefenronde_count = 0;
const oefenronde_tests = 3; // Aantal oefenvragen

// Genereert volgorde van kamers: eerste drie vast, vierde is willekeurige herhaling
function generate_room_sequence() {
  const sequence = ['small', 'medium', 'large']; // eerste drie kamers
  const random_fourth = base_room_conditions[Math.floor(Math.random() * base_room_conditions.length)];
  sequence.push(random_fourth);
  console.log('Generated room sequence:', sequence);
  return sequence;
}

// Maakt CSV bestand aan voor vragenlijstgegevens
function generate_questionnaire_csv() {
  let csv_content = 'participant_id,';
  let columns = [];
  let values = [`${csv_data.participant_id}`];
  
  Object.keys(csv_data.questionnaire_data).forEach(questionnaire_name => {
    const data = csv_data.questionnaire_data[questionnaire_name];
    Object.keys(data).forEach(question_key => {
      columns.push(`${questionnaire_name}_${question_key}`);
      values.push(`"${data[question_key]}"`);
    });
  });
  
  csv_content += columns.join(',') + '\n';
  csv_content += values.join(',') + '\n';
  
  return csv_content;
}

// Maakt CSV bestand aan voor testdata
function generate_test_data_csv() {
  let csv_content = 'participant_id,timestamp,is_practice,room_condition,fragment_number,direction_played,angle,correct,level,transitions,stage,test_phase_count\n';
  
  csv_data.test_data.forEach(test => {
    csv_content += `${csv_data.participant_id},${test.timestamp},${test.is_practice},${test.room_condition},${test.fragment_number},"${test.direction_played}",${test.angle},${test.correct},${test.level},${test.transitions},${test.stage},${test.test_phase_count || ''}\n`;
  });
  
  return csv_content;
}

// Start download van beide CSV bestanden 
function download_both_csvs() {
  // Download questionnaire CSV
  const questionnaire_csv = generate_questionnaire_csv();
  const questionnaire_blob = new Blob([questionnaire_csv], { type: 'text/csv;charset=utf-8;' });
  const questionnaire_link = document.createElement('a');
  
  if (questionnaire_link.download !== undefined) {
    const url = URL.createObjectURL(questionnaire_blob);
    questionnaire_link.setAttribute('href', url);
    questionnaire_link.setAttribute('download', `questionnaire_${csv_data.participant_id}.csv`);
    questionnaire_link.style.visibility = 'hidden';
    document.body.appendChild(questionnaire_link);
    questionnaire_link.click();
    document.body.removeChild(questionnaire_link);
  }
  
  // Download test data CSV
  setTimeout(() => {
    const test_csv = generate_test_data_csv();
    const test_blob = new Blob([test_csv], { type: 'text/csv;charset=utf-8;' });
    const test_link = document.createElement('a');
    
    if (test_link.download !== undefined) {
      const url = URL.createObjectURL(test_blob);
      test_link.setAttribute('href', url);
      test_link.setAttribute('download', `test_data_${csv_data.participant_id}.csv`);
      test_link.style.visibility = 'hidden';
      document.body.appendChild(test_link);
      test_link.click();
      document.body.removeChild(test_link);
    }
  }, 500); 
}

// Slaat ingevulde vragenlijstgegevens op
function save_questionnaire_data(questionnaire_name, data) {
  if (!csv_data.questionnaire_data[questionnaire_name]) {
    csv_data.questionnaire_data[questionnaire_name] = {};
  }
  
  Object.keys(data).forEach(key => {
    csv_data.questionnaire_data[questionnaire_name][key] = data[key];
  });
  
  console.log(`Saved ${questionnaire_name} data:`, data);
}

// Slaat antwoord van test op in CSV data
function save_test_answer(correct, angle, room_condition, is_practice, fragment_number, direction_played) {
  const test_entry = {
    timestamp: new Date().toISOString(),
    is_practice: is_practice,
    room_condition: room_condition,
    fragment_number: fragment_number,
    direction_played: direction_played,
    angle: angle.toFixed(2),
    correct: correct,
    level: huidig_level,
    transitions: transitions,
    stage: stage,
    test_phase_count: stage === 1 ? test_phase_count : null
  };
  
  csv_data.test_data.push(test_entry);
  
  console.log('Saved test answer:', test_entry);
}

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
  // Detecteer transitie (omslag) - wanneer antwoord juistheid verandert
  if (previous_correct !== null && previous_correct !== correct) {
    transitions += 1;
    console.log(`Transitie ${transitions}: ${previous_correct ? 'goed' : 'fout'} -> ${correct ? 'goed' : 'fout'}`);
    
    // Controleer of we naar testfase moeten (stage 1) na 3 omslagen
    if (transitions >= 3 && stage === 0) {
      stage = 1;
      attempts = 0;
      required_attempts = 2; // 2 goed nodig in testfase
      test_phase_count = 0; // Reset teller voor fase 2
      console.log(`Overgaan naar testfase (stage 1) na ${transitions} omslagen`);
    }
  }
  
  previous_correct = correct;
  
  if (correct) {
    // Juist antwoord
    attempts += 1;
    console.log(`Goed! Pogingen: ${attempts}, Vereist: ${required_attempts}, Fase: ${stage}`);
    
    // Controleer of genoeg juiste antwoorden om naar hoger level te gaan
    let should_promote = false;
    
    if (stage === 0) {
      // Aanloopfase: 1 juist antwoord nodig
      should_promote = (attempts >= 1);
    } else {
      // Testfase: 2 juiste antwoorden nodig  
      should_promote = (attempts >= 2);
    }
    
    if (should_promote) {
      huidig_level++;
      attempts = 0;
      
      // Bepaal stap factor op basis van level
      let stap_factor;
      if (huidig_level <= 3) {
        stap_factor = 1 / 3;
      } else {
        stap_factor = 1 / 4;
      }

      huidige_hoek = Math.max(1, huidige_hoek - stap_factor * huidige_hoek);

      console.log(`GEPROMOVEERD naar level ${huidig_level}, hoek: ${huidige_hoek.toFixed(2)}°`);
    }
  } else {
    // Fout antwoord - degraderen naar lager level
    attempts = 0; // Reset attempts na fout antwoord

    if (huidig_level > 0) {
      huidig_level--;

      // Bepaal stap factor op basis van het nieuwe level
      let stap_factor;
      if (huidig_level <= 3) {
        stap_factor = 1 / 3;
      } else {
        stap_factor = 1 / 4;
      }

      huidige_hoek = Math.min(90, huidige_hoek + stap_factor * huidige_hoek);

      console.log(`GEDEGRADEERD naar level ${huidig_level}, hoek: ${huidige_hoek.toFixed(2)}°`);
    }

  }
  
  // In testfase (stage 1): tel aantal fragmenten
  if (stage === 1) {
    test_phase_count++;
    console.log(`Testfase: fragment ${test_phase_count}/${TESTS_IN_PHASE_2}`);
  }
  
  console.log(`Level: ${huidig_level}, Hoek: ${huidige_hoek.toFixed(2)}°, Fase: ${stage}, Transities: ${transitions}`);
  
  const levelDisplay = document.getElementById('level-display');
  const hoekDisplay = document.getElementById('hoek-display');
  if (levelDisplay) levelDisplay.textContent = huidig_level;
  if (hoekDisplay) hoekDisplay.textContent = `${huidige_hoek.toFixed(1)}°`;
  
  updateAngleDisplay(huidige_hoek);
}

// Teken hoekenboog op scherm
function updateAngleDisplay(angle) {
  const filledSection = document.getElementById('filledSection');
  if (!filledSection) return;

  const centerX = 180;
  const centerY = 180;
  const radius = 75;

  const startAngleDeg = -angle;
  const endAngleDeg = angle;

  // Omrekenen naar radians 
  const startRad = (startAngleDeg - 90) * Math.PI / 180;
  const endRad = (endAngleDeg - 90) * Math.PI / 180;

  const startX = centerX + radius * Math.cos(startRad);
  const startY = centerY + radius * Math.sin(startRad);
  const endX = centerX + radius * Math.cos(endRad);
  const endY = centerY + radius * Math.sin(endRad);

  const largeArcFlag = (2 * angle) > 180 ? 1 : 0;

  const pathData = `
    M ${centerX},${centerY}
    L ${startX},${startY}
    A ${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY}
    Z
  `;

  filledSection.setAttribute('d', pathData.trim());

  console.log(`Arc from ${startAngleDeg}° to ${endAngleDeg}° (span = ${2 * angle}°)`);
}

// Functie om naar de volgende room condition te gaan
function ga_naar_volgende_room() {
  // Stop alle audio en timers
  stop_alle_audio_en_timers();
  
  huidige_room_index++;

  if (huidige_room_index >= room_conditions.length) {
    // Alle room conditions zijn doorlopen
    console.log('Alle room conditions voltooid!');
    test_actief = false;

    // Automatisch naar evaluatie scherm
    document.getElementById('test-interface').style.display = 'none';
    document.getElementById('achteraf').style.display = 'block';
    document.body.style.overflow = 'auto';

    return true;
  }
    // Reset alle variabelen voor nieuwe room
  huidig_level = 0;
  huidige_hoek = 90;
  stage = 0;
  attempts = 0;
  required_attempts = 1;
  transitions = 0;
  previous_correct = null;
  test_phase_count = 0;

  console.log(`Overschakelen naar room condition: ${room_conditions[huidige_room_index]} (Alle variabelen gereset)`);

  const levelDisplay = document.getElementById('level-display');
  const hoekDisplay = document.getElementById('hoek-display');
  if (levelDisplay) levelDisplay.textContent = huidig_level;
  if (hoekDisplay) hoekDisplay.textContent = `${huidige_hoek.toFixed(1)}°`;

  // Toon instruction page voor volgende room condition
  toon_instruction_page_between_parts();

  return false;
}

// Functie om instruction page te tonen (eerste keer)
function toon_instruction_page(isFirstTime = true) {
  const instructionTitle = document.getElementById('instruction-title');
  const instructionText = document.getElementById('instruction-text');
  
  instructionTitle.textContent = 'Instructies voor de test';
  instructionText.textContent = 'De test duurt ongeveer 30 minuten en bestaat uit vier onderdelen. Elk onderdeel bevat 30 vragen. We beginnen met een korte introductie waarin u het volledige geluid te horen krijgt, gevolgd door drie oefenvragen. Deze oefenvragen zijn bedoeld om u vertrouwd te maken met de testprocedure en tellen niet mee voor uw uiteindelijke resultaat. Tijdens de test hoort u steeds een geluidsfragment via de hoofdtelefoon. Uw taak is om aan te geven van welke kant (links of rechts) het geluid komt. Naarmate u vaker het juiste antwoord geeft, wordt de test geleidelijk moeilijker. Zo kunnen we nauwkeurig bepalen hoe goed u richtingsgeluid kunt waarnemen. We vragen u om zich tijdens de test zo goed mogelijk te concentreren op de geluiden. Het is normaal als sommige fragmenten moeilijk te horen zijn, twijfel hoort erbij. Vertrouw op uw gehoor en kies altijd een antwoord, ook als u niet zeker bent.';
  
  document.getElementById('test-interface').style.display = 'none';
  document.getElementById('instruction-page').style.display = 'flex';
  document.getElementById('oefenronde-page').style.display = 'none';
  document.getElementById('start-test-page').style.display = 'none';
}

// Functie om instruction page tussen onderdelen te tonen
function toon_instruction_page_between_parts() {
  const instructionTitle = document.getElementById('instruction-title');
  const instructionText = document.getElementById('instruction-text');
  
  let completedPart = '';
  let nextPart = '';
  
  if (huidige_room_index === 1) {
    completedPart = 'eerste';
    nextPart = 'tweede';
  } else if (huidige_room_index === 2) {
    completedPart = 'tweede';
    nextPart = 'derde';
  } else if (huidige_room_index === 3) {
    completedPart = 'derde';
    nextPart = 'vierde';
  }
  
  instructionTitle.textContent = 'Volgende deel van de test';
  instructionText.textContent = `U heeft het ${completedPart} deel van de test afgerond. We gaan nu verder met het ${nextPart} onderdeel. Ook hier hoort u steeds een geluidsfragment via de hoofdtelefoon en geeft u aan van welke kant het geluid komt. Klik op "Doorgaan" om verder te gaan.`;
  
  document.getElementById('test-interface').style.display = 'none';
  document.getElementById('instruction-page').style.display = 'flex';
  document.getElementById('oefenronde-page').style.display = 'none';
  document.getElementById('start-test-page').style.display = 'none';
}

// Functie om oefenronde page te tonen
function toon_oefenronde_page() {
  document.getElementById('instruction-page').style.display = 'none';
  document.getElementById('oefenronde-page').style.display = 'flex';
  document.getElementById('start-test-page').style.display = 'none';
  document.getElementById('test-interface').style.display = 'none';
}

// Functie om start test page te tonen
function toon_start_test_page() {
  document.getElementById('instruction-page').style.display = 'none';
  document.getElementById('oefenronde-page').style.display = 'none';
  document.getElementById('start-test-page').style.display = 'flex';
  document.getElementById('test-interface').style.display = 'none';
}

// Functie om audio fragment af te spelen
function speel_fragment() {
  if (huidige_audio) {
    huidige_audio.pause();
    huidige_audio = null;
  }
  
  // Verberg knoppen tijdens het afspelen
  toon_knoppen(false);
  
  // Bepaal fragment nummer (5 voor oefenronde, 1-4 voor echte test)
  const fragment_nummer = is_oefenronde ? 5 : huidig_fragment;
  
  // Bepaal de bestandsnaam gebaseerd op fragment, richting, hoek en room
  const hoek_afgerond = Math.round(huidige_hoek);
  const huidige_room = room_conditions[huidige_room_index];
  const bestandsnaam = `fragment${fragment_nummer}_${huidige_richting}_${hoek_afgerond}_reverb_${huidige_room}.wav`;
  const volledige_pad = `${fragmenten_path}/fragment${fragment_nummer}/${bestandsnaam}`;
  
  console.log(`Afspelen: ${bestandsnaam} (Oefenronde: ${is_oefenronde})`);
  
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

  updateAngleDisplay(huidige_hoek);
}

// Functie om countdown te starten voor fragment
function start_countdown() {
  if (!test_actief) return;
  
  const countdownContainer = document.getElementById('countdown-container');
  const countdownNumber = document.getElementById('countdown-number');
  
  if (!countdownContainer || !countdownNumber) return;
  
  // Verberg knoppen en toon countdown
  toon_knoppen(false);
  countdownContainer.style.display = 'block';
  
  let count = 3;
  countdownNumber.textContent = count;
  
  const countdownInterval = setInterval(() => {
    count--;
    
    if (count > 0) {
      countdownNumber.textContent = count;
      // animatie resetten
      countdownNumber.style.animation = 'none';
      countdownNumber.offsetHeight; 
      countdownNumber.style.animation = 'countdown-pulse 1s ease-in-out';
    } else {
      // Countdown afgelopen
      clearInterval(countdownInterval);
      countdownContainer.style.display = 'none';
      
      if (test_actief) {
        speel_fragment();
      }
    }
  }, 1000);
}

// Functie om de volgende test vraag voor te bereiden
function bereid_volgende_vraag_voor() {
  // Controleer of test nog actief is
  if (!test_actief) {
    console.log('Test is niet actief, stoppen met voorbereiden vraag');
    return;
  }
  
  // Check of we in oefenronde zijn
  if (is_oefenronde) {
    if (oefenronde_count >= oefenronde_tests) {
      // Oefenronde voltooid, ga naar start test page
      is_oefenronde = false;
      oefenronde_count = 0;
      test_actief = false;
      
      // Reset test variabelen voor echte test
      huidig_level = 0; // Aantal transities resetten
      huidige_hoek = 90; // Laatste antwoord resetten
      transitions = 0; // Reset transitions when starting real test
      previous_correct = null; // Reset previous_correct when starting real test
      stage = 0; // Reset to setup phase
      attempts = 0;
      required_attempts = 1;
      test_phase_count = 0;
      toon_start_test_page(); // Toon startpagina voor test
      return;
    }
  } else {
    // Controleer of fase 2 voltooid is (15 tests)
    if (stage === 1 && test_phase_count >= TESTS_IN_PHASE_2) {
      console.log('Testfase voltooid na 15 fragmenten');
      if (ga_naar_volgende_room()) {
        return; // Test is voltooid
      }
      return; // Wacht op nieuwe room start
    }
  }
  
  // Willekeurig fragment kiezen (1-4 voor echte test, 5 is al ingesteld voor oefenronde)
  if (!is_oefenronde) {
    huidig_fragment = Math.floor(Math.random() * 4) + 1;
  }
  
  // Willekeurige richting kiezen
  huidige_richting = Math.random() < 0.5 ? 'links' : 'rechts';
  
  // Start countdown en speel fragment daarna
  setTimeout(() => {
    if (test_actief) { // Extra check voordat countdown start
      start_countdown();
    }
  }, 1000);
}

// Verwerk het antwoord van de deelnemer
function verwerk_antwoord(gekozen_richting) {
  if (!test_actief) return;
  
  // Verberg knoppen direct na klik
  toon_knoppen(false);
  
  const correct = gekozen_richting === huidige_richting;
  
  // testdata opslaan
  const current_room = room_conditions[huidige_room_index];
  save_test_answer(
    correct, 
    huidige_hoek, 
    current_room, 
    is_oefenronde, 
    is_oefenronde ? 5 : huidig_fragment, 
    huidige_richting
  );
  
  if (is_oefenronde) {
    // Verhoog oefenronde teller en bepaa; volgende hoek
    oefenronde_count++;
    bereken_volgende_hoek(correct);
    
    console.log(`Oefenronde: ${oefenronde_count}/${oefenronde_tests}`);
  } else {
    
    // Bereken volgende hoek (alleen voor echte test)
    bereken_volgende_hoek(correct);
    
      // Toon voortgang op debug display
    console.log(`Room: ${room_conditions[huidige_room_index]}, Stage: ${stage}, Test phase count: ${test_phase_count}/${TESTS_IN_PHASE_2}`);
    const progressDisplay = document.getElementById('progress-display');
    if (progressDisplay) {
      if (stage === 0) {
        progressDisplay.textContent = `${room_conditions[huidige_room_index]} - Aanloopfase (${transitions}/3 transities)`;
      } else {
        progressDisplay.textContent = `${room_conditions[huidige_room_index]} - Testfase (${test_phase_count}/${TESTS_IN_PHASE_2})`;
      }
    }
  }
  
  // Bereid volgende vraag voor na korte pauze
  setTimeout(() => {
    bereid_volgende_vraag_voor();
  }, 800);
}

// Startwaarden voor een nieuwe deelnemer
function initialize_new_participant() {
  room_conditions = generate_room_sequence();
  huidige_room_index = 0;
  // Reset variabelen specifiek voor deze deelnemer
  csv_data = {
    participant_id: Date.now(),
    questionnaire_data: {},
    test_data: []
  };
}

// Functie om oefenronde te starten
function start_oefenronde() {
  // Verberg oefenronde page
  document.getElementById('oefenronde-page').style.display = 'none';
  
  // Toon test interface
  document.getElementById('test-interface').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Initialiseer oefenvariabelen
  is_oefenronde = true;
  oefenronde_count = 0;
  test_actief = true;
  
  // Zet startwaarden voor level en hoek
  huidig_level = 0;
  huidige_hoek = 90;
  
  // Update debug display
  const levelDisplay = document.getElementById('level-display');
  const hoekDisplay = document.getElementById('hoek-display');
  if (levelDisplay) levelDisplay.textContent = huidig_level;
  if (hoekDisplay) hoekDisplay.textContent = `${huidige_hoek.toFixed(1)}°`;
  
  console.log('Starting oefenronde with level/angle tracking');
  bereid_volgende_vraag_voor();
}

// Start de echte test vanuit instructiepagina
function start_test() {
  // Verberg instructiepagina
  document.getElementById('instruction-page').style.display = 'none';
  
  // Toon test interface
  document.getElementById('test-interface').style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Verberg startpagina test
  document.getElementById('start-test-page').style.display = 'none';
  
  // Start de test
  test_actief = true;
  console.log(`Starting test with room condition: ${room_conditions[huidige_room_index]}`);
  bereid_volgende_vraag_voor();
}

// Stop alle audio en timers
function stop_alle_audio_en_timers() {
  test_actief = false;
  
  // Stop huidige audio
  if (huidige_audio) {
    huidige_audio.pause();
    huidige_audio = null;
  }
  
  // Stop kalibratie audio
  if (kalibratie_audio) {
    kalibratie_audio.pause();
    kalibratie_audio = null;
  }
  
  // Verberg countdown
  const countdownContainer = document.getElementById('countdown-container');
  if (countdownContainer) {
    countdownContainer.style.display = 'none';
  }
  
  // Toon knoppen (voor het geval ze verborgen waren)
  toon_knoppen(true);
}

// Event handlers na DOM is geladen
document.addEventListener('DOMContentLoaded', function() {
  
// Selecteer leeftijdsopties
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
      // Deselecteer alle opties
      radioOptions.forEach(opt => opt.classList.remove('selected'));
      
      // Selecteer aangeklikte optie
      this.classList.add('selected');
      
      // Selecteer bijbehorende radio button
      const radio = this.querySelector('input[type="radio"]');
      radio.checked = true;
    });
  });
   // Event listeners voor kalibratieknoppen
  document.getElementById('speel-kalibratie').addEventListener('click', function() {
    speel_kalibratie(); // Start kalibratieaudio
  });

  document.getElementById('stop-kalibratie').addEventListener('click', function() {
    stop_kalibratie(); // Stop kalibratie audio
  });

  document.getElementById('verder-kalibratie').addEventListener('click', function() {
    // Stop audio als nog actief
    if (kalibratie_audio) {
      kalibratie_audio.pause();
      kalibratie_audio = null;
    }
    
    // Verberg kalibratiepagina en toon vragenlijst
    document.getElementById('kalibratie').style.display = 'none';
    
    // Knop om vragenlijst te bevestigen
    document.getElementById('voorafgaand').style.display = 'flex';
  });

  // Verder knop eerste vragenlijst
  document.getElementById('verdervoor').addEventListener('click', function() {
    const ageSelected = document.querySelector('input[name="age"]:checked');
    const hearingSelected = document.querySelector('input[name="hearing"]:checked');
    
    // Check of leeftijd en gehoor zijn ingevuld
    if (!ageSelected) {
      alert('Selecteer alstublieft uw leeftijd.');
      return;
    }
    
    if (!hearingSelected) {
      alert('Beantwoord alstublieft de vraag over gehoorvermindering.');
      return;
    }
    
    // Sla antwoorden op
    save_questionnaire_data('demographics', {
      age: ageSelected.value,
      hearing_problems: hearingSelected.value
    });
    
    // Genereer volgorde van kamers voor één keer
    if (room_conditions.length === 0) {
      room_conditions = generate_room_sequence();
    }
    
    // Reset testvariabelen
    document.getElementById('voorafgaand').style.display = 'none';
    huidig_level = 0;
    huidige_hoek = 90;
    huidige_room_index = 0;
    is_oefenronde = false;
    oefenronde_count = 0;
    
    toon_instruction_page(true); // Ga naar instructiepagina
  });


  // Start test knop (vanaf instructiepagina)
  document.getElementById('start-test').addEventListener('click', function() {
    // Eerste keer: toon oefenronde, anders start echte test
    if (huidige_room_index === 0 && room_test_count === 0) {
      toon_oefenronde_page();
    } else {
      start_test();
    }
  });

  // Start oefenronde knop
  document.getElementById('start-oefenronde').addEventListener('click', function() {
    start_oefenronde();
  });

  // Start echte test knop
  document.getElementById('start-echte-test').addEventListener('click', function() {
    start_test();
  });

  // test knoppen (links/rechts)
  const testButtons = document.querySelectorAll('#test-interface .button-row .button');
  
  if (testButtons.length >= 2) {
    testButtons[0].addEventListener('click', function() {
      verwerk_antwoord('links');
    });
    
    testButtons[1].addEventListener('click', function() {
      verwerk_antwoord('rechts');
    });
  }

  // Knop om testresultaten te verzenden
  document.getElementById('verderachteraf').addEventListener('click', function() {
   const evaluations = {};

   // for (let i = 1; i <= 9; i++) { : hiermee was de originele code gerund, waardoom de laatste vragen niet naar de csv geexporteerd waren. nu aangepast naar 12
        for (let i = 1; i <= 12; i++) {
      const slider = document.getElementById(`vraag${i}`);
      if (slider) {
        evaluations[`question_${i}`] = slider.value;
      }
    }
    
    // Voeg optionele feedback toe
    const feedback = document.getElementById('feedback');
    if (feedback && feedback.value.trim()) {
      evaluations.feedback = feedback.value.trim();
    }

    // Sla evaluatie op en download CSV
    save_questionnaire_data('evaluation', evaluations);    
    download_both_csvs();
    
    console.log('Complete test data saved and downloaded');
    alert('Test verzonden en data gedownload! Bedankt voor uw deelname.');
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

  // Visuele focusstyling voor betere toegankelijkheid
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