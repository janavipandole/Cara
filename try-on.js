// try-on.js
const uploadInput = document.getElementById('photo-upload');
const uploadText = document.getElementById('upload-text');
const generateBtn = document.getElementById('generate-btn');
const placeholder = document.getElementById('placeholder');
const uploadedPreview = document.getElementById('uploaded-preview');
const scanner = document.getElementById('scanner');
const aiStatus = document.getElementById('ai-status');
const result = document.getElementById('result');
const shareControls = document.getElementById('share-controls');

let hasOutfit = false;
let hasPhoto = false;

// 1. Handle Outfit Selection
function selectOutfit(element) {
    document.querySelectorAll('.clothing-item').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    hasOutfit = true;
    checkReady();
}

// 2. Handle Photo Upload
uploadInput.addEventListener('change', function(e) {
    if (this.files && this.files[0]) {
        hasPhoto = true;
        uploadText.innerText = this.files[0].name;
        
        // Show a blurred preview of the uploaded image
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedPreview.src = e.target.result;
            uploadedPreview.style.display = 'block';
            placeholder.style.display = 'none';
        }
        reader.readAsDataURL(this.files[0]);

        checkReady();
    }
});

// Enable button only if both outfit and photo are selected
function checkReady() {
    if (hasOutfit && hasPhoto) {
        generateBtn.disabled = false;
    }
}

// 3. Trigger AI Animation
generateBtn.addEventListener('click', () => {
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Processing...';
    
    // Show Scanner
    scanner.style.display = 'flex';
    
    // Simulate AI sequence
    setTimeout(() => {
        aiStatus.innerText = "MAPPING CLOTHING TEXTURES...";
    }, 1500);

    setTimeout(() => {
        aiStatus.innerText = "ADJUSTING LIGHTING & SHADOWS...";
    }, 3000);

    setTimeout(() => {
        // Finish Scanning, Show Result
        scanner.style.display = 'none';
        uploadedPreview.style.display = 'none';
        result.style.display = 'block';
        shareControls.style.display = 'flex';
        
        generateBtn.innerHTML = '<i class="ri-check-line"></i> Try-On Complete';
        generateBtn.style.background = '#10b981'; // Green
    }, 4500);
});

// 4. Reset flow
function resetTryOn() {
    result.style.display = 'none';
    shareControls.style.display = 'none';
    uploadedPreview.style.display = 'none';
    placeholder.style.display = 'block';
    
    hasPhoto = false;
    hasOutfit = false;
    uploadText.innerText = "Click to upload full-body photo";
    uploadInput.value = "";
    document.querySelectorAll('.clothing-item').forEach(el => el.classList.remove('selected'));
    
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="ri-sparkling-fill"></i> Generate AI Try-On';
    generateBtn.style.background = '';
}

// 5. Share logic (Mockup)
function shareInsta() {
    showToast("In a full implementation, this would generate a downloadable poster or trigger the Web Share API with the AI result!", 'info');
    if (navigator.share) {
        navigator.share({
            title: 'My Cara AI Look',
            text: 'Check out my AI-generated outfit on Cara Fashion! #CaraVirtualTryOn',
            url: window.location.href
        }).catch(console.error);
    }
}
