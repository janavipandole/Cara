/**
 * Address Book & Payment Vault Store
 */
class AddressVault {
    getAddresses() {
        try {
            const raw = localStorage.getItem('cara_saved_addresses');
            const parsed = JSON.parse(raw || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            return [];
        }
    }

    saveAddress(addr) {
        if (!addr || typeof addr !== 'object') return false;
        try {
            const list = this.getAddresses();
            list.push(addr);
            localStorage.setItem('cara_saved_addresses', JSON.stringify(list));
            return true;
        } catch (err) {
            // Silently fail if localStorage is unavailable or full
            return false;
        }
    }
}
window.addressVault = new AddressVault();


export function maskCreditCardNumber(cardNumber) { if (!cardNumber || typeof cardNumber !== 'string') return '****'; const clean = cardNumber.replace(/\D/g, ''); return clean.length < 4 ? '****' : '**** **** **** ' + clean.slice(-4); }