/* ================================================================
   WHOLESALE BAAZAR — app.js
   Core app: nav · slideshow · products · quickview · auth ·
   policies · dealer registration · cookie consent · init
   ================================================================ */

// ── CONFIG (replace with your real keys) ──
const RAZORPAY_KEY          = 'rzp_test_YOUR_KEY_HERE';
const EMAILJS_PUBLIC_KEY    = 'YOUR_EMAILJS_PUBLIC_KEY';
const EMAILJS_SERVICE_ID    = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID   = 'YOUR_TEMPLATE_ID';
const EMAILJS_WELCOME_TEMPLATE_ID = 'YOUR_WELCOME_TEMPLATE_ID';
const FIREBASE_CONFIG = {
  apiKey:            'AIzaSyCrAfvlvZ4oy_6z4hUR86G6kA64nKjMJWg',
  authDomain:        'wholesalebazaar-378a9.firebaseapp.com',
  projectId:         'wholesalebazaar-378a9',
  storageBucket:     'wholesalebazaar-378a9.firebasestorage.app',
  messagingSenderId: '1018239984544',
  appId:             '1:1018239984544:web:93d74cab61373d645b7ac5',
  measurementId:     'G-W9YBBS5E52'
};
// Groq API key for chatbot (optional — offline fallback used if empty)
const apiKey = '';

// ── FIREBASE INIT ──
let firebaseAuth   = null;
let googleProvider = null;
const FIREBASE_READY = FIREBASE_CONFIG.apiKey !== 'YOUR_FIREBASE_API_KEY';
if(FIREBASE_READY && typeof firebase !== 'undefined'){
  firebase.initializeApp(FIREBASE_CONFIG);
  firebaseAuth   = firebase.auth();
  googleProvider = new firebase.auth.GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  firebaseAuth.onAuthStateChanged(function(fbUser){
    if(fbUser){
      const user = {
        name:     fbUser.displayName || fbUser.email.split('@')[0],
        email:    fbUser.email,
        phone:    fbUser.phoneNumber || '',
        photo:    fbUser.photoURL    || '',
        uid:      fbUser.uid,
        joined:   new Date().toLocaleDateString('en-IN'),
        provider: 'google'
      };
      saveCurrentUser(user);
      updateNavUser();
    }
  });
}

if(EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY' && typeof emailjs !== 'undefined'){
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

// ── STATE ──
let currentSection = null;
let currentSlide   = 0;
let slideInterval  = null;

// ── GA4 HELPER ──
function trackEvent(action, category, label){
  if(typeof gtag !== 'undefined') gtag('event', action, { event_category: category, event_label: label });
}

// ── INPUT SANITIZATION ──
function sanitize(str){
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str || '')));
  return div.innerHTML;
}

// ── SHA-256 PASSWORD HASHING ──
async function hashPassword(password){
  const encoder   = new TextEncoder();
  const data      = encoder.encode(password + 'wb_salt_2026');
  const hashBuffer= await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
}

// ================================================================
// SLIDESHOW
// ================================================================
function initSlideshow(){
  const track  = document.getElementById('slideshowTrack');
  const dotsEl = document.getElementById('slideDots');
  track.innerHTML  = '';
  dotsEl.innerHTML = '';
  slideshowSlides.forEach((s,i)=>{
    const div = document.createElement('div');
    div.className = 'slide' + (i===0?' active':'');
    div.style.backgroundImage = `url('${s.url}')`;
    track.appendChild(div);
    const dot = document.createElement('button');
    dot.className = 'slide-dot' + (i===0?' active':'');
    dot.setAttribute('aria-label','Slide '+(i+1));
    dot.onclick = ()=>goSlide(i);
    dotsEl.appendChild(dot);
  });
  startSlideshow();
}

function startSlideshow(){
  clearInterval(slideInterval);
  if(slideshowSlides.length < 2) return;
  slideInterval = setInterval(()=>goSlide((currentSlide+1)%slideshowSlides.length), 5000);
}

function goSlide(n){
  const slides = document.querySelectorAll('.slide');
  const dots   = document.querySelectorAll('.slide-dot');
  slides[currentSlide]?.classList.remove('active');
  dots[currentSlide]?.classList.remove('active');
  currentSlide = (n + slideshowSlides.length) % slideshowSlides.length;
  slides[currentSlide]?.classList.add('active');
  dots[currentSlide]?.classList.add('active');
  startSlideshow();
}

