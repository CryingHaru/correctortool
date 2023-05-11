// Get the DOM elements
const imageInput = document.getElementById('imageInput');
const languageSelect = document.getElementById('languageSelect');
const previewImage = document.getElementById('previewImage');
const result = document.getElementById('result');
const ocrButton = document.getElementById('ocrButton');

// Define the Tesseract worker
const worker = Tesseract.createWorker();

// Function to process the image with OCR
const processImage = async () => {
  try {
    // Set the language
    const language = languageSelect.value;
    await worker.load();
    await worker.loadLanguage(language);
    await worker.initialize(language);

    // Get the image data
    const file = imageInput.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const imageData = reader.result;

      // Display the preview image
      previewImage.src = imageData;

      // Process the image with OCR
      const { data: { text } } = await worker.recognize(imageData);
      result.innerText = text;
    };
  } catch (error) {
    console.error(error);
  }
};

// Attach event listeners
imageInput.addEventListener('change', processImage);
languageSelect.addEventListener('change', processImage);
ocrButton.addEventListener('click', processImage);
