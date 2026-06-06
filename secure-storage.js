(function() {
    // A fast obfuscation helper to protect local storage data from plain text snooping
    function xorEncryptDecrypt(input, key) {
        let output = "";
        for (let i = 0; i < input.length; i++) {
            let charCode = input.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            output += String.fromCharCode(charCode);
        }
        return btoa(output);
    }

    function xorDecrypt(input, key) {
        try {
            let decoded = atob(input);
            let output = "";
            for (let i = 0; i < decoded.length; i++) {
                let charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                output += String.fromCharCode(charCode);
            }
            return output;
        } catch (e) {
            return null;
        }
    }

    const SECRET_KEY = "cara_obfuscation_secure_key";

    window.SecureStorage = {
        setItem: function(key, value) {
            const strVal = JSON.stringify(value);
            const encrypted = xorEncryptDecrypt(strVal, SECRET_KEY);
            localStorage.setItem(key, encrypted);
        },
        getItem: function(key) {
            const val = localStorage.getItem(key);
            if (!val) return null;
            const decrypted = xorDecrypt(val, SECRET_KEY);
            if (!decrypted) return null;
            try {
                return JSON.parse(decrypted);
            } catch (e) {
                return null;
            }
        },
        removeItem: function(key) {
            localStorage.removeItem(key);
        }
    };
})();

// TODO: Implement cryptographic token signing wrapper

// Wrapper utility ensuring local session tokens are obfuscated before storage.