document.addEventListener("DOMContentLoaded",()=>{
    // ============================================
// CARA VIRTUAL TRY-ON — Full Implementation
// Uses MediaPipe Pose (BlazePose) for body detection
// Canvas-based garment overlay with background removal
// ============================================

// ---- DOM References ----
const uploadInput = document.getElementById('photo-upload');
const uploadText = document.getElementById('upload-text');
const generateBtn = document.getElementById('generate-btn');
const placeholder = document.getElementById('placeholder');
const uploadedPreview = document.getElementById('uploaded-preview');
const scanner = document.getElementById('scanner');
const aiStatus = document.getElementById('ai-status');
const resultCanvas = document.getElementById('output-canvas');
const shareControls = document.getElementById('share-controls');
const bodyInfoEl = document.getElementById('body-info');
const webcamVideo = document.getElementById('webcam-video');

// ---- State ----
let currentMode = 'camera';   // 'camera' or 'upload'
let hasPhoto = false;
let hasOutfit = false;
let selectedGarmentImg = null;
let cleanedGarmentCanvas = null; // garment with background removed
let cameraStream = null;
let isLiveMode = false;        // true when webcam is live
let mediaPipeCamera = null;
let detectedLandmarks = null;  // store last detected landmarks

// ---- Product catalog for clothing grid ----
const tryOnProducts = [
    { id: 1,  name: "Tropical Hibiscus Shirt",  img: "images/products/f1.jpg", category: "top" },
    { id: 2,  name: "White Palm Leaf Shirt",     img: "images/products/f2.jpg", category: "top" },
    { id: 3,  name: "Vintage Rose Garden Shirt", img: "images/products/f3.jpg", category: "top" },
    { id: 4,  name: "Sakura Blossom Shirt",      img: "images/products/f4.jpg", category: "top" },
    { id: 5,  name: "Pink Peony Shirt",          img: "images/products/f5.jpg", category: "top" },
    { id: 6,  name: "Dual-Tone Corduroy Shirt",  img: "images/products/f6.jpg", category: "top" },
    { id: 8,  name: "Cat Print Blouse",          img: "images/products/f8.jpg", category: "top" },
    { id: 9,  name: "Sky Blue Mandarin Shirt",   img: "images/products/n1.jpg", category: "top" },
];

// ---- Populate clothing grid ----
(function populateClothingGrid() {
    const grid = document.getElementById('clothing-list');
    if (!grid) return;
    tryOnProducts.forEach(p => {
        const img = document.createElement('img');
        img.src = p.img;
        img.alt = p.name;
        img.className = 'clothing-item';
        img.title = p.name;
        img.addEventListener('click', () => selectOutfit(img));
        grid.appendChild(img);
    });
})();

// ============================================
// MEDIAPIPE POSE INITIALIZATION
// ============================================
const pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
    modelComplexity: 1,       // 0=lite, 1=full, 2=heavy
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

pose.onResults(onPoseResults);

// ============================================
// MODE SWITCHING (Camera / Upload)
// ============================================
window.switchMode = function(mode) {
    currentMode = mode;
    document.getElementById('btn-camera').classList.toggle('active', mode === 'camera');
    document.getElementById('btn-upload').classList.toggle('active', mode === 'upload');
    document.getElementById('camera-area').classList.toggle('visible', mode === 'camera');
    document.getElementById('upload-area').classList.toggle('visible', mode === 'upload');

    // Stop camera if switching to upload
    if (mode === 'upload' && cameraStream) {
        stopCamera();
    }
}

// ============================================
// CAMERA HANDLING
// ============================================
window.openCamera = function () {
    navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
    })
    .then(stream => {
        cameraStream = stream;

        webcamVideo.srcObject = stream;
        webcamVideo.style.display = 'block';
        placeholder.style.display = 'none';

        resultCanvas.style.display = 'block';
        resultCanvas.width = 640;
        resultCanvas.height = 480;

        document.getElementById('open-camera-btn').style.display = 'none';
        document.getElementById('capture-btn').style.display = 'flex';
        document.getElementById('stop-camera-btn').style.display = 'flex';

        isLiveMode = true;
        startLiveDetection();
    })
    .catch(err => {
        console.error('Camera error:', err);
        alert('Camera access failed');
    });
}
function startLiveDetection() {
    if (!isLiveMode) return;

    const ctx = resultCanvas.getContext('2d');

    function processFrame() {
        if (!isLiveMode || webcamVideo.paused || webcamVideo.ended) return;

        // Mirror the webcam feed
        ctx.save();
        ctx.translate(resultCanvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(webcamVideo, 0, 0, resultCanvas.width, resultCanvas.height);
        ctx.restore();

        // Send frame to MediaPipe
        pose.send({ image: webcamVideo }).then(() => {
            if (isLiveMode) {
                requestAnimationFrame(processFrame);
            }
        }).catch(err => {
            console.error('Pose error:', err);
            if (isLiveMode) requestAnimationFrame(processFrame);
        });
    }

    webcamVideo.onloadeddata = () => {
        requestAnimationFrame(processFrame);
    };

    // If video is already playing
    if (webcamVideo.readyState >= 2) {
        requestAnimationFrame(processFrame);
    }
}

window.capturePhoto=function() {
    if (!cameraStream) return;

    // Capture current frame from the canvas
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = resultCanvas.width;
    captureCanvas.height = resultCanvas.height;
    const captureCtx = captureCanvas.getContext('2d');

    // Mirror the video frame
    captureCtx.save();
    captureCtx.translate(captureCanvas.width, 0);
    captureCtx.scale(-1, 1);
    captureCtx.drawImage(webcamVideo, 0, 0, captureCanvas.width, captureCanvas.height);
    captureCtx.restore();

    // Stop camera
    stopCamera();

    // Set captured image as the uploaded preview
    uploadedPreview.src = captureCanvas.toDataURL('image/png');
    uploadedPreview.onload = () => {
        hasPhoto = true;
        checkReady();
        // Run pose detection on captured image
        processSingleImage();
    };

    updateStep(2);
}

window.stopCamera=function() {
    isLiveMode = false;
    if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        cameraStream = null;
    }
    webcamVideo.srcObject = null;
    webcamVideo.style.display = 'none';

    document.getElementById('open-camera-btn').style.display = 'flex';
    document.getElementById('capture-btn').style.display = 'none';
    document.getElementById('stop-camera-btn').style.display = 'none';
}

