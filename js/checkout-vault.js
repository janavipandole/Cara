/**
 * Address Book & Payment Vault Store
 */
class AddressVault {
  getAddresses() {
    return JSON.parse(localStorage.getItem('cara_saved_addresses') || '[]');
  }

  saveAddress(addr) {
    const list = this.getAddresses();
    list.push(addr);
    localStorage.setItem('cara_saved_addresses', JSON.stringify(list));
  }
}
window.addressVault = new AddressVault();
