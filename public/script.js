/*
    Iniciamos la conexión entre el navegador
    y nuestro servidor Socket.IO.
*/
const socket = io();



// ======================================================
// ELEMENTOS DEL HTML
// ======================================================

// Pantalla para ingresar el nombre.
const pantallaIngreso =
    document.getElementById("pantallaIngreso");

// Pantalla principal del chat.
const pantallaChat =
    document.getElementById("pantallaChat");

// Formulario de ingreso.
const formIngreso =
    document.getElementById("formIngreso");

// Campo donde se escribe el nombre.
const nombreUsuario =
    document.getElementById("nombreUsuario");

// Nombre del usuario actual.
const usuarioActual =
    document.getElementById("usuarioActual");

// Lista de usuarios conectados.
const listaUsuarios =
    document.getElementById("listaUsuarios");

// Contenedor donde aparecerán mensajes y eventos.
const mensajes =
    document.getElementById("mensajes");

// Formulario utilizado para enviar mensajes.
const formMensaje =
    document.getElementById("formMensaje");

// Campo donde el usuario escribe un mensaje.
const mensaje =
    document.getElementById("mensaje");



// ======================================================
// FUNCIÓN PARA ELIMINAR EL MENSAJE INICIAL
// ======================================================

function eliminarMensajeInicial() {

    /*
        Buscamos el texto:
        "Todavía no hay mensajes."
    */
    const mensajeInicial =
        mensajes.querySelector(".mensaje-inicial");


    // Si existe, lo eliminamos.
    if (mensajeInicial) {

        mensajeInicial.remove();
    }

}



// ======================================================
// FUNCIÓN PARA MOSTRAR EVENTOS
// ======================================================

/*
    Esta función se utiliza para mostrar:

    - ingreso de usuarios;
    - salida de usuarios.
*/
function agregarEvento(texto, hora, tipo) {

    // Quitamos el mensaje inicial si todavía existe.
    eliminarMensajeInicial();


    // Creamos el contenedor del evento.
    const evento =
        document.createElement("div");


    // Agregamos una clase general.
    evento.classList.add("evento-chat");


    // Agregamos una clase según el tipo de evento.
    if (tipo === "ingreso") {

        evento.classList.add("evento-ingreso");

    } else if (tipo === "salida") {

        evento.classList.add("evento-salida");
    }


    // Creamos el texto del evento.
    const contenido =
        document.createElement("span");

    contenido.textContent = texto;


    // Creamos el elemento que mostrará la hora.
    const horaEvento =
        document.createElement("small");

    horaEvento.classList.add("hora-evento");

    horaEvento.textContent = hora;


    // Agregamos texto y hora al evento.
    evento.appendChild(contenido);

    evento.appendChild(horaEvento);


    // Agregamos el evento al chat.
    mensajes.appendChild(evento);


    /*
        Movemos automáticamente el área
        hacia el último elemento agregado.
    */
    mensajes.scrollTop =
        mensajes.scrollHeight;

}



// ======================================================
// FUNCIÓN PARA MOSTRAR MENSAJES
// ======================================================

/*
    Recibe un objeto enviado desde el servidor.

    Ejemplo:

    {
        idUsuario: "...",
        nombre: "Franco",
        texto: "Hola",
        hora: "21:45:10"
    }
*/
function agregarMensaje(datos) {

    // Eliminamos el texto inicial.
    eliminarMensajeInicial();


    // Creamos el contenedor principal del mensaje.
    const contenedor =
        document.createElement("div");


    /*
        Todos los mensajes tendrán
        la clase "mensaje-chat".
    */
    contenedor.classList.add("mensaje-chat");


    /*
        Comparamos el ID recibido con nuestro socket.id.

        Si son iguales significa que este mensaje
        lo enviamos nosotros.
    */
    if (datos.idUsuario === socket.id) {

        contenedor.classList.add("mensaje-propio");

    } else {

        contenedor.classList.add("mensaje-otro");
    }


    // Creamos la cabecera del mensaje.
    const encabezado =
        document.createElement("div");

    encabezado.classList.add("mensaje-encabezado");


    // Nombre de quien envió el mensaje.
    const autor =
        document.createElement("strong");


    /*
        Si el mensaje es nuestro,
        mostramos "Vos".

        Si pertenece a otra persona,
        mostramos su nombre.
    */
    if (datos.idUsuario === socket.id) {

        autor.textContent = "Vos";

    } else {

        autor.textContent = datos.nombre;
    }


    // Elemento para mostrar la hora.
    const hora =
        document.createElement("small");

    hora.classList.add("hora-mensaje");

    hora.textContent = datos.hora;


    // Agregamos autor y hora a la cabecera.
    encabezado.appendChild(autor);

    encabezado.appendChild(hora);


    // Creamos el contenido del mensaje.
    const texto =
        document.createElement("p");


    /*
        Usamos textContent.

        De esta manera el navegador interpreta
        el contenido como texto y no como código HTML.
    */
    texto.textContent = datos.texto;


    // Clase para darle estilo.
    texto.classList.add("mb-0");


    // Agregamos todo al contenedor.
    contenedor.appendChild(encabezado);

    contenedor.appendChild(texto);


    // Mostramos finalmente el mensaje.
    mensajes.appendChild(contenedor);


    // Bajamos automáticamente hasta el último mensaje.
    mensajes.scrollTop =
        mensajes.scrollHeight;

}



