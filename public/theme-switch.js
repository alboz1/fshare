const themeSwitch = document.querySelector('.theme-switch');
const body = document.querySelector('body');
const darkSvg = themeSwitch.querySelector('.dark');
const lightSvg = themeSwitch.querySelector('.light');

if (body.classList.contains('dark-mode')) {
    lightSvg.style.display = 'inline-block';
} else {
    darkSvg.style.display = 'inline-block';
}

themeSwitch.addEventListener('click', e => {
    body.classList.toggle('dark-mode');
    darkSvg.style.display = 'inline-block';
    lightSvg.style.display = 'none';
    
    let theme = 'light';

    if (body.classList.contains('dark-mode')) {
        darkSvg.style.display = 'none';
        lightSvg.style.display = 'inline-block';
        theme = 'dark';
    }

    document.cookie = `theme=${theme};path=/`;
});