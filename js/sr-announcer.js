// Accessibility Screen Reader Announcer Manager
class SRAnnouncer {
    static init() {
        if (document.getElementById("sr-announcer")) return;
        const announcer = document.createElement("div");
        announcer.id = "sr-announcer";
        announcer.setAttribute("aria-live", "polite");
        announcer.setAttribute("aria-atomic", "true");
        announcer.style.cssText = "position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden;";
        document.body.appendChild(announcer);
    }

    static announce(message) {
        this.init();
        const el = document.getElementById("sr-announcer");
        if (el) {
            el.textContent = message;
        }
    }
}
window.SRAnnouncer = SRAnnouncer;
document.addEventListener("DOMContentLoaded", () => SRAnnouncer.init());
