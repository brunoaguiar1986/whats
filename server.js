const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public")); // coloque o HTML/JS/CSS dentro da pasta "public"

let usuarios = {}; // {nome: {foto, ultimaAtividade}}

io.on("connection", (socket) => {

  socket.on("usuario entrou", (dados) => {
    usuarios[dados.nome] = { foto: dados.foto, ultimaAtividade: Date.now() };
    io.emit("usuario entrou", { nome: dados.nome });
  });

  socket.on("atualiza foto", (dados) => {
    if (usuarios[dados.nome]) usuarios[dados.nome].foto = dados.foto;
    io.emit("atualiza foto", dados);
  });

  socket.on("chat message", (dados) => {
    if (usuarios[dados.nome]) usuarios[dados.nome].ultimaAtividade = Date.now();
    io.emit("chat message", dados);
  });

  // Emitir status de atividade a cada 5s
  setInterval(() => {
    for (let nome in usuarios) {
      io.emit("atualiza status", {
        nome,
        ultimaAtividade: usuarios[nome].ultimaAtividade
      });
    }
  }, 5000);
});

http.listen(3000, () => console.log("Servidor rodando na porta 3000"));