// ============================================
// IMAGE UPLOAD HANDLING
// ============================================
uploadInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        hasPhoto = true;
        uploadText.innerText = this.files[0].name;

        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedPreview.src = e.target.result;
            uploadedPreview.onload = () => {
                placeholder.style.display = 'none';
                processSingleImage();
            };
        };
        reader.readAsDataURL(this.files[0]);
        checkReady();
        updateStep(2);
    }
});

// ============================================
// PROCESS SINGLE IMAGE (Upload or Capture)
// ============================================
async function processSingleImage() {
    // Show scanning animation
    scanner.style.display = 'flex';
    aiStatus.innerText = 'DETECTING BODY LANDMARKS...';

    try {
        await pose.send({ image: uploadedPreview });
    } catch (err) {
        console.error('Pose detection error:', err);
        aiStatus.innerText = 'DETECTION FAILED';
        setTimeout(() => { scanner.style.display = 'none'; }, 1500);
    }
}

// ============================================
// OUTFIT SELECTION
// ============================================
function selectOutfit(element) {
    document.querySelectorAll('.clothing-item').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    hasOutfit = true;

    // Load and process the garment image (remove background)
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = element.src;
    img.onload = () => {
        selectedGarmentImg = img;
        cleanedGarmentCanvas = removeGarmentBackground(img);
        checkReady();
    };

    updateStep(3);
}

