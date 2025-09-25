// public/signup.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");
  const errorEl = document.getElementById("signupError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // prevent full page reload

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch("/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        errorEl.textContent = data.error || "Signup failed";
        return;
      }

      errorEl.textContent = "";
      alert("Signup successful! Please log in.");
      window.location.href = "/login"; // redirect after success
    } catch (err) {
      console.error("Signup error:", err);
      errorEl.textContent = "An error occurred. Please try again.";
    }
  });
});
