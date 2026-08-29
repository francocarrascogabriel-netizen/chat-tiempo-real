// Importamos Express para crear el servidor web.
const express = require("express");

// Importamos el módulo HTTP de Node.js.
// Socket.IO funcionará utilizando este servidor HTTP.
const http = require("http");

// Importamos Server desde Socket.IO.
const { Server } = require("socket.io");


// Creamos la aplicación Express.
const app = express();

// Creamos el servidor HTTP.
const server = http.createServer(app);

// Asociamos Socket.IO al servidor HTTP.
const io = new Server(server);

// Puerto donde funcionará nuestra aplicación.
const PORT = 3000;


// Express servirá todos los archivos que se encuentren
// dentro de la carpeta public.
app.use(express.static("public"));



/*
    Map donde almacenamos los usuarios conectados.

    Usamos socket.id como clave porque es único
    para cada conexión.

    Ejemplo:

    "abc123" => {
        id: "abc123",
        nombre: "Franco"
    }
*/
const usuarios = new Map();



/*
    Función que obtiene la fecha y hora actual.

    La utilizamos para mensajes, ingresos
    y desconexiones.
*/
function obtenerFechaHora() {

    // Creamos un objeto con la fecha y hora actual.
    const ahora = new Date();


    // Formateamos la fecha para Argentina.
    const fecha = ahora.toLocaleDateString("es-AR");


    // Obtenemos hora, minutos y segundos.
    const hora = ahora.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });


    // Devolvemos ambos valores.
    return {
        fecha,
        hora
    };
}



// ======================================================
// CONEXIÓN DE SOCKET.IO
// ======================================================

/*
    Este evento se ejecuta automáticamente
    cuando un navegador se conecta al servidor.
*/
io.on("connection", (socket) => {

    console.log("Nueva conexión:", socket.id);



    // ==================================================
    // REGISTRO DEL USUARIO
    // ==================================================

    /*
        Escuchamos el evento que envía el frontend
        cuando una persona ingresa su nombre.
    */
    socket.on("registrarUsuario", (nombre) => {

        // Quitamos espacios innecesarios.
        const nombreLimpio = nombre.trim();


        // No permitimos nombres vacíos.
        if (nombreLimpio === "") {
            return;
        }


        // Creamos el objeto del usuario.
        const usuario = {

            // ID único generado por Socket.IO.
            id: socket.id,

            // Nombre elegido por la persona.
            nombre: nombreLimpio
        };


        // Guardamos al usuario en nuestro Map.
        usuarios.set(socket.id, usuario);


        // Obtenemos fecha y hora del ingreso.
        const momento = obtenerFechaHora();


        // Registramos el ingreso en consola.
        console.log(
            `[${momento.fecha} ${momento.hora}] ` +
            `Ingresó ${usuario.nombre} - ID: ${usuario.id}`
        );


        /*
            Confirmamos solamente a este usuario
            que su registro fue correcto.
        */
        socket.emit("usuarioRegistrado", usuario);


        /*
            Informamos a todos que alguien
            ingresó al chat.
        */
        io.emit("usuarioIngreso", {

            nombre: usuario.nombre,

            fecha: momento.fecha,

            hora: momento.hora
        });


        // Actualizamos la lista de conectados.
        io.emit(
            "actualizarUsuarios",
            Array.from(usuarios.values())
        );

    });



    // ==================================================
    // ENVÍO DE MENSAJES
    // ==================================================

    /*
        Escuchamos el evento "enviarMensaje"
        enviado desde script.js.
    */
    socket.on("enviarMensaje", (texto) => {

        /*
            Buscamos qué usuario corresponde
            al socket que envió el mensaje.

            De esta manera NO confiamos en que
            el navegador nos diga quién es.

            El servidor identifica al usuario
            mediante socket.id.
        */
        const usuario = usuarios.get(socket.id);


        // Si el usuario no está registrado,
        // no permitimos enviar mensajes.
        if (!usuario) {
            return;
        }


        /*
            Limpiamos espacios al principio
            y al final del mensaje.
        */
        const mensajeLimpio = texto.trim();


        // Evitamos mensajes vacíos.
        if (mensajeLimpio === "") {
            return;
        }


        // Obtenemos fecha y hora del mensaje.
        const momento = obtenerFechaHora();


        /*
            Creamos un objeto con toda
            la información del mensaje.
        */
        const datosMensaje = {

            // ID del usuario que envió el mensaje.
            idUsuario: usuario.id,

            // Nombre del usuario.
            nombre: usuario.nombre,

            // Contenido del mensaje.
            texto: mensajeLimpio,

            // Fecha del mensaje.
            fecha: momento.fecha,

            // Hora del mensaje.
            hora: momento.hora
        };


        /*
            Mostramos también el mensaje
            en la consola del servidor.
        */
        console.log(
            `[${momento.fecha} ${momento.hora}] ` +
            `${usuario.nombre}: ${mensajeLimpio}`
        );


        /*
            Enviamos el mensaje a TODOS
            los usuarios conectados.

            Incluye también al usuario
            que originalmente lo envió.
        */
        io.emit("nuevoMensaje", datosMensaje);

    });



    // ==================================================
    // DESCONEXIÓN DEL USUARIO
    // ==================================================

    /*
        Socket.IO ejecuta automáticamente este evento
        cuando una conexión termina.

        reason contiene el motivo de desconexión.
    */
    socket.on("disconnect", (reason) => {

        // Buscamos al usuario asociado al socket.
        const usuario = usuarios.get(socket.id);


        // Solo continuamos si estaba registrado.
        if (usuario) {

            // Obtenemos fecha y hora.
            const momento = obtenerFechaHora();


            /*
                Registramos:
                - fecha;
                - hora;
                - usuario;
                - ID;
                - motivo.
            */
            console.log(
                `[${momento.fecha} ${momento.hora}] ` +
                `Usuario: ${usuario.nombre} | ` +
                `ID: ${usuario.id} | ` +
                `Motivo: ${reason}`
            );


            // Eliminamos al usuario de la lista.
            usuarios.delete(socket.id);


            // Informamos la salida a los demás.
            io.emit("usuarioSalida", {

                nombre: usuario.nombre,

                fecha: momento.fecha,

                hora: momento.hora
            });

        }


        // Actualizamos la lista de usuarios conectados.
        io.emit(
            "actualizarUsuarios",
            Array.from(usuarios.values())
        );

    });

});



// ======================================================
// INICIO DEL SERVIDOR
// ======================================================

// Ponemos el servidor a escuchar en el puerto 3000.
server.listen(PORT, () => {

    console.log(
        `Servidor funcionando en http://localhost:${PORT}`
    );

});