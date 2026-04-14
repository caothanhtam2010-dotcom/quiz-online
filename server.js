const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let rooms = {};

function createPIN() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

io.on("connection", (socket) => {

    socket.on("createRoom", () => {
        const pin = createPIN();
        rooms[pin] = { players: {}, scores: {} };
        socket.join(pin);
        socket.emit("roomCreated", pin);
    });

    socket.on("joinRoom", ({pin, name}) => {
        if (rooms[pin]) {
            rooms[pin].players[socket.id] = name;
            rooms[pin].scores[name] = 0;
            socket.join(pin);
            io.to(pin).emit("updatePlayers", Object.values(rooms[pin].players));
        }
    });

    socket.on("answer", ({pin, name, correct}) => {
        if (correct) rooms[pin].scores[name] += 10;
        io.to(pin).emit("scoreUpdate", rooms[pin].scores);
    });

});

http.listen(3000);