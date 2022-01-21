//Dependencies
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

//instructs which port the server will listen on
const PORT = process.env.PORT || 3000;

//initializes express
const app = express();

//middleware
app.use(logger("dev"));
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

//connects to mongoDB with the correct environment variable and connection string
mongoose.connect("mongodb://localhost/budget", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

// routes
app.use(require("./routes/api.js"));

//starts server
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});