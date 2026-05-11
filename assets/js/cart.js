/* ================================================================
   WHOLESALE BAAZAR — cart.js
   Cart · Wishlist · Checkout · Toast · Order Tracker
   ================================================================ */

let cart     = JSON.parse(localStorage.getItem('wb_cart')    || '[]');
let wishlist = JSON.parse(localStorage.getItem('wb_wishlist')|| '[]');
let orders   = JSON.parse(localStorage.getItem('wb_orders')  || '[]');

function saveCart(){ localStorage.setItem('wb_cart', JSON.stringify(cart)); }

// ── CART ──
function addToCart(id, size){
  const p = allProducts.find(p => p.id === id);
  if(!p) return;
  const key = id + '-' + size;
  const ex = cart.find(i => i.key === key);
  if(ex) ex.qty++;
  else cart.push({...p, size, qty:1, key});
  saveCart();
  updateCartUI();
  showToast(p.img, `<b>${p.name}</b> (${size}) added`);
  trackEvent('add_to_cart', 'Ecommerce', p.name);
}

function removeFromCart(key){ cart = cart.filter(i => i.key !== key); saveCart(); updateCartUI(); }

function changeQty(key, d){
  const item = cart.find(i => i.key === key);
  if(!item) return;
  item.qty += d;
  if(item.qty <= 0) removeFromCart(key);
  else { saveCart(); updateCartUI(); }
}

