/* ================================================================
   WHOLESALE BAAZAR — product-page.js
   Individual product pages with full details, image gallery,
   size chart, related products, reviews integration
   ================================================================ */

let currentProductPage = null;

// ── EXTENDED PRODUCT DETAILS ──
// Add rich info per product ID (size charts, care, features, tags)
const PRODUCT_DETAILS = {
  // Men shirts
  1: {
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop&q=85',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=750&fit=crop&q=85',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=750&fit=crop&q=85'
    ],
    highlights: ['100% Premium Cotton Oxford Weave','Chest Pocket with Button Loop','Soft Collar & Button-Down Front','Machine Washable at 30°C','Available in White, Blue, Grey'],
    fabric: '100% Cotton Oxford',
    fit: 'Regular Fit',
    care: ['Machine wash cold','Do not bleach','Tumble dry low','Warm iron if needed'],
    sizeChart: {
      headers: ['Size','Chest (in)','Length (in)','Shoulder (in)'],
      rows: [
        ['XS','36','27','16.5'],['S','38','28','17'],['M','40','29','17.5'],
        ['L','42','30','18'],['XL','44','31','18.5'],['XXL','46','32','19']
      ]
    },
    tags: ['Formal','Office Wear','Casual','Cotton','Shirt'],
    sku: 'WB-MEN-SHIRT-001',
    deliveryDays: '3-5',
    returnDays: 7
  },
  // Women dress
  18: {
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=750&fit=crop&q=85',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=750&fit=crop&q=85',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=750&fit=crop&q=85'
    ],
    highlights: ['Flowy Floral Print Fabric','Adjustable Shoulder Straps','Tiered Hem for Movement','Fully Lined','Available in 4 colour prints'],
    fabric: 'Rayon Blend',
    fit: 'Flowy / Relaxed',
    care: ['Hand wash preferred','Cold water only','Do not wring','Dry in shade','Low iron'],
    sizeChart: {
      headers: ['Size','Bust (in)','Waist (in)','Hip (in)','Length (in)'],
      rows: [
        ['XS','32','26','36','52'],['S','34','28','38','53'],['M','36','30','40','54'],
        ['L','38','32','42','55'],['XL','40','34','44','56'],['XXL','42','36','46','57']
      ]
    },
    tags: ['Floral','Maxi Dress','Summer','Casual','Beach'],
    sku: 'WB-WMN-DRESS-001',
    deliveryDays: '3-5',
    returnDays: 7
  }
};

// Default detail template for products without specific info
function getProductDetail(pid){
  if(PRODUCT_DETAILS[pid]) return PRODUCT_DETAILS[pid];
  const p = allProducts.find(p=>p.id===pid);
  if(!p) return null;
  return {
    images: [p.img, p.img, p.img],
    highlights: [
      'Premium quality '+p.category.toLowerCase()+' from Wholesale Baazar',
      'Available in multiple sizes',
      'Fast delivery across India',
      'COD and online payment available',
      '7-day easy return policy'
    ],
    fabric: p.section==='supplements'?'N/A':'Premium Fabric Blend',
    fit: p.section==='supplements'?'N/A':'Standard Fit',
    care: p.section==='supplements'
      ? ['Store in cool dry place','Keep away from sunlight','Close cap tightly after use']
      : ['Machine wash cold','Dry in shade','Warm iron if needed','Do not bleach'],
    sizeChart: p.section==='supplements'||p.section==='homekitchen' ? null : {
      headers: ['Size','Chest (in)','Length (in)'],
      rows: p.section==='kids'
        ? [['2Y','22','16'],['4Y','24','18'],['6Y','26','20'],['8Y','28','22'],['10Y','30','24'],['12Y','32','26']]
        : [['XS','36','27'],['S','38','28'],['M','40','29'],['L','42','30'],['XL','44','31'],['XXL','46','32']]
    },
    tags: [p.category, p.section.charAt(0).toUpperCase()+p.section.slice(1), 'Wholesale', 'Bulk'],
    sku: 'WB-'+p.section.toUpperCase()+'-'+pid,
    deliveryDays: '3-5',
    returnDays: 7
  };
}

