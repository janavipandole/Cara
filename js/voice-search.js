// Web Speech API Voice Search Navigation Handler
document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.querySelector(".newsletter-form") || document.querySelector("form");
    if (!searchForm) return;

    const input = searchForm.querySelector("input") || searchForm.querySelector("input[type='email']");
    if (!input) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn("Speech recognition is not supported in this browser.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const voiceBtn = document.createElement("button");
    voiceBtn.type = "button";
    voiceBtn.id = "voice-search-btn";
    voiceBtn.innerHTML = "🎙️";
    voiceBtn.style.cssText = "position:absolute; right:10px; top:50%; transform:translateY(-50%); border:none; background:none; cursor:pointer; font-size:18px; z-index:10;";
    
    input.parentNode.style.position = "relative";
    input.parentNode.appendChild(voiceBtn);

    voiceBtn.addEventListener("click", () => {
        voiceBtn.textContent = "🛑";
        recognition.start();
    });

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        input.value = text;
        voiceBtn.textContent = "🎙️";
        searchForm.submit();
    };

    recognition.onerror = () => {
        voiceBtn.textContent = "🎙️";
    };

    recognition.onend = () => {
        voiceBtn.textContent = "🎙️";
    };
});
