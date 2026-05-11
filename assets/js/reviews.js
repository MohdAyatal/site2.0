/* ================================================================
   WHOLESALE BAAZAR — reviews.js (ENHANCED v2)
   Star ratings · Rating breakdown bar · Photo upload reviews
   Verified purchase badge · Review modal · Product schema inject
   ================================================================ */

let productReviews = JSON.parse(localStorage.getItem('wb_reviews') || '{}');

function saveReviews(){ localStorage.setItem('wb_reviews', JSON.stringify(productReviews)); }

function getAvgRating(pid){
  const reviews = productReviews[pid] || [];
  if(!reviews.length) return 0;
  return reviews.reduce((s,r)=>s+r.rating,0)/reviews.length;
}

function getReviewCount(pid){ return (productReviews[pid]||[]).length; }

// ── STAR RENDER ──
function renderStars(rating, interactive, pid, size){
  size = size||'1rem';
  const full = Math.floor(rating);
  let html = `<span style="display:inline-flex;gap:1px;align-items:center;font-size:${size};">`;
  for(let i=1;i<=5;i++){
    const filled = i<=full||(i===full+1&&(rating-full)>=0.5);
    if(interactive&&pid){
      html+=`<span style="cursor:pointer;color:${i<=full?'#FF9900':'#ddd'};transition:color .15s;"
        onmouseover="hoverStars(this,${i})" onmouseout="resetStars(this,${pid})"
        onclick="setReviewRating(${pid},${i},this)" data-val="${i}">★</span>`;
    } else {
      html+=`<span style="color:${filled?'#FF9900':'#ddd'}">★</span>`;
    }
  }
  return html+'</span>';
}

function hoverStars(el,val){
  [...el.parentElement.children].forEach((s,i)=>s.style.color=i<val?'#FF9900':'#ddd');
}

function resetStars(el,pid){
  const sel = [...el.parentElement.children].find(s=>s.dataset.selected);
  const selected = sel?parseInt(sel.dataset.selected):0;
  [...el.parentElement.children].forEach((s,i)=>s.style.color=i<selected?'#FF9900':'#ddd');
}

let pendingRating={};
function setReviewRating(pid,rating,el){
  pendingRating[pid]=rating;
  [...el.parentElement.children].forEach(s=>delete s.dataset.selected);
  el.dataset.selected=rating;
  [...el.parentElement.children].forEach((s,i)=>s.style.color=i<rating?'#FF9900':'#ddd');
  const lbl=document.getElementById('ratingLabel_'+pid);
  const labels=['','Terrible 😞','Poor 😕','Okay 😐','Good 😊','Excellent! 🤩'];
  if(lbl) lbl.textContent=labels[rating]||'';
}

// ── RATING BREAKDOWN BAR ──
function renderRatingBreakdown(pid){
  const reviews=productReviews[pid]||[];
  const total=reviews.length;
  const avg=getAvgRating(pid);
  const counts={1:0,2:0,3:0,4:0,5:0};
  reviews.forEach(r=>counts[r.rating]=(counts[r.rating]||0)+1);
  if(!total) return `<div class="rb-empty">Be the first to review this product!</div>`;
  let bars='';
  for(let s=5;s>=1;s--){
    const pct=total>0?Math.round((counts[s]/total)*100):0;
    const col=s>=4?'#27ae60':s===3?'#FF9900':'#e74c3c';
    bars+=`<div class="rb-row">
      <span class="rb-label">${s} ★</span>
      <div class="rb-track"><div class="rb-fill" style="width:${pct}%;background:${col}"></div></div>
      <span class="rb-count">${counts[s]}</span>
    </div>`;
  }
  return `<div class="rating-breakdown">
    <div class="rb-summary">
      <div class="rb-big-score">${avg.toFixed(1)}</div>
      <div>${renderStars(avg,false,null,'1rem')}</div>
      <div class="rb-total-label">${total} review${total!==1?'s':''}</div>
    </div>
    <div class="rb-bars">${bars}</div>
  </div>`;
}

