const express= require('express');
const mongoose= require('mongoose');
const dotenv= require('dotenv');
const morgan=require('morgan');
const helmet= require('helmet');
const userRoute= require("./routes/users");
const authRoute=require('./routes/auth');
const postRoute=require('./routes/post');
const commentRoute=require('./routes/comment');
const replyRouter= require('./routes/replies');
const cors=require("cors");
const {Server} = require('socket.io');
const http= require('http');
const authenticateJWT = require('./middleware/authMiddleware');

const app=express();
dotenv.config();
const server= http.createServer(app);
const io= new Server(server,{
    cors:{
        origin: 'http://localhost:3000',
        methods: ['GET','POST','PUT','DELETE']
    }
});

const connectDB = (async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('DB connected');
    } catch (error) {
        console.error('Error connecting to the database', error);
        process.exit(1); // Exit process with failure
    }
})();
// connectDB();

app.use(cors({
    origin: process.env.SOCKET_URL,
  }));
  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan("common"));
app.use('/api/auth',authRoute);
app.use("/api/users",authenticateJWT,userRoute);
app.use('/api/posts',authenticateJWT,postRoute);
app.use('/api/comment',authenticateJWT,commentRoute);
app.use('/api/comment/reply',authenticateJWT,replyRouter);

io.on('connection',(socket)=>{
    console.log('Connected: ',socket.id);

    socket.on('send_msg',(data)=>{
        console.log('Message received:', data);
        socket.broadcast.emit("recieve_msg", `Server says: ${data}`);
    });
    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
      });
});



server.listen(8800,()=>{
    console.log("Server started");
});