function prevSlide(){ goSlide(currentSlide - 1); }
function nextSlide(){ goSlide(currentSlide + 1); }

// ================================================================
// NAV & SECTIONS
// ================================================================
function goHome(){
  document.querySelectorAll('.section-page').forEach(p=>p.classList.remove('active'));
  document.getElementById('heroSection').style.display = '';
  document.querySelectorAll('.nav-section-btn').forEach(b=>b.classList.remove('active'));
  currentSection = null;
  window.scrollTo({top:0, behavior:'smooth'});
}

function switchSection(s){
  document.getElementById('heroSection').style.display = 'none';
  document.querySelectorAll('.section-page').forEach(p=>p.classList.remove('active'));
  document.getElementById(s+'Section').classList.add('active');
  document.querySelectorAll('.nav-section-btn').forEach(b=>b.classList.toggle('active', b.dataset.s===s));
  currentSection = s;
  window.scrollTo({top:0, behavior:'smooth'});
  closeMobileMenu();
  if(s==='contact') return;
  populateCategoryFilter(s);
  const nav = document.getElementById('subcatNav_'+s);
  if(nav){
    nav.querySelectorAll('.subcat-pill').forEach(p=>p.classList.remove('active'));
    const allPill = nav.querySelector('.subcat-pill');
    if(allPill) allPill.classList.add('active');
  }
  renderProducts(s);
}

function toggleMobileMenu(el){
  el.classList.toggle('change');
  const menu = document.getElementById('mobileMenu');
  menu.style.display = menu.style.display==='flex' ? 'none' : 'flex';
}

function closeMobileMenu(){
  document.getElementById('mobileMenu').style.display = 'none';
  document.querySelector('.hamburger-menu')?.classList.remove('change');
}

// ================================================================
// PRODUCT RENDER
// ================================================================
function renderProducts(section, list){
  const grid     = document.getElementById(section+'Grid');
  const products = list || allProducts.filter(p=>p.section===section);
  if(!products.length){
    grid.innerHTML = `<div class="empty-state">
      <svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="38" stroke="#ddd" stroke-width="2" fill="none"/><text x="40" y="46" text-anchor="middle" font-size="28" fill="#ddd">🔍</text></svg>
      <p>No products found.</p></div>`;
    return;
  }
  grid.innerHTML = products.map((p,i)=>{
    const inWishlist  = wishlist.find(w=>w.id===p.id);
    const reviewCount = getReviewCount(p.id);
    const avgRating   = getAvgRating(p.id);
    return `<div class="product-card reveal" style="animation-delay:${i*0.04}s" onclick="openQuickview(${p.id})">
      <div class="product-img-wrap">
        <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
        ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
        <div class="moq-badge">MOQ: 10 pcs</div>
        <button class="wishlist-btn ${inWishlist?'active':''}" onclick="event.stopPropagation();toggleWishlistItem(${p.id})" title="Wishlist">${inWishlist?'♥':'♡'}</button>
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-category">${p.category}</div>
        ${reviewCount > 0 ? `<div class="product-stars">${renderStars(avgRating,false,null,'0.75rem')}<span style="font-size:.68rem;color:var(--muted);margin-left:.3rem;">(${reviewCount})</span></div>` : ''}
        <div class="product-footer">
          <div class="product-price">₹${p.price.toLocaleString('en-IN')}</div>
          <button class="add-cart-btn" onclick="event.stopPropagation();quickAddCart(${p.id})">+ Cart</button>
        </div>
      </div>
    </div>`;
  }).join('');
  observeReveal();
}

function populateCategoryFilter(section){
  const cats = [...new Set(allProducts.filter(p=>p.section===section).map(p=>p.category))].sort();
  const sel  = document.getElementById('catFilter_'+section);
  if(!sel) return;
  sel.innerHTML = '<option value="">All Categories</option>' + cats.map(c=>`<option value="${c}">${c}</option>`).join('');
}

