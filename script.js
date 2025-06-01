document.addEventListener("DOMContentLoaded", function () {
  const pre = document.getElementById("pre-questionnaire");
  const test = document.getElementById("test-interface");
  const post = document.getElementById("post-questionnaire");

  document.getElementById("verdervoor").addEventListener("click", function () {
    pre.style.display = "none";
    test.style.display = "block";
  });

  document.getElementById("verdertest").addEventListener("click", function () {
    test.style.display = "none";
    post.style.display = "block";
  });

  document.getElementById("verderachteraf").addEventListener("click", function () {
    alert("Bedankt voor het invullen van de test!");
  });
});
