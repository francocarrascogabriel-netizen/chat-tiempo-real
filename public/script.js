/*
    Creamos la conexión entre este navegador
    y el servidor Socket.IO.
*/
const socket = io();



// ======================================================
// ELEMENTOS DEL HTML
// ======================================================

// Pantalla inicial donde el usuario escribe su nombre.
const pantallaIngreso =
    document.getElementById("pantallaIngreso");


// Pantalla principal del chat.
const pantallaChat =
    document.getElementById("pantallaChat");


// Formulario para ingresar al chat.
const formIngreso =
    document.getElementById("formIngreso");


// Campo donde se escribe el nombre de usuario.
const nombreUsuario =
    document.getElementById("nombreUsuario");


// Lugar donde mostramos el usuario actual.
const usuarioActual =
    document.getElementById("usuarioActual");


// Lista donde se muestran los usuarios conectados.
const listaUsuarios =
    document.getElementById("listaUsuarios");


// Contenedor donde aparecen mensajes y eventos.
const mensajes =
    document.getElementById("mensajes");


// Formulario utilizado para enviar mensajes.
const formMensaje =
    document.getElementById("formMensaje");


// Campo donde el usuario escribe el mensaje.
const mensaje =
    document.getElementById("mensaje");


// Indicador visual de conexión con el servidor.
const estadoConexion =
    document.getElementById("estadoConexion");


// Contador de usuarios conectados.
const contadorUsuarios =
    document.getElementById("contadorUsuarios");



// ======================================================
// ELIMINAR MENSAJE INICIAL
// ======================================================

/*
    Elimina el texto:
    "Todavía no hay mensajes."

    Se ejecuta cuando aparece el primer evento
    o el primer mensaje.
*/
function eliminarMensajeInicial() {

    // Buscamos el elemento por su clase.
    const mensajeInicial =
        mensajes.querySelector(".mensaje-inicial");


    // Si existe, lo eliminamos.
    if (mensajeInicial) {

        mensajeInicial.remove();
    }

}



// ======================================================
// MOSTRAR EVENTOS EN EL CHAT
// ======================================================

/*
    Utilizamos esta función para mostrar:

    - ingreso de usuarios;
    - salida de usuarios.

    Parámetros:

    texto = información que queremos mostrar.
    hora = hora del evento.
    tipo = ingreso o salida.
*/
function agregarEvento(texto, hora, tipo) {

    // Eliminamos el texto inicial si todavía existe.
    eliminarMensajeInicial();


    // Creamos un <div> para representar el evento.
    const evento =
        document.createElement("div");


    // Clase general para todos los eventos.
    evento.classList.add("evento-chat");


    /*
        Dependiendo del tipo de evento
        utilizamos estilos diferentes.
    */
    if (tipo === "ingreso") {

        evento.classList.add("evento-ingreso");

    } else if (tipo === "salida") {

        evento.classList.add("evento-salida");
    }


    // Creamos el texto principal del evento.
    const contenido =
        document.createElement("span");

    contenido.textContent = texto;


    // Creamos el elemento donde aparecerá la hora.
    const horaEvento =
        document.createElement("small");

    horaEvento.classList.add("hora-evento");

    horaEvento.textContent = hora;


    // Agregamos texto y hora dentro del evento.
    evento.appendChild(contenido);

    evento.appendChild(horaEvento);


    // Incorporamos el evento al área del chat.
    mensajes.appendChild(evento);


    /*
        Movemos automáticamente el scroll
        hasta el último evento.
    */
    mensajes.scrollTop =
        mensajes.scrollHeight;

}



// ======================================================
// MOSTRAR MENSAJES
// ======================================================

