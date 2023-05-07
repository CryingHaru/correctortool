// ==UserScript==
// @name         Corrector tool ADD-ON
// @namespace    https://cryingharu.github.io/correctortool/
// @version      1.0
// @description  Add on para corrector tool
// @author       HaruCraft
// @updateURL https://cryingharu.github.io/correctortool/script.user.js
// @downloadURL https://cryingharu.github.io/correctortool/script.user.js
// @match        https://lectortmo.com/*/*/cascade
// @match        https://page.kakao.com/content/*/viewer/*
// @match        https://mangadex.org/chapter/*/*
// @match        https://coffeemanga.io/manga/*/*/
// @match        https://mangaplus.shueisha.co.jp/viewer/*
// @match        https://mangakakalot.com/chapter/*/*
// @match        https://chapmanganato.com/*/*
// @match        *//docs.google.com/*/*/*
// @match        https://cryingharu.github.io/correctortool/
// @require      https://cdn.jsdelivr.net/npm/jszip@3.6.0/dist/jszip.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==
(function () {
    'use strict';
    const message = document.createElement("div");
    message.textContent = "Url copiada.";
    message.style.position = "fixed";
    message.style.top = "0";
    message.style.left = "0";
    message.style.width = "100%";
    message.style.textAlign = "center";
    message.style.backgroundColor = "#000";
    message.style.color = "#fff";
    message.style.fontSize = "30px";
    message.style.padding = "20px";
    if (window.location.hostname === "cryingharu.github.io/correctortool/") {
        const googleDocsURL = GM_getValue("googleDocsURL");
        let tamper = document.querySelector("#tampermonkey");
        tamper.style.display = 'none';
        if (googleDocsURL) {
            const confirmPaste = confirm(`Quieres pegar el url del archivo ${googleDocsURL} como traduccion?`);
            if (confirmPaste) {
                const inputField = document.querySelector("#section2-url");
                inputField.value = googleDocsURL;
                inputField.dispatchEvent(new Event("change"));
            }
        }
        const imgslist = GM_getValue('IMGS');

        if (imgslist) {
            const sr = confirm(`Quieres pegar las imagenes`);
            if (sr) {
                console.log(typeof imgslist)
                const zip = new JSZip();
                zip.loadAsync(imgslist)
                    .then(function (zip) {
                        const filenames = Object.keys(zip.files);
                        filenames.sort((a, b) => {
                            const aIndex = parseInt(a.substring(0, a.indexOf(".")));
                            const bIndex = parseInt(b.substring(0, b.indexOf(".")));
                            return aIndex - bIndex;
                        });

                        filenames.forEach(filename => {
                            const img = document.createElement("img");
                            zip.file(filename).async("blob").then(blob => {
                                const reader = new FileReader();
                                reader.onload = () => {
                                    img.src = reader.result;
                                };
                                reader.readAsDataURL(blob);
                            }).catch(err => {
                                console.error("Error loading file:", err);
                            });

                            document.getElementById("section3-embed").appendChild(img);
                        });
                    }).catch(err => {
                        console.error("Error loading zip file:", err);
                    });
            }
        }
    }
    else {
        if (window.location.hostname === "docs.google.com" && /^\/document\/.*\/edit$/.test(window.location.pathname)) {
            setTimeout(() => {
                document.body.appendChild(message);
                setTimeout(() => {
                    message.remove();
                }, 1000);
            }, 1000);


            GM_setValue("googleDocsURL", window.location.href);

        }
        else {
            const pageTitle = document.title;
            function loades() {
                const body = document.body;
                const imgElements = document.querySelectorAll('img');
                let count = 0;
                const imgSrcArray = [];
                imgElements.forEach(img => {
                    if (img.width >= 400) {
                        count++;
                        const src = img.getAttribute('data-src') || img.getAttribute('src');
                        if (src) {
                            imgSrcArray.push(src.trim());
                        }
                    }
                });

                const imgCodeArray = imgSrcArray.map(src => `<img src="${src}">`);

                while (body.firstChild) {
                    body.removeChild(body.firstChild);
                }

                body.innerHTML = imgCodeArray.join('');
                console.log(`Descargando ${count} Imagenes`);
                var zipFolder = new JSZip();
                let contador = 0;
                let currentProgress = 0;
                function downloadImage(index) {
                    let host = window.location.origin + "/";
                    let imgSrc = imgSrcArray[index];
                    if (imgSrc.endsWith('.webp') || imgSrc.endsWith('.png') || imgSrc.endsWith('.tiff')) {
                        let canvas = document.createElement('canvas');
                        let ctx = canvas.getContext('2d');
                        let img = new Image();
                        img.crossOrigin = 'anonymous';
                        img.onload = function () {
                            canvas.width = img.width;
                            canvas.height = img.height;
                            ctx.drawImage(img, 0, 0);
                            let dataURL = canvas.toDataURL('image/png');
                            let blob = dataURLToBlob(dataURL);
                            saveBlobAsJPEG(index, blob);
                        };
                        img.src = imgSrc;
                    } else {
                        GM_xmlhttpRequest({
                            method: "get",
                            url: imgSrc,
                            headers: { referer: host },
                            responseType: "blob",
                            onload: function (response) {
                                saveBlobAsJPEG(index, response.response);
                            },
                            onerror: function (response) {
                                console.error(`Error downloading image: ${response.statusText}`);
                                if (contador < count) {
                                    downloadImage(index + 1);
                                }
                            }
                        });
                    }
                }

                function dataURLToBlob(dataURL) {
                    let parts = dataURL.split(',');
                    let contentType = parts[0].split(':')[1];
                    let byteString = atob(parts[1]);
                    let arrayBuffer = new ArrayBuffer(byteString.length);
                    let uint8Array = new Uint8Array(arrayBuffer);
                    for (let i = 0; i < byteString.length; i++) {
                        uint8Array[i] = byteString.charCodeAt(i);
                    }
                    return new Blob([arrayBuffer], { type: contentType });
                }

                function saveBlobAsJPEG(index, blob) {
                    try {
                        contador++;
                        zipFolder.file(contador + ".jpg", blob, { base64: true });
                        console.log(contador + '/' + count);
                        if (contador == count) {
                            console.log("Comprimiendo imagenes");
                            setTimeout(function () {
                                zipFolder.generateAsync({ type: "string" })
                                    .then(function (content) {
                                        console.log("Listo");
                                        GM_setValue('IMGS', content);
                                        message.textContent = 'Imagenes Cargadas'
                                        setTimeout(() => {
                                            document.body.appendChild(message);
                                            setTimeout(() => {
                                                message.remove();
                                                document.reload()
                                            }, 1000);
                                        }, 1000);
                                    })
                                    .catch(function (error) {
                                        console.error('Error generating zip file:', error);
                                    });
                            }, 3000);
                        } else {
                            downloadImage(index + 1);
                        }
                    } catch (error) {
                        console.error('Error saving blob as png:', error);
                    }
                }
                if (imgSrcArray.length > 0) {
                    downloadImage(0);
                }
            }
            const button = document.createElement('button');
            button.textContent = 'Cargar imagenes';
            button.style.position = 'fixed';
            button.style.top = '10%';
            button.style.left = '40%';
            button.style.backgroundColor = '#ffffff';
            button.style.border = 'none';
            button.style.color = 'black';
            button.style.padding = '10px 20px';
            button.style.textAlign = 'center';
            button.style.textDecoration = 'none';
            button.style.display = 'inline-block';
            button.style.fontSize = '16px';
            button.style.borderRadius = '4px';
            button.style.cursor = 'pointer';
            button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            button.style.transform = 'translate(-50%, -50%)';
            button.addEventListener('click', () => {
                loades()
            });
            function checkImagesLoaded() {
                const imgElements = document.querySelectorAll('img[width="400"]');
                let allLoaded = true;

                imgElements.forEach(img => {
                    if (img.naturalWidth !== 400) {
                        allLoaded = false;
                    }
                });

                if (allLoaded) {
                    console.log('Todas las imágenes con un ancho de 400px han sido cargadas');
                    document.body.appendChild(button);
                } else {
                    console.log('No todas las imágenes con un ancho de 400px han sido cargadas. Reintentando en 3 segundos...');
                    setTimeout(checkImagesLoaded, 3000);
                }
            }

            window.addEventListener('load', function () {
                checkImagesLoaded();
            });
        }
    }
})();
