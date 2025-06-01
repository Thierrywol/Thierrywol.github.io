document.addEventListener("DOMContentLoaded", function () {
  const preQuestionnaire = document.getElementById("pre-questionnaire");
  const testInterface = document.getElementById("test-interface");
  const postQuestionnaire = document.getElementById("post-questionnaire");

  // Create and add a "Start Test" button to the pre-questionnaire
  const startButton = document.createElement("button");
  startButton.textContent = "Start test";
  startButton.className = "button";
  startButton.style.marginTop = "2rem";
  preQuestionnaire.appendChild(startButton);

  startButton.addEventListener("click", function () {
    preQuestionnaire.style.display = "none";
    testInterface.style.display = "flex";
  });

  // Select test buttons
  const testButtons = testInterface.querySelectorAll(".button");

  testButtons.forEach(button => {
    button.addEventListener("click", () => {
      testInterface.style.display = "none";
      postQuestionnaire.style.display = "block";
    });
  });
});
