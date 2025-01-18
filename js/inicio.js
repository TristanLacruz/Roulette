const { ipcRenderer } = require("electron");

const fs = require("fs");
const path = require('path');
const rutaRegistro = path.join(__dirname, 'registroJugadores.json');


// Leer datos iniciales de los usuarios desde el archivo JSON
let fichero = fs.readFileSync('./registroJugadores.json');
let usuarios = JSON.parse(fichero);

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    /**
     * REFERENCIAS HTML
     */
    // Página principal
    const pestanyaInicio = document.getElementById('pestanyaInicio');
    const botonEntrar = document.getElementById('entrar');
    const nombreBienvenido = document.getElementById("nombreBienvenido");

    // Botones principales
    const botonIniciarSesion = document.getElementById("btn_IniciarSesion");
    const botonRegistrarse = document.getElementById("btn_Registrarse");
    const botonCerrarSesion = document.getElementById("btn_CerrarSesion");

    // Modales de inicio de sesión y registro
    const divIniciarSesion = document.getElementById('divIniciarSesion');
    const divRegistrarse = document.getElementById('divRegistrarse');
    const closeSesionModalBtn = document.getElementById('closeSesionModalBtn');
    const closeRegistroModalBtn = document.getElementById('closeRegistroModal');

    // Modal de error
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const closeErrorModalBtn = document.getElementById('closeErrorModalBtn');

    const botonConfirmarInicioSesion = document.getElementById("btn_ComprobarInicioSesion");
    botonConfirmarInicioSesion.addEventListener('click', confirmarInicioSesion);

    const botonMusica = document.getElementById("btn_EncenderMusica");
    const audioMusica = document.getElementById("audioMusica");

    // Variable de estado
    let inicioSesion = false;

    /**
     * FUNCIONES PRINCIPALES
     */

    // Iniciar el juego
    function iniciarJuego() {
        if (inicioSesion) {
            //
            ipcRenderer.send('abrirJuego');
        } else {
            showErrorModal("Por favor, inicie sesión o regístrese antes de entrar.");
        }
    }

    // Mostrar el modal de registro
    function registrarse() {
        divRegistrarse.classList.remove('hidden');
    }

    // Cerrar sesión
    function cerrarSesion() {
        if (!inicioSesion) {
            showErrorModal("No hay una sesión iniciada.");
            return;
        }

        // Restablecer estado de sesión
        inicioSesion = false;
        nombreBienvenido.textContent = "";

        // Alternar botones
        botonIniciarSesion.classList.remove('hidden');
        botonRegistrarse.classList.remove("hidden");
        botonCerrarSesion.classList.add('hidden');

        showErrorModal("Sesión cerrada correctamente.");
    }

    // Iniciar sesión
    function iniciarSesion() {
        // Mostrar el modal de inicio de sesión
        divIniciarSesion.classList.remove('hidden');
    }

    function encenderMusica() {
        if (audioMusica.paused) {
            audioMusica.volume = 0.5;
            audioMusica.play(); // Reproducir música
            botonMusica.textContent = "Pausar música"; // Cambiar texto del botón
        } else {
            audioMusica.pause(); // Pausar música
            botonMusica.textContent = "Encender música"; // Cambiar texto del botón
        }
    }

    // Confirmar inicio de sesión (listener separado)
    function confirmarInicioSesion() {
        const dniInput = document.getElementById("textDni");
        const passwordInput = document.getElementById("textPassword");

        const dni = dniInput.value.trim();
        const password = passwordInput.value.trim();

        // Validar campos vacíos
        if (!dni || !password) {
            showErrorModal("Por favor, complete todos los campos para iniciar sesión.");
            return;
        }

        // Buscar usuario en el array
        const usuarioEncontrado = usuarios.find(u => u.dni === dni && u.password === password);
        if (!usuarioEncontrado) {
            showErrorModal("DNI o contraseña incorrectos. Inténtelo nuevamente.");
            return;
        }

        // Iniciar sesión exitosamente
        inicioSesion = true;

        nombreBienvenido.textContent = `Bienvenido, ${usuarioEncontrado.nombre}`;
        actualizarPosicionJugador(dni);
        

        // Alternar botones
        divIniciarSesion.classList.add('hidden');
        botonIniciarSesion.classList.add('hidden');
        botonRegistrarse.classList.add("hidden");
        botonCerrarSesion.classList.remove('hidden');

        // Limpiar campos de entrada
        dniInput.value = '';
        passwordInput.value = '';
    }

    function actualizarPosicionJugador(dni) {
        try {
            // Leer el archivo JSON
            let datos = JSON.parse(fs.readFileSync(rutaRegistro, 'utf-8'));
            
            // Buscar el índice del jugador
            const indiceJugador = datos.findIndex(jugador => jugador.dni === dni);
            if (indiceJugador === -1) {
                console.error(`Jugador con DNI ${dni} no encontrado.`);
                return;
            }
    
            // Extraer la información del jugador y eliminarlo del array
            const jugador = datos.splice(indiceJugador, 1)[0];
            
            // Agregar al final
            datos.push(jugador);
            
            // Escribir los datos actualizados en el archivo
            fs.writeFileSync(rutaRegistro, JSON.stringify(datos, null, 4));
            console.log(`Jugador ${jugador.nombre} movido al final del registro.`);
        } catch (error) {
            console.error('Error al actualizar el registro:', error);
        }
    }
    
    // Confirmar registro
    const botonConfirmarRegistro = document.getElementById("btn_ComprobarRegistro");
    botonConfirmarRegistro.addEventListener('click', () => {
        const nombreInput = document.getElementById("textNombreRegistro");
        const dniInput = document.getElementById("textDniRegistro");
        const passwordInput = document.getElementById("textPasswordRegistro");

        const nombre = nombreInput.value.trim();
        const dni = dniInput.value.trim();
        const password = passwordInput.value.trim();
        const credits = 100;

        // Validar campos vacíos
        if (!nombre || !dni || !password) {
            showErrorModal("Por favor, complete todos los campos para registrarse.");
            return;
        }

        // Verificar si el usuario ya existe
        if (usuarios.some(u => u.dni === dni)) {
            showErrorModal("Ya existe un usuario con este DNI. Por favor, inicie sesión.");
            return;
        }

        // Crear nuevo usuario
        const nuevoUsuario = { nombre, dni, password, credits };
        usuarios.push(nuevoUsuario);

        // Guardar en el archivo JSON
        try {
            fs.writeFileSync('./registroJugadores.json', JSON.stringify(usuarios, null, 2));
            showErrorModal("Usuario registrado con éxito. Ahora puede iniciar sesión.");
            divRegistrarse.classList.add('hidden');
        } catch (error) {
            showErrorModal("Error al guardar el usuario. Inténtelo nuevamente.");
            console.error(error);
        }

        // Limpiar campos del formulario
        nombreInput.value = '';
        dniInput.value = '';
        passwordInput.value = '';
    });

    /**
     * MODALES Y ERRORES
     */
    function showErrorModal(message) {
        errorMessage.textContent = message;
        errorModal.classList.remove('hidden');
    }

    // Cerrar modales
    closeErrorModalBtn.addEventListener('click', () => errorModal.classList.add('hidden'));
    closeSesionModalBtn.addEventListener('click', () => divIniciarSesion.classList.add('hidden'));
    closeRegistroModalBtn.addEventListener('click', () => divRegistrarse.classList.add('hidden'));

    /**
     * EVENTOS DE BOTONES
     */
    botonEntrar.addEventListener('click', iniciarJuego);
    botonIniciarSesion.addEventListener('click', iniciarSesion);
    botonRegistrarse.addEventListener('click', registrarse);
    botonCerrarSesion.addEventListener('click', cerrarSesion);
    botonMusica.addEventListener("click", encenderMusica);
});