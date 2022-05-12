const form = document.querySelector('#upload-form');
const submitBtn = document.querySelector('input[type="submit"]');

form.addEventListener('submit', (e) => {
    console.log(e);
    submitBtn.setAttribute('disabled', 'true');
});
// upload.addEventListener('change', (e) => {
//     const file = e.target.files[0];
//     const reader = new FileReader();

//     if (file) {
//         reader.readAsDataURL(file);
//         reader.onloadend = () => {
//             console.log(reader.result);
//         }
//     }
// });