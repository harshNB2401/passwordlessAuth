document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('magicForm');
    const statusMessage = document.getElementById('statusMessage');
 
    // Array of creative success messages
    const successMessages = [
        'Link transmitted to your inbox!',
        'Magic link beamed to your email!',
        'Cyber portal unlocked—check your mail!',
        'Access granted. Email incoming!'
    ];
 
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.querySelector('input[name="email"]').value;
 
        // Show a loading state
        statusMessage.textContent = 'Transmitting...';
        statusMessage.style.opacity = '1';
 
        try {
            const response = await fetch('/send-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ email })
            });
 
            if (response.ok) {
                // Random success message
                const randomMsg = successMessages[Math.floor(Math.random() * successMessages.length)];
                statusMessage.textContent = randomMsg;
                form.reset();
                setTimeout(() => {
                    statusMessage.style.opacity = '0';
                }, 5000);
            } else {
                statusMessage.textContent = 'Transmission failed. Retry!';
                statusMessage.style.color = '#ff3333';
                setTimeout(() => {
                    statusMessage.style.opacity = '0';
                    statusMessage.style.color = '#ffffff'; // Reset color
                }, 3000);
            }
        } catch (error) {
            console.error('Error:', error);
            statusMessage.textContent = 'System error. Check logs.';
            statusMessage.style.color = '#ff3333';
        }
    });
 });
 