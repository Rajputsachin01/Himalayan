require("dotenv").config()
const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require('./src/utils/db');
connectDB();
const bodyParser = require("body-parser");
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));

const userRoutes = require('./src/routes/userRoutes')
const adminRoutes = require('./src/routes/adminRoutes')
const targetRoutes = require('./src/routes/targetRoutes')
const hotelRoutes = require('./src/routes/hotelRoutes')
const driverRoutes = require('./src/routes/driverRoutes')
const vehicleRoutes = require('./src/routes/vehicleRoutes')
const taskRoutes = require('./src/routes/taskRoutes')
const vehicleAssignmentRoutes = require('./src/routes/vehicleAssignRoutes')
const uploadRoutes = require('./src/routes/uploadRoutes')

app.use("/v1/upload",uploadRoutes)
app.use("/v1/user",userRoutes)
app.use("/v1/admin",adminRoutes)
app.use("/v1/target",targetRoutes)
app.use("/v1/hotel",hotelRoutes)
app.use("/v1/vehicle",vehicleRoutes)
app.use("/v1/vehicleAssignment",vehicleAssignmentRoutes)
app.use("/v1/driver",driverRoutes)
app.use("/v1/task",taskRoutes)

app.get("/",(req,res)=>{
    res.send("Server is Active")
})
const PORT=process.env.PORT ||5910;
app.listen(PORT,()=>{
    console.log(`Server is Running On http://localhost:${PORT}`);
})
