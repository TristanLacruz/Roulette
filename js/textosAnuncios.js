
// Lista de los textos que aparecerán
const texts = [
    "No necesitas esperanza, solo necesitas jugar y ganar",
    "¿Vas a dejar que la suerte de tu familia se escape de tus manos?",
    "Tu futuro está en el casino, ¡no dejes que te lo arrebaten!",
    "¡Cada segundo que no juegas es dinero que pierdes!",
    "Si no juegas ahora, nunca sabrás lo que es ser millonario",
    "Esta tirada podría ser la que salve a tu familia de la ruina",
    "Sin apuestas, no hay esperanza. ¡Juega ahora y salva tu futuro!"
];

const textContainer = document.getElementById("text-container");

let index = 0;

// Función para actualizar el texto con animación
function updateText() {
    textContainer.style.animation = "none"; // Reinicia la animación
    textContainer.offsetHeight; 
    textContainer.textContent = texts[index]; // Actualiza el texto
    index = (index + 1) % texts.length; // Ciclo infinito
    textContainer.style.animation = "slideText 15s linear"; // Reactiva la animación
}

// Inicializar el texto y cambiarlo cada 15 segundos
updateText();
setInterval(updateText, 15000); // Tiempo total de la animación