// ── REVIEW CARD ──
function renderReviewCard(r){
  const starsHtml=renderStars(r.rating,false,null,'0.82rem');
  const photosHtml=(r.photos&&r.photos.length)?`<div class="review-photos">${r.photos.map(ph=>`<img src="${ph}" alt="Review photo" class="review-photo-thumb" onclick="openPhotoViewer('${ph}')">`).join('')}</div>`:'';
  return `<div class="review-card">
    <div class="review-card-header">
      <div class="review-avatar">${r.name.charAt(0).toUpperCase()}</div>
      <div class="review-meta">
        <div class="review-name">${r.name}${r.verified?'<span class="verified-badge">✓ Verified Purchase</span>':''}</div>
        <div class="review-date">${r.date}</div>
      </div>
      <div class="review-stars-row">${starsHtml}</div>
    </div>
    ${r.title?`<div class="review-title">"${r.title}"</div>`:''}
    ${r.text?`<div class="review-text">${r.text}</div>`:''}
    ${photosHtml}
    <div class="review-helpful"><button onclick="markHelpful(this)" class="helpful-btn">👍 Helpful (${r.helpful||0})</button></div>
  </div>`;
}

function markHelpful(btn){
  const match=btn.textContent.match(/\((\d+)\)/);
  const count=match?parseInt(match[1])+1:1;
  btn.textContent=`👍 Helpful (${count})`;
  btn.style.color='var(--accent)';
  btn.disabled=true;
}

