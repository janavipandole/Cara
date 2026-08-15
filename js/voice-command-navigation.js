(function () {
  'use strict';
  const btn = document.querySelector('[data-voice-command]');
  if (!btn || !('webkitSpeechRecognition' in window)) return;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SR();
  rec.lang = 'en-IN';
  rec.interimResults = false;
  const onResult = (e) => {
    const text = (e.results[0][0].transcript || '').toLowerCase().trim();
    if (!text) return;
    window.dispatchEvent(new CustomEvent('cara:voice-command', { detail: { text } }));
  };
  rec.onresult = onResult;
  rec.onend = () => { btn.classList.remove('is-listening'); };
  btn.addEventListener('click', () => {
    btn.classList.add('is-listening');
    try { rec.start(); } catch (err) {}
  });
})();
