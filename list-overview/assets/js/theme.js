const themeToggle = document.getElementById('themeToggle');

function getTheme() {
  return localStorage.getItem('theme') || 'system';
}

function applyTheme(theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (theme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.checked = true;
  } else if (theme === 'light') {
    document.body.classList.remove('dark');
    themeToggle.checked = false;
  } else {
    document.body.classList.toggle('dark', prefersDark);
    themeToggle.checked = prefersDark;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(getTheme());
});