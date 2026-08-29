// Importamos Express para crear y administrar nuestro servidor web.
const express = require("express");

// Importamos el módulo HTTP nativo de Node.js.
// Socket.IO necesita trabajar sobre un servidor HTTP.
const http = require("http");

// Importamos Server desde Socket.IO.
// Este objeto permitirá manejar las conexiones en tiempo real.
const { Server } = require("socket.io");

// Creamos la aplicación de Express.
const app = express();

// Creamos el servidor HTTP utilizando nuestra aplicación Express.
const server = http.createServer(app);

// Asociamos Socket.IO al servidor HTTP.
const io = new Server(server);

// Puerto donde se ejecutará nuestra aplicación.
const PORT = 3000;

// Indicamos a Express que los archivos del frontend
// se encuentran dentro de la carpeta public.
app.use(express.static("public"));

// Socket.IO detecta cada vez que un navegador se conecta.
io.on("connection", (socket) => {

    // socket.id es un identificador único generado
    // automáticamente para cada conexión.
    console.log("Usuario conectado:", socket.id);

    // Se ejecuta cuando el usuario pierde o cierra la conexión.
    socket.on("disconnect", (reason) => {

        // Por ahora mostramos solamente el identificador
        // y el motivo de desconexión.
        console.log("Usuario desconectado:", socket.id);
        console.log("Motivo:", reason);
    });
});

// Ponemos el servidor a escuchar en el puerto definido.
server.listen(PORT, () => {

    // Mensaje para confirmar que el servidor inició correctamente.
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});