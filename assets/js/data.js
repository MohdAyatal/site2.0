/* ================================================================
   WHOLESALE BAAZAR — data.js
   All product data + slideshow data + size helpers
   ================================================================ */

const FALLBACK_IMG = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" fill="%23eaeaea"><rect width="400" height="500"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23aaa" font-size="16">No Image</text></svg>';

const ADULT_SIZES = ['XS','S','M','L','XL','XXL'];
const KIDS_SIZES  = ['2Y','4Y','6Y','8Y','10Y','12Y'];
const UNIT_SIZES  = ['1 Unit','Pack of 2','Pack of 3','Pack of 6'];
const SUPP_SIZES  = ['250g','500g','1kg','2kg','60 Tabs','90 Tabs'];

function sizesFor(p){
  if(p.section==='kids')        return KIDS_SIZES;
  if(p.section==='homekitchen') return UNIT_SIZES;
  if(p.section==='supplements') return SUPP_SIZES;
  return ADULT_SIZES;
}

let slideshowSlides = JSON.parse(localStorage.getItem('wb_slides') || 'null') || [
  {url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=800&fit=crop&q=80', caption:'New Arrivals 2026'},
  {url:'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&h=800&fit=crop&q=80', caption:"Women's Collection"},
  {url:'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1400&h=800&fit=crop&q=80', caption:'Style for Everyone'},
  {url:'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&h=800&fit=crop&q=80', caption:'Kids Collection'}
];

let allProducts = JSON.parse(localStorage.getItem('wb_products') || 'null') || [
  // ── MEN (17) ──
  {id:1,  name:'Classic Oxford Shirt',       section:'men', category:'Shirts',     price:1299, badge:'NEW',    desc:'Crisp cotton Oxford weave, perfect for office or smart-casual outings.',                    img:'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=500&fit=crop&q=80'},
  {id:2,  name:'Slim Fit Chinos',            section:'men', category:'Trousers',   price:1599, badge:'',       desc:'Tapered slim-fit chinos in stretch cotton for all-day comfort.',                           img:'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400&h=500&fit=crop&q=80'},
  {id:3,  name:'Genuine Leather Belt',       section:'men', category:'Accessories',price:699,  badge:'',       desc:'Full-grain leather belt with classic pin buckle, built to last.',                          img:'https://images.unsplash.com/photo-1553531889-e6cf4d692b1b?w=400&h=500&fit=crop&q=80'},
  {id:4,  name:'Vintage Denim Jacket',       section:'men', category:'Jackets',    price:2499, badge:'SALE',   desc:'Stonewashed denim jacket with classic collar and chest pockets.',                          img:'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&h=500&fit=crop&q=80'},
  {id:5,  name:'Classic Polo T-Shirt',       section:'men', category:'T-Shirts',   price:899,  badge:'',       desc:'Premium pique polo with ribbed collar and two-button placket.',                            img:'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=500&fit=crop&q=80'},
  {id:6,  name:'Formal Dress Trousers',      section:'men', category:'Trousers',   price:1799, badge:'',       desc:'Flat-front dress trousers in fine wool-blend fabric for formal events.',                    img:'https://images.unsplash.com/photo-1594938298603-c8148c4b4416?w=400&h=500&fit=crop&q=80'},
  {id:7,  name:'Urban Casual Sneakers',      section:'men', category:'Footwear',   price:2299, badge:'HOT',    desc:'Lightweight sneakers with cushioned sole for everyday street style.',                      img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop&q=80'},
  {id:8,  name:'Oxford Formal Shoes',        section:'men', category:'Footwear',   price:3499, badge:'',       desc:'Hand-stitched leather Oxford shoes for polished boardroom looks.',                         img:'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&h=500&fit=crop&q=80'},
  {id:9,  name:'Winter Puffer Jacket',       section:'men', category:'Jackets',    price:3999, badge:'NEW',    desc:'Insulated puffer jacket with water-resistant shell for cold winters.',                     img:'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=400&h=500&fit=crop&q=80'},
  {id:10, name:'Abstract Graphic Tee',       section:'men', category:'T-Shirts',   price:599,  badge:'SALE',   desc:'100% cotton tee with bold abstract print, relaxed fit.',                                  img:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop&q=80'},
  {id:11, name:'Cargo Utility Pants',        section:'men', category:'Trousers',   price:1399, badge:'',       desc:'Multi-pocket cargo pants in durable ripstop fabric.',                                    img:'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop&q=80'},
  {id:12, name:'Breezy Linen Shirt',         section:'men', category:'Shirts',     price:1099, badge:'',       desc:'Lightweight linen shirt ideal for warm weather and beach outings.',                        img:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop&q=80'},
  {id:13, name:'Performance Sports Shorts',  section:'men', category:'Activewear', price:799,  badge:'',       desc:'Moisture-wicking shorts with inner liner for gym and running.',                           img:'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=500&fit=crop&q=80'},
  {id:14, name:'Merino Wool Sweater',        section:'men', category:'Knitwear',   price:2199, badge:'NEW',    desc:'Fine merino wool crewneck sweater, soft and temperature-regulating.',                     img:'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&h=500&fit=crop&q=80'},
  {id:15, name:'Jogger Track Suit',          section:'men', category:'Activewear', price:1999, badge:'',       desc:'Matching track jacket and jogger set in soft French terry.',                              img:'https://images.unsplash.com/photo-1562886812-a2e523bab4ef?w=400&h=500&fit=crop&q=80'},
  {id:16, name:'Beach Swim Trunks',          section:'men', category:'Swimwear',   price:699,  badge:'',       desc:'Quick-dry swim trunks with drawstring waist and side pockets.',                           img:'https://images.unsplash.com/photo-1565462905009-8e0ada4a3f8d?w=400&h=500&fit=crop&q=80'},
  {id:17, name:'Tailored Slim Blazer',       section:'men', category:'Formals',    price:4999, badge:'LUXURY', desc:'Single-breasted slim blazer in premium wool blend, fully lined.',                          img:'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop&q=80'},
  // ── WOMEN (17) ──
  {id:18, name:'Floral Maxi Dress',          section:'women', category:'Dresses',   price:1899, badge:'HOT',     desc:'Flowy floral-print maxi dress with adjustable straps and tiered hem.',                  img:'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop&q=80'},
  {id:19, name:'Ribbed Crop Top',            section:'women', category:'Tops',      price:699,  badge:'',        desc:'Stretchy ribbed crop top with scoop neck, pairs with anything.',                       img:'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400&h=500&fit=crop&q=80'},
  {id:20, name:'High Waist Skinny Jeans',    section:'women', category:'Bottoms',   price:1599, badge:'NEW',     desc:'High-rise skinny jeans in stretch denim for a flattering silhouette.',                  img:'https://images.unsplash.com/photo-1542574271-7f3b92e6c821?w=400&h=500&fit=crop&q=80'},
  {id:21, name:'Satin Silk Blouse',          section:'women', category:'Tops',      price:1299, badge:'',        desc:'Elegant satin blouse with V-neck and relaxed boyfriend fit.',                         img:'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=400&h=500&fit=crop&q=80'},
  {id:22, name:'Pleated Mini Skirt',         section:'women', category:'Bottoms',   price:999,  badge:'SALE',    desc:'Knife-pleated mini skirt in crepe fabric, elastic waistband.',                        img:'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=500&fit=crop&q=80'},
  {id:23, name:'Flowy Palazzo Pants',        section:'women', category:'Bottoms',   price:1199, badge:'',        desc:'Wide-leg palazzo pants in chiffon, breezy and sophisticated.',                        img:'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop&q=80'},
  {id:24, name:'Embroidered Kurti',          section:'women', category:'Ethnic',    price:899,  badge:'NEW',     desc:'Handcrafted embroidered cotton kurti with traditional mirror work.',                    img:'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=500&fit=crop&q=80'},
  {id:25, name:'Banarasi Silk Saree',        section:'women', category:'Ethnic',    price:3999, badge:'PREMIUM', desc:'Authentic Banarasi silk saree with zari border and contrast blouse piece.',              img:'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop&q=80'},
  {id:26, name:'Oversized Denim Jacket',     section:'women', category:'Jackets',   price:1999, badge:'',        desc:'Oversized denim jacket with raw hem and vintage wash.',                               img:'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=500&fit=crop&q=80'},
  {id:27, name:'Sports Bra (Pack of 2)',     section:'women', category:'Activewear',price:799,  badge:'',        desc:'High-impact sports bra with racerback design and moisture control.',                   img:'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=400&h=500&fit=crop&q=80'},
  {id:28, name:'Yoga Fit Leggings',          section:'women', category:'Activewear',price:699,  badge:'HOT',     desc:'Four-way stretch leggings with hidden pocket and compression fit.',                    img:'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=500&fit=crop&q=80'},
  {id:29, name:'Boho Knit Cardigan',         section:'women', category:'Knitwear',  price:1499, badge:'',        desc:'Open-front boho cardigan in chunky knit with fringe detailing.',                      img:'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=500&fit=crop&q=80'},
  {id:30, name:'Floral Linen Jumpsuit',      section:'women', category:'Dresses',   price:2199, badge:'NEW',     desc:'Relaxed linen jumpsuit with floral embroidery and wide legs.',                        img:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop&q=80'},
  {id:31, name:'Velvet Evening Gown',        section:'women', category:'Formals',   price:4999, badge:'LUXURY',  desc:'Floor-length velvet gown with plunging back and trumpet silhouette.',                  img:'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop&q=80'},
  {id:32, name:'Anarkali Ethnic Set',        section:'women', category:'Ethnic',    price:2499, badge:'SALE',    desc:'Embellished anarkali kurta with matching churidar and dupatta.',                      img:'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=500&fit=crop&q=80'},
  {id:33, name:'Cozy Oversized Hoodie',      section:'women', category:'Knitwear',  price:1299, badge:'',        desc:'Dropped-shoulder hoodie in heavyweight fleece with kangaroo pocket.',                  img:'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop&q=80'},
  {id:34, name:'Racerback Tank Top',         section:'women', category:'Tops',      price:599,  badge:'',        desc:'Seamless racerback tank in soft modal blend, easy everyday layering.',                 img:'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=400&h=500&fit=crop&q=80'},
  // ── KIDS (16) ──
  {id:35, name:'Dino Print Cartoon Tee',     section:'kids', category:'Tops',       price:499,  badge:'NEW',  desc:'Soft cotton tee with fun dinosaur print, machine washable.',                              img:'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=500&fit=crop&q=80'},
  {id:36, name:'Denim Bermuda Shorts',       section:'kids', category:'Bottoms',    price:599,  badge:'',    desc:'Classic denim shorts with adjustable waistband for growing kids.',                         img:'https://images.unsplash.com/photo-1519278409-1f56ab241a17?w=400&h=500&fit=crop&q=80'},
  {id:37, name:'School Uniform Set',         section:'kids', category:'Uniforms',   price:999,  badge:'',    desc:'Durable school uniform with shirt and trousers, easy-care fabric.',                        img:'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=500&fit=crop&q=80'},
  {id:38, name:'Princess Party Dress',       section:'kids', category:'Dresses',    price:1299, badge:'HOT', desc:'Tulle princess dress with satin bodice and sparkling sequin detail.',                      img:'https://images.unsplash.com/photo-1476234251651-f353703a034d?w=400&h=500&fit=crop&q=80'},
  {id:39, name:'Comfy Jogger Set',           section:'kids', category:'Activewear', price:799,  badge:'',    desc:'Two-piece jogger set in cotton fleece, cozy for home and play.',                           img:'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=500&fit=crop&q=80'},
  {id:40, name:'Waterproof Rain Jacket',     section:'kids', category:'Jackets',    price:1099, badge:'',    desc:'Lightweight waterproof rain jacket with hood and sealed seams.',                           img:'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=500&fit=crop&q=80'},
  {id:41, name:'Soft Pyjama Set',            section:'kids', category:'Sleepwear',  price:699,  badge:'',    desc:'Ultra-soft cotton pyjama set with playful animal print.',                                  img:'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=500&fit=crop&q=80'},
  {id:42, name:'Festive Ethnic Kurta',       section:'kids', category:'Ethnic',     price:899,  badge:'NEW', desc:'Embroidered kurta in silk blend for festivals and special occasions.',                     img:'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=500&fit=crop&q=80'},
  {id:43, name:'Light-Up Sneakers',          section:'kids', category:'Footwear',   price:1299, badge:'HOT', desc:'Velcro sneakers with LED lights in the sole — kids love them!',                           img:'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400&h=500&fit=crop&q=80'},
  {id:44, name:'Beach Swim Set',             section:'kids', category:'Swimwear',   price:799,  badge:'',    desc:'Rash guard and board shorts set with UPF 50+ sun protection.',                            img:'https://images.unsplash.com/photo-1476234251651-f353703a034d?w=400&h=500&fit=crop&q=80'},
  {id:45, name:'Padded Winter Jacket',       section:'kids', category:'Jackets',    price:1499, badge:'NEW', desc:'Warm padded jacket with hood and reflective strips for safety.',                          img:'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=500&fit=crop&q=80'},
  {id:46, name:'Superhero Printed Hoodie',   section:'kids', category:'Tops',       price:899,  badge:'',    desc:'Bold superhero graphic hoodie in cozy brushed fleece.',                                   img:'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=500&fit=crop&q=80'},
  {id:47, name:'Daisy Floral Dress',         section:'kids', category:'Dresses',    price:999,  badge:'SALE',desc:'Sweet daisy-print cotton dress with smocked bodice and puff sleeves.',                    img:'https://images.unsplash.com/photo-1476234251651-f353703a034d?w=400&h=500&fit=crop&q=80'},
  {id:48, name:'Junior Sports Kit',          section:'kids', category:'Activewear', price:1199, badge:'',    desc:'Breathable jersey top and shorts set for junior sports players.',                         img:'https://images.unsplash.com/photo-1519278409-1f56ab241a17?w=400&h=500&fit=crop&q=80'},
  {id:49, name:'Woolen Pullover Sweater',    section:'kids', category:'Knitwear',   price:799,  badge:'',    desc:'Warm woolen pullover with contrast stripe detail, easy pull-on.',                         img:'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=500&fit=crop&q=80'},
  {id:50, name:'Classic Denim Dungaree',     section:'kids', category:'Bottoms',    price:1099, badge:'',    desc:'Adjustable strap denim dungaree with front bib pocket.',                                  img:'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=500&fit=crop&q=80'},
  // ── HOME & KITCHEN (12) ──
  {id:51, name:'Non-Stick Cookware Set',     section:'homekitchen', category:'Cookware',    price:2499, badge:'HOT',  desc:'5-piece premium non-stick cookware set with glass lids. PFOA-free coating.',             img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=500&fit=crop&q=80'},
  {id:52, name:'Stainless Steel Tiffin Box', section:'homekitchen', category:'Storage',     price:699,  badge:'',    desc:'3-tier leak-proof stainless steel lunch box with carry bag.',                           img:'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&q=80'},
  {id:53, name:'Microfibre Bedsheet Set',    section:'homekitchen', category:'Bedding',     price:1299, badge:'NEW', desc:'King size 1000 TC microfibre bedsheet with 2 pillow covers, wrinkle-resistant.',        img:'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=500&fit=crop&q=80'},
  {id:54, name:'Kitchen Cleaning Brush Set', section:'homekitchen', category:'Cleaning',    price:399,  badge:'',    desc:'6-piece kitchen cleaning brush set with ergonomic handles.',                            img:'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=500&fit=crop&q=80'},
  {id:55, name:'Ceramic Flower Vase',        section:'homekitchen', category:'Decor',       price:899,  badge:'',    desc:'Handcrafted ceramic vase with geometric pattern, perfect table centrepiece.',           img:'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=400&h=500&fit=crop&q=80'},
  {id:56, name:'Electric Kettle 1.5L',       section:'homekitchen', category:'Appliances',  price:1499, badge:'SALE',desc:'1500W electric kettle with auto shut-off and boil-dry protection.',                    img:'https://images.unsplash.com/photo-1556909190-10f44c7f7143?w=400&h=500&fit=crop&q=80'},
  {id:57, name:'Airtight Container Set',     section:'homekitchen', category:'Storage',     price:799,  badge:'',    desc:'Set of 6 BPA-free airtight food storage containers in assorted sizes.',                 img:'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&q=80'},
  {id:58, name:'Wooden Chopping Board',      section:'homekitchen', category:'Cookware',    price:549,  badge:'',    desc:'Premium acacia wood chopping board with juice groove, anti-slip feet.',                img:'https://images.unsplash.com/photo-1591189824339-45bd98fa5533?w=400&h=500&fit=crop&q=80'},
  {id:59, name:'Mop & Bucket Set',           section:'homekitchen', category:'Cleaning',    price:999,  badge:'NEW', desc:'360° spin mop with self-wringing bucket and 2 microfibre heads.',                     img:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=500&fit=crop&q=80'},
  {id:60, name:'Wall Clock Minimalist',      section:'homekitchen', category:'Decor',       price:649,  badge:'',    desc:'Silent sweep mechanism wall clock with nordic minimalist design.',                     img:'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400&h=500&fit=crop&q=80'},
  {id:61, name:'Air Fryer 3.5L',             section:'homekitchen', category:'Appliances',  price:4999, badge:'HOT', desc:'Digital air fryer with 8 preset modes, 1500W, dishwasher-safe basket.',                img:'https://images.unsplash.com/photo-1625961332771-3f40b0e2bdcf?w=400&h=500&fit=crop&q=80'},
  {id:62, name:'Pillow Pack of 2',           section:'homekitchen', category:'Bedding',     price:799,  badge:'',    desc:'Extra-soft hollow fibre pillows with hypoallergenic filling, washable cover.',          img:'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=400&h=500&fit=crop&q=80'},
  // ── SUPPLEMENTS (10) ──
  {id:63, name:'Whey Protein Chocolate 1kg', section:'supplements', category:'Protein',          price:1999, badge:'HOT',  desc:'24g protein per serving, rich chocolate flavour, fast-absorbing whey isolate blend.',img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop&q=80'},
  {id:64, name:'Multivitamin Men 60 Tabs',   section:'supplements', category:'Vitamins',          price:799,  badge:'',    desc:'Complete daily multivitamin with 23 essential vitamins and minerals for men.',       img:'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=500&fit=crop&q=80'},
  {id:65, name:'Pre-Workout Explosive',      section:'supplements', category:'Pre-Workout',       price:1499, badge:'NEW', desc:'200mg caffeine, beta-alanine, citrulline for explosive gym performance.',           img:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop&q=80'},
  {id:66, name:'Fat Burner Thermogenic',     section:'supplements', category:'Weight Loss',       price:1299, badge:'',    desc:'Green tea extract, L-carnitine and CLA blend for natural fat metabolism support.', img:'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=500&fit=crop&q=80'},
  {id:67, name:'Ashwagandha 500mg 60 Caps',  section:'supplements', category:'Ayurvedic',         price:599,  badge:'',    desc:'KSM-66 standardized ashwagandha root extract for stress relief and vitality.',     img:'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=400&h=500&fit=crop&q=80'},
  {id:68, name:'BCAA 2:1:1 Mango 250g',      section:'supplements', category:'Sports Nutrition',  price:1099, badge:'',    desc:'Branched-chain amino acids for muscle recovery. Sugar-free mango flavour.',        img:'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=500&fit=crop&q=80'},
  {id:69, name:'Whey Protein Vanilla 2kg',   section:'supplements', category:'Protein',          price:3499, badge:'SALE', desc:'Premium whey concentrate with 22g protein, low carb, easy-mix formula.',           img:'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=500&fit=crop&q=80'},
  {id:70, name:'Vitamin D3 + K2 60 Tabs',    section:'supplements', category:'Vitamins',          price:699,  badge:'NEW', desc:'2000 IU Vitamin D3 paired with K2 for optimal calcium absorption and bone health.',img:'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=500&fit=crop&q=80'},
  {id:71, name:'Triphala Churna 200g',        section:'supplements', category:'Ayurvedic',         price:299,  badge:'',    desc:'Traditional Ayurvedic blend of amla, haritaki and bibhitaki for digestive wellness.',img:'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=400&h=500&fit=crop&q=80'},
  {id:72, name:'Creatine Monohydrate 300g',  section:'supplements', category:'Sports Nutrition',  price:899,  badge:'HOT', desc:'Micronised creatine monohydrate for strength and power output. Unflavoured.',      img:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop&q=80'}
];

// Subcategory filter maps
const SUBCAT_MAP = {
  men: {
    all:null,
    shoes:['Footwear','Shoes'],
    gymwear:['Activewear','Gymwear','Gym Wear','Sports'],
    partywear:['Formals','Party Wear','Partywear'],
    hygiene:['Hygiene','Mens Hygiene','Personal Care'],
    casual:['T-Shirts','Shirts','Trousers','Knitwear','Swimwear','Casual','Chinos'],
    wearables:['Accessories','Wearables','Smartwatch','Knitwear','Jackets']
  },
  women: {
    all:null,
    cosmetics:['Cosmetics','Beauty','Skincare'],
    shoes:['Footwear','Shoes','Heels'],
    hygiene:['Hygiene','Personal Care','Feminine Care'],
    makeup:['Makeup','Cosmetics','Beauty'],
    wearables:['Accessories','Wearables','Knitwear','Jewellery'],
    clothes:['Dresses','Tops','Bottoms','Ethnic','Jumpsuits','Sarees'],
    partywear:['Formals','Dresses','Ethnic','Anarkali'],
    casual:['Tops','Bottoms','Knitwear','Jackets','Casual'],
    gymwear:['Activewear','Gymwear','Gym Wear','Sports']
  },
  kids: {
    all:null,
    shoes:['Footwear','Shoes'],
    wearables:['Accessories','Wearables','Smartwatch'],
    casual:['Tops','Bottoms','Activewear','Sleepwear','Jackets','Swimwear','Knitwear','Casual'],
    partywear:['Dresses','Ethnic','Formals','Party Wear'],
    schoolsupplies:['Uniforms','School Supplies','Stationery']
  },
  homekitchen: {
    all:null,
    cookware:['Cookware','Bakeware','Kitchen Tools'],
    storage:['Storage','Containers','Organisers'],
    bedding:['Bedding','Pillows','Mattress','Blankets'],
    cleaning:['Cleaning','Mops','Brushes','Laundry'],
    decor:['Decor','Wall Art','Vases','Candles','Clocks'],
    appliances:['Appliances','Kettles','Air Fryer','Mixer']
  },
  supplements: {
    all:null,
    protein:['Protein','Whey','Mass Gainer','Casein'],
    vitamins:['Vitamins','Minerals','Omega','Fish Oil'],
    preworkout:['Pre-Workout','Energy','Pump','Stimulant'],
    weightloss:['Weight Loss','Fat Burner','CLA','Thermogenic'],
    ayurvedic:['Ayurvedic','Herbal','Triphala','Ashwagandha'],
    sports:['Sports Nutrition','BCAA','Creatine','Glutamine']
  }
};

function saveProducts(){ localStorage.setItem('wb_products', JSON.stringify(allProducts)); }
function saveSlides(){ localStorage.setItem('wb_slides', JSON.stringify(slideshowSlides)); }
