const express = require('express');
const { Socket } = require('socket.io');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);


app.get('/', (req,res) => {
    res.sendFile(__dirname+"/index.html");
});

const connectedUsers = [];

io.on("connection", socket => {
    console.log("a user connected");
    let userName = "";
    updateUserName();

    //login 
    socket.on("login", (name,callback) => {
      //check is duplicate name
      const isDuplicate = connectedUsers.length >1 ? false: connectedUsers.some( user => user === name);

      console.log(name);
        if(name.trim().length === 0) {
          loginResult("name cannot be empty");
           //return wil end this process
          return;
        }

        if(isDuplicate) {
          loginResult("name has been duplicate");
          //return wil end this process
          return;
        }

        callback(true);
        userName = name;
        connectedUsers.push(userName);
        // console.log(connectedUsers);

        updateUserName();
    });

    
    //receive chat message
    socket.on("chat message", msg => {

      if(msg.trim().length === 0) {
        return;
      }
      
      io.emit('chat history', {
        name:userName,
        msg:msg
      });
    });
    
    //Disconnect
    socket.on("disconnect", () => {
        console.log("user disconnected");
        const index = connectedUsers.indexOf(userName);
        if(index !== -1) {
          connectedUsers.splice(index,1);
        }
        // console.log(connectedUsers);
        updateUserName();
    });
    
    //update username
    function updateUserName() {
      io.emit('loadUser', connectedUsers,userName)
    }

    function loginResult(msg) {
      socket.emit("login result", msg);
    }

    
});

const port = process.env.PORT || 5000;

server.listen(port,()=> console.log(`Server running on port ${port}`));