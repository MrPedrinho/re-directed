const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const { join } = require("path");
const { unwatchFile } = require("fs");


process.env.MONGO_URI="mongodb+srv://BobinBieber:WalterWhite88@webdev.vmsax.mongodb.net/URLShortener?retryWrites=true&w=majority";

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology:true});
const db = mongoose.connection;

const URL_Schema = new mongoose.Schema({
    original: {
        type: String,
        required:true
    },
    code: {
        type: String,
        required:true
    }
})

const userSchema = new mongoose.Schema({
    token: {type: Number, required: true},
    redirects: [Array]
})

const URL = mongoose.model("URL", URL_Schema);
const User = mongoose.model("User", userSchema);

function generateCode(template) {
    var r = '', ch, n;
    for (var i = 0; i < template.length; i++) {
        ch = template.substr(i, 1);
        if (ch == "d") {
            r += parseInt(Math.random() * 10);
        } else if (ch == "A") {
            r += String.fromCharCode(65 + parseInt(Math.random() * 26));
        } else if (ch == "w") {
            n = parseInt(Math.random() * 36);
            if (n > 9) {
                r += String.fromCharCode(55 + n);
            } else {
                r += n;
            }
        } else {
            r += ch;
        }
    }
    return r;
};

var currentCode

async function getCode() {
    do {
        var gotIt = true
        var nCode = generateCode("wAddd");
        currentCode = nCode
        await URL.find({code: nCode}, (err,data) => {
            if (!data.length > 0) {
                gotIt = false
            }
        })
    } while (!gotIt)
    return currentCode;
}

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname+"/public"));

app.get("/", (req,res) => {
    res.sendFile(__dirname + "/home.html")
})

app.get("/public/style.css", (req,res) => {
    res.sendFile(__dirname + "/public/style.css")
})

app.get("/public/app.js", (req,res) => {
    res.sendFile(__dirname + "/public/app.js")
})

app.post("/shorten", (req,res) => {
    if (req.body.customCode.trim().length > 0) {
        URL.findOne({code: req.body.customCode}, async (err,data) => {
            if (!err) {
                if (data) {
                    res.json({error: "Code exists"});
                } else {
                    var newCode = req.body.customCode.trim()
                    var newRedirect = new URL({
                        original: req.body.sendingURL,
                        code: newCode
                    })
                    newRedirect.save((err,data) => {
                        if (!err) {
                            User.findOneAndUpdate({
                               token: req.body.token 
                            }, {
                                $push: {redirects: {
                                    original: req.body.sendingURL,
                                    code: newCode
                                }}
                            }, {useFindAndModify: false, returnOriginal:false},
                            (err,doc) => {
                                if (!err) {
                                    res.json({
                                        original: data.original,
                                        code: data.code
                                    })
                                }
                            });
                        }
                    })
                }
            }
        })     
    } else {
        getCode()
        var newRedirect = new URL({
            original: req.body.sendingURL,
            code: currentCode
        })
        newRedirect.save((err,data) => {
            User.findOneAndUpdate({
                token: req.body.token
            }, {
                $push: {redirects: {
                    original: req.body.sendingURL,
                    code: currentCode
                }}
            }, {useFindAndModify: false, returnOriginal:false},
            (err,doc) => {
                if (!err) {
                    res.json({
                        original: data.original,
                        code: data.code
                    })
                }
            });
        })
    }
})

app.post("/check", (req,res) => {
    URL.findOne({code: req.body.code.trim()}, (err,data) => {
        if (!err) {
            if (data) {
                res.json({used: true})
            } else {
                res.json({used: false})
            }
        }
    })
})

app.get("/go/:code", (req,res) => {
    URL.findOne({code: req.params.code}, (err,data) => {
        if (!err) {
            if (data) {
                res.redirect(data.original)
            } else {
                res.sendFile(__dirname + "/public/tricked.html")
            }
        }
    })
})

app.get("/newtoken", (req,res) => {
    User.find({})
        .sort({token: "desc"})
        .exec((err,data) => {
            if (!err) {
                var ntoken
                if (data.length !== 0) {
                    ntoken = data[0].token + 1
                } else {
                    ntoken = 1
                }
                var newUser = new User({
                    token: ntoken,
                    redirects: []
                })
                newUser.save((err,doc) => {
                    if (!err) {
                        doc.token = doc.token.toString()
                        res.json({token: doc.token})
                    }
                })
            }
        })
})

app.post("/redirects", (req,res) => {
    User.findOne({token: req.body.token}, (err,data) => {
        if (!err) {
            if (data) {
                res.json(data.redirects)
            }
        }
    })
})

app.listen(process.env.PORT || 5000, () => {
    console.log("Listening on http://localhost:5000");
})