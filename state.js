(function() {
    class CentralStateStore {
        constructor() {
            this.state = {
                cart: JSON.parse(localStorage.getItem("productsInCart")) || [],
                wishlist: JSON.parse(localStorage.getItem("wishlist")) || [],
                loggedInUser: JSON.parse(localStorage.getItem("loggedInUser")) || null
            };
            this.listeners = {};

            // Listen for cross-tab updates
            window.addEventListener('storage', (e) => {
                if (e.key === "productsInCart") {
                    this.state.cart = JSON.parse(e.newValue) || [];
                    this.emit("cart", this.state.cart);
                } else if (e.key === "wishlist") {
                    this.state.wishlist = JSON.parse(e.newValue) || [];
                    this.emit("wishlist", this.state.wishlist);
                } else if (e.key === "loggedInUser") {
                    this.state.loggedInUser = JSON.parse(e.newValue) || null;
                    this.emit("auth", this.state.loggedInUser);
                }
            });
        }

        getState(key) {
            return this.state[key];
        }

        setState(key, value) {
            this.state[key] = value;
            const storageKey = key === "cart" ? "productsInCart" : key;
            localStorage.setItem(storageKey, JSON.stringify(value));
            this.emit(key, value);
        }

        subscribe(key, listener) {
            if (!this.listeners[key]) {
                this.listeners[key] = [];
            }
            this.listeners[key].push(listener);
            // Fire immediately with current value
            listener(this.state[key]);
            return () => {
                this.listeners[key] = this.listeners[key].filter(l => l !== listener);
            };
        }

        emit(key, value) {
            if (this.listeners[key]) {
                this.listeners[key].forEach(listener => {
                    try {
                        listener(value);
                    } catch (e) {
                        console.error(`Error in state listener for ${key}:`, e);
                    }
                });
            }
        }
    }

    window.StateStore = new CentralStateStore();
})();
