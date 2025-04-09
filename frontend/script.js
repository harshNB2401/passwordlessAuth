document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.querySelector("#email").value;

    try {
        const response = await fetch("http://localhost:3000/send-link", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            throw new Error("Failed to send magic link");
        }

        const data = await response.json();
        alert("✅ Magic link sent to your email!");
        console.log("📩 Success:", data);
    } catch (error) {
        console.error("❌ Request failed:", error);
        alert("❌ Error sending magic link. Try again.");
    }
});

// ✅ Function to check for token in URL and verify login
async function checkAuthToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) return; // No token found, skip authentication

    try {
        const response = await fetch(`http://localhost:3000/auth?token=${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
            console.log("✅ Login Successful! Redirecting...");

            // ✅ Save user session (optional, only if needed)
            localStorage.setItem("userToken", token);

            // ✅ Add a slight delay to ensure smooth redirection
            setTimeout(() => {
                window.location.href = "http://localhost:3000/dashboard";
            }, 1000);
        } else {
            throw new Error(data.error || "Invalid or expired token");
        }
    } catch (error) {
        console.error("❌ Authentication failed:", error);
        document.body.innerHTML = `<h1>❌ Error</h1><p>${error.message}</p>`;
    }
}

// ✅ Auto-check authentication on page load
checkAuthToken();
