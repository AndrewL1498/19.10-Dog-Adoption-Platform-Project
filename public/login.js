document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorEl = document.getElementById("loginError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // prevent full page reload

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch("/login", { //fetch means make a request, either get or post
        method: "POST", //in this case we are posting data to the server
        headers: { // headers provide information about the request
          "Content-Type": "application/json", // we are sending JSON data
        },
        body: JSON.stringify({ username, password }), // stringifies our request body to JSON format
        credentials: "include", // tells fetch to include cookies in the request
      });

      const data = await res.json(); // parse the JSON response for the frontend to use

      if (!res.ok) { // the response object exists even if there is an error. ok is true if status is 200-299 and false otherwise
        errorEl.textContent = data.error || "Login failed"; //set the text content of the error element in login.ejs to the error message from the server or a default message
        return;
      }

      errorEl.textContent = ""; // clear any previous error messages on successful login
      // alert("Login successful!"); // display a success message
      window.location.href = "/"; // tells the browser to navigate to the dashboard page after successful login
    } catch (err) {
      console.error("Login error:", err);
      errorEl.textContent = "An error occurred. Please try again.";
    }
  });
});
