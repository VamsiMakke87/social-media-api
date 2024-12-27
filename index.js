const express= require('express');
const mongoose= require('mongoose');
const dotenv= require('dotenv');
const morgan=require('morgan');
const helmet= require('helmet');
const userRoute= require("./routes/users");
const authRoute=require('./routes/auth');

const app=express();
dotenv.config();

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

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use("/api/users",userRoute);
app.use('/api/auth',authRoute)


app.listen(8800,()=>{
    console.log("Server started");
});