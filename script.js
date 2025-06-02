document.addEventListener("DOMContentLoaded", function () {
  const vooraf = document.getElementById("voorafgaand");
  const test = document.getElementById("test-interface");
  const achteraf = document.getElementById("achteraf");

  const knopVoor = document.getElementById("verdervoor");
  const knopTest = document.getElementById("verdertest");
  const knopAchteraf = document.getElementById("verderachteraf");

  knopVoor.addEventListener("click", function () {
    vooraf.style.display = "none";
    test.style.display = "block";
  });

  knopTest.addEventListener("click", function () {
    test.style.display = "none";
    achteraf.style.display = "block";
  });

  knopAchteraf.addEventListener("click", function () {
    alert("Bedankt voor uw deelname");
  });
});
document.addEventListener("DOMContentLoaded", function () {
  const progressBar = document.getElementById("progress-bar");

  function updateProgress(percentage) {
    progressBar.style.width = `${percentage}%`;
  }

  // Start op 10% (voorafgaand)
  updateProgress(10);

  const vooraf = document.getElementById("voorafgaand");
  const test = document.getElementById("test-interface");
  const achteraf = document.getElementById("achteraf");

  const knopVoor = document.getElementById("verdervoor");
  const knopTest = document.getElementById("verdertest");
  const knopAchteraf = document.getElementById("verderachteraf");

  const knopLinks = document.getElementById("links-naar-rechts");
  const knopRechts = document.getElementById("rechts-naar-links");

  // Fragmentdata voorbereiden
  const fragmenten = [];
  const fragmentNummers = [1, 2, 3, 4];
  const richtingen = ["p", "m"];
  const graden = [0, 30, 60, 90];
  const reverbs = ["0p4s", "2p0s", "6p0s"];

  fragmentNummers.forEach(fragNr => {
    richtingen.forEach(richting => {
      graden.forEach(graad => {
        reverbs.forEach(reverb => {
          fragmenten.push({
            naam: `Fragment${fragNr}_${richting}${graad}deg_reverb${reverb}.wav`,
            fragment: fragNr,
            richting: richting === "p" ? "links-naar-rechts" : "rechts-naar-links",
            graad: graad,
            reverb: reverb,
            path: `audio/Fragment${fragNr}_${richting}${graad}deg_reverb${reverb}.wav`
          });
        });
      });
    });
  });

  const reverbCondities = ["0p4s", "2p0s", "6p0s"];
  let faseIndex = 0;
  let testSet = [];
  let currentIndex = 0;
  let totaalAantalTestFragmenten = 60; // 3 reverbs × 20 fragmenten
  let huidigeFragmentTeller = 0;
  let antwoordGegeven = false;

  function getTestSetVoorReverb(reverb) {
    return fragmenten
      .filter(f => f.reverb === reverb)
      .sort(() => Math.random() - 0.5)
      .slice(0, 20);
  }

  function updateTestProgress() {
    // Testfase is 80% van totale bar (tussen 10 en 90%)
    const percentage = 10 + (huidigeFragmentTeller / totaalAantalTestFragmenten) * 80;
    updateProgress(percentage);
  }

  function startTrial() {
    if (currentIndex >= testSet.length) {
      gaNaarVolgendeReverb();
      return;
    }

    const huidige = testSet[currentIndex];
    const audio = new Audio(huidige.path);
    audio.play();

    antwoordGegeven = false;
    knopTest.disabled = true;
  }

  function gaNaarVolgendeReverb() {
    faseIndex++;
    if (faseIndex < reverbCondities.length) {
      testSet = getTestSetVoorReverb(reverbCondities[faseIndex]);
      currentIndex = 0;
      startTrial();
    } else {
      test.style.display = "none";
      achteraf.style.display = "block";
      updateProgress(100); // Eindstatus
    }
  }

  knopVoor.addEventListener("click", function () {
    vooraf.style.display = "none";
    test.style.display = "block";
    updateProgress(10); // Start test
    testSet = getTestSetVoorReverb(reverbCondities[faseIndex]);
    startTrial();
  });

  knopTest.addEventListener("click", function () {
    if (antwoordGegeven) {
      currentIndex++;
      huidigeFragmentTeller++;
      updateTestProgress();
      startTrial();
    }
  });

  knopAchteraf.addEventListener("click", function () {
    alert("Bedankt voor uw deelname");
  });

  knopLinks.addEventListener("click", function () {
    console.log("Antwoord: links naar rechts");
    antwoordGegeven = true;
    knopTest.disabled = false;
    moeilijkheid = Math.max(moeilijkheid - 5, 0);
  });

  knopRechts.addEventListener("click", function () {
    console.log("Antwoord: rechts naar links");
    antwoordGegeven = true;
    knopTest.disabled = false;
    moeilijkheid += 5;
  });
});
