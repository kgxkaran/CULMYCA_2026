import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer , {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173' }
});

//Middlewares
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

//Health check
app.get('/api/health' , (req,res)=>{
    res.json({
        status : "Ok",
        message : "Api running !! " 
    });
});

//socket.io
io.on('connection' , (socket)=>{
    console.log('User connected:', socket.id);
    socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

//DB+Server start
const PORT = process.env.PORT || 5000;
mongoose
.connect(process.env.MONGO_URL)
.then(() => {
    console.log("Connection successful");
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => {
    console.error("Error Db connection failed : " , err);
});
