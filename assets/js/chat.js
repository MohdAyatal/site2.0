/* ================================================================
   WHOLESALE BAAZAR — chat.js
   AI Chatbot (Groq fallback + offline mock replies)
   ================================================================ */

let chatOpen    = false;
let chatHistory = [];
let lastChatTime = 0;

// Set your Groq API key in app.js as: const apiKey = 'your_key';
// If not set, the chatbot uses smart offline fallback replies.

function toggleChat(){
  chatOpen = !chatOpen;
  document.getElementById('chatPanel').classList.toggle('open', chatOpen);
  document.getElementById('chatFab').textContent = chatOpen ? '✕' : '💬';
  if(chatOpen) setTimeout(()=>document.getElementById('chatInput').focus(), 80);
}

async function sendChat(){
  const input = document.getElementById('chatInput');
  const msg   = input.value.trim();
  if(!msg) return;
  if(Date.now() - lastChatTime < 1500){ showToast(null,'Please wait a moment'); return; }
  lastChatTime = Date.now();
  input.value = '';
  appendMsg(msg, 'user');
  chatHistory.push({ role:'user', content:msg });
  const typing = document.getElementById('chatTyping');
  typing.classList.add('visible');

  const freeShipping = (typeof storeSettings !== 'undefined') ? storeSettings.freeShipping : 999;

  if(typeof apiKey !== 'undefined' && apiKey && apiKey !== ''){
    try {
      const systemPrompt = `You are a helpful customer support assistant for Wholesale Baazar, a wholesale fashion store in Prayagraj, India.
Store info: Phone +91 88401 30533, Email wholesalebaazar.support@gmail.com, Address: Ground Floor Anwar Market, Jhunsi, Prayagraj. Hours: Mon-Sat 9AM-8PM.
Products: Men's fashion (₹599-₹4999), Women's (₹599-₹4999), Kids (₹499-₹1499), Home & Kitchen (₹399-₹4999), Supplements (₹299-₹3499).
MOQ: 10 pieces per style. Free shipping above ₹${freeShipping}. Delivery: 3-5 business days. Payment: COD and Razorpay. 7-day returns.
Keep replies short, friendly and under 3 sentences. Use emojis sparingly. Always respond in the same language the customer uses.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role:'system', content: systemPrompt },
            ...chatHistory.slice(-8)
          ],
          max_tokens: 200,
          temperature: 0.6
        })
      });
      if(!response.ok) throw new Error('API error ' + response.status);
      const data  = await response.json();
      const reply = data.choices?.[0]?.message?.content || mockReply(msg);
      chatHistory.push({ role:'assistant', content: reply });
      typing.classList.remove('visible');
      appendMsg(reply, 'bot');
    } catch(err){
      console.warn('Groq error:', err);
      typing.classList.remove('visible');
      appendMsg(mockReply(msg), 'bot');
    }
  } else {
    setTimeout(()=>{ typing.classList.remove('visible'); appendMsg(mockReply(msg), 'bot'); }, 700);
  }
}

function mockReply(msg){
  const freeShipping = (typeof storeSettings !== 'undefined') ? storeSettings.freeShipping : 999;
  const m = msg.toLowerCase();
  if(/^(hi|hello|hey|namaste|hii|helo)/.test(m))
    return "Hey! 👋 Welcome to <strong>Wholesale Baazar</strong> – Prayagraj's trusted wholesale fashion supplier. How can I help you today?";
  if(/bulk|wholesale|moq|minimum order/.test(m))
    return "Minimum order quantity (MOQ) starts at <strong>10 pieces</strong> per style. For bulk orders above 50 pieces, call us for special pricing! 📞 +91 88401 30533";
  if(/men|shirt|blazer|trouser/.test(m))
    return "Our <strong>Men's</strong> collection has 17 items — Oxford Shirts (₹1,299), Blazers (₹4,999) and more. Click 'Men' in the menu to browse!";
  if(/women|dress|saree|kurti|lehenga/.test(m))
    return "Explore <strong>Women's</strong>: Banarasi Silk Sarees (₹3,999), Embroidered Kurtis (₹899), Floral Dresses (₹1,899) and more!";
  if(/kids|toy|school|child|baby/.test(m))
    return "<strong>Kids'</strong> range: school uniforms, princess dresses, joggers — all ₹499–₹1,499.";
  if(/home|kitchen|utensil|appliance/.test(m))
    return "Our <strong>Home & Kitchen</strong> section has premium cookware, storage and decor items. Browse using the top menu!";
  if(/supplement|protein|gym|fitness|creatine/.test(m))
    return "We stock top supplements — Whey Protein (₹3,499), Creatine (₹899), Pre-Workout (₹1,499) and more in our Supplements section!";
  if(/price|cost|cheap|afford|rate/.test(m))
    return "Prices start at <strong>₹299</strong>! Free shipping on orders above ₹"+freeShipping+". Wholesale rates available on bulk orders.";
  if(/size|fit|sizing/.test(m))
    return "Adults: XS–XXL. Kids: 2Y–12Y. Select your size in the product card!";
  if(/return|refund|exchange/.test(m))
    return "<strong>7-day</strong> hassle-free returns on all items. Email wholesalebazaar.support@gmail.com or WhatsApp +91 88401 30533.";
  if(/deliver|ship|courier/.test(m))
    return "We deliver PAN India. Standard delivery 3–5 business days. Free shipping above ₹"+freeShipping+"!";
  if(/pay|payment|razorpay|upi|cod/.test(m))
    return "We accept <strong>Cash on Delivery (COD)</strong> and <strong>Online Payment</strong> via Razorpay (UPI, cards, net banking). Choose at checkout!";
  if(/discount|coupon|sale|offer/.test(m))
    return "Check <strong>SALE</strong> badges on products for discounts up to 20%! For bulk order discounts, call +91 88401 30533.";
  if(/contact|support|help|phone|whatsapp/.test(m))
    return "📧 wholesalebazaar.support@gmail.com<br>📞 +91 88401 30533 (Mon–Sat 9am–8pm)<br>📍 Ground Floor Anwar Market, Jhunsi, Prayagraj";
  if(/location|address|where|prayagraj|allahabad/.test(m))
    return "We're at <strong>Ground Floor, Anwar Market, Jhunsi, Prayagraj</strong>. Visit Mon–Sat 9AM–8PM!";
  if(/gst|invoice|bill/.test(m))
    return "Yes, we provide GST invoices on all bulk orders. Share your GSTIN when placing your order.";
  if(/dealer|reseller|franchise|agent/.test(m))
    return "We offer dealer registration with up to 20% discount on MOQ 10 pcs. Click <strong>Become a Dealer</strong> in the Contact section!";
  if(/track|order status|order id/.test(m))
    return "Use the 🔍 <strong>Track Order</strong> button in the cart / menu. Enter your Order ID (e.g. WB2604-XKP-Q7MR) to check status!";
  return "I'm here to help! Ask me about products, bulk pricing, sizes, shipping, returns or payment. You can also WhatsApp us at <strong>+91 88401 30533</strong>. 🙂";
}

function appendMsg(text, role){
  const msgs = document.getElementById('chatMessages');
  const div  = document.createElement('div');
  div.className = 'chat-msg ' + role;
  div.innerHTML = role === 'bot' ? sanitizeMD(text) : escapeHtml(text);
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function sanitizeMD(t){
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,'<em>$1</em>')
    .replace(/\n/g,'<br>');
}

function escapeHtml(t){ return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