// ============================================
// GARMENT BACKGROUND REMOVAL (Canvas Pixel Manipulation)
// ============================================
function removeGarmentBackground(img) {
    const offscreen = document.createElement('canvas');
    offscreen.width = img.naturalWidth || img.width;
    offscreen.height = img.naturalHeight || img.height;
    const ctx = offscreen.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
    const data = imageData.data;

    // Sample background color from corners (average of 4 corners, 10x10 patches)
    const cornerColors = [];
    const patchSize = 10;
    const corners = [
        [0, 0],
        [offscreen.width - patchSize, 0],
        [0, offscreen.height - patchSize],
        [offscreen.width - patchSize, offscreen.height - patchSize]
    ];

    corners.forEach(([cx, cy]) => {
        let r = 0, g = 0, b = 0, count = 0;
        for (let py = cy; py < cy + patchSize; py++) {
            for (let px = cx; px < cx + patchSize; px++) {
                const idx = (py * offscreen.width + px) * 4;
                r += data[idx];
                g += data[idx + 1];
                b += data[idx + 2];
                count++;
            }
        }
        cornerColors.push({ r: r / count, g: g / count, b: b / count });
    });

    // Average of corner colors = estimated background
    const bgR = cornerColors.reduce((s, c) => s + c.r, 0) / cornerColors.length;
    const bgG = cornerColors.reduce((s, c) => s + c.g, 0) / cornerColors.length;
    const bgB = cornerColors.reduce((s, c) => s + c.b, 0) / cornerColors.length;

    // Threshold: how close a pixel must be to the background to be made transparent
    const threshold = 60;

    for (let i = 0; i < data.length; i += 4) {
        const dr = data[i] - bgR;
        const dg = data[i + 1] - bgG;
        const db = data[i + 2] - bgB;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);

        if (dist < threshold) {
            // Make transparent
            data[i + 3] = 0;
        } else if (dist < threshold + 30) {
            // Feather edges for smooth blending
            const alpha = Math.round(((dist - threshold) / 30) * 255);
            data[i + 3] = Math.min(data[i + 3], alpha);
        }
    }

    ctx.putImageData(imageData, 0, 0);
    return offscreen;
}

// ============================================
// BODY ANALYSIS — Classify Body Type
// ============================================
function analyzeBody(landmarks, canvasW, canvasH) {
    const lShoulder = landmarks[11];
    const rShoulder = landmarks[12];
    const lHip = landmarks[23];
    const rHip = landmarks[24];
    const lElbow = landmarks[13];
    const rElbow = landmarks[14];

    // Pixel distances
    const shoulderWidth = Math.sqrt(
        Math.pow((lShoulder.x - rShoulder.x) * canvasW, 2) +
        Math.pow((lShoulder.y - rShoulder.y) * canvasH, 2)
    );
    const hipWidth = Math.sqrt(
        Math.pow((lHip.x - rHip.x) * canvasW, 2) +
        Math.pow((lHip.y - rHip.y) * canvasH, 2)
    );

    const shoulderMidY = ((lShoulder.y + rShoulder.y) / 2) * canvasH;
    const hipMidY = ((lHip.y + rHip.y) / 2) * canvasH;
    const torsoLength = hipMidY - shoulderMidY;

    // Shoulder-to-hip ratio determines body type
    const ratio = shoulderWidth / hipWidth;
    let bodyType = 'Rectangle';
    if (ratio > 1.15) bodyType = 'Inverted Triangle';
    else if (ratio < 0.85) bodyType = 'Pear';
    else if (ratio >= 0.95 && ratio <= 1.05) bodyType = 'Rectangle';
    else bodyType = 'Hourglass';

    return {
        shoulderWidth: Math.round(shoulderWidth),
        hipWidth: Math.round(hipWidth),
        torsoLength: Math.round(torsoLength),
        ratio: ratio.toFixed(2),
        bodyType
    };
}

function showBodyInfo(info) {
    bodyInfoEl.innerHTML = `
        <div><span class="label">Body Type:</span> ${info.bodyType}</div>
        <div><span class="label">Shoulder W:</span> ${info.shoulderWidth}px</div>
        <div><span class="label">Hip W:</span> ${info.hipWidth}px</div>
        <div><span class="label">Torso:</span> ${info.torsoLength}px</div>
        <div><span class="label">S/H Ratio:</span> ${info.ratio}</div>
    `;
    bodyInfoEl.style.display = 'block';
}

