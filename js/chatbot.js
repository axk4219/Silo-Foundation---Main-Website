/* ============================================
   S.I.L.O. Foundation AI Chatbot
   Floating bubble + chat window UI
   Powered by Claude API via n8n webhook proxy
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initChatbot();
});

function initChatbot() {
  const bubble = document.getElementById('chatbot-toggle');
  const window_ = document.getElementById('chatbot-window');
  const closeBtn = document.getElementById('chatbot-close');
  const input = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send');
  const messages = document.getElementById('chatbot-messages');

  if (!bubble || !window_) return;

  // Restore conversation history from sessionStorage
  let conversationHistory = JSON.parse(sessionStorage.getItem('silo_chat_history') || '[]');

  // N8N webhook URL
  const WEBHOOK_URL = 'https://n8n.srv1426838.hstgr.cloud/webhook/silo-chatbot';

  // Restore previous messages into the chat window
  const savedMessages = sessionStorage.getItem('silo_chat_messages');
  if (savedMessages) {
    messages.innerHTML = savedMessages;
    messages.scrollTop = messages.scrollHeight;
  }

  // Restore chat window open/closed state
  if (sessionStorage.getItem('silo_chat_open') === 'true') {
    window_.classList.add('active');
    bubble.style.display = 'none';
  }

  // Toggle chat window
  bubble.addEventListener('click', () => {
    window_.classList.toggle('active');
    if (window_.classList.contains('active')) {
      bubble.style.display = 'none';
      sessionStorage.setItem('silo_chat_open', 'true');
      input.focus();
    }
  });

  // Close chat
  closeBtn.addEventListener('click', () => {
    window_.classList.remove('active');
    bubble.style.display = 'flex';
    sessionStorage.setItem('silo_chat_open', 'false');
  });

  // Send message
  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    conversationHistory.push({ role: 'user', content: text });
    saveSession();
    input.value = '';

    showTyping();

    if (WEBHOOK_URL) {
      fetchBotResponse(text);
    } else {
      // Fallback: local responses for demo without n8n
      setTimeout(() => {
        removeTyping();
        const response = getLocalResponse(text);
        addMessage(response, 'bot');
        conversationHistory.push({ role: 'assistant', content: response });
        saveSession();
      }, 1000 + Math.random() * 1000);
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Save conversation state to sessionStorage
  function saveSession() {
    sessionStorage.setItem('silo_chat_history', JSON.stringify(conversationHistory));
    sessionStorage.setItem('silo_chat_messages', messages.innerHTML);
  }

  // Add message to chat
  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `chatbot-msg chatbot-msg--${sender}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  // Typing indicator
  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'chatbot-typing';
    typing.id = 'chatbot-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {
    const typing = document.getElementById('chatbot-typing');
    if (typing) typing.remove();
  }

  // Fetch response from n8n webhook
  async function fetchBotResponse(text) {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: conversationHistory.slice(-10) // Last 10 messages for context
        })
      });

      if (!response.ok) throw new Error('Network error');

      const data = await response.json();
      removeTyping();

      const botReply = data.reply || data.message || "I'm sorry, I couldn't process that. Please try again!";
      addMessage(botReply, 'bot');
      conversationHistory.push({ role: 'assistant', content: botReply });
      saveSession();

    } catch (err) {
      removeTyping();
      addMessage("I'm having trouble connecting right now. Please try again or contact us at Thesilofoundation@gmail.com or 631-357-1726.", 'bot');
    }
  }

  // Local fallback responses (for demo without n8n)
  function getLocalResponse(text) {
    const lower = text.toLowerCase();

    if (lower.includes('donat') || lower.includes('give') || lower.includes('money') || lower.includes('contribute')) {
      return "Thank you for wanting to donate! You can make a donation through our Zeffy page. Visit our Donate page or go directly to zeffy.com/fundraising/2025-boobies. Every dollar goes toward breast cancer awareness!";
    }

    if (lower.includes('event') || lower.includes('festival') || lower.includes('music') || lower.includes('concert')) {
      return "Our biggest event is the 14th Breast Cancer Charity Music Festival on August 2nd at 485 Lake Ave, St. James, NY 11780! We also have the Bra-Tender competition in July and Toys for Shots during the holidays. Check our Events page for details!";
    }

    if (lower.includes('bra-tender') || lower.includes('bartender') || lower.includes('bar')) {
      return "The Bra-Tender competition runs throughout July! As many as 30 establishments compete to raise the most money for the Stony Brook Cancer Foundation. Want to participate? Head to our Contact page!";
    }

    if (lower.includes('store') || lower.includes('merch') || lower.includes('shirt') || lower.includes('tank') || lower.includes('buy') || lower.includes('shop')) {
      return "We have awesome merchandise! Check out our Black Tank Top, Boobies White Tee, and Pink Tank Tops. Visit our Store page or email Thesilofoundation@gmail.com to place an order. 100% of proceeds go to the cause!";
    }

    if (lower.includes('volunteer') || lower.includes('help') || lower.includes('involved') || lower.includes('join')) {
      return "We'd love your help! Whether you want to volunteer at events, become a sponsor, or just spread the word, reach out to us at Thesilofoundation@gmail.com or call 631-357-1726. You can also fill out our Contact form!";
    }

    if (lower.includes('about') || lower.includes('who') || lower.includes('mission') || lower.includes('silo') || lower.includes('foundation')) {
      return "S.I.L.O. stands for Swan Is Love Outreach Foundation L.T.D. We're a breast cancer non-profit on Long Island, NY, founded by Sequwan Olivera, Jeffery Comiskey, and Ethan Carpenter. For 14+ years, we've been fighting cancer through community events and fundraising. Visit our About page to learn more!";
    }

    if (lower.includes('contact') || lower.includes('phone') || lower.includes('email') || lower.includes('reach')) {
      return "You can reach us at:\nPhone: 631-357-1726\nEmail: Thesilofoundation@gmail.com\nFacebook: ComiskeyParkLovesBoobies\nInstagram: @thesilofoundation\nOr use our Contact form!";
    }

    if (lower.includes('sponsor')) {
      return "Interested in sponsoring one of our events? We'd love to partner with you! Contact us at Thesilofoundation@gmail.com for sponsorship packages and benefits. Your support makes a huge difference!";
    }

    if (lower.includes('member') || lower.includes('membership')) {
      return "Become a S.I.L.O. member and get exclusive access to events! You can sign up through our Donate page via Zeffy. Welcome to the family!";
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('good')) {
      return "Hey there! Welcome to the S.I.L.O. Foundation! I'm here to help you learn about our events, donate, volunteer, or get in touch. What would you like to know?";
    }

    if (lower.includes('thank')) {
      return "You're welcome! Thank you for your interest in the S.I.L.O. Foundation. Together we can make a difference in the fight against breast cancer!";
    }

    return "Great question! I can help you with information about our events, donations, store, volunteering, or the foundation. What would you like to know more about? You can also reach us directly at Thesilofoundation@gmail.com or 631-357-1726.";
  }
}
