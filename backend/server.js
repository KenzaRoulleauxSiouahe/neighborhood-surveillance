const express = require('express');
const mongoose = require("mongoose");

const app = express();

const port = process.env.PORT || 5000;

mongoose.connect("mongodb://localhost:27017/neighborhood-surveillance")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.get('/', (req, res) => {
  res.send('neighborhood Surveillance is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

