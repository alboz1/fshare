const form = document.querySelector('#upload-form');
const submitBtn = document.querySelector('button[type="submit"]');
const submitBtnText = submitBtn.querySelector('.text');
const btnLoader = submitBtn.querySelector('button[type="submit"] .loader');

window.addEventListener("pageshow", e => {
    if (e.persisted) {
        window.location.reload();
    }
}, false);

form.addEventListener('submit', e => {
    btnLoader.style.display = 'inline-block';
    submitBtnText.textContent = 'Uploading...';
    submitBtn.setAttribute('disabled', 'true');
});

const fileUpload = document.querySelector('input[type="file"]');
const img = document.querySelector('#file-info-picture');
const figureCaption = document.querySelector('.figure-caption');
const fileInfo = document.querySelector('.file-info-wrapper');
const wrapper = form.querySelector('.wrapper');
const svg = document.querySelector('#file-icon');
const loader = wrapper.querySelector('.loading-file');

fileUpload.addEventListener('change', e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    fileInfo.classList.remove('show');
    img.style.display = 'none';
    svg.style.display = 'none';
    wrapper.style.maxHeight = '0';

    if (file) {
        reader.readAsDataURL(file);
        wrapper.style.maxHeight = '100%';

        reader.onloadstart = () => {
            loader.style.display = 'block';
        }

        reader.onload = () => {
            loader.style.display = 'none';

            if (file.type.match(/image\/.*/)) {
                img.style.display = 'inline-block';
                img.style.backgroundImage = `url(${reader.result})`;
            } else {
                svg.style.display = 'inline-block';
            }

            figureCaption.textContent = file.name;
            fileInfo.classList.add('show');
        }
    }
});