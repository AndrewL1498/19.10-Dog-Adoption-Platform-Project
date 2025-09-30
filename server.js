const app = require("./app");
const { connectDb } = require("./db");

connectDb()
  .then(() => {
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error("Server not started due to DB connection error:", err));