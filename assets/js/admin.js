/* ================================================================
   WHOLESALE BAAZAR — admin.js
   Admin panel: login, security, products, orders, customers,
   slideshow, settings, account management
   ================================================================ */

// ── CREDENTIALS ──
let adminCreds = JSON.parse(localStorage.getItem('wb_admin_creds') || 'null') || { user:'admin', pass:'admin123' };
let adminFailedAttempts = 0;
const ADMIN_MAX_ATTEMPTS = 3;
const ADMIN_LOCKOUT_MS   = 15 * 60 * 1000; // 15 min
let adminLockoutUntil    = parseInt(localStorage.getItem('wb_admin_lockout') || '0');
let adminSessionTimer    = null;
const ADMIN_SESSION_MS   = 30 * 60 * 1000; // 30 min auto-logout

function saveAdminCreds(){ localStorage.setItem('wb_admin_creds', JSON.stringify(adminCreds)); }

function isAdminLockedOut(){
  if(Date.now() < adminLockoutUntil) return true;
  if(adminLockoutUntil > 0 && Date.now() >= adminLockoutUntil){
    adminLockoutUntil = 0; adminFailedAttempts = 0;
    localStorage.removeItem('wb_admin_lockout');
  }
  return false;
}

function startLockoutCountdown(){
  const notice   = document.getElementById('lockoutNotice');
  const timerEl  = document.getElementById('lockoutTimer');
  const loginBtn = document.querySelector('#adminLoginWrap .btn-primary');
  if(notice) notice.classList.add('show');
  if(loginBtn) loginBtn.disabled = true;
  const tick = setInterval(()=>{
    const left = adminLockoutUntil - Date.now();
    if(left <= 0){
      clearInterval(tick);
      if(notice) notice.classList.remove('show');
      if(loginBtn) loginBtn.disabled = false;
      document.getElementById('attemptCounter').textContent = '';
      adminFailedAttempts = 0;
      return;
    }
    const m = Math.floor(left/60000);
    const s = Math.floor((left%60000)/1000);
    if(timerEl) timerEl.textContent = `${m}:${s.toString().padStart(2,'0')}`;
  }, 1000);
}

function resetAdminSession(){
  clearTimeout(adminSessionTimer);
  adminSessionTimer = setTimeout(()=>{
    const dash = document.getElementById('adminDash');
    if(dash && dash.style.display !== 'none'){
      adminLogout();
      showToast(null,'⏱ Admin session expired. Please log in again.');
    }
  }, ADMIN_SESSION_MS);
}

function doAdminLogin(){
  if(isAdminLockedOut()){ startLockoutCountdown(); return; }
  const u   = sanitize(document.getElementById('adminUser').value.trim());
  const p   = document.getElementById('adminPass').value;
  const errEl = document.getElementById('loginError');
  if(!u||!p){ errEl.textContent='Please enter username and password.'; return; }
  if(u === adminCreds.user && p === adminCreds.pass){
    adminFailedAttempts = 0;
    localStorage.removeItem('wb_admin_lockout');
    document.getElementById('adminLoginWrap').style.display = 'none';
    document.getElementById('adminDash').style.display      = 'block';
    renderAdminProducts(); updateStatTotal(); loadSettings(); loadAccountTab();
    resetAdminSession();
    trackEvent('admin_login','Admin','success');
  } else {
    adminFailedAttempts++;
    const remaining = ADMIN_MAX_ATTEMPTS - adminFailedAttempts;
    if(adminFailedAttempts >= ADMIN_MAX_ATTEMPTS){
      adminLockoutUntil = Date.now() + ADMIN_LOCKOUT_MS;
      localStorage.setItem('wb_admin_lockout', adminLockoutUntil.toString());
      errEl.textContent = '';
      document.getElementById('attemptCounter').textContent = '';
      startLockoutCountdown();
      trackEvent('admin_lockout','Admin','brute_force');
    } else {
      errEl.textContent = 'Invalid username or password.';
      document.getElementById('attemptCounter').textContent = `⚠ ${remaining} attempt${remaining===1?'':'s'} remaining before lockout.`;
    }
  }
}

