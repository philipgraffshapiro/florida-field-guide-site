"use strict";
try {
  document.documentElement.dataset.theme=localStorage.getItem('florida-theme')||'dark';
} catch (error) {
  document.documentElement.dataset.theme='dark';
  console.warn('Saved theme is unavailable; using dark mode.',error);
}
