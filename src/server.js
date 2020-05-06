const express = require('express');
const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');

const PORT = 8000;
const DB_PATH = 'DB.json';

let chat;
try {
  chat = JSON.parse(fs.readFileSync(DB_PATH));
} catch (e) {
  chat = [];
  save();
}

let rooms = [];
for (var i = 0; i < chat.length; i++) {
  rooms.push(chat[i].room)
}

function save() {
  return new Promise((resolve, reject) => {
    fs.writeFile(DB_PATH, JSON.stringify(chat), function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('User Connected');

  socket.on('get_rooms', () => {
    socket.emit('rooms', rooms);
  });

  socket.on('join', (room) => {
    socket.join(room, () => {
      console.log(room);
      for (var i = 0; i < chat.length; i++) {
        if (chat[i].room === room) {
          socket.emit('messages', chat[i].messages)
        };
      };
    });
  });

  socket.on('new_message', (data) => {
    console.log("message received");
    console.log(data.room);
    let message = {
      username: data.username,
      content: data.content
    };
    socket.broadcast.to(data.room).emit('message', data);
    for (var i = 0; i < chat.length; i++) {
      if (chat[i].room === data.room) {
        chat[i].messages.push(message);
        console.log(chat[i].messages.length);
      }
    }
    save();
  });

  socket.on('create_room', (data) => {
    let new_room = {
      room: data,
      messages: []
    }

    chat.push(new_room);
    rooms.push(data);
    save();
    socket.emit('rooms', rooms);
  });

  socket.on('delete', (data) => {
    console.log('delete ' + data);

    let deletedRoom = rooms.indexOf(data);
    console.log(deletedRoom);

    if (deletedRoom > 0) {
      chat.splice(deletedRoom, 1);
      rooms.splice(deletedRoom, 1);
      console.log(rooms.length);
      save();
      socket.emit('rooms', rooms);
    } else if (deletedRoom === 0) {
      chat.shift();
      rooms.shift();
      save();
      socket.emit('rooms', rooms);
    };
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected');
  });
});

http.listen(PORT, () => {
 console.log('listening on ' + PORT);
});