// ── PHOTO VIEWER ──
function openPhotoViewer(src){
  let ov=document.getElementById('photoViewerOv');
  if(!ov){ ov=document.createElement('div'); ov.id='photoViewerOv'; ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;'; ov.onclick=()=>ov.remove(); document.body.appendChild(ov); }
  ov.innerHTML=`<img src="${src}" style="max-width:92vw;max-height:92vh;object-fit:contain;"><button onclick="this.parentElement.remove()" style="position:absolute;top:1.5rem;right:1.5rem;background:none;border:none;color:#fff;font-size:2rem;cursor:pointer;">✕</button>`;
}

// ── CHECK PURCHASED ──
function checkPurchased(pid){
  const orders=JSON.parse(localStorage.getItem('wb_orders')||'[]');
  return orders.some(o=>o.items.some(i=>i.id===pid));
}

// ── WRITE REVIEW FORM ──
let pendingPhotos={};

function renderWriteReviewForm(pid){
  const hasPurchased=checkPurchased(pid);
  const user=(typeof currentUser!=='undefined')?currentUser:null;
  const defaultName=user?user.name.split(' ').map((w,i)=>i===0?w:w.charAt(0)+'.').join(' '):'';
  return `<div class="write-review-form" id="writeReviewForm_${pid}">
    <div class="review-form-title">✍ Write Your Review</div>
    <div class="form-group" style="margin-bottom:.9rem;">
      <label class="form-label">Your Rating *</label>
      <div style="display:flex;align-items:center;gap:.8rem;margin-top:.4rem;">
        ${renderStars(0,true,pid,'1.8rem')}
        <span id="ratingLabel_${pid}" style="font-size:.82rem;color:var(--accent);font-weight:600;"></span>
      </div>
    </div>
    <div class="form-group" style="margin-bottom:.8rem;">
      <label class="form-label">Review Title</label>
      <input class="form-input" id="reviewTitle_${pid}" placeholder="e.g. Great quality fabric!">
    </div>
    <div class="form-group" style="margin-bottom:.8rem;">
      <label class="form-label">Your Review *</label>
      <textarea class="form-input" id="reviewText_${pid}" rows="4" placeholder="Tell others about the quality, fit, delivery experience... (min. 20 characters)" style="resize:vertical;font-family:'DM Sans',sans-serif;line-height:1.6;"></textarea>
    </div>
    <div class="form-group" style="margin-bottom:.8rem;">
      <label class="form-label">Add Photos (optional)</label>
      <div class="photo-upload-area" onclick="document.getElementById('photoInput_${pid}').click()">
        <div style="font-size:2rem;margin-bottom:.4rem;">📸</div>
        <div style="font-size:.85rem;font-weight:600;color:var(--text);">Click to upload product photos</div>
        <div style="font-size:.72rem;color:var(--muted);margin-top:.3rem;">JPG or PNG · Up to 5 photos · Max 5MB each</div>
      </div>
      <input type="file" id="photoInput_${pid}" accept="image/*" multiple style="display:none" onchange="handlePhotoUpload(${pid},this)">
      <div id="photoPreviewRow_${pid}" class="photo-preview-row"></div>
    </div>
    <div class="form-group" style="margin-bottom:.8rem;">
      <label class="form-label">Your Name *</label>
      <input class="form-input" id="reviewerName_${pid}" placeholder="e.g. Priya S." value="${defaultName}">
    </div>
    ${hasPurchased?'<div style="font-size:.72rem;color:var(--success);margin-bottom:.6rem;">✓ You purchased this product — review will show as Verified Purchase</div>':''}
    <div id="reviewFormError_${pid}" style="font-size:.78rem;color:#e04;min-height:1rem;margin-bottom:.4rem;"></div>
    <button class="btn-primary" style="width:100%;padding:.95rem;font-size:.85rem;" onclick="submitReview(${pid})">Submit Review →</button>
  </div>`;
}

function handlePhotoUpload(pid,input){
  const files=[...input.files].slice(0,5);
  if(!pendingPhotos[pid]) pendingPhotos[pid]=[];
  const row=document.getElementById('photoPreviewRow_'+pid);
  if(!row) return;
  files.forEach(file=>{
    if(file.size>5*1024*1024){ showToast(null,'Photo too large (max 5MB)'); return; }
    const reader=new FileReader();
    reader.onload=e=>{
      const idx=pendingPhotos[pid].length;
      pendingPhotos[pid].push(e.target.result);
      const wrap=document.createElement('div');
      wrap.className='photo-preview-item';
      wrap.innerHTML=`<img src="${e.target.result}" alt="Preview"><button onclick="removePreviewPhoto(${pid},${idx},this)" class="photo-remove-btn">✕</button>`;
      row.appendChild(wrap);
    };
    reader.readAsDataURL(file);
  });
}

function removePreviewPhoto(pid,idx,btn){
  pendingPhotos[pid].splice(idx,1);
  btn.closest('.photo-preview-item').remove();
}

function submitReview(pid){
  const rating=pendingRating[pid]||0;
  const title=document.getElementById('reviewTitle_'+pid)?.value.trim();
  const text=document.getElementById('reviewText_'+pid)?.value.trim();
  const name=document.getElementById('reviewerName_'+pid)?.value.trim();
  const errEl=document.getElementById('reviewFormError_'+pid);
  const photos=pendingPhotos[pid]||[];
  if(!rating){ if(errEl) errEl.textContent='Please select a star rating.'; return; }
  if(!name){ if(errEl) errEl.textContent='Please enter your name.'; return; }
  if(text&&text.length<20){ if(errEl) errEl.textContent='Review must be at least 20 characters.'; return; }
  const verified=checkPurchased(pid);
  if(!productReviews[pid]) productReviews[pid]=[];
  const email=(typeof currentUser!=='undefined'&&currentUser)?currentUser.email:'guest_'+Date.now();
  const existing=productReviews[pid].findIndex(r=>r.email===email);
  const review={name,email,rating,title:title||'',text:text||'',photos,verified,helpful:0,date:new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})};
  if(existing>-1) productReviews[pid][existing]=review;
  else productReviews[pid].push(review);
  saveReviews();
  pendingRating[pid]=0; pendingPhotos[pid]=[];
  const p=allProducts.find(p=>p.id===pid);
  if(p) injectProductSchema(p);
  if(typeof currentSection!=='undefined'&&currentSection) renderProducts(currentSection);
  closeReviewModal();
  showToast(null,'⭐ Thank you for your review!');
}

