document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorEl = document.getElementById("loginError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // prevent full page reload

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include", // important for cookies!
      });

      const data = await res.json();

      if (!res.ok) {
        errorEl.textContent = data.error || "Login failed";
        return;
      }

      errorEl.textContent = "";
      alert("Login successful!"); // you can redirect instead
      window.location.href = "/dashboard"; // or wherever your app goes
    } catch (err) {
      console.error("Login error:", err);
      errorEl.textContent = "An error occurred. Please try again.";
    }
  });
});