// ── OPEN PRODUCT PAGE ──
function openProductPage(pid){
  const p = allProducts.find(p=>p.id===pid);
  if(!p) return;
  currentProductPage = pid;

  // Hide all section pages, show product page
  document.querySelectorAll('.section-page').forEach(s=>s.classList.remove('active'));
  document.getElementById('heroSection').style.display = 'none';

  let pg = document.getElementById('productPageSection');
  if(!pg){
    pg = document.createElement('div');
    pg.id = 'productPageSection';
    pg.className = 'section-page';
    // Insert before footer
    const footer = document.querySelector('footer');
    footer.parentNode.insertBefore(pg, footer);
  }
  pg.classList.add('active');
  pg.innerHTML = buildProductPage(p);
  window.scrollTo({top:0,behavior:'smooth'});

  // Start image gallery
  initProductGallery(pid);
  // Track
  trackEvent('product_view','Ecommerce',p.name);
}

function closeProductPage(){
  const pg = document.getElementById('productPageSection');
  if(pg) pg.classList.remove('active');
  if(currentProductPage){
    const p = allProducts.find(p=>p.id===currentProductPage);
    if(p) switchSection(p.section);
  }
  currentProductPage = null;
}

// ── BUILD FULL PAGE HTML ──
function buildProductPage(p){
  const detail   = getProductDetail(p.id);
  const sizes    = sizesFor(p);
  const avg      = getAvgRating(p.id);
  const count    = getReviewCount(p.id);
  const inWL     = wishlist.find(w=>w.id===p.id);
  const sold     = (typeof getSoldCount==='function') ? getSoldCount(p.id) : (1000 + p.id*37);
  const stock    = (typeof getStockLevel==='function') ? getStockLevel(p.id) : 45;
  const combo    = (typeof COMBO_OFFERS!=='undefined') ? COMBO_OFFERS[p.id] : null;
  const urgColor = stock<=10?'#e74c3c':stock<=25?'#FF9900':'#27ae60';
  const viewers  = (typeof getLiveViewers==='function') ? getLiveViewers(p.id) : Math.floor(Math.random()*40)+10;
  const related  = allProducts.filter(r=>r.section===p.section&&r.id!==p.id).slice(0,4);
  const p10      = Math.round(p.price*0.90);
  const p50      = Math.round(p.price*0.80);

  return `
  <!-- BREADCRUMB -->
  <div style="padding:6.5rem 2.5rem 0;max-width:1200px;margin:0 auto;">
    <nav style="font-size:.75rem;color:var(--muted);margin-bottom:1.5rem;display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;">
      <span onclick="goHome()" style="cursor:pointer;color:var(--accent);">Home</span>
      <span>›</span>
      <span onclick="switchSection('${p.section}')" style="cursor:pointer;color:var(--accent);">${p.section.charAt(0).toUpperCase()+p.section.slice(1)}</span>
      <span>›</span>
      <span>${p.category}</span>
      <span>›</span>
      <span style="color:var(--text);font-weight:500;">${p.name}</span>
    </nav>

    <!-- PRODUCT GRID -->
    <div class="pp-grid">

      <!-- LEFT: IMAGE GALLERY -->
      <div class="pp-gallery">
        <div class="pp-main-image-wrap" id="ppMainWrap_${p.id}">
          <img id="ppMainImg_${p.id}" src="${detail.images[0]}" alt="${p.name}" class="pp-main-image" onerror="this.src='${FALLBACK_IMG}'">
          ${p.badge?`<div class="product-badge" style="top:1rem;left:1rem;font-size:.72rem;">${p.badge}</div>`:''}
          <button class="pp-wishlist-btn ${inWL?'active':''}" onclick="toggleWishlistItem(${p.id})" id="ppWishBtn_${p.id}">${inWL?'♥':'♡'}</button>
        </div>
        <div class="pp-thumbs" id="ppThumbs_${p.id}">
          ${detail.images.map((img,i)=>`
            <div class="pp-thumb ${i===0?'active':''}" onclick="switchProductImage(${p.id},${i},'${img}',this)">
              <img src="${img}" alt="View ${i+1}" onerror="this.src='${FALLBACK_IMG}'">
            </div>`).join('')}
        </div>
      </div>

      <!-- RIGHT: PRODUCT INFO -->
      <div class="pp-info">
        <div style="font-size:.7rem;letter-spacing:.25em;text-transform:uppercase;color:var(--accent);margin-bottom:.5rem;">${p.category}</div>
        <h1 class="pp-title">${p.name}</h1>

        <!-- RATINGS ROW -->
        <div class="pp-ratings-row">
          ${renderStars(avg,false,null,'0.95rem')}
          <span style="font-size:.82rem;color:var(--muted);margin-left:.4rem;">${avg>0?avg.toFixed(1)+' ('+count+' reviews)':'No reviews yet'}</span>
          <span style="margin-left:.8rem;font-size:.78rem;color:var(--muted);">🔥 ${sold.toLocaleString('en-IN')} sold</span>
          <a href="#ppReviewsAnchor" style="font-size:.78rem;color:var(--accent);margin-left:.8rem;text-decoration:underline;">Write a review</a>
        </div>

        <!-- PRICE -->
        <div class="pp-price-row">
          <span class="pp-price">₹${p.price.toLocaleString('en-IN')}</span>
          <span style="font-size:.75rem;color:var(--muted);margin-left:.6rem;">MRP incl. all taxes</span>
          ${p.badge==='SALE'?`<span style="background:#e74c3c;color:#fff;font-size:.65rem;font-weight:700;padding:.2rem .6rem;margin-left:.6rem;border-radius:2px;">SALE</span>`:''}
        </div>

        <!-- SOCIAL PROOF -->
        <div class="pp-social-proof">
          <div class="social-proof-row"><span class="live-dot"></span><span id="liveViewers_${p.id}">${viewers}</span> people viewing right now</div>
          <div class="stock-row" style="color:${urgColor};">Only <strong>${stock}</strong> item(s) left in stock!</div>
          <div class="stock-bar-wrap" style="margin-top:.4rem;">
            <div class="stock-bar-track"><div class="stock-bar-fill" style="width:${Math.min(100,Math.round(stock/2))}%;background:${urgColor}"></div></div>
          </div>
        </div>

        <!-- SIZE SELECTOR -->
        <div class="pp-section-block">
          <div class="pp-section-label">Select Size ${detail.sizeChart?'<a href="#ppSizeChart" style="font-size:.72rem;color:var(--accent);margin-left:.5rem;text-decoration:underline;">Size Guide ↓</a>':''}</div>
          <div class="size-selector" id="ppSizes_${p.id}">
            ${sizes.map(s=>`<button class="size-option" onclick="selectPPSize(this,'${s}',${p.id})">${s}</button>`).join('')}
          </div>
        </div>

        <!-- QUANTITY -->
        <div class="pp-section-block">
          <div class="pp-section-label">Quantity</div>
          <div class="pp-qty-row">
            <button class="qty-btn" onclick="changePPQty(${p.id},-1)">−</button>
            <span class="qty-num" id="ppQty_${p.id}" style="font-size:1rem;min-width:28px;text-align:center;">1</span>
            <button class="qty-btn" onclick="changePPQty(${p.id},1)">+</button>
          </div>
        </div>

        <!-- COMBO OFFER -->
        ${combo?`<div class="pp-section-block">
          <div class="pp-section-label">Active Offer</div>
          <div class="combo-offer-card" style="margin-top:.5rem;">
            <span class="combo-label">${combo.label}</span>
            <div class="combo-title">${combo.title}</div>
            <div class="combo-save">Save ${combo.save}</div>
            ${combo.detail.split(' · ').map(d=>`<div class="combo-detail">> ${d}</div>`).join('')}
            <button class="combo-cta" onclick="addPPComboToCart(${p.id})">Add Combo to Cart →</button>
          </div>
        </div>`:''}

        <!-- BULK PRICING -->
        <div class="pp-section-block">
          <div class="pp-section-label">Wholesale / Bulk Pricing</div>
          <div class="bulk-pricing-box" style="margin-top:.5rem;">
            <div style="display:flex;gap:1.5rem;flex-wrap:wrap;">
              <div><div style="font-size:.7rem;color:var(--muted);">1–9 pcs</div><div style="font-weight:700;">₹${p.price.toLocaleString('en-IN')}/pc</div></div>
              <div><div style="font-size:.7rem;color:var(--muted);">10–49 pcs</div><div style="font-weight:700;color:var(--success);">₹${p10.toLocaleString('en-IN')}/pc <span style="font-size:.65rem;">−10%</span></div></div>
              <div><div style="font-size:.7rem;color:var(--muted);">50+ pcs</div><div style="font-weight:700;color:var(--success);">₹${p50.toLocaleString('en-IN')}/pc <span style="font-size:.65rem;">−20%</span></div></div>
            </div>
            <div style="margin-top:.5rem;font-size:.72rem;color:var(--muted);">📞 <a href="tel:+918840130533" style="color:var(--accent)">+91 88401 30533</a> for 50+ pcs rates</div>
          </div>
        </div>

        <!-- CTA BUTTONS -->
        <div class="pp-cta-row">
          <button class="pp-add-cart-btn" onclick="addPPToCart(${p.id})">🛍 Add to Cart</button>
          <a href="https://wa.me/918840130533?text=Hi%2C+I+want+to+order+${encodeURIComponent(p.name)}+at+₹${p.price}" target="_blank" rel="noopener" class="pp-wa-btn">💬 Order on WhatsApp</a>
        </div>

        <!-- TRUST BADGES -->
        <div class="pp-trust-row">
          <div class="pp-trust-badge">🚚 Free delivery on ₹999+</div>
          <div class="pp-trust-badge">↩ 7-day returns</div>
          <div class="pp-trust-badge">💵 COD available</div>
          <div class="pp-trust-badge">🔒 Secure checkout</div>
        </div>
      </div>
    </div><!-- /pp-grid -->

    <!-- PRODUCT DETAILS TABS -->
    <div class="pp-tabs-wrap" style="margin-top:3rem;">
      <div class="pp-tabs">
        <button class="pp-tab active" onclick="switchPPTab('details',this)">Product Details</button>
        <button class="pp-tab" onclick="switchPPTab('sizechart',this)">Size Chart</button>
        <button class="pp-tab" onclick="switchPPTab('shipping',this)">Shipping & Returns</button>
      </div>

      <!-- DETAILS TAB -->
      <div class="pp-tab-content active" id="pp-tab-details">
        <div class="pp-details-grid">
          <div>
            <h3 class="pp-details-heading">Product Highlights</h3>
            <ul class="pp-highlights-list">
              ${detail.highlights.map(h=>`<li>${h}</li>`).join('')}
            </ul>
          </div>
          <div>
            <h3 class="pp-details-heading">Product Info</h3>
            <table class="pp-info-table">
              <tr><td>SKU</td><td>${detail.sku}</td></tr>
              <tr><td>Fabric</td><td>${detail.fabric}</td></tr>
              <tr><td>Fit</td><td>${detail.fit}</td></tr>
              <tr><td>Category</td><td>${p.category}</td></tr>
              <tr><td>MOQ</td><td>10 pieces</td></tr>
            </table>
            <h3 class="pp-details-heading" style="margin-top:1.2rem;">Care Instructions</h3>
            <ul class="pp-care-list">
              ${detail.care.map(c=>`<li>${c}</li>`).join('')}
            </ul>
            <div class="pp-tags" style="margin-top:1rem;">
              ${detail.tags.map(t=>`<span class="pp-tag">${t}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- SIZE CHART TAB -->
      <div class="pp-tab-content" id="pp-tab-sizechart" id="ppSizeChart">
        ${detail.sizeChart ? `
          <h3 class="pp-details-heading">Size Chart</h3>
          <p style="font-size:.82rem;color:var(--muted);margin-bottom:1rem;">All measurements are in inches. For the best fit, measure yourself and compare with the chart below.</p>
          <div class="table-wrap">
            <table class="admin-table" style="min-width:400px;">
              <thead><tr>${detail.sizeChart.headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
              <tbody>${detail.sizeChart.rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>
          </div>
          <div style="margin-top:1.2rem;padding:1rem;background:var(--surface);border:1px solid var(--border);font-size:.82rem;color:var(--muted);">
            💡 <strong>Tip:</strong> If you're between sizes, we recommend sizing up for a comfortable fit. For exact measurements, WhatsApp us at <a href="https://wa.me/918840130533" style="color:var(--accent);">+91 88401 30533</a>.
          </div>` : `<p style="color:var(--muted);font-size:.85rem;padding:1.5rem 0;">No size chart applicable for this product.</p>`}
      </div>

      <!-- SHIPPING TAB -->
      <div class="pp-tab-content" id="pp-tab-shipping">
        <div class="pp-shipping-grid">
          <div class="pp-shipping-card">
            <div style="font-size:2rem;margin-bottom:.6rem;">🚚</div>
            <div class="pp-shipping-title">Standard Delivery</div>
            <div style="font-size:.85rem;color:var(--muted);">3–5 business days across India. Free on orders above ₹999.</div>
          </div>
          <div class="pp-shipping-card">
            <div style="font-size:2rem;margin-bottom:.6rem;">💵</div>
            <div class="pp-shipping-title">Cash on Delivery</div>
            <div style="font-size:.85rem;color:var(--muted);">COD available on all orders. Pay when your order arrives.</div>
          </div>
          <div class="pp-shipping-card">
            <div style="font-size:2rem;margin-bottom:.6rem;">↩</div>
            <div class="pp-shipping-title">${detail.returnDays}-Day Returns</div>
            <div style="font-size:.85rem;color:var(--muted);">Unused items in original packaging. WhatsApp to initiate return.</div>
          </div>
          <div class="pp-shipping-card">
            <div style="font-size:2rem;margin-bottom:.6rem;">🏪</div>
            <div class="pp-shipping-title">Wholesale Orders</div>
            <div style="font-size:.85rem;color:var(--muted);">MOQ 10 pcs. Bulk discounts available. GST invoice provided.</div>
          </div>
        </div>
      </div>
    </div><!-- /pp-tabs-wrap -->

    <!-- REVIEWS SECTION -->
    <div id="ppReviewsAnchor" style="margin-top:3rem;">
      <h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;margin-bottom:1.5rem;">Customer Reviews</h2>
      ${renderFullReviewsSection(p.id)}
    </div>

    <!-- RELATED PRODUCTS -->
    <div style="margin-top:3.5rem;">
      <h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;margin-bottom:1.5rem;">You May Also Like</h2>
      <div class="product-grid">
        ${related.map((r,i)=>{
          const rAvg=getAvgRating(r.id); const rCount=getReviewCount(r.id); const rInWL=wishlist.find(w=>w.id===r.id);
          return `<div class="product-card reveal" style="animation-delay:${i*0.07}s" onclick="openProductPage(${r.id})">
            <div class="product-img-wrap">
              <img src="${r.img}" alt="${r.name}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
              ${r.badge?`<div class="product-badge">${r.badge}</div>`:''}
              <div class="moq-badge">MOQ: 10 pcs</div>
              <button class="wishlist-btn ${rInWL?'active':''}" onclick="event.stopPropagation();toggleWishlistItem(${r.id})" title="Wishlist">${rInWL?'♥':'♡'}</button>
            </div>
            <div class="product-info">
              <div class="product-name">${r.name}</div>
              <div class="product-category">${r.category}</div>
              ${rCount>0?`<div class="product-stars">${renderStars(rAvg,false,null,'0.75rem')}<span style="font-size:.68rem;color:var(--muted);margin-left:.3rem;">(${rCount})</span></div>`:''}
              <div class="product-footer">
                <div class="product-price">₹${r.price.toLocaleString('en-IN')}</div>
                <button class="add-cart-btn" onclick="event.stopPropagation();quickAddCart(${r.id})">+ Cart</button>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  </div><!-- /container -->
  `;
}

// ── GALLERY CONTROLS ──
let ppGalleryActive = {};

function initProductGallery(pid){
  ppGalleryActive[pid] = 0;
}

function switchProductImage(pid, idx, src, thumb){
  ppGalleryActive[pid] = idx;
  const mainImg = document.getElementById('ppMainImg_'+pid);
  if(mainImg){ mainImg.style.opacity='0.6'; mainImg.src=src; mainImg.style.opacity='1'; }
  document.querySelectorAll(`#ppThumbs_${pid} .pp-thumb`).forEach(t=>t.classList.remove('active'));
  if(thumb) thumb.classList.add('active');
}

// ── PRODUCT PAGE QTY ──
let ppQty = {};

function changePPQty(pid, d){
  if(!ppQty[pid]) ppQty[pid]=1;
  ppQty[pid] = Math.max(1, ppQty[pid]+d);
  const el = document.getElementById('ppQty_'+pid);
  if(el) el.textContent = ppQty[pid];
}

function selectPPSize(btn, size, pid){
  btn.closest('.size-selector').querySelectorAll('.size-option').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}

// ── PRODUCT PAGE ADD TO CART ──
function addPPToCart(pid){
  const size = document.querySelector(`#ppSizes_${pid} .size-option.active`)?.textContent;
  if(!size){ showToast(null,'Please select a size first'); return; }
  const qty = ppQty[pid]||1;
  for(let i=0;i<qty;i++) addToCart(pid,size);
  if(typeof incrementSold==='function') incrementSold(pid);
}

function addPPComboToCart(pid){
  const combo = (typeof COMBO_OFFERS!=='undefined') ? COMBO_OFFERS[pid] : null;
  if(!combo) return;
  const p = allProducts.find(p=>p.id===pid);
  if(!p) return;
  const sizes = sizesFor(p);
  const size = document.querySelector(`#ppSizes_${pid} .size-option.active`)?.textContent || sizes[0];
  for(let i=0;i<combo.minQty;i++) addToCart(pid,size);
  showToast(p.img,`🎉 Combo added! ${combo.minQty} × ${p.name}`);
}

// ── PRODUCT PAGE TABS ──
function switchPPTab(tab, btn){
  document.querySelectorAll('.pp-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.pp-tab-content').forEach(c=>c.classList.remove('active'));
  btn.classList.add('active');
  const content = document.getElementById('pp-tab-'+tab);
  if(content) content.classList.add('active');
}
// ── ENHANCED GALLERY WITH VIDEO SUPPORT ──
function initProductGallery(pid) {
  ppGalleryActive[pid] = 0;
  
  // Update the switchProductImage function to handle videos
  const originalSwitch = window.switchProductImage;
  window.switchProductImage = function(pid, idx, src, thumb) {
    ppGalleryActive[pid] = idx;
    const mainMedia = document.getElementById('ppMainImg_' + pid);
    
    if (!mainMedia) return;
    
    if (src && src.startsWith('video:')) {
      const videoUrl = src.substring(6);
      mainMedia.innerHTML = `
        <video controls autoplay muted loop playsinline 
               style="width:100%;height:100%;object-fit:contain;background:#000;">
          <source src="${videoUrl}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      `;
    } else {
      mainMedia.src = src;
      mainMedia.style.opacity = '0.6';
      setTimeout(() => { mainMedia.style.opacity = '1'; }, 300);
    }
    
    // Update thumbnail active state
    document.querySelectorAll(`#ppThumbs_${pid} .pp-thumb`).forEach(t => t.classList.remove('active'));
    if (thumb) thumb.classList.add('active');
  };
  
  // Restore original function when needed
  window.switchProductImage.restore = () => {
    window.switchProductImage = originalSwitch;
  };
}
