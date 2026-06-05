class CaraToast {
    static queue = [];
    static activeToasts = 0;
    static maxActive = 3;

    static init() {
        let container = document.getElementById("toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            document.body.appendChild(container);
        }
        return container;
    }

    static show(message, type = "success", duration = 4000) {
        // Enqueue the request
        this.queue.push({ message, type, duration });
        this.processQueue();
    }

    static processQueue() {
        if (this.activeToasts >= this.maxActive || this.queue.length === 0) return;

        const nextToast = this.queue.shift();
        this.createToast(nextToast.message, nextToast.type, nextToast.duration);
    }

    static createToast(message, type, duration) {
        const container = this.init();
        this.activeToasts++;

        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        toast.setAttribute("role", "alert");
        toast.setAttribute("aria-live", "polite");

        const icons = {
            success: "fa-circle-check",
            error: "fa-circle-xmark",
            warning: "fa-triangle-exclamation",
            info: "fa-circle-info"
        };

        toast.innerHTML = `
            <i class="fa-solid ${icons[type] || icons.success} toast-icon"></i>
            <span class="toast-msg">${message}</span>
            <button class="toast-close" aria-label="Close notification">&times;</button>
            <div class="toast-progress"></div>
        `;

        container.appendChild(toast);

        let remainingTime = duration;
        let start = Date.now();
        let timeoutId;
        const progressBar = toast.querySelector(".toast-progress");

        const dismiss = () => {
            if (toast.classList.contains("toast-hiding")) return;
            toast.classList.add("toast-hiding");
            toast.addEventListener("animationend", () => {
                toast.remove();
                this.activeToasts--;
                this.processQueue();
            });
        };

        // Close button click handler
        toast.querySelector(".toast-close").addEventListener("click", dismiss);

        // Timer control functions
        const startTimer = () => {
            start = Date.now();
            timeoutId = setTimeout(dismiss, remainingTime);
            progressBar.style.animationPlayState = "running";
        };

        const pauseTimer = () => {
            clearTimeout(timeoutId);
            remainingTime -= Date.now() - start;
            progressBar.style.animationPlayState = "paused";
        };

        // Pause on Hover
        toast.addEventListener("mouseenter", pauseTimer);
        toast.addEventListener("mouseleave", startTimer);

        // Start initial timer
        startTimer();
    }
}

// Bind to window object for global availability
window.CaraToast = CaraToast;
// Overwrite window.showToast to use the upgraded system transparently
window.showToast = (message, type) => CaraToast.show(message, type);
