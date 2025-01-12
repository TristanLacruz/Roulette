// Módulos requeridos
const fs = require("fs");
const { ipcRenderer } = require("electron");

// Variables globales
let fichasDisponibles = 100; // Fichas iniciales del jugador
let numerosApuesta = []; // Arreglo para almacenar las apuestas realizadas

// Inicialización de la aplicación
inicializarBotones(); // Asigna eventos a los botones
actualizarFichasDisponibles(); // Actualiza la visualización inicial de las fichas

document.addEventListener('DOMContentLoaded', () => {
    actualizarFichasDisponibles();

    // Asignar eventos a los botones principales
    document.getElementById('jugar').addEventListener('click', jugarRuleta);
    document.getElementById('salir').addEventListener('click', salirJuego);

    // Guardar el texto original de los botones de apuesta
    const botones = document.querySelectorAll('.botonApuesta');
    botones.forEach(boton => {
        if (!boton.hasAttribute('data-original-text')) {
            boton.setAttribute('data-original-text', boton.textContent.trim());
        }
    });

});

/**
 * Función: salirJuego
 * Reinicia las variables globales y la interfaz gráfica al salir del juego.
 */
function salirJuego() {
    fichasDisponibles = 100; // Reinicia las fichas disponibles
    numerosApuesta = []; // Limpia las apuestas

    const botonesApuesta = document.querySelectorAll('.botonApuesta');
    botonesApuesta.forEach(boton => {
        boton.classList.remove('botonSeleccionado', 'botonConImagen');
        const textoOriginal = boton.getAttribute('data-original-text');
        if (textoOriginal) boton.textContent = textoOriginal; // Restaura el texto original
    });

    actualizarFichasDisponibles();
    ipcRenderer.send('salirJuego'); // Notifica al proceso principal que el juego terminó
}

/**
 * Función: jugarRuleta
 * Lógica principal para seleccionar un número ganador y calcular las ganancias.
 */
async function jugarRuleta() {
    if (numerosApuesta.length === 0) {
        alert('Debes seleccionar al menos un número para jugar.');
        return;
    }

    await alternarColoresBotones(); //Efectos especiales de los botones al jugar

    const numeroGanador = Math.floor(Math.random() * 37); // Generar un número aleatorio entre 0 y 36
    document.getElementById('resultado').textContent = numeroGanador; // Mostrar el número ganador
    agregarResultadoAnterior(numeroGanador); // Actualizar la tabla de resultados

    let ganancias = 0;
    numerosApuesta.forEach(apuesta => {
        const [numero, fichas] = apuesta;
        ganancias += verificarApuesta(numero, numeroGanador) * fichas; // Calcular ganancias
    });

    fichasDisponibles += ganancias;
    mostrarGanancias(ganancias); // Mostrar un mensaje con las ganancias/pérdidas

    // Reiniciar apuestas
    numerosApuesta = [];
    const botonesApuesta = document.querySelectorAll('.botonApuesta');
    botonesApuesta.forEach(boton => {
        boton.classList.remove('botonSeleccionado', 'botonConImagen');
        const textoOriginal = boton.getAttribute('data-original-text');
        if (textoOriginal) boton.textContent = textoOriginal;
    });

    actualizarFichasDisponibles();
}

/**
 * Función: manejarClickApuesta
 * Lógica para gestionar las apuestas al hacer clic en un botón de número.
 * @param {Event} event - El evento de clic generado por el usuario.
 */
function manejarClickApuesta(event) {
    const boton = event.currentTarget; // El botón que se clicó
    const numero = boton.id; // ID del botón (e.g., "btn10")

    // Buscar si ya existe una apuesta en el número seleccionado
    let apuestaExistente = numerosApuesta.find(apuesta => apuesta[0] === numero);

    if (!apuestaExistente) {
        // Crear una nueva apuesta si no existe
        if (fichasDisponibles > 0) {
            numerosApuesta.push([numero, 1]);
            fichasDisponibles--;
            boton.classList.add('botonSeleccionado');
        } else {
            alert('No tienes suficientes fichas para apostar.');
            return;
        }
    } else {
        // Verificar el límite de 10 fichas por número
        if (apuestaExistente[1] >= 10) {
            alert('Máximo, 10 fichas por número.');
            return;
        }

        // Incrementar las fichas apostadas
        if (fichasDisponibles > 0) {
            apuestaExistente[1]++;
            fichasDisponibles--;
        } else {
            alert('No tienes suficientes fichas para apostar.');
            return;
        }
    }

    // Actualizar la imagen y el estado del botón
    const apuestaTotal = numerosApuesta.find(apuesta => apuesta[0] === numero)[1];
    let imagen = boton.querySelector('.imagen-ficha');

    if (!imagen) {
        imagen = document.createElement('img');
        imagen.classList.add('imagen-ficha'); // Clase para estilos
        boton.appendChild(imagen);
    }

    imagen.src = `css/img/ficha${apuestaTotal}.png`;
    imagen.alt = `Fichas: ${apuestaTotal}`;
    imagen.style.width = '150px';
    imagen.style.height = '150px';
    imagen.style.position = 'absolute';
    imagen.style.top = '50%';
    imagen.style.left = '50%';
    imagen.style.transform = 'translate(-50%, -50%)';

    actualizarFichasDisponibles();
}

