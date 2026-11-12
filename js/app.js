// Shared code used by every page: storage, navbar, footer, cart, wishlist, toasts.

const STORE = {
  cart: "gym_cart",
  wishlist: "gym_wishlist",
  orders: "gym_orders",
  coupon: "gym_coupon",
  buyNow: "gym_buy_now",
};

/* ---------- storage helpers ---------- */
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* storage blocked: ignore */
  }
}

/* ---------- formatting ---------- */
function rupees(n) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function discountPercent(p) {
  return Math.round(((p.mrp - p.price) / p.mrp) * 100);
}

function storageLabel(gb) {
  return gb >= 1024 ? gb / 1024 + "TB" : gb + "GB";
}

function productTitle(p) {
  return `${p.name} (${p.color}, ${storageLabel(p.storage)})`;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/* ---------- cart ---------- */
function getCart() {
  // Drop any items whose product no longer exists.
  return load(STORE.cart, []).filter((item) => getProduct(item.id));
}

function setCart(cart) {
  save(STORE.cart, cart);
  updateBadges();
}

function cartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function cartQty(id) {
  const item = getCart().find((i) => i.id === id);
  return item ? item.qty : 0;
}

const MAX_QTY = 5;

function addToCart(id, qty = 1) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (item) {
    if (item.qty >= MAX_QTY) {
      showToast(`You can buy at most ${MAX_QTY} units of this phone.`, "warning");
      return;
    }
    item.qty = Math.min(MAX_QTY, item.qty + qty);
  } else {
    cart.push({ id, qty: Math.min(MAX_QTY, qty) });
  }
  setCart(cart);
  showToast(`${getProduct(id).name} added to cart`, "success", { text: "View cart", href: "cart.html" });
}

function setQty(id, qty) {
  let cart = getCart();
  if (qty <= 0) cart = cart.filter((i) => i.id !== id);
  else cart.forEach((i) => { if (i.id === id) i.qty = Math.min(MAX_QTY, qty); });
  setCart(cart);
}

function removeFromCart(id) {
  setCart(getCart().filter((i) => i.id !== id));
}

/* ---------- wishlist ---------- */
function getWishlist() {
  return load(STORE.wishlist, []).filter((id) => getProduct(id));
}

function isWished(id) {
  return getWishlist().includes(id);
}

function toggleWishlist(id) {
  let list = getWishlist();
  if (list.includes(id)) {
    list = list.filter((x) => x !== id);
    showToast("Removed from wishlist", "secondary");
  } else {
    list.push(id);
    showToast("Added to wishlist", "danger", { text: "View", href: "wishlist.html" });
  }
  save(STORE.wishlist, list);
  updateBadges();
  return list.includes(id);
}

/* ---------- price summary ---------- */
// items: [{ id, qty }]
function priceSummary(items, couponCode) {
  let mrp = 0;
  let price = 0;
  items.forEach((i) => {
    const p = getProduct(i.id);
    mrp += p.mrp * i.qty;
    price += p.price * i.qty;
  });
  let couponDiscount = 0;
  let couponError = "";
  const coupon = couponCode ? COUPONS[couponCode] : null;
  if (couponCode && !coupon) couponError = "Invalid coupon code.";
  else if (coupon && price < coupon.minOrder) couponError = `Add items worth ${rupees(coupon.minOrder - price)} more to use ${couponCode}.`;
  else if (coupon) {
    couponDiscount = coupon.type === "percent" ? Math.min((price * coupon.value) / 100, coupon.max) : coupon.value;
  }
  const delivery = price === 0 || price >= 999 ? 0 : 49;
  return {
    mrp,
    price,
    productDiscount: mrp - price,
    couponDiscount: Math.round(couponDiscount),
    couponError,
    delivery,
    total: Math.max(0, Math.round(price - couponDiscount + delivery)),
    count: items.reduce((s, i) => s + i.qty, 0),
  };
}

/* ---------- product card (used on home, wishlist, similar products) ---------- */
function stars(rating) {
  return `<span class="rating-badge">${rating.toFixed(1)} ★</span>`;
}

