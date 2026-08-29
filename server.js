// Importamos Express para crear el servidor web.
const express = require("express");

// Importamos el módulo HTTP de Node.js.
// Socket.IO funcionará sobre este servidor HTTP.
const http = require("http");

// Importamos Server desde Socket.IO.
const { Server } = require("socket.io");


// Creamos la aplicación Express.
const app = express();

// Creamos el servidor HTTP.
const server = http.createServer(app);

// Conectamos Socket.IO con el servidor HTTP.
const io = new Server(server);

// Puerto donde funcionará nuestro chat.
const PORT = 3000;


// Indicamos que Express debe servir los archivos
// que se encuentran dentro de la carpeta public.
app.use(express.static("public"));



/*
    Map donde guardamos los usuarios conectados.

    La clave será socket.id y el valor será
    un objeto con los datos del usuario.

    Ejemplo:

    "abc123" => {
        id: "abc123",
        nombre: "Franco"
    }
*/
const usuarios = new Map();



/*
    Esta función obtiene la fecha y hora actual.

    La utilizaremos para registrar los eventos
    de ingreso y desconexión.
*/
function obtenerFechaHora() {

    const ahora = new Date();

    /*
        Formateamos la fecha utilizando
        configuración regional argentina.
    */
    const fecha = ahora.toLocaleDateString("es-AR");

    /*
        Obtenemos la hora con horas, minutos
        y segundos.
    */
    const hora = ahora.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    // Devolvemos ambos valores en un objeto.
    return {
        fecha,
        hora
    };
}



// Socket.IO ejecuta esta función cada vez
// que un navegador se conecta al servidor.
io.on("connection", (socket) => {

    console.log("Nueva conexión:", socket.id);



    // =====================================================
    // REGISTRO DEL USUARIO
    // =====================================================

    socket.on("registrarUsuario", (nombre) => {

        // Eliminamos espacios sobrantes.
        const nombreLimpio = nombre.trim();

        // Si el nombre está vacío, detenemos el proceso.
        if (nombreLimpio === "") {
            return;
        }


        // Creamos el objeto que representa al usuario.
        const usuario = {
            id: socket.id,
            nombre: nombreLimpio
        };


        // Guardamos al usuario usando socket.id como clave.
        usuarios.set(socket.id, usuario);


        // Obtenemos fecha y hora del ingreso.
        const momento = obtenerFechaHora();


        // Mostramos el evento en la consola del servidor.
        console.log(
            `[${momento.fecha} ${momento.hora}] ` +
            `Ingresó ${usuario.nombre} - ID: ${usuario.id}`
        );


        /*
            Confirmamos solamente a este navegador
            que el registro fue exitoso.
        */
        socket.emit("usuarioRegistrado", usuario);


        /*
            Informamos a TODOS los clientes
            que un usuario ingresó al chat.
        */
        io.emit("usuarioIngreso", {
            nombre: usuario.nombre,
            fecha: momento.fecha,
            hora: momento.hora
        });


        /*
            Actualizamos la lista de usuarios
            para todos los navegadores.
        */
        io.emit(
            "actualizarUsuarios",
            Array.from(usuarios.values())
        );

    });



    // =====================================================
    // DESCONEXIÓN DEL USUARIO
    // =====================================================

    /*
        Este evento es generado automáticamente
        por Socket.IO cuando una conexión termina.

        "reason" contiene el motivo detectado
        por Socket.IO.
    */
    socket.on("disconnect", (reason) => {

        // Buscamos al usuario asociado al socket.
        const usuario = usuarios.get(socket.id);


        /*
            Puede existir una conexión que todavía
            no haya registrado un nombre.

            Por eso verificamos primero que el usuario exista.
        */
        if (usuario) {

            // Obtenemos fecha y hora de la desconexión.
            const momento = obtenerFechaHora();


            /*
                Mostramos toda la información solicitada
                en la consola del servidor.
            */
            console.log(
                `[${momento.fecha} ${momento.hora}] ` +
                `Usuario: ${usuario.nombre} | ` +
                `ID: ${usuario.id} | ` +
                `Motivo: ${reason}`
            );


            // Eliminamos al usuario del Map.
            usuarios.delete(socket.id);


            /*
                Informamos a los usuarios que continúan
                conectados que esta persona abandonó el chat.
            */
            io.emit("usuarioSalida", {
                nombre: usuario.nombre,
                fecha: momento.fecha,
                hora: momento.hora
            });

        }


        // Actualizamos nuevamente la lista de conectados.
        io.emit(
            "actualizarUsuarios",
            Array.from(usuarios.values())
        );

    });

});



// Iniciamos el servidor.
server.listen(PORT, () => {

    console.log(
        `Servidor funcionando en http://localhost:${PORT}`
    );

});