/**
 * Función: verificarApuesta
 * Verifica si la apuesta coincide con el número ganador.
 * @param {string} numero - El ID del número apostado.
 * @param {number} numeroGanador - El número ganador generado.
 * @returns {number} - El multiplicador de fichas ganadas.
 */
function verificarApuesta(numero, numeroGanador) {
    if (numero === 'btn_1_12' && numeroGanador >= 1 && numeroGanador <= 12) return 3;
    if (numero === 'btn_13_24' && numeroGanador >= 13 && numeroGanador <= 24) return 3;
    if (numero === 'btn_25_36' && numeroGanador >= 25 && numeroGanador <= 36) return 3;
    if (numero === 'btn1_18' && numeroGanador >= 1 && numeroGanador <= 18) return 2;
    if (numero === 'btn19_36' && numeroGanador >= 19 && numeroGanador <= 36) return 2;
    if (numero === 'btnPar' && numeroGanador % 2 === 0) return 2;
    if (numero === 'btnImpar' && numeroGanador % 2 !== 0) return 2;
    if (numero === 'btnCeldasNegras' && [6, 15, 24, 33, 2, 8, 11, 17, 20, 26, 29, 35, 4, 10, 13, 22, 28, 31].includes(numeroGanador)) return 2;
    if (numero === 'btnCeldasRojas' && [3, 9, 12, 18, 21, 27, 30, 36, 5, 14, 23, 32, 1, 7, 16, 19, 25, 34].includes(numeroGanador)) return 2;
    if (numero === 'btn_1_3' && [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].includes(numeroGanador)) return 3;
    if (numero === 'btn_2_3' && [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].includes(numeroGanador)) return 3;
    if (numero === 'btn_3_3' && [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].includes(numeroGanador)) return 3;
    if (!isNaN(numero) && parseInt(numero) === numeroGanador) return 37; // Número exacto
    return 0;
}

/**
 * Función: agregarResultadoAnterior
 * Actualiza la tabla de resultados con el número ganador más reciente.
 * @param {number} numero - El número ganador.
 */
function agregarResultadoAnterior(numero) {
    const resultadosAnteriores = document.querySelector('.tablaResultadosAnteriores tr');
    const celda = document.createElement('td');
    celda.classList.add('celdaResultadosAnteriores');

    const numerosRojos = [3, 9, 12, 18, 21, 27, 30, 36, 5, 14, 23, 32, 1, 7, 16, 19, 25, 34];
    const numerosNegros = [6, 15, 24, 33, 2, 8, 11, 17, 20, 26, 29, 35, 4, 10, 13, 22, 28, 31];

    if (numerosRojos.includes(numero)) celda.classList.add('red');
    else if (numerosNegros.includes(numero)) celda.classList.add('black');

    celda.textContent = numero;
    resultadosAnteriores.appendChild(celda);

    if (resultadosAnteriores.children.length > 8) {
        resultadosAnteriores.removeChild(resultadosAnteriores.firstChild);
    }
}

/**
 * Función: mostrarGanancias
 * Muestra un mensaje indicando las ganancias obtenidas en la ronda.
 * @param {number} ganancias - La cantidad de fichas ganadas (o perdidas).
 */
function mostrarGanancias(ganancias) {
    if (ganancias > 0) {
        alert(`¡Has ganado ${ganancias} fichas!`);
    } else {
        alert('No has ganado. Intenta de nuevo.');
    }
}

/**
 * Función: actualizarFichasDisponibles
 * Actualiza la visualización de las fichas disponibles en la interfaz.
 */
function actualizarFichasDisponibles() {
    const fichasElemento = document.getElementById('fichas');
    fichasElemento.textContent = fichasDisponibles;
}

/**
 * Función: inicializarBotones
 * Asigna el evento de clic a todos los botones de apuesta.
 */
function inicializarBotones() {
    const botones = document.querySelectorAll('.botonApuesta');
    botones.forEach(boton => {
        boton.addEventListener('click', manejarClickApuesta);
    });
}



/**
 * Función asíncrona para los efectos visuales y el sonido
 */
async function alternarColoresBotones() {
    casinoTheme.play(); // Reproducir música
    const botones = document.querySelectorAll('.botonApuesta');
    const botonesCambiados = new Set();

    return new Promise((resolve) => {
        const intervalo = setInterval(() => {
            let numAleatorio = Math.floor(Math.random() * botones.length);
            let botonSeleccionado = botones[numAleatorio];

            if (!botonesCambiados.has(botonSeleccionado)) {
                botonSeleccionado.classList.add("botonIluminado");
                botonesCambiados.add(botonSeleccionado);

                setTimeout(() => {
                    botonSeleccionado.classList.remove("botonIluminado");
                    botonesCambiados.delete(botonSeleccionado);
                }, 100); // Cada botón permanece iluminado por 0.1 segundos
            }
        }, 50); // Un nuevo botón se ilumina cada 0.05 segundos

        setTimeout(() => {
            clearInterval(intervalo);
            botonesCambiados.forEach(boton => boton.classList.remove("botonIluminado"));

            // Resuelve la promesa para indicar que el método ha terminado
            resolve();

            // Detener la música 1 segundo después de que termine el método
            setTimeout(() => {
                casinoTheme.pause();
                casinoTheme.currentTime = 0; // Reinicia la música al inicio
            }, 1000); // 1 segundo adicional
        }, 5000); // Detener después de 5 segundos
    });
}