/*
    Recibe los datos enviados desde server.js.

    Ejemplo:

    {
        idUsuario: "...",
        nombre: "Franco",
        texto: "Hola",
        fecha: "28/08/2026",
        hora: "21:40:10"
    }
*/
function agregarMensaje(datos) {

    // Eliminamos el mensaje inicial.
    eliminarMensajeInicial();


    // Creamos el contenedor principal.
    const contenedor =
        document.createElement("div");


    // Todos los mensajes utilizan esta clase.
    contenedor.classList.add("mensaje-chat");


    /*
        Comparamos el ID del usuario que envió
        el mensaje con nuestro propio socket.id.

        Así sabemos si el mensaje es nuestro
        o pertenece a otra persona.
    */
    if (datos.idUsuario === socket.id) {

        // Mensaje propio.
        contenedor.classList.add("mensaje-propio");

    } else {

        // Mensaje enviado por otro usuario.
        contenedor.classList.add("mensaje-otro");
    }


    // Creamos la cabecera del mensaje.
    const encabezado =
        document.createElement("div");

    encabezado.classList.add(
        "mensaje-encabezado"
    );


    // Creamos el nombre del autor.
    const autor =
        document.createElement("strong");


    /*
        Si el mensaje es nuestro mostramos "Vos".

        Si pertenece a otra persona,
        mostramos su nombre.
    */
    if (datos.idUsuario === socket.id) {

        autor.textContent = "Vos";

    } else {

        autor.textContent = datos.nombre;
    }


    // Creamos el elemento para mostrar la hora.
    const hora =
        document.createElement("small");

    hora.classList.add(
        "hora-mensaje"
    );

    hora.textContent = datos.hora;


    // Incorporamos autor y hora a la cabecera.
    encabezado.appendChild(autor);

    encabezado.appendChild(hora);


    // Creamos el contenido del mensaje.
    const texto =
        document.createElement("p");


    /*
        Utilizamos textContent para que
        cualquier texto enviado sea tratado
        como texto y no como código HTML.
    */
    texto.textContent = datos.texto;


    // Clase Bootstrap para eliminar margen inferior.
    texto.classList.add("mb-0");


    // Agregamos la cabecera al mensaje.
    contenedor.appendChild(encabezado);


    // Agregamos el texto del mensaje.
    contenedor.appendChild(texto);


    // Mostramos el mensaje dentro del chat.
    mensajes.appendChild(contenedor);


    // Bajamos automáticamente hasta el último mensaje.
    mensajes.scrollTop =
        mensajes.scrollHeight;

}



// ======================================================
// INGRESO DEL USUARIO
// ======================================================

/*
    Escuchamos el envío del formulario
    donde se ingresa el nombre.
*/
formIngreso.addEventListener(
    "submit",
    (evento) => {

        /*
            Evitamos que el formulario haga
            una recarga tradicional de la página.
        */
        evento.preventDefault();


        // Obtenemos el nombre ingresado.
        const nombre =
            nombreUsuario.value.trim();


        // Evitamos nombres vacíos.
        if (nombre === "") {

            return;
        }


        /*
            Enviamos el nombre al servidor.

            server.js escucha este evento mediante:

            socket.on("registrarUsuario", ...)
        */
        socket.emit(
            "registrarUsuario",
            nombre
        );

    }
);



// ======================================================
// CONFIRMACIÓN DEL REGISTRO
// ======================================================

/*
    El servidor devuelve este evento
    cuando el usuario fue registrado correctamente.
*/
socket.on(
    "usuarioRegistrado",
    (usuario) => {

        /*
            Mostramos:
            nombre + primeros 6 caracteres del ID.
        */
        usuarioActual.textContent =
            `${usuario.nombre} (${usuario.id.substring(0, 6)})`;


        // Ocultamos la pantalla de ingreso.
        pantallaIngreso.classList.add(
            "d-none"
        );


        // Mostramos la pantalla del chat.
        pantallaChat.classList.remove(
            "d-none"
        );


        // Dejamos el cursor en el campo de mensajes.
        mensaje.focus();

    }
);



// ======================================================
// ACTUALIZAR USUARIOS CONECTADOS
// ======================================================