function adminLogout(){
  clearTimeout(adminSessionTimer);
  document.getElementById('adminDash').style.display     = 'none';
  document.getElementById('adminLoginWrap').style.display = '';
  document.getElementById('adminUser').value  = '';
  document.getElementById('adminPass').value  = '';
  document.getElementById('loginError').textContent = '';
  closeAdmin();
}

function openAdmin() { document.getElementById('adminOverlay').classList.add('open'); }
function closeAdmin(){ document.getElementById('adminOverlay').classList.remove('open'); }

// ── TABS ──
function switchAdminTab(tab, btn){
  document.querySelectorAll('.admin-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.admin-section').forEach(s=>s.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-'+tab).classList.add('active');
  if(tab==='orders')    renderOrdersTable();
  if(tab==='customers') renderCustomersTable();
  if(tab==='slideshow') renderSlidesAdmin();
  if(tab==='account')   loadAccountTab();
}

// ── STATS DASHBOARD ──
function updateStatTotal(){
  const totalRevenue = orders.reduce((s,o) => s + o.total, 0);
  const stats = [
    {val:allProducts.length, l:'Products', i:'📦'},
    {val:orders.length, l:'Orders', i:'🛒'},
    {val:[...new Set(orders.map(o=>o.email))].length, l:'Customers', i:'👥'},
    {val:'₹'+totalRevenue.toLocaleString('en-IN'), l:'Revenue', i:'💰'}
  ];
  document.getElementById('dash-stats-row').innerHTML = stats.map(s=>`
    <div class="stat-card">
      <div class="stat-label">${s.l}</div>
      <div class="stat-value">${s.val}</div>
      <div class="stat-sub">${s.i}</div>
    </div>`).join('');
  const pc = document.getElementById('productCount');
  if(pc) pc.textContent = allProducts.length;
}

// ── PRODUCTS ──
function renderAdminProducts(){
  const tbody = document.getElementById('adminProductsTbody');
  tbody.innerHTML = allProducts.map(p=>`
    <tr>
      <td><input type="checkbox" class="prod-check" value="${p.id}"></td>
      <td><img class="product-thumb" src="${p.img}" onerror="this.src='${FALLBACK_IMG}'" alt=""></td>
      <td>${p.name}</td>
      <td><span class="section-badge">${p.section}</span></td>
      <td>${p.category}</td>
      <td>₹${p.price.toLocaleString('en-IN')}</td>
      <td class="table-actions">
        <button class="tbl-btn" onclick="editProduct(${p.id})">Edit</button>
        <button class="tbl-btn del" onclick="deleteProduct(${p.id})">Delete</button>
      </td>
    </tr>`).join('');
}

function toggleSelectAll(cb){ document.querySelectorAll('.prod-check').forEach(c=>c.checked=cb.checked); }

function deleteSelectedProducts(){
  const ids = [...document.querySelectorAll('.prod-check:checked')].map(c=>parseInt(c.value));
  if(!ids.length){ showToast(null,'No products selected'); return; }
  if(!confirm('Delete '+ids.length+' product(s)?')) return;
  allProducts = allProducts.filter(p=>!ids.includes(p.id));
  saveProducts(); renderAdminProducts(); updateStatTotal();
  if(typeof currentSection !== 'undefined' && currentSection) renderProducts(currentSection);
  showToast(null, ids.length+' products deleted.');
}

let editingId = null;

function openProductModal(p){
  editingId = p ? p.id : null;
  document.getElementById('modalTitle').textContent = p ? 'Edit Product' : 'Add Product';
  document.getElementById('pName').value     = p ? p.name     : '';
  document.getElementById('pSection').value  = p ? p.section  : 'men';
  document.getElementById('pCategory').value = p ? p.category : '';
  document.getElementById('pPrice').value    = p ? p.price    : '';
  document.getElementById('pBadge').value    = p ? p.badge    : '';
  document.getElementById('pImg').value      = p ? p.img      : '';
  document.getElementById('pDesc').value     = p ? p.desc||'' : '';
  updateImgPreview(p ? p.img : '');
  document.getElementById('productModal').classList.add('open');
}

function closeProductModal(){ document.getElementById('productModal').classList.remove('open'); editingId=null; }

function editProduct(id){ const p = allProducts.find(p=>p.id===id); if(p) openProductModal(p); }

function updateImgPreview(url){
  const prev = document.getElementById('imgPreview');
  if(url){ prev.src=url; prev.classList.add('show'); }
  else { prev.classList.remove('show'); }
}

function saveProduct(){
  const name     = document.getElementById('pName').value.trim();
  const section  = document.getElementById('pSection').value;
  const category = document.getElementById('pCategory').value.trim();
  const price    = parseInt(document.getElementById('pPrice').value);
  const badge    = document.getElementById('pBadge').value.trim().toUpperCase();
  const img      = document.getElementById('pImg').value.trim() || `https://picsum.photos/seed/${Date.now()}/400/500`;
  const desc     = document.getElementById('pDesc').value.trim();
  if(!name||!category||!price){ showToast(null,'Name, category and price are required.'); return; }
  if(editingId){
    const idx = allProducts.findIndex(p=>p.id===editingId);
    if(idx!==-1) allProducts[idx] = {id:editingId,name,section,category,price,badge,img,desc};
    showToast(null,'Product updated.');
  } else {
    const newId = Math.max(0,...allProducts.map(p=>p.id))+1;
    allProducts.push({id:newId,name,section,category,price,badge,img,desc});
    showToast(null,'Product added.');
  }
  saveProducts(); renderAdminProducts(); updateStatTotal();
  if(typeof currentSection !== 'undefined' && currentSection) renderProducts(currentSection);
  closeProductModal();
}

function deleteProduct(id){
  if(!confirm('Delete this product?')) return;
  allProducts = allProducts.filter(p=>p.id!==id);
  saveProducts(); renderAdminProducts(); updateStatTotal();
  if(typeof currentSection !== 'undefined' && currentSection) renderProducts(currentSection);
  showToast(null,'Product deleted.');
}

function exportProductsToCSV(){
  const rows=[['ID','Name','Section','Category','Price','Badge']];
  allProducts.forEach(p=>rows.push([p.id,p.name,p.section,p.category,'₹'+p.price,p.badge||'']));
  downloadCSV(rows,'wholesale_baazar_products.csv');
}

// ── ORDERS ──
function renderOrdersTable(){
  const tbody = document.getElementById('ordersTableBody');
  if(!orders.length){
    tbody.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:2rem">No orders yet.</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(o=>`
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.name}<br><small style="color:var(--muted)">${o.phone}</small></td>
      <td style="max-width:200px;font-size:.75rem">${o.items.map(i=>i.name+' ×'+i.qty).join(', ')}</td>
      <td>₹${o.total.toLocaleString('en-IN')}</td>
      <td style="font-size:.75rem">${o.date}</td>
      <td>
        <select class="status-select" onchange="updateOrderStatus('${o.id}',this.value)">
          ${['Pending','Packed','Shipped','Delivered'].map(s=>`<option ${o.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </td>
    </tr>`).join('');
}

function updateOrderStatus(id, status){
  const o = orders.find(o=>o.id===id);
  if(o){ o.status=status; localStorage.setItem('wb_orders',JSON.stringify(orders)); showToast(null,'Order status updated.'); }
}

function exportOrdersToCSV(){
  if(!orders.length){ showToast(null,'No orders to export'); return; }
  const rows=[['Order ID','Customer','Phone','Email','Address','Items','Total','Status','Date']];
  orders.forEach(o=>rows.push([o.id,o.name,o.phone,o.email,o.address,o.items.map(i=>i.name+' x'+i.qty).join('; '),'₹'+o.total,o.status,o.date]));
  downloadCSV(rows,'wholesale_baazar_orders.csv');
}

// ── CUSTOMERS ──
function renderCustomersTable(){
  const tbody = document.getElementById('customersTableBody');
  const seen  = new Map();
  orders.forEach(o=>{ if(!seen.has(o.email)) seen.set(o.email,{name:o.name,phone:o.phone,email:o.email}); });
  const customers = [...seen.values()];
  if(!customers.length){
    tbody.innerHTML='<tr><td colspan="3" style="text-align:center;color:var(--muted);padding:2rem">No customers yet.</td></tr>';
    return;
  }
  tbody.innerHTML = customers.map(c=>`<tr><td>${c.name}</td><td>${c.email}</td><td>${c.phone}</td></tr>`).join('');
}

// ── SLIDESHOW ADMIN ──
function renderSlidesAdmin(){
  const list = document.getElementById('slidesAdminList');
  list.innerHTML = slideshowSlides.length
    ? slideshowSlides.map((s,i)=>`
      <div class="slide-item">
        <img class="slide-item-thumb" src="${s.url}" onerror="this.src='${FALLBACK_IMG}'" alt="">
        <div style="flex:1;min-width:0;">
          <div class="slide-item-caption">${s.caption||'Slide '+(i+1)}</div>
          <div class="slide-item-url">${s.url}</div>
        </div>
        <button class="tbl-btn del" onclick="deleteSlide(${i})">Remove</button>
      </div>`).join('')
    : '<p style="color:var(--muted);font-size:.85rem">No slides added yet.</p>';
}

function addSlide(){
  const url = document.getElementById('newSlideUrl').value.trim();
  const cap = document.getElementById('newSlideCaption').value.trim();
  if(!url){ showToast(null,'Please enter an image URL'); return; }
  slideshowSlides.push({url, caption:cap||'New Slide'});
  saveSlides();
  if(typeof initSlideshow === 'function') initSlideshow();
  renderSlidesAdmin();
  document.getElementById('newSlideUrl').value    = '';
  document.getElementById('newSlideCaption').value = '';
  showToast(null,'Slide added!');
}

function deleteSlide(i){
  if(!confirm('Remove this slide?')) return;
  slideshowSlides.splice(i,1);
  if(typeof currentSlide !== 'undefined' && currentSlide >= slideshowSlides.length) currentSlide = 0;
  saveSlides();
  if(typeof initSlideshow === 'function') initSlideshow();
  renderSlidesAdmin();
  showToast(null,'Slide removed.');
}

// ── SETTINGS ──
let storeSettings = JSON.parse(localStorage.getItem('wb_settings') || 'null') || {
  storeName: 'Wholesale Baazar',
  email:     'wholesalebazaar.support@gmail.com',
  phone:     '+91 88401 30533',
  freeShipping: 999
};

function loadSettings(){
  document.getElementById('storeName').value    = storeSettings.storeName;
  document.getElementById('contactEmail').value = storeSettings.email;
  document.getElementById('contactPhone').value = storeSettings.phone;
  const fsEl = document.getElementById('freeShippingThreshold');
  if(fsEl) fsEl.value = storeSettings.freeShipping;
}

function saveSettings(){
  storeSettings.storeName    = document.getElementById('storeName').value;
  storeSettings.email        = document.getElementById('contactEmail').value;
  storeSettings.phone        = document.getElementById('contactPhone').value;
  const fsEl = document.getElementById('freeShippingThreshold');
  if(fsEl) storeSettings.freeShipping = parseInt(fsEl.value) || 999;
  localStorage.setItem('wb_settings', JSON.stringify(storeSettings));
  showToast(null,'✅ Settings saved!');
}

// ── ACCOUNT / PASSWORD ──
function loadAccountTab(){
  const el = document.getElementById('displayCurrentUser');
  if(el) el.textContent = adminCreds.user;
  ['verifyPassForUser','newAdminUser','currentPassInput','newPassInput','confirmPassInput'].forEach(id=>{
    const el = document.getElementById(id); if(el) el.value='';
  });
  ['userMsg','passMsg'].forEach(id=>{
    const el = document.getElementById(id);
    if(el){ el.textContent=''; el.className='account-msg'; }
  });
  const fill  = document.getElementById('passStrengthFill');
  const label = document.getElementById('passStrengthLabel');
  if(fill){ fill.style.width='0%'; fill.style.background=''; }
  if(label) label.textContent = '';
}

function saveAdminUsername(){
  const verifyPass = document.getElementById('verifyPassForUser').value;
  const newUser    = sanitize(document.getElementById('newAdminUser').value.trim());
  const msg        = document.getElementById('userMsg');
  if(!verifyPass){ setMsg(msg,'Please enter your current password to confirm.','error'); return; }
  if(verifyPass !== adminCreds.pass){ setMsg(msg,'Incorrect current password.','error'); return; }
  if(!newUser || newUser.length < 3){ setMsg(msg,'Username must be at least 3 characters.','error'); return; }
  adminCreds.user = newUser;
  saveAdminCreds();
  document.getElementById('displayCurrentUser').textContent = newUser;
  document.getElementById('verifyPassForUser').value = '';
  document.getElementById('newAdminUser').value = '';
  setMsg(msg,'✅ Username updated successfully!','success');
  resetAdminSession();
}

function saveAdminPassword(){
  const current = document.getElementById('currentPassInput').value;
  const newPass = document.getElementById('newPassInput').value;
  const confirm = document.getElementById('confirmPassInput').value;
  const msg     = document.getElementById('passMsg');
  if(!current){ setMsg(msg,'Please enter your current password.','error'); return; }
  if(current !== adminCreds.pass){ setMsg(msg,'Current password is incorrect.','error'); return; }
  if(newPass.length < 8){ setMsg(msg,'New password must be at least 8 characters.','error'); return; }
  if(!/[A-Z]/.test(newPass)){ setMsg(msg,'Include at least one uppercase letter.','error'); return; }
  if(!/[0-9]/.test(newPass)){ setMsg(msg,'Include at least one number.','error'); return; }
  if(newPass !== confirm){ setMsg(msg,'Passwords do not match.','error'); return; }
  adminCreds.pass = newPass;
  saveAdminCreds();
  ['currentPassInput','newPassInput','confirmPassInput'].forEach(id=>{ document.getElementById(id).value=''; });
  const fill  = document.getElementById('passStrengthFill');
  const label = document.getElementById('passStrengthLabel');
  if(fill){ fill.style.width='0%'; } if(label) label.textContent='';
  setMsg(msg,'✅ Password updated successfully!','success');
}

function checkPassStrength(val){
  const fill  = document.getElementById('passStrengthFill');
  const label = document.getElementById('passStrengthLabel');
  if(!fill||!label) return;
  let score=0;
  if(val.length>=8)  score++;
  if(val.length>=12) score++;
  if(/[A-Z]/.test(val)) score++;
  if(/[0-9]/.test(val)) score++;
  if(/[^A-Za-z0-9]/.test(val)) score++;
  const levels=[
    {w:'20%',bg:'#e74c3c',t:'Very Weak'},{w:'40%',bg:'#e67e22',t:'Weak'},
    {w:'60%',bg:'#f1c40f',t:'Fair'},{w:'80%',bg:'#2ecc71',t:'Strong'},
    {w:'100%',bg:'#27ae60',t:'Very Strong'}
  ];
  const lvl=levels[Math.max(0,score-1)]||levels[0];
  fill.style.width   = val ? lvl.w : '0%';
  fill.style.background = lvl.bg;
  label.textContent  = val ? lvl.t : '';
}

function setMsg(el, text, type){
  el.textContent = text;
  el.className   = 'account-msg ' + type;
  setTimeout(()=>{ if(el.textContent===text){ el.textContent=''; el.className='account-msg'; } }, 4000);
}

// ── CSV HELPER ──
function downloadCSV(rows, filename){
  const csv = rows.map(r=>r.map(v=>'"'+(v+'').replace(/"/g,'""')+'"').join(',')).join('\n');
  const a   = document.createElement('a');
  a.href     = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = filename;
  a.click();
}