function filterProducts(section, q){
  const cat  = document.getElementById('catFilter_'+section)?.value || '';
  const minP = parseFloat(document.getElementById('minPrice_'+section)?.value) || 0;
  const maxP = parseFloat(document.getElementById('maxPrice_'+section)?.value) || Infinity;
  const ql   = q.toLowerCase();
  renderProducts(section, allProducts.filter(p=>
    p.section===section &&
    (p.name.toLowerCase().includes(ql) || p.category.toLowerCase().includes(ql)) &&
    (!cat || p.category===cat) &&
    p.price>=minP && p.price<=maxP
  ));
}

function filterByCategory(section){ filterProducts(section, document.querySelector(`#${section}Section .search-input`)?.value||''); }
function filterByPrice(section){    filterProducts(section, document.querySelector(`#${section}Section .search-input`)?.value||''); }

function sortProducts(section, order){
  let list = allProducts.filter(p=>p.section===section);
  if(order==='asc')  list.sort((a,b)=>a.price-b.price);
  if(order==='desc') list.sort((a,b)=>b.price-a.price);
  if(order==='name') list.sort((a,b)=>a.name.localeCompare(b.name));
  renderProducts(section, list);
}

function filterBySubcat(section, key, pill){
  document.querySelectorAll(`#subcatNav_${section} .subcat-pill`).forEach(p=>p.classList.remove('active'));
  pill.classList.add('active');
  const cats = SUBCAT_MAP[section][key];
  const searchEl = document.querySelector(`#${section}Section .search-input`);
  if(searchEl) searchEl.value = '';
  const catSel = document.getElementById('catFilter_'+section);
  if(catSel) catSel.value = '';
  if(!cats){ renderProducts(section); return; }
  const catsLower = cats.map(c=>c.toLowerCase());
  renderProducts(section, allProducts.filter(p=>p.section===section && catsLower.includes(p.category.toLowerCase())));
}

// ================================================================
// QUICKVIEW
// ================================================================
function openQuickview(id){
  const p = allProducts.find(p=>p.id===id);
  if(!p) return;

  injectProductSchema(p);

  const sizes = sizesFor(p);
  document.getElementById('qvImg').src        = p.img;
  document.getElementById('qvImg').onerror    = function(){ this.src=FALLBACK_IMG; };
  document.getElementById('qvName').textContent     = p.name;
  document.getElementById('qvCategory').textContent = p.category;
  document.getElementById('qvPrice').textContent    = '₹'+p.price.toLocaleString('en-IN');
  document.getElementById('qvDesc').textContent     = p.desc||'Premium quality fashion item.';
  document.getElementById('qvBadge').textContent    = p.badge||'';
  document.getElementById('qvBadge').style.display  = p.badge ? 'inline-block' : 'none';

  // Bulk pricing box
  const bulkEl = document.getElementById('qvBulkPricing');
  if(bulkEl){
    const p10 = Math.round(p.price * 0.90);
    const p50 = Math.round(p.price * 0.80);
    bulkEl.innerHTML = `
      <div style="font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:.5rem;">Bulk Pricing (MOQ 10 pcs)</div>
      <div style="display:flex;gap:1.5rem;flex-wrap:wrap;">
        <div><div style="font-size:.7rem;color:var(--muted);">1–9 pcs</div><div style="font-weight:700;">₹${p.price.toLocaleString('en-IN')}/pc</div></div>
        <div><div style="font-size:.7rem;color:var(--muted);">10–49 pcs</div><div style="font-weight:700;color:var(--success);">₹${p10.toLocaleString('en-IN')}/pc <span style="font-size:.65rem;">−10%</span></div></div>
        <div><div style="font-size:.7rem;color:var(--muted);">50+ pcs</div><div style="font-weight:700;color:var(--success);">₹${p50.toLocaleString('en-IN')}/pc <span style="font-size:.65rem;">−20%</span></div></div>
      </div>
      <div style="margin-top:.5rem;font-size:.7rem;color:var(--muted);">📞 <a href="tel:+918840130533" style="color:var(--accent)">+91 88401 30533</a> for 50+ pcs wholesale rates</div>`;
  }

  // Wishlist button
  const inWL = wishlist.find(w=>w.id===id);
  document.getElementById('qvWishBtn').textContent = inWL ? '♥ Wishlisted' : '♡ Wishlist';
  document.getElementById('qvWishBtn').dataset.id  = id;

  // WhatsApp share
  const waShareEl = document.getElementById('qvWaShare');
  if(waShareEl){
    const waText = encodeURIComponent(`Check out ${p.name} at ₹${p.price.toLocaleString('en-IN')} on Wholesale Baazar! 🛍️\nhttps://wholesalebaazar.in`);
    waShareEl.href = `https://wa.me/?text=${waText}`;
  }

  // Sizes
  const sizeEl = document.getElementById('qvSizes');
  sizeEl.innerHTML = sizes.map(s=>`<button class="size-option" onclick="selectSize(this,'${s}')">${s}</button>`).join('');

  // Reviews
  const reviewsEl = document.getElementById('qvReviewsSection');
  if(reviewsEl) reviewsEl.innerHTML = renderReviewsHtml(id);

  document.getElementById('qvAddCart').onclick = ()=>addToCartFromQV(id);
  document.getElementById('quickviewModal').classList.add('open');
}