// ======================================================
// INGRESO AL CHAT
// ======================================================

formIngreso.addEventListener("submit", (evento) => {

    // Evitamos que la página se recargue.
    evento.preventDefault();


    // Obtenemos el nombre.
    const nombre =
        nombreUsuario.value.trim();


    // Evitamos un nombre vacío.
    if (nombre === "") {
        return;
    }


    // Enviamos el nombre al servidor.
    socket.emit(
        "registrarUsuario",
        nombre
    );

});



// ======================================================
// USUARIO REGISTRADO
// ======================================================

socket.on("usuarioRegistrado", (usuario) => {

    // Mostramos nombre y parte del ID.
    usuarioActual.textContent =
        `${usuario.nombre} (${usuario.id.substring(0, 6)})`;


    // Ocultamos la pantalla inicial.
    pantallaIngreso.classList.add("d-none");


    // Mostramos el chat.
    pantallaChat.classList.remove("d-none");


    // Dejamos el cursor en el campo de mensajes.
    mensaje.focus();

});



// ======================================================
// ACTUALIZAR USUARIOS CONECTADOS
// ======================================================

socket.on("actualizarUsuarios", (usuarios) => {

    // Eliminamos la lista anterior.
    listaUsuarios.innerHTML = "";


    // Recorremos todos los usuarios.
    usuarios.forEach((usuario) => {

        // Creamos un <li>.
        const elementoUsuario =
            document.createElement("li");


        // Aplicamos estilos de Bootstrap.
        elementoUsuario.classList.add(
            "list-group-item",
            "d-flex",
            "justify-content-between",
            "align-items-center"
        );


        // Creamos el nombre.
        const nombre =
            document.createElement("span");

        nombre.textContent = usuario.nombre;


        // Creamos el identificador.
        const identificador =
            document.createElement("small");

        identificador.classList.add(
            "text-secondary"
        );

        identificador.textContent =
            usuario.id.substring(0, 6);


        // Indicamos cuál somos nosotros.
        if (usuario.id === socket.id) {

            nombre.textContent += " (vos)";
        }


        // Agregamos nombre e ID.
        elementoUsuario.appendChild(nombre);

        elementoUsuario.appendChild(identificador);


        // Agregamos el usuario a la lista.
        listaUsuarios.appendChild(
            elementoUsuario
        );

    });

});



// ======================================================
// EVENTO DE INGRESO
// ======================================================

socket.on("usuarioIngreso", (datos) => {

    agregarEvento(
        `${datos.nombre} ingresó al chat`,
        datos.hora,
        "ingreso"
    );

});



// ======================================================
// EVENTO DE SALIDA
// ======================================================

socket.on("usuarioSalida", (datos) => {

    agregarEvento(
        `${datos.nombre} abandonó el chat`,
        datos.hora,
        "salida"
    );

});



// ======================================================
// ENVÍO DE MENSAJES
// ======================================================

/*
    Escuchamos el submit del formulario
    donde escribimos los mensajes.
*/
formMensaje.addEventListener("submit", (evento) => {

    // Evitamos recargar la página.
    evento.preventDefault();


    // Obtenemos el texto escrito.
    const texto =
        mensaje.value.trim();


    // Evitamos mensajes vacíos.
    if (texto === "") {
        return;
    }


    /*
        Enviamos el mensaje al servidor.

        Cliente:
        socket.emit()

        Servidor:
        socket.on()
    */
    socket.emit(
        "enviarMensaje",
        texto
    );


    // Limpiamos el campo después de enviar.
    mensaje.value = "";


    // Volvemos a dejar el cursor en el input.
    mensaje.focus();

});



// ======================================================
// RECEPCIÓN DE MENSAJES
// ======================================================

/*
    El servidor envía "nuevoMensaje"
    a todos los usuarios conectados.
*/
socket.on("nuevoMensaje", (datos) => {

    // Mostramos el mensaje recibido.
    agregarMensaje(datos);

});