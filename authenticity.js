// Authenticity Web NFC Logic
/* global NDEFReader */

document.addEventListener('DOMContentLoaded', () => {
  const startScanBtn = document.getElementById('start-scan-btn');
  const nfcStatus = document.getElementById('nfc-status');
  const nfcMessage = document.getElementById('nfc-message');
  const nfcUnsupported = document.getElementById('nfc-unsupported');
  const authResult = document.getElementById('auth-result');

  const resProductId = document.getElementById('res-product-id');
  const resDate = document.getElementById('res-date');

  // Feature detection
  if (!('NDEFReader' in window)) {
    startScanBtn.disabled = true;
    startScanBtn.classList.add('hidden');
    nfcUnsupported.classList.remove('hidden');
    nfcStatus.classList.add('hidden');
    return;
  }

  startScanBtn.addEventListener('click', async () => {
    try {
      // Create a new NDEFReader instance
      const ndef = new NDEFReader();

      // Update UI for scanning state
      startScanBtn.innerHTML =
        '<i class="ri-loader-4-line fa-spin"></i> Scanning...';
      startScanBtn.disabled = true;
      nfcStatus.classList.add('scanning');
      nfcMessage.textContent =
        'Scanning... Please hold your device near the garment tag.';

      // Start scanning
      await ndef.scan();

      // Listen for reading errors
      ndef.addEventListener('readingerror', () => {
        nfcMessage.textContent = 'Error reading tag. Please try again.';
        nfcMessage.style.color = 'var(--auth-error)';
        setTimeout(() => resetScanningUI(), 3000);
      });

      // Handle successful reading
      ndef.addEventListener('reading', ({ message, serialNumber }) => {
        let payload = 'Unknown';

        // Extract data from the first record if available
        if (message.records && message.records.length > 0) {
          const record = message.records[0];
          if (record.recordType === 'text') {
            const textDecoder = new TextDecoder(record.encoding || 'utf-8');
            payload = textDecoder.decode(record.data);
          } else if (record.recordType === 'url') {
            const textDecoder = new TextDecoder();
            payload = textDecoder.decode(record.data);
          }
        }

        showSuccessResult(serialNumber, payload);
      });
    } catch (error) {
      console.error('Error starting NFC scan:', error);
      nfcMessage.textContent =
        'Permission denied or NFC error: ' + error.message;
      nfcMessage.style.color = 'var(--auth-error)';
      resetScanningUI();
    }
  });

  function resetScanningUI() {
    startScanBtn.innerHTML = '<i class="ri-scan-2-line"></i> Start Scan';
    startScanBtn.disabled = false;
    nfcStatus.classList.remove('scanning');
  }

  function showSuccessResult(serialNumber, payload) {
    // Hide scanning UI
    nfcStatus.classList.add('hidden');
    startScanBtn.classList.add('hidden');
    console.log('NFC Payload:', payload);

    // Populate data
    // Fallback to random if serial is missing, simulating a tag
    const id =
      serialNumber ||
      'CR-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    resProductId.textContent = id;

    // Set a random recent date for manufacture just for demo purposes
    const date = new Date();
    date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));
    resDate.textContent = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Show result
    authResult.classList.remove('hidden');
  }
});