// ============================================
// MEDIAPIPE RESULTS CALLBACK
// ============================================
function onPoseResults(results) {
    const canvas = resultCanvas;
    const ctx = canvas.getContext('2d');

    // For live webcam mode, just draw skeleton overlay
    if (isLiveMode) {
        canvas.width = 640;
        canvas.height = 480;
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Mirror the webcam
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        // Draw skeleton landmarks on live feed
        if (results.poseLandmarks) {
            detectedLandmarks = results.poseLandmarks;
            drawSkeleton(ctx, results.poseLandmarks, canvas.width, canvas.height, true);
            const bodyInfo = analyzeBody(results.poseLandmarks, canvas.width, canvas.height);
            showBodyInfo(bodyInfo);
        }
        return;
    }

    // For single image mode (upload or captured photo)
    const imgW = uploadedPreview.naturalWidth || 640;
    const imgH = uploadedPreview.naturalHeight || 480;
    canvas.width = imgW;
    canvas.height = imgH;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks) {
        detectedLandmarks = results.poseLandmarks;

        // Draw skeleton
        drawSkeleton(ctx, results.poseLandmarks, canvas.width, canvas.height, false);

        // Analyze body
        const bodyInfo = analyzeBody(results.poseLandmarks, canvas.width, canvas.height);
        showBodyInfo(bodyInfo);
    }

    ctx.restore();

    // Show canvas, hide scanner
    scanner.style.display = 'none';
    canvas.style.display = 'block';
}