function closeQuickview(){ document.getElementById('quickviewModal').classList.remove('open'); }

function selectSize(btn){
  btn.closest('.size-selector').querySelectorAll('.size-option').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}

function getSelectedSize(){ return document.querySelector('#qvSizes .size-option.active')?.textContent || null; }

function addToCartFromQV(id){
  const size = getSelectedSize();
  if(!size){ showToast(null,'Please select a size'); return; }
  addToCart(id, size);
  closeQuickview();
}

function quickAddCart(id){
  const p     = allProducts.find(p=>p.id===id);
  if(!p) return;
  const sizes = sizesFor(p);
  addToCart(id, sizes[2] || sizes[0]);
}

function qvToggleWishlist(){
  const id = parseInt(document.getElementById('qvWishBtn').dataset.id);
  toggleWishlistItem(id);
  const inWL = wishlist.find(w=>w.id===id);
  document.getElementById('qvWishBtn').textContent = inWL ? '♥ Wishlisted' : '♡ Wishlist';
}

// ================================================================
// USER AUTH
// ================================================================
let userAccounts = JSON.parse(localStorage.getItem('wb_user_accounts') || '[]');
let currentUser  = JSON.parse(localStorage.getItem('wb_current_user')  || 'null');

function saveUserAccounts(){ localStorage.setItem('wb_user_accounts', JSON.stringify(userAccounts)); }
function saveCurrentUser(u){ currentUser=u; localStorage.setItem('wb_current_user', JSON.stringify(u)); }

function openUserModal(){
  document.getElementById('userModalOverlay').classList.add('open');
  const signInPanel = document.getElementById('panelSignIn');
  const profileForm = document.getElementById('formProfile');
  if(currentUser){
    if(signInPanel) signInPanel.style.display = 'none';
    if(profileForm) profileForm.classList.add('active');
    populateProfileForm();
    document.getElementById('userModalTitle').textContent = 'My Account';
    document.getElementById('userModalSub').textContent   = 'Manage your profile & orders';
  } else {
    if(signInPanel) signInPanel.style.display = '';
    if(profileForm) profileForm.classList.remove('active');
    document.getElementById('userModalTitle').textContent = 'Sign In';
    document.getElementById('userModalSub').textContent   = 'Sign in to track your orders';
  }
}

function closeUserModal(){ document.getElementById('userModalOverlay').classList.remove('open'); }
function handleUserModalClick(e){ if(e.target===document.getElementById('userModalOverlay')) closeUserModal(); }

function signInWithGoogle(){
  if(!FIREBASE_READY || !firebaseAuth){
    showToast(null,'⚠ Google login not set up yet. Configure Firebase first.');
    return;
  }
  firebaseAuth.signInWithPopup(googleProvider)
    .then(result=>{
      const fbUser = result.user;
      const isNew  = result.additionalUserInfo?.isNewUser;
      const user   = {
        name:     fbUser.displayName || fbUser.email.split('@')[0],
        email:    fbUser.email,
        phone:    fbUser.phoneNumber || '',
        photo:    fbUser.photoURL    || '',
        uid:      fbUser.uid,
        joined:   new Date().toLocaleDateString('en-IN'),
        provider: 'google'
      };
      saveCurrentUser(user);
      updateNavUser();
      closeUserModal();
      if(isNew){
        showToast(null,'🎉 Welcome to Wholesale Baazar, '+user.name.split(' ')[0]+'!');
        sendWelcomeEmail(user.name, user.email);
        trackEvent('user_signup','User','google');
      } else {
        showToast(null,'👋 Welcome back, '+user.name.split(' ')[0]+'!');
        trackEvent('user_login','User','google');
      }
    })
    .catch(err=>{
      if(err.code === 'auth/popup-closed-by-user') return;
      showToast(null,'Google sign-in failed. Please try again.');
      console.error('Google sign-in error:', err);
    });
}

