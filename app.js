

const express = require('express');
const routes = require('./routes/routes');
const { connectDb } = require('./db');
const cookieParser = require('cookie-parser');

const app = express();
// const { connectToDb, getDb } = require('./db');

console.log("Routes file loaded");

app.use(express.json()); //middleware to parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // url encoded parses incoming form submissions. extended: true allows for nested objects
app.use(cookieParser()); //middleware to parse cookies from incoming requests
app.use(express.static('public')); // Serve static files from the "public" directory

// Optional: for EJS rendering
app.set('view engine', 'ejs'); //Tells Express: when you call res.render("something"), look for an .ejs file and process it through the EJS template engine. says to use the ejs as the view engine
app.set('views', `${__dirname}/views`); // the first argument views is the name of the setting we are configuring, the second argument is the path to the views directory

app.use('/', routes);

// Database connection
connectDb()
  .then(() => {
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error("Server not started due to DB connection error:", err));