// ============================================
// SKELETON DRAWING
// ============================================
function drawSkeleton(ctx, landmarks, w, h, mirrored) {
    // Key connections for upper body
    const connections = [
        [11, 12], // shoulders
        [11, 13], [13, 15], // left arm
        [12, 14], [14, 16], // right arm
        [11, 23], [12, 24], // torso sides
        [23, 24], // hips
        [23, 25], [25, 27], // left leg
        [24, 26], [26, 28], // right leg
    ];

    // Draw connections
    ctx.strokeStyle = 'rgba(8, 129, 120, 0.7)';
    ctx.lineWidth = 3;

    connections.forEach(([a, b]) => {
        const la = landmarks[a];
        const lb = landmarks[b];
        if (la.visibility > 0.5 && lb.visibility > 0.5) {
            let ax = la.x * w, bx = lb.x * w;
            if (mirrored) {
                ax = w - ax;
                bx = w - bx;
            }
            ctx.beginPath();
            ctx.moveTo(ax, la.y * h);
            ctx.lineTo(bx, lb.y * h);
            ctx.stroke();
        }
    });

    // Draw key landmark dots
    const keyPoints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
    keyPoints.forEach(idx => {
        const lm = landmarks[idx];
        if (lm.visibility > 0.5) {
            let lx = lm.x * w;
            if (mirrored) lx = w - lx;
            ctx.beginPath();
            ctx.arc(lx, lm.y * h, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#088178';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}

// ============================================
// GARMENT OVERLAY RENDERING
// ============================================
function overlayGarment(ctx, landmarks, canvasW, canvasH, garment) {
    const lShoulder = landmarks[11];
    const rShoulder = landmarks[12];
    const lHip = landmarks[23];
    const rHip = landmarks[24];

    // Pixel coordinates
    const x1 = rShoulder.x * canvasW;
    const y1 = rShoulder.y * canvasH;
    const x2 = lShoulder.x * canvasW;
    const y2 = lShoulder.y * canvasH;

    const hipMidY = ((lHip.y + rHip.y) / 2) * canvasH;

    // Shoulder distance and angle
    const shoulderDist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // Center of shoulders
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;

    // Garment width = shoulder distance * padding multiplier
    const garmentWidth = shoulderDist * 1.8;

    // Garment height covers from just above shoulders to just below hips
    const torsoLength = hipMidY - centerY;
    const garmentHeight = torsoLength * 1.3;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    // Set blending for natural look
    ctx.globalAlpha = 0.88;

    ctx.drawImage(
        garment,
        -garmentWidth / 2,
        -garmentHeight * 0.15,  // offset up for neckline
        garmentWidth,
        garmentHeight
    );

    ctx.globalAlpha = 1.0;
    ctx.restore();
}

// ============================================
// GENERATE TRY-ON
// ============================================
generateBtn.addEventListener('click', async () => {
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Processing...';

    scanner.style.display = 'flex';
    aiStatus.innerText = 'FITTING GARMENT TO BODY...';

    // If we already have landmarks from a previous detection, use them directly
    // Otherwise re-detect
    const useExistingLandmarks = detectedLandmarks && hasPhoto;

    setTimeout(async () => {
        try {
            if (!useExistingLandmarks) {
                await pose.send({ image: uploadedPreview });
            }

            // Now render the final composite
            renderFinalComposite();

        } catch (err) {
            console.error('Try-on error:', err);
            aiStatus.innerText = 'ERROR';
            setTimeout(() => resetTryOn(), 2000);
        }
    }, 300);
});

function renderFinalComposite() {
    if (!detectedLandmarks || !cleanedGarmentCanvas) {
        aiStatus.innerText = 'MISSING DATA — SELECT OUTFIT & PHOTO';
        setTimeout(() => { scanner.style.display = 'none'; }, 1500);
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="ri-sparkling-fill"></i> Generate AI Try-On';
        return;
    }

    const canvas = resultCanvas;
    const ctx = canvas.getContext('2d');

    const imgW = uploadedPreview.naturalWidth || 640;
    const imgH = uploadedPreview.naturalHeight || 480;
    canvas.width = imgW;
    canvas.height = imgH;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw user photo
    ctx.drawImage(uploadedPreview, 0, 0, canvas.width, canvas.height);

    // Overlay cleaned garment
    overlayGarment(ctx, detectedLandmarks, canvas.width, canvas.height, cleanedGarmentCanvas);

    // UI updates
    scanner.style.display = 'none';
    canvas.style.display = 'block';
    shareControls.style.display = 'flex';
    bodyInfoEl.style.display = 'block';

    generateBtn.innerHTML = '<i class="ri-check-line"></i> Try-On Complete';
    generateBtn.style.background = '#10b981';
}

// ============================================
// READY CHECK
// ============================================
function checkReady() {
    if (hasOutfit && hasPhoto) {
        generateBtn.disabled = false;
    }
}

// ============================================
// STEP INDICATOR
// ============================================
function updateStep(step) {
    document.getElementById('step1').classList.toggle('active', step >= 1);
    document.getElementById('step2').classList.toggle('active', step >= 2);
    document.getElementById('step3').classList.toggle('active', step >= 3);
}

// ============================================
// RESET
// ============================================
function resetTryOn() {
    resultCanvas.style.display = 'none';
    shareControls.style.display = 'none';
    bodyInfoEl.style.display = 'none';
    placeholder.style.display = 'block';
    uploadedPreview.src = '';

    hasPhoto = false;
    hasOutfit = false;
    selectedGarmentImg = null;
    cleanedGarmentCanvas = null;
    detectedLandmarks = null;

    uploadText.innerText = 'Click to upload full-body photo';
    uploadInput.value = '';
    document.querySelectorAll('.clothing-item').forEach(el => el.classList.remove('selected'));

    const ctx = resultCanvas.getContext('2d');
    ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);

    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="ri-sparkling-fill"></i> Generate AI Try-On';
    generateBtn.style.background = '';

    updateStep(1);
}

// ============================================
// SHARE & DOWNLOAD
// ============================================
function downloadResult() {
    const link = document.createElement('a');
    link.download = 'cara-virtual-tryon.png';
    link.href = resultCanvas.toDataURL('image/png');
    link.click();
}

function shareResult() {
    if (navigator.share) {
        resultCanvas.toBlob(blob => {
            const file = new File([blob], 'cara-tryon.png', { type: 'image/png' });
            navigator.share({
                title: 'My Cara AI Look',
                text: 'Check out my AI-generated outfit on Cara Fashion! #CaraVirtualTryOn',
                files: [file]
            }).catch(console.error);
        });
    } else {
        // Fallback: download
        downloadResult();
    }
}

switchMode("camera");
})
const topBtn = document.getElementById("topBtn");

    // Show button when user scrolls down
    window.onscroll = function () {
      if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        topBtn.style.display = "block";
      } else {
        topBtn.style.display = "none";
      }
    };

    // Scroll to top smoothly
    topBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