function sendWelcomeEmail(name, email){
  if(EMAILJS_PUBLIC_KEY==='YOUR_EMAILJS_PUBLIC_KEY' || typeof emailjs==='undefined') return;
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_WELCOME_TEMPLATE_ID, {
    to_name:    name,
    to_email:   email,
    reply_to:   'wholesalebazaar.support@gmail.com',
    first_name: name.split(' ')[0],
    join_date:  new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}),
    store_url:  'https://wholesalebaazar.in',
    whatsapp:   'https://wa.me/918840130533'
  }).catch(err=>console.warn('Welcome email error:', err));
}

function sendOrderConfirmationEmail(orderId,name,email,phone,total,payMode){
  if(EMAILJS_PUBLIC_KEY==='YOUR_EMAILJS_PUBLIC_KEY' || typeof emailjs==='undefined') return;
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    order_id:       orderId,
    from_name:      'Wholesale Baazar',
    customer_name:  name,
    reply_to:       email,
    phone:          phone,
    total:          '₹' + total.toLocaleString('en-IN'),
    pay_mode:       payMode,
    message:        `Your order ${orderId} has been placed! We will contact you at ${phone} to confirm delivery. Expected: 3–5 business days.`
  }).catch(err=>console.warn('Order email error:', err));
}

function saveUserProfile(){
  const name  = document.getElementById('editName').value.trim();
  const phone = document.getElementById('editPhone').value.trim();
  const sucEl = document.getElementById('profileSuccess');
  if(!name){ sucEl.style.color='#e04'; sucEl.textContent='Name cannot be empty.'; return; }
  currentUser.name=name; currentUser.phone=phone;
  const idx = userAccounts.findIndex(u=>u.email===currentUser.email);
  if(idx!==-1){ userAccounts[idx].name=name; userAccounts[idx].phone=phone; saveUserAccounts(); }
  saveCurrentUser(currentUser);
  updateNavUser();
  populateProfileForm();
  sucEl.style.color=''; sucEl.textContent='✅ Profile updated!';
  setTimeout(()=>{ sucEl.textContent=''; }, 3000);
}