function updateCartUI(){
  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s,i) => s + i.qty, 0);
  const cntEl = document.getElementById('cartCount');
  cntEl.textContent = count;
  cntEl.classList.toggle('visible', count > 0);
  document.getElementById('cartTotal').textContent = '₹' + total.toLocaleString('en-IN');
  const el = document.getElementById('cartItems');
  if(!cart.length){ el.innerHTML = '<p class="cart-empty">Your cart is empty.</p>'; return; }
  el.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.img}" alt="${item.name}" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">Size: ${item.size}</div>
        <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.key}',-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.key}',1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.key}')">✕</button>
    </div>`).join('');
}

function toggleCart(){
  document.getElementById('cartOverlay').classList.toggle('open');
  document.getElementById('cartSidebar').classList.toggle('open');
}

// ── WISHLIST ──
function toggleWishlistItem(id){
  const p = allProducts.find(p => p.id === id);
  if(!p) return;
  const idx = wishlist.findIndex(w => w.id === id);
  if(idx > -1){ wishlist.splice(idx,1); showToast(p.img,'Removed from wishlist'); }
  else { wishlist.push(p); showToast(p.img,`<b>${p.name}</b> wishlisted ♥`); }
  localStorage.setItem('wb_wishlist', JSON.stringify(wishlist));
  updateWishlistUI();
  if(typeof currentSection !== 'undefined' && currentSection) renderProducts(currentSection);
}

function updateWishlistUI(){
  const count = wishlist.length;
  const cntEl = document.getElementById('wishlistCount');
  cntEl.textContent = count;
  cntEl.classList.toggle('visible', count > 0);
  const el = document.getElementById('wishlistItems');
  if(!wishlist.length){ el.innerHTML = '<p class="wishlist-empty">Your wishlist is empty.</p>'; return; }
  el.innerHTML = wishlist.map(item => `
    <div class="wishlist-item">
      <img class="wishlist-item-img" src="${item.img}" alt="${item.name}" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
      <div class="wishlist-item-info">
        <div class="wishlist-item-name">${item.name}</div>
        <div class="wishlist-item-price">₹${item.price.toLocaleString('en-IN')}</div>
        <div class="wishlist-item-actions">
          <button class="wishlist-move-to-cart" onclick="moveToCart(${item.id})">Add to Cart</button>
          <button class="wishlist-remove" onclick="toggleWishlistItem(${item.id})">✕</button>
        </div>
      </div>
    </div>`).join('');
}

function moveToCart(id){ quickAddCart(id); }

function toggleWishlist(){
  document.getElementById('wishlistOverlay').classList.toggle('open');
  document.getElementById('wishlistSidebar').classList.toggle('open');
}

// ── CHECKOUT ──
function openCheckout(){
  if(!cart.length){ showToast(null,'Your cart is empty!'); return; }
  toggleCart();
  setTimeout(()=>{
    document.getElementById('checkoutModal').classList.add('open');
    document.getElementById('step1').classList.add('active');
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.remove('active');
  }, 400);
}

function closeCheckout(){ document.getElementById('checkoutModal').classList.remove('open'); }

function goStep2(){
  const name  = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const email = document.getElementById('custEmail').value.trim();
  const addr  = document.getElementById('custAddr').value.trim();
  const pin   = document.getElementById('custPin').value.trim();
  if(!name||!phone||!email||!addr||!pin){ showToast(null,'Please fill all fields'); return; }
  if(!/^\d{6}$/.test(pin)){ showToast(null,'Enter a valid 6-digit pincode'); return; }
  const summaryEl = document.getElementById('orderSummaryItems');
  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);
  summaryEl.innerHTML = cart.map(i => `
    <div class="summary-item">
      <span class="summary-item-name">${i.name} × ${i.qty} (${i.size})</span>
      <span>₹${(i.price*i.qty).toLocaleString('en-IN')}</span>
    </div>`).join('')
    + `<div class="summary-total"><span>Total</span><span>₹${total.toLocaleString('en-IN')}</span></div>`;
  document.getElementById('step1').classList.remove('active');
  document.getElementById('step2').classList.add('active');
}

function placeOrder(){
  const name  = sanitize(document.getElementById('custName').value.trim());
  const phone = sanitize(document.getElementById('custPhone').value.trim());
  const email = sanitize(document.getElementById('custEmail').value.trim());
  const addr  = sanitize(document.getElementById('custAddr').value.trim());
  const pin   = sanitize(document.getElementById('custPin').value.trim());
  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || 'cod';

  if(payMethod === 'razorpay'){
    if(RAZORPAY_KEY === 'rzp_test_YOUR_KEY_HERE' || typeof Razorpay === 'undefined'){
      showToast(null,'⚠ Razorpay key not set yet. Using COD instead.');
      finalizeOrder(name,phone,email,addr,pin,total,'COD');
      return;
    }
    const options = {
      key: RAZORPAY_KEY,
      amount: total * 100,
      currency: 'INR',
      name: 'Wholesale Baazar',
      description: 'Fashion Order',
      handler: function(response){
        finalizeOrder(name,phone,email,addr,pin,total,'Razorpay:'+response.razorpay_payment_id);
      },
      prefill: { name, email, contact: phone },
      theme: { color: '#FF9900' },
      modal: { ondismiss: function(){ showToast(null,'Payment cancelled. Order not placed.'); } }
    };
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function(response){ showToast(null,'Payment failed: '+response.error.description); });
    rzp.open();
  } else {
    finalizeOrder(name,phone,email,addr,pin,total,'COD');
  }
}

function finalizeOrder(name,phone,email,addr,pin,total,payMode){
  const orderId = (function(){
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const seg = n => Array.from({length:n},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
    const now = new Date();
    const yr  = now.getFullYear().toString().slice(-2);
    const mo  = String(now.getMonth()+1).padStart(2,'0');
    return 'WB'+yr+mo+'-'+seg(3)+'-'+seg(4);
  })();
  const order = {id:orderId,name,phone,email,address:addr+', '+pin,items:[...cart],total,status:'Pending',payMode,date:new Date().toLocaleString('en-IN')};
  orders.unshift(order);
  localStorage.setItem('wb_orders', JSON.stringify(orders));
  document.getElementById('finalOrderId').textContent = orderId;
  document.getElementById('step2').classList.remove('active');
  document.getElementById('step3').classList.add('active');
  const pSignin   = document.getElementById('postOrderSignin');
  const pLoggedIn = document.getElementById('postOrderLoggedIn');
  if(pSignin && pLoggedIn){
    if(typeof currentUser !== 'undefined' && currentUser){ pLoggedIn.style.display=''; pSignin.style.display='none'; }
    else { pSignin.style.display=''; pLoggedIn.style.display='none'; }
  }
  cart = [];
  saveCart();
  updateCartUI();
  trackEvent('purchase','Ecommerce',payMode+'_₹'+total);
  sendOrderConfirmationEmail(orderId,name,email,phone,total,payMode);
}

function copyOrderId(){
  const id = document.getElementById('finalOrderId').textContent;
  if(!id) return;
  navigator.clipboard?.writeText(id).then(()=>showToast(null,'📋 Order ID copied!')).catch(()=>{});
}

// ── TOAST ──
let toastTimer;
function showToast(imgSrc, html){
  const t = document.getElementById('toast');
  t.innerHTML = (imgSrc ? `<img class="toast-image" src="${imgSrc}" onerror="this.style.display='none'">` : '') + '<span>' + html + '</span>';
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2800);
}

// ── ORDER TRACKER ──
const TRACK_STEPS = [
  { key:'Pending',   icon:'📋', label:'Order Received',  sub:'We have received your order and are reviewing it.' },
  { key:'Packed',    icon:'📦', label:'Order Packed',     sub:'Your items have been packed and are ready for pickup.' },
  { key:'Shipped',   icon:'🚚', label:'Out for Delivery', sub:'Your order is on the way! Delivery in 1–2 days.' },
  { key:'Delivered', icon:'✅', label:'Delivered',        sub:'Your order has been delivered successfully.' }
];

function openTrackModal(prefillId){
  prefillId = prefillId || '';
  const overlay = document.getElementById('trackModalOverlay');
  overlay.classList.add('open');
  document.getElementById('trackInput').value = prefillId;
  if(prefillId) doTrackSearch();
  else renderAllOrders();
}

function closeTrackModal(){ document.getElementById('trackModalOverlay').classList.remove('open'); }

function handleTrackOverlayClick(e){
  if(e.target === document.getElementById('trackModalOverlay')) closeTrackModal();
}

function renderAllOrders(){
  const container = document.getElementById('trackAllOrders');
  const resultEl  = document.getElementById('trackResult');
  resultEl.classList.remove('show');
  if(!orders.length){
    container.innerHTML = '<div class="track-not-found"><div style="font-size:2.5rem;margin-bottom:.8rem">📭</div><p>No orders placed yet.</p><p style="font-size:.78rem;margin-top:.4rem">Place your first order and track it here!</p></div>';
    return;
  }
  container.innerHTML = '<p style="font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:.8rem;">Recent Orders — click to view details</p>'
    + '<div class="track-orders-list">'
    + orders.slice(0,8).map(o=>`
      <div class="track-order-card" onclick="showOrderDetail('${o.id}')">
        <div>
          <div style="font-size:.8rem;font-weight:700;color:var(--text);margin-bottom:.2rem;">${o.id}</div>
          <div style="font-size:.75rem;color:var(--muted);">${o.date} · ₹${o.total.toLocaleString('en-IN')} · ${o.items.length} item${o.items.length>1?'s':''}</div>
        </div>
        <span class="track-status-badge ${o.status}">${o.status}</span>
      </div>`).join('')
    + '</div>';
}

function doTrackSearch(){
  const val = document.getElementById('trackInput').value.trim().toUpperCase();
  document.getElementById('trackAllOrders').innerHTML = '';
  if(!val){ renderAllOrders(); return; }
  showOrderDetail(val);
}

function showOrderDetail(orderId){
  const resultEl  = document.getElementById('trackResult');
  const notFound  = document.getElementById('trackNotFound');
  const detailEl  = document.getElementById('trackOrderDetail');
  document.getElementById('trackAllOrders').innerHTML = '';
  resultEl.classList.add('show');
  const order = orders.find(o => o.id === orderId);
  if(!order){ notFound.style.display='block'; detailEl.innerHTML=''; return; }
  notFound.style.display = 'none';
  const statusIdx = TRACK_STEPS.findIndex(s => s.key === order.status);
  const timelineHtml = TRACK_STEPS.map((step,i)=>{
    const isDone   = i < statusIdx;
    const isActive = i === statusIdx;
    const cls      = isDone ? 'done' : isActive ? 'active-step' : '';
    const lineCls  = isDone ? 'done-line' : '';
    return `<div class="track-step ${cls}">
      <div style="position:relative;">
        <div class="track-step-dot">${isDone?'✓':step.icon}</div>
        <div class="track-step-line ${lineCls}"></div>
      </div>
      <div class="track-step-info">
        <div class="track-step-label">${step.label}</div>
        <div class="track-step-sub">${isActive||isDone ? step.sub : 'Waiting…'}</div>
      </div>
    </div>`;
  }).join('');
  const itemsHtml = order.items.map(i=>`
    <div class="track-item-row">
      <span>${i.name} <span style="color:var(--muted);">× ${i.qty}</span></span>
      <span style="color:var(--accent);font-family:'Playfair Display',serif;">₹${(i.price*i.qty).toLocaleString('en-IN')}</span>
    </div>`).join('');
  detailEl.innerHTML = `
    <div style="margin-bottom:1.2rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem;">
      <div>
        <div style="font-size:.68rem;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin-bottom:.25rem;">Order ID</div>
        <div style="font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;color:var(--accent);">${order.id}</div>
      </div>
      <span class="track-status-badge ${order.status}" style="font-size:.75rem;padding:.35rem .85rem;">${order.status}</span>
    </div>
    <div class="track-order-meta" style="margin-bottom:1.5rem;">
      <div class="track-order-meta-row"><span>Customer</span><span>${order.name}</span></div>
      <div class="track-order-meta-row"><span>Phone</span><span>${order.phone}</span></div>
      <div class="track-order-meta-row"><span>Address</span><span style="text-align:right;max-width:60%;">${order.address}</span></div>
      <div class="track-order-meta-row"><span>Payment</span><span>${order.payMode}</span></div>
      <div class="track-order-meta-row"><span>Date</span><span>${order.date}</span></div>
      <div class="track-order-meta-row"><span>Total</span><span style="color:var(--accent);font-family:'Playfair Display',serif;font-size:.98rem;">₹${order.total.toLocaleString('en-IN')}</span></div>
    </div>
    <p style="font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:1rem;">Delivery Status</p>
    <div class="track-timeline">${timelineHtml}</div>
    <p style="font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:.5rem;">Items Ordered</p>
    <div class="track-items-list">
      <div class="track-items-list-head"><span>Product</span><span>Price</span></div>
      ${itemsHtml}
      <div class="track-item-row" style="font-weight:700;background:var(--surface);">
        <span>Total</span>
        <span style="color:var(--accent);font-family:'Playfair Display',serif;">₹${order.total.toLocaleString('en-IN')}</span>
      </div>
    </div>
    <div style="margin-top:1.2rem;display:flex;gap:.7rem;flex-wrap:wrap;">
      <button class="btn-primary" onclick="document.getElementById('trackInput').value='';renderAllOrders();document.getElementById('trackResult').classList.remove('show')">← All Orders</button>
      <a href="https://wa.me/918840130533?text=Hi%2C+I+need+help+with+order+${order.id}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:.4rem;background:#25D366;color:#fff;padding:.5rem 1rem;font-size:.78rem;font-weight:600;text-decoration:none;letter-spacing:.05em;">💬 WhatsApp Support</a>
    </div>`;
}
