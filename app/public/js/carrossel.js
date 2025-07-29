const box = document.querySelector(".container");
const imagens = document.querySelectorAll(".container img");

let contador = 0;
let largura = imagens[0].clientWidth;

function atualizarLargura() {
    largura = imagens[0].clientWidth;
    box.style.transform = `translateX(${-contador * largura}px)`;
}

function slider() {
    contador = (contador + 1) % imagens.length;
    atualizarLargura();
}

function anterior() {
    contador = (contador - 1 + imagens.length) % imagens.length;
    atualizarLargura();
}

document.getElementById("next").addEventListener("click", slider);
document.getElementById("prev").addEventListener("click", anterior);
window.addEventListener("resize", atualizarLargura);

let intervalo = setInterval(slider, 2500);

// Swipe (touch)
let startX = 0;
const carrossel = document.querySelector(".carrossel");

carrossel.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
});

carrossel.addEventListener("touchend", (e) => {
    let endX = e.changedTouches[0].clientX;
    let diff = startX - endX;

    if (diff > 50) {
        slider(); // próxima
        clearInterval(intervalo);
    } else if (diff < -50) {
        anterior(); // anterior
        clearInterval(intervalo);
    }
});
