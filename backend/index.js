import express from "express";//importing express port
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/connectDB.js";
import router from "./routes/authRoutes.js";

dotenv.config(".env");////if we don't want to show the port directly we use .env file and from there we can access the things which we want to and hide it from the direct display

const PORT = process.env.PORT || 5001;

const app = express();//here we are giving all powers of express to app.
app.use(express.json());//it will convert all the data coming to app to json format

//coonect your Database
connectDB();

app.use(
    cors({
        origin: "http://localhost:5173",//origin: "*"
        credentials: true,
    })
);

app.use(cors());
app.get("/", (req, res) => {//here we are declaring the function with parameters request and response, here as per our requestest the response will be given
    res.status(200).json({message: "Server is Working."})
})//status(200) means "ok" server is working fine


app.use("/api/auth", router);


app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));