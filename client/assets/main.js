const form = document.querySelector('#upload-form');
const submitBtn = document.querySelector('input[type="submit"]');

form.addEventListener('submit', (e) => {
    console.log(e);
    submitBtn.setAttribute('disabled', 'true');
});

const fileUpload = document.querySelector('input[type="file"]');
const img = document.querySelector('#file-info-picture');
const figureCaption = document.querySelector('.figure-caption');

fileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    if (file) {
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            console.log(reader.result);
            img.setAttribute('src', reader.result);
            figureCaption.textContent = file.name;
        }
    }
});