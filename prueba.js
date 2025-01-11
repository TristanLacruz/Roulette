const fs = require("fs");
const { ipcRenderer } = require("electron");

document.addEventListener('DOMContentLoaded', () => {
    const pestanyaInicio = document.getElementById('pestanyaInicio');
    const pestanyaContenido = document.getElementById('pestanyaContenido');
    const botonEntrar = document.getElementById('entrar');
    const botonJugar = document.getElementById('jugar');
    const botonSalir = document.getElementById('salir');
    const fichasJugador = document.getElementById('fichas');
    const resultado = document.getElementById('resultado');
    const resultadosAnteriores = document.querySelector('.tablaResultadosAnteriores tr');
    const botonesApuesta = document.querySelectorAll('.botonApuesta');

    let fichas = 10; // Fichas iniciales del jugador
    let numerosApuesta = []; // Arreglo para almacenar las apuestas del jugador
    actualizarFichas();

    // Función para salir del juego
    function salirJuego() {
        fichas = 10; // Reinicia las fichas
        numerosApuesta = []; // Limpia las apuestas
        botonesApuesta.forEach(boton => boton.classList.remove('botonSeleccionado'));
        botonesApuesta.forEach(boton => boton.classList.remove('botonConImagen'));
        actualizarFichas();

        //
        ipcRenderer.send('salirJuego');
    }



    // Función para jugar a la ruleta
    async function jugarRuleta() {
        if (numerosApuesta.length === 0) {
            alert('Debes seleccionar al menos un número para jugar.');
            return;
        }

        //Efectos especiales de los botones al jugar
        await alternarColoresBotones();

        // Generar número ganador
        const numeroGanador = Math.floor(Math.random() * 37); // Número entre 0 y 36
        console.log("XXX: ", numerosApuesta)
        resultado.textContent = numeroGanador; // Mostrar el resultado en la interfaz
        agregarResultadoAnterior(numeroGanador);

        let ganancias = 0;

        // Verificar todas las apuestas
        numerosApuesta.forEach(numero => {
            ganancias += verificarApuesta(numero, numeroGanador);
        });

        fichas += ganancias;
        mostrarGanancias(ganancias); // Mostrar mensaje de ganancias/pérdidas
        numerosApuesta = []; // Limpiar las apuestas seleccionadas
        botonesApuesta.forEach(boton => boton.classList.remove('botonSeleccionado')); // Quitar iluminación del botón
        botonesApuesta.forEach(boton => boton.classList.remove('botonConImagen')); // Quitar imagen de la ficha
        actualizarFichas();
    }

    function verificarApuesta(numero, numeroGanador) {
        let ganancias = 0;
        if (
            (numero === 'btn_1_12' && numeroGanador >= 1 && numeroGanador <= 12) ||
            (numero === 'btn_13_24' && numeroGanador >= 13 && numeroGanador <= 24) ||
            (numero === 'btn_25_36' && numeroGanador >= 25 && numeroGanador <= 36)
        ) {
            ganancias += 3; // Gana 3 fichas por acertar el rango
        } else if (
            (numero === 'btn_1_3' && [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].includes(numeroGanador)) ||
            (numero === 'btn_2_3' && [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].includes(numeroGanador)) ||
            (numero === 'btn_3_3' && [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].includes(numeroGanador))
        ) {
            ganancias += 3; // Gana 3 fichas por acertar el tercio
        } else if (numero.startsWith('btn') && parseInt(numero.replace('btn', '')) === numeroGanador) {
            ganancias += 37; // Gana 37 fichas por acertar el número exacto
        } else if (
            (numero === 'btnPar' && numeroGanador % 2 === 0) ||
            (numero === 'btnImpar' && numeroGanador % 2 !== 0) ||
            (numero === 'btnCeldasNegras' && [6, 15, 24, 33, 2, 8, 11, 17, 20, 26, 29, 35, 4, 10, 13, 22, 28, 31].includes(numeroGanador)) ||
            (numero === 'btnCeldasRojas' && [3, 9, 12, 18, 21, 27, 30, 36, 5, 14, 23, 32, 1, 7, 16, 19, 25, 34].includes(numeroGanador)) ||
            (numero === 'btn1_18' && (numeroGanador >= 1 || numeroGanador <= 18)) ||
            (numero === 'btn19_36' && (numeroGanador >= 19 || numeroGanador <= 36))
        ) {
            ganancias += 2; // Gana 2 ficha por acertar si es par o impar
        }
        return ganancias;
    }

    // Función para agregar el número ganador a la tabla de resultados
    function agregarResultadoAnterior(numero) {
        const celda = document.createElement('td');
        celda.classList.add('celdaResultadosAnteriores');

        // Arrays con los números rojos y negros
        const numerosRojos = [3, 9, 12, 18, 21, 27, 30, 36, 5, 14, 23, 32, 1, 7, 16, 19, 25, 34];
        const numerosNegros = [6, 15, 24, 33, 2, 8, 11, 17, 20, 26, 29, 35, 4, 10, 13, 22, 28, 31];

        // Verificar el color del número
        if (numerosRojos.includes(numero)) {
            celda.classList.add('red');
        } else if (numerosNegros.includes(numero)) {
            celda.classList.add('black');
        }

        celda.textContent = numero;
        resultadosAnteriores.appendChild(celda);

        // Limitar a 8 resultados visibles
        if (resultadosAnteriores.children.length > 8) {
            resultadosAnteriores.removeChild(resultadosAnteriores.firstChild);
        }
    }

    // Mostrar mensaje de ganancias/pérdidas
    function mostrarGanancias(ganancias) {
        if (ganancias > 0) {
            alert(`¡Has ganado ${ganancias} fichas!`);
        } else {
            alert('No has ganado. Intenta de nuevo.');
        }
    }

    // Actualizar contador de fichas en pantalla
    function actualizarFichas() {
        fichasJugador.textContent = `€${fichas}`;
    }

    // Función para seleccionar un número
    function seleccionarNumero(event) {
        const boton = event.target;
        const numeroSeleccionado = boton.id; // Usar el id del botón como número seleccionado

        if (numerosApuesta.includes(numeroSeleccionado)) {
            // Si ya estaba seleccionado, desmarcarlo y devolver la ficha
            numerosApuesta = numerosApuesta.filter(num => num !== numeroSeleccionado);
            fichas += 1;
            boton.classList.remove('botonSeleccionado');
            boton.classList.remove('botonConImagen');
        } else {
            // Si no está seleccionado, verificar si hay fichas disponibles
            if (fichas > 0) {
                numerosApuesta.push(numeroSeleccionado);
                fichas -= 1;
                boton.classList.add('botonSeleccionado');
                boton.classList.add('botonConImagen');
            } else {
                alert('No tienes fichas suficientes para apostar en más números.');
            }
        }
        actualizarFichas();
    }

    // Eventos de botones
    botonSalir.addEventListener('click', salirJuego);
    botonJugar.addEventListener('click', jugarRuleta);

    botonesApuesta.forEach(boton => {
        boton.addEventListener('click', seleccionarNumero);
    });


});

async function alternarColoresBotones() {
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
            resolve(); // Indica que la función ha terminado
        }, 3000); // Detener después de 3 segundos
        botonesCambiados.forEach(boton => boton.classList.add("botonIluminado"));
    });
}