function populateProfileForm(){
  if(!currentUser) return;
  document.getElementById('profileName').textContent  = currentUser.name;
  document.getElementById('profileEmail').textContent = currentUser.email;
  const avatarEl = document.getElementById('profileAvatar');
  if(currentUser.photo){
    avatarEl.innerHTML = `<img src="${currentUser.photo}" alt="Profile" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
  } else {
    avatarEl.textContent = currentUser.name.charAt(0).toUpperCase();
  }
  document.getElementById('editName').value  = currentUser.name;
  document.getElementById('editPhone').value = currentUser.phone||'';
}

function userLogout(){
  currentUser = null;
  localStorage.removeItem('wb_current_user');
  updateNavUser();
  closeUserModal();
  showToast(null,'You have been logged out.');
}

function updateNavUser(){
  const wrap   = document.getElementById('navUserWrap');
  const btn    = document.getElementById('navUserBtn');
  const label  = document.getElementById('navUserLabel');
  const avatar = document.getElementById('navUserAvatar');
  const dName  = document.getElementById('dropdownName');
  const dEmail = document.getElementById('dropdownEmail');
  if(!wrap) return;
  if(currentUser){
    wrap.style.display = '';
    label.textContent  = currentUser.name.split(' ')[0];
    avatar.textContent = currentUser.name.charAt(0).toUpperCase();
    avatar.style.background = 'var(--accent)';
    btn.classList.add('logged-in');
    dName.textContent  = currentUser.name;
    dEmail.textContent = currentUser.email;
    const mob1=document.getElementById('mobileOrdersLink'); if(mob1) mob1.style.display='';
    const mob2=document.getElementById('mobileLogoutLink'); if(mob2) mob2.style.display='';
  } else {
    wrap.style.display = 'none';
    dName.textContent  = 'Guest';
    dEmail.textContent = 'Not signed in';
    const mob1=document.getElementById('mobileOrdersLink'); if(mob1) mob1.style.display='none';
    const mob2=document.getElementById('mobileLogoutLink'); if(mob2) mob2.style.display='none';
  }
}

function toggleUserDropdown(){
  const dd = document.getElementById('userDropdown');
  if(!currentUser){ openUserModal(); return; }
  dd.classList.toggle('open');
}

function goToOrders(){
  document.getElementById('userDropdown').classList.remove('open');
  openTrackModal();
}

document.addEventListener('click', e=>{
  const wrap = document.getElementById('navUserWrap');
  if(wrap && !wrap.contains(e.target)) document.getElementById('userDropdown').classList.remove('open');
});

// ================================================================
// CONTACT FORM
// ================================================================
function submitContactForm(e){
  e.preventDefault();
  const btn    = document.getElementById('cf_btn');
  const status = document.getElementById('cf_status');
  btn.textContent = 'Sending…';
  btn.disabled    = true;
  if(EMAILJS_PUBLIC_KEY==='YOUR_EMAILJS_PUBLIC_KEY' || typeof emailjs==='undefined'){
    status.textContent  = '⚠ Email not set up yet. Please WhatsApp us on +91 88401 30533!';
    status.style.display= 'block';
    status.style.background='#fff3cd'; status.style.color='#856404';
    btn.textContent='Send Enquiry →'; btn.disabled=false;
    return;
  }
  emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, e.target)
    .then(()=>{
      status.textContent  ='✅ Enquiry sent! We\'ll reply within 24 hours.';
      status.style.display='block';
      status.style.background='#d4edda'; status.style.color='#155724';
      e.target.reset();
    })
    .catch(err=>{
      console.error('EmailJS error:', err);
      status.textContent  ='❌ Could not send. Please WhatsApp us on +91 88401 30533';
      status.style.display='block';
      status.style.background='#f8d7da'; status.style.color='#721c24';
    })
    .finally(()=>{ btn.textContent='Send Enquiry →'; btn.disabled=false; });
}

// ================================================================
// DEALER REGISTRATION
// ================================================================
function submitDealerForm(){
  const biz   = document.getElementById('dl_biz').value.trim();
  const name  = document.getElementById('dl_name').value.trim();
  const phone = document.getElementById('dl_phone').value.trim();
  const city  = document.getElementById('dl_city').value.trim();
  const gst   = document.getElementById('dl_gst').value.trim();
  const sec   = document.getElementById('dl_section').value;
  const st    = document.getElementById('dl_status');
  if(!biz||!name||!phone||!city){ showToast(null,'Please fill all required fields.'); return; }
  const leads = JSON.parse(localStorage.getItem('wb_dealer_leads')||'[]');
  leads.push({biz,name,phone,city,gst,sec,date:new Date().toLocaleDateString('en-IN')});
  localStorage.setItem('wb_dealer_leads',JSON.stringify(leads));
  const waMsg = encodeURIComponent(`🤝 New Dealer Enquiry!\nBusiness: ${biz}\nName: ${name}\nPhone: ${phone}\nCity: ${city}\nGSTIN: ${gst||'N/A'}\nInterested in: ${sec||'All'}`);
  window.open('https://wa.me/918840130533?text='+waMsg,'_blank');
  st.style.display='block'; st.style.background='#d4edda'; st.style.color='#155724';
  st.textContent='✅ Application sent via WhatsApp! We\'ll contact you within 24 hours.';
  trackEvent('dealer_signup','B2B','dealer_form');
}

// ================================================================
// POLICY MODALS
// ================================================================
const POLICIES = {
  privacy:{
    title:'Privacy Policy',
    body:`<h3>1. Information We Collect</h3><p>When you place an order or create an account on Wholesale Baazar, we collect personal information including your name, email address, phone number, and delivery address. We also collect browsing data to improve your experience.</p><h3>2. How We Use Your Information</h3><ul><li>To process and deliver your orders</li><li>To send order confirmations and delivery updates</li><li>To respond to your queries via phone, email or WhatsApp</li><li>To improve our website and product offerings</li></ul><h3>3. Data Storage</h3><p>Your data is stored securely in your browser's local storage. We do not sell, rent or share your personal information with third parties for marketing purposes.</p><h3>4. Cookies</h3><p>We use cookies to remember your cart, wishlist, and preferences, and to analyze website traffic via Google Analytics. You may decline non-essential cookies using the banner at the bottom of the page.</p><h3>5. Third-Party Services</h3><p>We use Google Analytics (anonymized IP), Unsplash for product imagery, and WhatsApp Business for customer support.</p><h3>6. Your Rights</h3><p>You have the right to access, correct, or delete your personal data. Contact: wholesalebazaar.support@gmail.com or +91 88401 30533.</p><h3>7. Children's Privacy</h3><p>Our services are not directed to children under 13. We do not knowingly collect personal information from children.</p><p class="policy-last-updated">Last updated: March 2026 | Wholesale Baazar, Prayagraj, Uttar Pradesh, India</p>`
  },
  terms:{
    title:'Terms of Service',
    body:`<h3>1. Acceptance of Terms</h3><p>By accessing or using Wholesale Baazar, you agree to be bound by these Terms of Service.</p><h3>2. Products and Pricing</h3><p>All prices are listed in Indian Rupees (₹) inclusive of applicable taxes. We reserve the right to change prices at any time.</p><h3>3. Orders and Payment</h3><p>Orders are accepted subject to availability. We accept Cash on Delivery (COD) and online payments via Razorpay.</p><h3>4. Shipping and Delivery</h3><p>We deliver across India. Standard delivery takes 3–5 business days. Free shipping on orders above ₹999.</p><h3>5. Returns and Refunds</h3><p>7-day return policy from the date of delivery. Items must be unused and in original packaging.</p><h3>6. Intellectual Property</h3><p>All content on this site is the property of Wholesale Baazar and may not be reproduced without written permission.</p><h3>7. Governing Law</h3><p>These Terms shall be governed by the laws of India. Disputes subject to jurisdiction of courts in Prayagraj, Uttar Pradesh.</p><p class="policy-last-updated">Last updated: March 2026 | Wholesale Baazar, Prayagraj, Uttar Pradesh, India</p>`
  },
  return:{
    title:'Return & Refund Policy',
    body:`<h3>7-Day Easy Returns</h3><p>We want you to love what you ordered. If you're not satisfied, we'll make it right.</p><h3>Eligibility</h3><ul><li>Return request must be raised within 7 days of delivery</li><li>Item must be unused, unwashed, with original tags attached</li><li>Original packaging must be intact</li><li>Items purchased during clearance sales are not returnable</li><li>Innerwear, swimwear and customized items are non-returnable</li></ul><h3>How to Return</h3><p>Contact us via WhatsApp (+91 88401 30533) or email (wholesalebazaar.support@gmail.com) with your Order ID and reason for return.</p><h3>Refund Process</h3><ul><li><strong>COD orders:</strong> Refund via bank transfer within 5–7 business days</li><li><strong>Online payments:</strong> Refund to original payment method within 5–7 business days</li></ul><p class="policy-last-updated">Last updated: March 2026</p>`
  },
  shipping:{
    title:'Shipping Information',
    body:`<h3>Delivery Areas</h3><p>We deliver to all pin codes across India.</p><h3>Delivery Timeline</h3><ul><li><strong>Metro cities:</strong> 2–3 business days</li><li><strong>Tier 2 cities:</strong> 3–5 business days</li><li><strong>Tier 3 & rural areas:</strong> 5–7 business days</li></ul><h3>Shipping Charges</h3><ul><li>Orders above ₹999: <strong>FREE shipping</strong></li><li>Orders below ₹999: ₹49 flat shipping fee</li></ul><h3>Order Processing</h3><p>Orders placed before 2 PM are processed the same business day. Orders after 2 PM or on Sundays are processed the next business day.</p><h3>Bulk/Wholesale Orders</h3><p>For wholesale orders above ₹10,000, contact us at wholesalebazaar.support@gmail.com for priority shipping and special pricing.</p><p class="policy-last-updated">Last updated: March 2026</p>`
  }
};

function openPolicy(key){
  const policy = POLICIES[key];
  if(!policy) return;
  document.getElementById('policyTitle').textContent = policy.title;
  document.getElementById('policyBody').innerHTML    = policy.body;
  document.getElementById('policyOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  trackEvent('policy_view','Engagement', key);
}

function closePolicy(){
  document.getElementById('policyOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function handlePolicyOverlayClick(e){
  if(e.target===document.getElementById('policyOverlay')) closePolicy();
}

// ================================================================
// COOKIE CONSENT
// ================================================================
function initCookieBanner(){
  const consent = localStorage.getItem('wb_cookie_consent');
  if(!consent){
    setTimeout(()=>{ document.getElementById('cookieBanner').classList.add('show'); }, 1500);
  }
}

function closeCookiePopup(){
  document.getElementById('cookieBanner').classList.remove('show');
  document.getElementById('cookieOverlay').classList.remove('show');
}

function handleCookieOverlayClick(){}

function handleCookie(accepted){
  const prefs = accepted
    ? { essential:true, analytics:true, marketing:true }
    : { essential:true, analytics:false, marketing:false };
  localStorage.setItem('wb_cookie_consent', JSON.stringify(prefs));
  closeCookiePopup();
  trackEvent('cookie_consent','Engagement', accepted?'accepted_all':'rejected_all');
}

function handleCookieCustom(){
  const analytics = document.getElementById('toggleAnalytics')?.checked ?? true;
  const marketing = document.getElementById('toggleMarketing')?.checked ?? true;
  localStorage.setItem('wb_cookie_consent', JSON.stringify({essential:true, analytics, marketing}));
  closeCookiePopup();
  trackEvent('cookie_consent','Engagement','custom');
}

function reopenPrivacyPopup(){
  localStorage.removeItem('wb_cookie_consent');
  document.getElementById('cookieBanner').classList.add('show');
}

// ================================================================
// SCROLL & ANIMATION
// ================================================================
function observeReveal(){
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
  },{threshold:0.1});
  document.querySelectorAll('.reveal:not(.visible)').forEach(el=>obs.observe(el));
}

window.addEventListener('scroll',()=>{
  const btn = document.getElementById('backToTop');
  btn.classList.toggle('visible', window.scrollY > 300);
});

function scrollTop(){ window.scrollTo({top:0, behavior:'smooth'}); }

// ================================================================
// KEYBOARD SHORTCUTS & ESC
// ================================================================
document.addEventListener('keydown', e=>{
  // Ctrl+Shift+A → unlock admin tools
  if(e.ctrlKey && e.shiftKey && e.key==='A'){
    document.querySelectorAll('.admin-only').forEach(el=>el.style.display='inline-block');
    showToast(null,'⚙ Admin tools unlocked.');
  }
  if(e.key !== 'Escape') return;
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('wishlistOverlay').classList.remove('open');
  document.getElementById('wishlistSidebar').classList.remove('open');
  document.getElementById('quickviewModal').classList.remove('open');
  document.getElementById('checkoutModal').classList.remove('open');
  document.getElementById('adminOverlay').classList.remove('open');
  document.getElementById('productModal').classList.remove('open');
  document.getElementById('userModalOverlay').classList.remove('open');
  document.getElementById('trackModalOverlay').classList.remove('open');
  closePolicy();
  if(typeof chatOpen !== 'undefined' && chatOpen){
    chatOpen=false;
    document.getElementById('chatPanel').classList.remove('open');
    document.getElementById('chatFab').textContent='💬';
  }
});

// Legacy URL param support
if(window.location.search.includes('admin')){
  document.querySelectorAll('.admin-only').forEach(el=>el.style.display='inline-block');
}

// ================================================================
// INIT
// ================================================================
function init(){
  initSlideshow();
  ['men','women','kids','homekitchen','supplements'].forEach(s=>{
    renderProducts(s);
    populateCategoryFilter(s);
  });
  updateCartUI();
  updateWishlistUI();
  if(typeof loadSettings === 'function') loadSettings();
  updateStatTotal();
  updateNavUser();
  observeReveal();
  initCookieBanner();
  if(typeof isAdminLockedOut === 'function' && isAdminLockedOut()) startLockoutCountdown();
  // Hero card product counts
  ['men','women','kids','homekitchen','supplements'].forEach(s=>{
    const el = document.getElementById('hc_'+s);
    if(el) el.textContent = allProducts.filter(p=>p.section===s).length+' products';
  });
  // Section nav tracking
  document.querySelectorAll('.nav-section-btn').forEach(btn=>{
    btn.addEventListener('click',()=>trackEvent('section_view','Navigation',btn.dataset.s));
  });
}

init();