/*
    El servidor envía este evento
    cada vez que cambia la lista de usuarios.
*/
socket.on(
    "actualizarUsuarios",
    (usuarios) => {

        /*
            Mostramos la cantidad total
            de usuarios conectados.
        */
        contadorUsuarios.textContent =
            usuarios.length;


        // Limpiamos la lista anterior.
        listaUsuarios.innerHTML = "";


        // Recorremos todos los usuarios.
        usuarios.forEach(
            (usuario) => {

                // Creamos un elemento <li>.
                const elementoUsuario =
                    document.createElement("li");


                // Clases Bootstrap para organizar la fila.
                elementoUsuario.classList.add(
                    "list-group-item",
                    "d-flex",
                    "justify-content-between",
                    "align-items-center"
                );


                // Creamos el nombre del usuario.
                const nombre =
                    document.createElement("span");

                nombre.textContent =
                    usuario.nombre;


                // Creamos una parte visible del ID.
                const identificador =
                    document.createElement("small");

                identificador.classList.add(
                    "text-secondary"
                );

                identificador.textContent =
                    usuario.id.substring(0, 6);


                /*
                    Si este ID corresponde
                    al navegador actual,
                    agregamos "(vos)".
                */
                if (usuario.id === socket.id) {

                    nombre.textContent +=
                        " (vos)";
                }


                // Agregamos nombre al <li>.
                elementoUsuario.appendChild(
                    nombre
                );


                // Agregamos identificador al <li>.
                elementoUsuario.appendChild(
                    identificador
                );


                // Incorporamos el usuario a la lista.
                listaUsuarios.appendChild(
                    elementoUsuario
                );

            }
        );

    }
);



// ======================================================
// INGRESO DE UN USUARIO
// ======================================================

/*
    El servidor emite este evento
    cuando alguien entra al chat.
*/
socket.on(
    "usuarioIngreso",
    (datos) => {

        agregarEvento(
            `${datos.nombre} ingresó al chat`,
            datos.hora,
            "ingreso"
        );

    }
);



// ======================================================
// SALIDA DE UN USUARIO
// ======================================================

/*
    El servidor emite este evento
    cuando una persona abandona el chat.
*/
socket.on(
    "usuarioSalida",
    (datos) => {

        agregarEvento(
            `${datos.nombre} abandonó el chat`,
            datos.hora,
            "salida"
        );

    }
);



// ======================================================
// ENVÍO DE MENSAJES
// ======================================================

/*
    Escuchamos el formulario donde
    el usuario escribe mensajes.
*/
formMensaje.addEventListener(
    "submit",
    (evento) => {

        // Evitamos que la página se recargue.
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

            server.js lo recibe mediante:

            socket.on("enviarMensaje", ...)
        */
        socket.emit(
            "enviarMensaje",
            texto
        );


        // Limpiamos el campo.
        mensaje.value = "";


        // Volvemos a dejar el cursor en el campo.
        mensaje.focus();

    }
);



// ======================================================
// RECEPCIÓN DE MENSAJES
// ======================================================

/*
    El servidor utiliza io.emit()
    para enviar el mensaje a todos
    los usuarios conectados.
*/
socket.on(
    "nuevoMensaje",
    (datos) => {

        // Mostramos el mensaje recibido.
        agregarMensaje(datos);

    }
);



// ======================================================
// ESTADO DE CONEXIÓN
// ======================================================

/*
    Socket.IO ejecuta automáticamente
    este evento cuando logra conectarse
    correctamente con el servidor.
*/
socket.on(
    "connect",
    () => {

        // Cambiamos el texto.
        estadoConexion.textContent =
            "Conectado";


        // Quitamos el color rojo.
        estadoConexion.classList.remove(
            "text-bg-danger"
        );


        // Aplicamos el color verde.
        estadoConexion.classList.add(
            "text-bg-success"
        );

    }
);



// ======================================================
// PÉRDIDA DE CONEXIÓN
// ======================================================

/*
    Socket.IO ejecuta este evento
    cuando el navegador pierde la conexión
    con el servidor.
*/
socket.on(
    "disconnect",
    (reason) => {

        // Cambiamos el indicador visual.
        estadoConexion.textContent =
            "Desconectado";


        // Quitamos el color verde.
        estadoConexion.classList.remove(
            "text-bg-success"
        );


        // Aplicamos el color rojo.
        estadoConexion.classList.add(
            "text-bg-danger"
        );


        /*
            Mostramos también el motivo
            en la consola del navegador.
        */
        console.log(
            "Conexión perdida. Motivo:",
            reason
        );

    }
);