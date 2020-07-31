const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

const PORT = 3000;

const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//app.use(express.static("public"));
app.use(express.static(__dirname + "/Develop/public"));

mongoose.connect("mongodb://localhost/budget", {
  useNewUrlParser: true,
  useFindAndModify: false
});

// routes
app.use(require("./Develop/routes/api.js"));

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/Develop/public/index.html');
});