
      // Function to handle the image file selection
      function handleImageSelect(event) {
        var file = event.target.files[0];

        var reader = new FileReader();
        reader.onload = function (e) {
          var img = new Image();
          img.onload = function () {
            recognizeText(img, document.getElementById("languageSelect").value);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }

      // Function to perform OCR on the image
      async function recognizeText(img, lang) {
        const { data: { text } } = await Tesseract.recognize(img, lang);
        document.getElementById("result").innerText = text;
      }

      // Attach an event listener to the file input
      document.getElementById("imageInput").addEventListener("change", handleImageSelect);

      // Attach an event listener to the OCR button
      document.getElementById("ocrButton").addEventListener("click", function () {
        var img = new Image();
        img.onload = function () {
          recognizeText(img, document.getElementById("languageSelect").value);
        };
        img.src = document.getElementById("imageInput").files[0] ? URL.createObjectURL(document.getElementById("imageInput").files[0]) : "";
      });
