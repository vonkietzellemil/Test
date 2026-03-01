const themeToggle = document.getElementById('themeToggle');

function getTheme() {
  return localStorage.getItem('theme') || 'system';
}

function applyTheme(theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.checked = true;
  } else if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.checked = false;
  } else {
    document.documentElement.setAttribute('data-theme', prefersDark);
    themeToggle.checked = prefersDark;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(getTheme());
});