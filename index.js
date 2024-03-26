const express = require("express");
const rootrouter = require("./api/index");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const { MONGO_URL } = require("../backend/config")
mongoose.connect(MONGO_URL).then(() => {
    console.log("database connected");
});
const morgan = require("morgan");
var cors = require('cors');
const { middleauth } = require("./middleware");

const app = express();
app.use(cors());
app.use(morgan('combined'))
app.use(express.json());

app.use("/api/v1", rootrouter);

app.listen(3000,()=>{
    console.log("Server Started");
});
