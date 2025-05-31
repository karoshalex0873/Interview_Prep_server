import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './config/data-source';
import authRoutes from './routes/authRoutes';
import promtRoutes from './routes/promtRoutes';
import cookieParser from "cookie-parser";
import cors from 'cors'


dotenv.config();

//instace of express
const app = express();


// load port from .env
const PORT = process.env.PORT

// middleware to parse json request bodies
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// the cors options
app.use(cors({
  origin:["http://localhost:3001"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials:true
}))


app.get('',(req,res)=>{
  res.send("Welcome to the server !");
})
// Authentication router
app.use('/api/v1/auth',authRoutes)

//router for post
// app.use('/api/v1/post',postRoutes)

//router for questions
app.use('/api/v1/questions',promtRoutes)

AppDataSource.initialize()
.then(()=>console.log("🚀 Database connected succsefully"))
.catch((error)=>console.log("Database connection error:",error))

// start server

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});





