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