function productCard(p) {
  const inCart = cartQty(p.id) > 0;
  return `
  <div class="col">
    <div class="card product-card h-100">
      <button class="wish-btn ${isWished(p.id) ? "active" : ""}" data-wish="${p.id}" aria-label="Add ${escapeHtml(p.name)} to wishlist" title="Wishlist">
        <i class="bi ${isWished(p.id) ? "bi-heart-fill" : "bi-heart"}"></i>
      </button>
      ${p.bankOffer ? '<span class="offer-tag">Bank Offer</span>' : ""}
      <a href="product.html?id=${p.id}" class="product-img-wrap">
        <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy">
      </a>
      <div class="card-body d-flex flex-column">
        <small class="text-uppercase text-muted fw-semibold brand-label">${p.brand}</small>
        <a href="product.html?id=${p.id}" class="product-name">${escapeHtml(productTitle(p))}</a>
        <div class="my-1">${stars(p.rating)} <small class="text-muted">(${p.ratings.toLocaleString("en-IN")})</small></div>
        <div class="price-row">
          <span class="price">${rupees(p.price)}</span>
          <span class="mrp">${rupees(p.mrp)}</span>
          <span class="off">${discountPercent(p)}% off</span>
        </div>
        <small class="text-success mb-2">Free delivery · Exchange up to ${rupees(EXCHANGE_UPTO)}</small>
        <div class="mt-auto d-grid gap-2">
          ${inCart
            ? `<a href="cart.html" class="btn btn-outline-primary btn-sm"><i class="bi bi-cart-check"></i> Go to Cart</a>`
            : `<button class="btn btn-warning btn-sm fw-semibold" data-add="${p.id}"><i class="bi bi-cart-plus"></i> Add to Cart</button>`}
          <button class="btn btn-orange btn-sm fw-semibold" data-buy="${p.id}"><i class="bi bi-lightning-charge-fill"></i> Buy Now</button>
        </div>
      </div>
    </div>
  </div>`;
}

// One click handler for Add / Buy / Wishlist buttons inside a container.
// onChange is called so the page can re-render (e.g. "Add" turns into "Go to Cart").
function bindProductActions(container, onChange) {
  container.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    const buy = e.target.closest("[data-buy]");
    const wish = e.target.closest("[data-wish]");
    if (add) {
      addToCart(add.dataset.add);
      if (onChange) onChange();
    } else if (buy) {
      buyNow(buy.dataset.buy, 1);
    } else if (wish) {
      e.preventDefault();
      toggleWishlist(wish.dataset.wish);
      if (onChange) onChange();
    }
  });
}

// Buy Now checks out just this one product, without touching the cart.
function buyNow(id, qty) {
  sessionStorage.setItem(STORE.buyNow, JSON.stringify({ id, qty }));
  window.location.href = "checkout.html?mode=buynow";
}