// ── FULL REVIEWS SECTION ──
function renderFullReviewsSection(pid){
  const reviews=productReviews[pid]||[];
  const hasPurchased=checkPurchased(pid);
  const sorted=[...reviews].sort((a,b)=>b.rating-a.rating);
  return `<div class="full-reviews-wrap">
    ${renderRatingBreakdown(pid)}
    <button class="write-review-btn" onclick="openReviewModal(${pid})">✍ Write a Review</button>
    <div class="reviews-list">
      ${sorted.length?sorted.map(r=>renderReviewCard(r)).join(''):'<div class="rb-empty">No reviews yet — be the first!</div>'}
    </div>
  </div>`;
}

// ── REVIEW MODAL ──
function openReviewModal(pid){
  let modal=document.getElementById('reviewModal');
  if(!modal){ modal=document.createElement('div'); modal.id='reviewModal'; modal.className='modal-overlay'; modal.onclick=e=>{if(e.target===modal)closeReviewModal();}; document.body.appendChild(modal); }
  const p=allProducts.find(p=>p.id===pid);
  modal.innerHTML=`<div class="modal-box" style="max-width:540px;">
    <div style="display:flex;align-items:center;gap:.8rem;margin-bottom:1.2rem;padding-bottom:1rem;border-bottom:1px solid var(--border);">
      <img src="${p?p.img:''}" alt="" style="width:52px;height:64px;object-fit:cover;background:#eaeaea;flex-shrink:0;">
      <div><div style="font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;">${p?p.name:''}</div><div style="font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;">${p?p.category:''}</div></div>
      <button onclick="closeReviewModal()" style="margin-left:auto;background:none;border:none;font-size:1.4rem;color:var(--muted);cursor:pointer;line-height:1;">✕</button>
    </div>
    ${renderWriteReviewForm(pid)}
  </div>`;
  modal.classList.add('open');
}

function closeReviewModal(){
  const modal=document.getElementById('reviewModal');
  if(modal) modal.classList.remove('open');
}

// ── QUICKVIEW REVIEWS (compact) ──
function refreshQuickviewReviews(pid){
  const el=document.getElementById('qvReviewsSection');
  if(el) el.innerHTML=renderFullReviewsSection(pid);
}

// ── DYNAMIC PRODUCT SCHEMA ──
function injectProductSchema(p){
  let el=document.getElementById('dynamic-product-schema');
  if(!el){ el=document.createElement('script'); el.type='application/ld+json'; el.id='dynamic-product-schema'; document.head.appendChild(el); }
  const avgRating=getAvgRating(p.id);
  const reviewCount=getReviewCount(p.id);
  const schema={
    "@context":"https://schema.org","@type":"Product",
    "name":p.name,"description":p.desc||'Premium quality fashion item from Wholesale Baazar.',
    "image":[p.img],"brand":{"@type":"Brand","name":"Wholesale Baazar"},
    "category":p.category,"sku":"WB-"+p.id,
    "offers":{"@type":"Offer","url":"https://wholesalebaazar.in/#"+p.section,"priceCurrency":"INR","price":p.price,"priceValidUntil":"2027-12-31","availability":"https://schema.org/InStock","seller":{"@type":"Organization","name":"Wholesale Baazar"}}
  };
  if(reviewCount>0){
    schema.aggregateRating={"@type":"AggregateRating","ratingValue":avgRating.toFixed(1),"reviewCount":reviewCount,"bestRating":"5","worstRating":"1"};
    schema.review=(productReviews[p.id]||[]).slice(0,3).map(r=>({
      "@type":"Review","author":{"@type":"Person","name":r.name},
      "reviewRating":{"@type":"Rating","ratingValue":r.rating,"bestRating":"5"},
      "reviewBody":r.text||''
    }));
  }
  el.textContent=JSON.stringify(schema);
}
