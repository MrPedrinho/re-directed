const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const cors = require("cors");


process.env.MONGO_URI="mongodb+srv://BobinBieber:WalterWhite88@webdev.vmsax.mongodb.net/URLShortener?retryWrites=true&w=majority";

app.use(cors());
app.use(express.json());

app.get("/", (req,res) => {
    res.json({
        error: "GG"
    })
})

app.post("/shorten", (req,res) => {
    console.log(req.body);
})


app.listen(5000, () => {
    console.log("Listening on http://localhost:5000");
})