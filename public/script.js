/*
    Iniciamos la conexión del navegador
    con Socket.IO.
*/
const socket = io();



// ======================================================
// ELEMENTOS DEL HTML
// ======================================================

// Pantalla inicial.
const pantallaIngreso =
    document.getElementById("pantallaIngreso");

// Pantalla principal del chat.
const pantallaChat =
    document.getElementById("pantallaChat");

// Formulario de ingreso.
const formIngreso =
    document.getElementById("formIngreso");

// Campo donde escribimos el nombre.
const nombreUsuario =
    document.getElementById("nombreUsuario");

// Lugar donde mostramos el usuario actual.
const usuarioActual =
    document.getElementById("usuarioActual");

// Lista de usuarios conectados.
const listaUsuarios =
    document.getElementById("listaUsuarios");

// Contenedor de mensajes y eventos.
const mensajes =
    document.getElementById("mensajes");

// Campo donde posteriormente escribiremos mensajes.
const mensaje =
    document.getElementById("mensaje");



// ======================================================
// FUNCIÓN PARA MOSTRAR EVENTOS EN EL CHAT
// ======================================================

/*
    Esta función agrega información al área
    de mensajes del chat.

    Recibe:

    texto = mensaje que queremos mostrar.
    hora  = hora del evento.
    tipo  = ingreso o salida.
*/
function agregarEvento(texto, hora, tipo) {

    /*
        Si todavía está el mensaje inicial
        "Todavía no hay mensajes", lo eliminamos.
    */
    const mensajeInicial =
        mensajes.querySelector(".mensaje-inicial");

    if (mensajeInicial) {
        mensajeInicial.remove();
    }


    // Creamos un contenedor para el evento.
    const evento = document.createElement("div");

    // Clase general para todos los eventos.
    evento.classList.add("evento-chat");


    /*
        Dependiendo del tipo agregamos una clase distinta.

        Después CSS utilizará estas clases para
        diferenciar ingresos y desconexiones.
    */
    if (tipo === "ingreso") {

        evento.classList.add("evento-ingreso");

    } else if (tipo === "salida") {

        evento.classList.add("evento-salida");
    }


    // Creamos el texto principal del evento.
    const contenido = document.createElement("span");

    contenido.textContent = texto;


    // Creamos el elemento donde aparecerá la hora.
    const horaEvento = document.createElement("small");

    horaEvento.classList.add("hora-evento");

    horaEvento.textContent = hora;


    // Agregamos el contenido dentro del evento.
    evento.appendChild(contenido);

    evento.appendChild(horaEvento);


    // Finalmente mostramos el evento dentro del chat.
    mensajes.appendChild(evento);


    /*
        Movemos automáticamente el scroll hacia abajo.

        Esto será muy útil cuando existan
        muchos mensajes.
    */
    mensajes.scrollTop = mensajes.scrollHeight;
}



// ======================================================
// INGRESO AL CHAT
// ======================================================

formIngreso.addEventListener("submit", (evento) => {

    /*
        Evitamos que el formulario recargue
        automáticamente la página.
    */
    evento.preventDefault();


    // Obtenemos el nombre ingresado.
    const nombre = nombreUsuario.value.trim();


    // No permitimos enviar un nombre vacío.
    if (nombre === "") {
        return;
    }


    /*
        Enviamos el nombre al servidor mediante
        nuestro evento personalizado.
    */
    socket.emit("registrarUsuario", nombre);

});



// ======================================================
// USUARIO REGISTRADO
// ======================================================

socket.on("usuarioRegistrado", (usuario) => {

    /*
        Mostramos el nombre y los primeros
        caracteres de socket.id.
    */
    usuarioActual.textContent =
        `${usuario.nombre} (${usuario.id.substring(0, 6)})`;


    // Ocultamos la pantalla de ingreso.
    pantallaIngreso.classList.add("d-none");

    // Mostramos el chat.
    pantallaChat.classList.remove("d-none");


    // Dejamos preparado el campo de mensajes.
    mensaje.focus();

});



// ======================================================
// ACTUALIZACIÓN DE USUARIOS CONECTADOS
// ======================================================

socket.on("actualizarUsuarios", (usuarios) => {

    // Limpiamos primero la lista existente.
    listaUsuarios.innerHTML = "";


    // Recorremos todos los usuarios recibidos.
    usuarios.forEach((usuario) => {

        // Creamos un elemento <li>.
        const elementoUsuario =
            document.createElement("li");


        // Agregamos clases Bootstrap.
        elementoUsuario.classList.add(
            "list-group-item",
            "d-flex",
            "justify-content-between",
            "align-items-center"
        );


        // Elemento para mostrar el nombre.
        const nombre =
            document.createElement("span");

        nombre.textContent = usuario.nombre;


        // Elemento para mostrar parte del ID.
        const identificador =
            document.createElement("small");

        identificador.classList.add(
            "text-secondary"
        );

        identificador.textContent =
            usuario.id.substring(0, 6);


        /*
            Si este usuario corresponde
            al navegador actual, mostramos "(vos)".
        */
        if (usuario.id === socket.id) {

            nombre.textContent += " (vos)";
        }


        // Agregamos los elementos al <li>.
        elementoUsuario.appendChild(nombre);

        elementoUsuario.appendChild(identificador);


        // Agregamos el usuario a la lista.
        listaUsuarios.appendChild(
            elementoUsuario
        );

    });

});



// ======================================================
// EVENTO: INGRESO DE UN USUARIO
// ======================================================

socket.on("usuarioIngreso", (datos) => {

    /*
        Mostramos en pantalla algo como:

        Franco ingresó al chat       21:42:05
    */
    agregarEvento(
        `${datos.nombre} ingresó al chat`,
        datos.hora,
        "ingreso"
    );

});



// ======================================================
// EVENTO: SALIDA DE UN USUARIO
// ======================================================

socket.on("usuarioSalida", (datos) => {

    /*
        Mostramos en pantalla algo como:

        Franco abandonó el chat      21:45:11
    */
    agregarEvento(
        `${datos.nombre} abandonó el chat`,
        datos.hora,
        "salida"
    );

});