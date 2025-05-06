const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { Server } = require('socket.io');
const http = require('http')
const fs = require('fs');
// const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const User = require('./models/User');
const Message = require('./models/Message');
const users = {};






 








const PORT = 5000;
const SECRET = '666';


app.use(cors());

app.use(express.json());


// MongoDB Connect
mongoose.connect('mongodb+srv://brucerobert434:LiMoN003@cluster0.8obupn9.mongodb.net/usersdb?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log('MongoDB Connected (Atlas)'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Create a server instance
const server = http.createServer(app);

// Setup socket.io
const io = new Server(server, {
  cors: { origin: '*' }
});

const socketIo = require('socket.io');





// Socket connection for real-time chat
let activeUsers = [];








// User connect hole
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

    socket.on('register', (userId) => {
      users[userId] = socket.id;
      console.log(`${userId} online`);
  
      // pending message send
      Message.find({ receiver: userId, status: 'pending' })
        .then((messages) => {
          messages.forEach((message) => {
            io.to(socket.id).emit('newMessage', {
              sender: message.sender,
              content: message.content,
            });
  
            message.status = 'delivered';
            message.save();
          });
        });
    });
  
    socket.on('send-message', async (message) => {
      const { sender, receiver, content } = message;
  
      if (users[receiver]) {
        io.to(users[receiver]).emit('newMessage', { sender, receiver: receiver, content });
      } else {
        const newMessage = new Message({
          sender,
          receiver,
          content,
          status: 'pending',
          timestamp: new Date()
        });
        await newMessage.save();
      }
    });
  
    socket.on('disconnect', () => {
      for (const [userId, socketId] of Object.entries(users)) {
        if (socketId === socket.id) {
          delete users[userId];
          break;
        }
      }
      console.log('User disconnected');
    });
  });
  












const sendMessage = async () => {
  if (!content) return;
  console.log('Sending message...');

  try {
    const response = await axios.post('http://localhost:5000/message', {
      sender: user._id,
      receiver: selectedFriend._id,
      content,
    });

    console.log('Message sent:', response.data);

    socket.emit('send-message', {
      sender: user._id,
      receiver: selectedFriend._id,
      content,
    });

    setcontent('');
  } catch (err) {
    console.error('Error sending message:', err);
  }
  const { sender, receiver, content } = message;

  const newMessage = new Message({
    sender: sender,
    receiver: receiver,
    content,
    timestamp: new Date()
  });

  await newMessage.save();
  sender.messages.push(newMessage._id);
  receiver.messages.push(newMessage._id);

  await sender.save();
  await receiver.save();
};









app.get('/messages/:sender/:receiver', async (req, res) => {
  const { sender, receiver } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender }
      ]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
});



app.post('/message', async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;
const message = new Message({
  sender,
  receiver,
  content
});


    await message.save(); 
    res.status(200).send(message);
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).send({ error: 'Error saving message' });
  }
});





// Signup
app.post("/signup", async (req, res) => {
  console.log("Signup body:", req.body);  // ⬅️ Debug line

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(409).json({ message: "Name already exists" });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, SECRET);
    res.status(201).json({
      message: "Signup successful",
      user: newUser,
      token,
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Signup failed. Please try again" });
  }
});





// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login request:", email, password); 

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = password === user.password; 
    if (!isMatch) {
      console.log("Invalid password");
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, 'your_secret_key');
    res.json({ token, user });
  } catch (error) {
    console.error("Login Error:", error); 
    res.status(500).json({ message: 'Server error' });
  }
});

//  user status (active/suspend)
app.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id); // Use mongoose method to find user

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();  // Save the updated user status

    res.json({ message: `User status updated to ${user.status}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


//  Edit user profile
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password, profileImage } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.Name = name || user.Name;
    user.email = email || user.email;
    user.password = password || user.password;
    user.profileImage = profileImage || user.profileImage; 

    await user.save();
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find(); // Get all users from MongoDB
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Search user by ID
app.get('/users/id/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id); // Find user by ID
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});




// Start server
server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
