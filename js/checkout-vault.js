/**
 * Address Book & Payment Vault Store
 */
class AddressVault {
    getAddresses() {
        try {
            const raw = localStorage.getItem('cara_saved_addresses');
            return JSON.parse(raw || '[]');
        } catch (err) {
            return [];
        }
    }

    saveAddress(addr) {
        try {
            const list = this.getAddresses();
            list.push(addr);
            localStorage.setItem('cara_saved_addresses', JSON.stringify(list));
        } catch (err) {
            // Silently fail if localStorage is unavailable or full
        }
    }
}
window.addressVault = new AddressVault();
