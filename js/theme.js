const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

// LOAD SAVED THEME
if (localStorage.getItem("theme") === "dark") {

  document.body.classList.add("dark-theme");

  themeIcon.classList.remove("ri-moon-line");
  themeIcon.classList.add("ri-sun-line");
}

// BUTTON CLICK
themeToggle.addEventListener("click", () => {

  document.body.classList.toggle("dark-theme");

  const isDark =
    document.body.classList.contains("dark-theme");

  // SAVE THEME
  localStorage.setItem(
    "theme",
    isDark ? "dark" : "light"
  );

  // CHANGE ICON
  if (isDark) {

    themeIcon.classList.remove("ri-moon-line");
    themeIcon.classList.add("ri-sun-line");

  } else {

    themeIcon.classList.remove("ri-sun-line");
    themeIcon.classList.add("ri-moon-line");
  }

});