/* ---------- toasts ---------- */
function showToast(message, type = "success", action) {
  let area = document.getElementById("toast-area");
  if (!area) {
    area = document.createElement("div");
    area.id = "toast-area";
    area.className = "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.appendChild(area);
  }
  const el = document.createElement("div");
  el.className = `toast align-items-center text-bg-${type} border-0`;
  el.setAttribute("role", "status");
  el.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${escapeHtml(message)}
        ${action ? `<a href="${action.href}" class="ms-2 fw-bold text-reset">${action.text}</a>` : ""}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>`;
  area.appendChild(el);
  if (window.bootstrap) {
    const t = new bootstrap.Toast(el, { delay: 2500 });
    t.show();
    el.addEventListener("hidden.bs.toast", () => el.remove());
  } else {
    setTimeout(() => el.remove(), 2500);
  }
}

/* ---------- navbar + footer ---------- */
function renderHeader() {
  const target = document.getElementById("site-header");
  if (!target) return;
  const page = document.body.dataset.page;
  const q = getParam("q") || "";
  target.innerHTML = `
  <div class="topbar text-center small py-1">Use code <strong>GRAB10</strong> for 10% off · Free delivery on all phones</div>
  <nav class="navbar navbar-expand-lg navbar-dark main-nav sticky-top">
    <div class="container">
      <a class="navbar-brand d-flex align-items-center gap-2" href="index.html">
        <span class="logo-mark"><i class="bi bi-phone"></i></span>
        <span class="lh-1">Grab Your Mobile<small class="d-block fw-normal">Smartphones store</small></span>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav"
        aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="mainNav">
        <form class="search-form mx-lg-4 my-3 my-lg-0 flex-grow-1" action="index.html" role="search">
          <div class="input-group">
            <input class="form-control" type="search" name="q" value="${escapeHtml(q)}" placeholder="Search for phones, brands, colours…" aria-label="Search">
            <button class="btn btn-warning" type="submit" aria-label="Search"><i class="bi bi-search"></i></button>
          </div>
        </form>
        <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1">
          <li class="nav-item"><a class="nav-link ${page === "home" ? "active" : ""}" href="index.html">Home</a></li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Brands</a>
            <ul class="dropdown-menu dropdown-menu-end">
              ${BRANDS.map((b) => `<li><a class="dropdown-item" href="index.html?brand=${b.name}#shop">${b.name}</a></li>`).join("")}
            </ul>
          </li>
          <li class="nav-item"><a class="nav-link ${page === "orders" ? "active" : ""}" href="orders.html"><i class="bi bi-box-seam"></i> Orders</a></li>
          <li class="nav-item">
            <a class="nav-link position-relative ${page === "wishlist" ? "active" : ""}" href="wishlist.html">
              <i class="bi bi-heart"></i> Wishlist <span class="badge rounded-pill bg-danger" id="wish-badge"></span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link position-relative ${page === "cart" ? "active" : ""}" href="cart.html">
              <i class="bi bi-cart3"></i> Cart <span class="badge rounded-pill bg-warning text-dark" id="cart-badge"></span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>`;
  updateBadges();
}

function renderFooter() {
  const target = document.getElementById("site-footer");
  if (!target) return;
  target.innerHTML = `
  <footer class="site-footer mt-5">
    <div class="container py-4">
      <div class="row g-4">
        <div class="col-md-4">
          <h6 class="text-white">Grab Your Mobile</h6>
          <p class="small mb-0">Latest smartphones from top brands at the best prices, with easy exchange and fast delivery.</p>
        </div>
        <div class="col-6 col-md-2">
          <h6 class="text-white">Shop</h6>
          <ul class="list-unstyled small">
            ${BRANDS.slice(0, 5).map((b) => `<li><a href="index.html?brand=${b.name}#shop">${b.name}</a></li>`).join("")}
          </ul>
        </div>
        <div class="col-6 col-md-2">
          <h6 class="text-white">Account</h6>
          <ul class="list-unstyled small">
            <li><a href="cart.html">Cart</a></li>
            <li><a href="wishlist.html">Wishlist</a></li>
            <li><a href="orders.html">My Orders</a></li>
          </ul>
        </div>
        <div class="col-md-4">
          <h6 class="text-white">Why shop with us</h6>
          <ul class="list-unstyled small mb-0">
            <li><i class="bi bi-truck"></i> Free delivery on all phones</li>
            <li><i class="bi bi-arrow-repeat"></i> 7-day replacement</li>
            <li><i class="bi bi-shield-check"></i> 1-year brand warranty</li>
          </ul>
        </div>
      </div>
      <hr class="border-secondary">
      <p class="small text-center mb-0">© ${new Date().getFullYear()} Grab Your Mobile · Front-end demo project (HTML, CSS, JavaScript, Bootstrap) · No real payments are processed.</p>
    </div>
  </footer>`;
}

function updateBadges() {
  const c = document.getElementById("cart-badge");
  const w = document.getElementById("wish-badge");
  if (c) c.textContent = cartCount() || "";
  if (w) w.textContent = getWishlist().length || "";
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
});

// Keep badges in sync if another tab changes the cart.
window.addEventListener("storage", updateBadges);
