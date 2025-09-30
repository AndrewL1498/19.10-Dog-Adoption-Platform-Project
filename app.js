

const express = require('express');
const authRoutes = require('./routes/authRoutes');
const { connectDb } = require('./db');
const cookieParser = require('cookie-parser');
const dogRoutes = require('./routes/dogRoutes');
const ExpressError = require('./helpers/expressError');

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

app.use('/', authRoutes);
app.use('/dogs', dogRoutes);

app.use((req, res, next) => {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

// General error handler
app.use((err, req, res, next) => {
  // If it's a validation error from Mongoose, convert it to 400
  if (err.name === "ValidationError") err.status = 400;

  res.status(err.status || 500);

  // You can choose JSON or HTML response depending on your API vs EJS usage
  if (req.originalUrl.startsWith("/dogs")) {
    // EJS rendering
    return res.render("error", { error: err });
  } else {
    // JSON API
    return res.json({
      error: err,
      message: err.message
    });
  }
});

// Database connection
connectDb()
  .then(() => {
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error("Server not started due to DB connection error:", err));