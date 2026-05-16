// Barcode Scanner Module — Uses QuaggaJS (free, no backend needed)
// Initialize barcode scanner for food logging

let _barcodeStream = null;
let _scannerActive = false;

async function initBarcodeScanner(videoElementId, onDetected) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    GlowUtils.toast('Camera access not available', 'error');
    return false;
  }

  try {
    // Load QuaggaJS library
    if (typeof Quagga === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/quagga@0.12.1/dist/quagga.min.js';
      script.onload = () => startBarcodeScanner(videoElementId, onDetected);
      document.head.appendChild(script);
      return true;
    }

    startBarcodeScanner(videoElementId, onDetected);
    return true;
  } catch (e) {
    console.error('Barcode init error:', e);
    GlowUtils.toast('Camera error: ' + e.message, 'error');
    return false;
  }
}

function startBarcodeScanner(videoElementId, onDetected) {
  if (_scannerActive) return;

  const videoEl = document.getElementById(videoElementId);
  if (!videoEl) {
    GlowUtils.toast('Video element not found', 'error');
    return;
  }

  // Ensure video element is visible and has proper styling
  videoEl.style.display = 'block';
  videoEl.style.width = '100%';
  videoEl.style.height = '100%';
  videoEl.style.objectFit = 'cover';

  // Get the parent container
  const container = videoEl.parentElement;
  if (container) {
    container.style.backgroundColor = '#000';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
  }

  Quagga.init({
    inputStream: {
      name: 'Live',
      type: 'LiveStream',
      target: videoEl,
      constraints: {
        facingMode: 'environment',
        width: { min: 320, ideal: 480, max: 1280 },
        height: { min: 240, ideal: 360, max: 960 }
      }
    },
    decoder: {
      readers: [
        'ean_reader', 'ean_8_reader', 'code_128_reader', 'code_39_reader', 'upc_reader'
      ]
    },
    locator: {
      halfSample: true
    }
  }, err => {
    if (err) {
      console.error('Quagga init error:', err);
      GlowUtils.toast('Camera failed: check permissions', 'error');
      return;
    }

    Quagga.start();
    _scannerActive = true;

    // Detect barcodes
    Quagga.onDetected(result => {
      if (result && result.codeResult && result.codeResult.code) {
        const barcode = result.codeResult.code;
        console.log('Barcode detected:', barcode);
        stopBarcodeScanner();
        onDetected(barcode);
      }
    });
  });
}

function stopBarcodeScanner() {
  if (!_scannerActive) return;
  try {
    Quagga.stop();
    _scannerActive = false;
  } catch (e) {
    console.warn('Stop scanner error:', e);
  }
}

// Lookup product by barcode (simplified — real system would use EAN/UPC database)
// For now, we'll search by barcode number in product names
function lookupByBarcode(barcode) {
  // In production, use an external API like Open Food Facts
  // For now, try matching barcode digits to product ID
  return null; // Fallback to manual search
}

// Alternative: Use Open Food Facts API (free, no auth needed)
async function lookupOpenFoodFacts(barcode) {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.product) return null;

    return {
      id: 'off_' + barcode,
      name: data.product.product_name || 'Unknown',
      brand: data.product.brands || 'Unknown',
      cal: data.product.nutriments?.['energy-kcal_100g'] || 0,
      protein: data.product.nutriments?.['proteins_100g'] || 0,
      carbs: data.product.nutriments?.['carbohydrates_100g'] || 0,
      fat: data.product.nutriments?.['fat_100g'] || 0,
    };
  } catch (e) {
    console.warn('Open Food Facts lookup failed:', e);
    return null;
  }
}
