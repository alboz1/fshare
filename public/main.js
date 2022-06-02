const app = {
    init() {
        controllers.selectFile();
        controllers.submitForm();
        
        window.addEventListener("pageshow", e => {
            const fileUpload = document.querySelector('input[type="file"]');
            fileUpload.value = null;
            
            if (e.persisted) {
                window.location.reload();
            }
        });
    }
};

const controllers = {
    submitForm() {
        const form = document.querySelector('#upload-form');
        form.addEventListener('submit', () => view.showUploadingAnimation());
    },

    selectFile() {
        const fileUpload = document.querySelector('input[type="file"]');
        fileUpload.addEventListener('change', e => {
            const file = e.target.files[0];
            view.showSelectedFile(file);
        });
    }
};

const view = {
    submitBtn: document.querySelector('button[type="submit"]'),

    showSelectedFile(file) {
        const wrapper = document.querySelector('.wrapper');
        const loader = wrapper.querySelector('.loading-file');
        const fileInfo = wrapper.querySelector('.file-info-wrapper');
        const img = fileInfo.querySelector('#file-info-picture');
        const svg = fileInfo.querySelector('#file-icon');
        const figureCaption = fileInfo.querySelector('.figure-caption');
        const paragraph = fileInfo.querySelector('.file-size-warning');
        const reader = new FileReader();

        //reset
        fileInfo.classList.remove('show');
        img.style.display = 'none';
        svg.style.display = 'none';
        wrapper.style.maxHeight = '0';
        paragraph.style.display = 'none';
        this.submitBtn.style.display = 'inline-block';

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

                if (file.size >= 16777216) {
                    this.submitBtn.style.display = 'none';
                    paragraph.style.display = 'block';
                }
            }
        }
    },

    showUploadingAnimation() {
        const submitBtnText = this.submitBtn.querySelector('.text');
        const btnLoader = this.submitBtn.querySelector('.loader');

        this.submitBtn.setAttribute('disabled', 'true');
        btnLoader.style.display = 'inline-block';
        submitBtnText.textContent = 'Uploading...';
    }
};

app.init();