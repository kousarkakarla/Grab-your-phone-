// Product details page: product.html?id=ip15

function deliveryDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function renderProduct(p) {
  document.title = `${p.name} – Grab Your Mobile`;
  const inCart = cartQty(p.id);
  const bankPrice = Math.round(p.price * 0.95);

  document.getElementById("product-page").innerHTML = `
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb small">
      <li class="breadcrumb-item"><a href="index.html">Home</a></li>
      <li class="breadcrumb-item"><a href="index.html?brand=${p.brand}#shop">${p.brand}</a></li>
      <li class="breadcrumb-item active" aria-current="page">${escapeHtml(p.name)}</li>
    </ol>
  </nav>

  <div class="row g-4">
    <div class="col-md-5">
      <div class="detail-image card">
        <button class="wish-btn ${isWished(p.id) ? "active" : ""}" id="wish-toggle" aria-label="Add to wishlist">
          <i class="bi ${isWished(p.id) ? "bi-heart-fill" : "bi-heart"}"></i>
        </button>
        <img src="${p.image}" alt="${escapeHtml(p.name)}">
      </div>
      <div class="d-grid d-sm-flex gap-2 mt-3 sticky-actions">
        ${inCart
          ? `<a href="cart.html" class="btn btn-outline-primary btn-lg flex-fill"><i class="bi bi-cart-check"></i> Go to Cart (${inCart})</a>`
          : `<button class="btn btn-warning btn-lg flex-fill fw-semibold" id="add-btn"><i class="bi bi-cart-plus"></i> Add to Cart</button>`}
        <button class="btn btn-orange btn-lg flex-fill fw-semibold" id="buy-btn"><i class="bi bi-lightning-charge-fill"></i> Buy Now</button>
      </div>
    </div>

    <div class="col-md-7">
      <small class="text-uppercase text-muted fw-semibold">${p.brand}</small>
      <h1 class="h3 product-title">${escapeHtml(productTitle(p))}</h1>
      <div class="mb-2">${stars(p.rating)} <span class="text-muted small">${p.ratings.toLocaleString("en-IN")} ratings</span></div>

      <div class="price-row big my-2">
        <span class="price">${rupees(p.price)}</span>
        <span class="mrp">${rupees(p.mrp)}</span>
        <span class="off">${discountPercent(p)}% off</span>
      </div>
      <small class="text-muted d-block mb-3">Inclusive of all taxes · You save ${rupees(p.mrp - p.price)}</small>

      <div class="card mb-3">
        <div class="card-body">
          <h6 class="fw-bold mb-2">Available offers</h6>
          <ul class="list-unstyled offer-list mb-0">
            ${p.bankOffer ? `<li><i class="bi bi-tag-fill text-success"></i> <strong>Bank Offer:</strong> 5% instant discount on credit cards — effective price ${rupees(bankPrice)}</li>` : ""}
            <li><i class="bi bi-tag-fill text-success"></i> <strong>Exchange:</strong> Up to ${rupees(EXCHANGE_UPTO)} off on exchanging your old phone</li>
            <li><i class="bi bi-tag-fill text-success"></i> <strong>Coupon:</strong> Use GRAB10 for 10% off on orders above ₹10,000</li>
            <li><i class="bi bi-tag-fill text-success"></i> <strong>EMI:</strong> No-cost EMI from ${rupees(p.price / 6)}/month for 6 months</li>
          </ul>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-sm-6">
          <label class="form-label fw-semibold" for="qty">Quantity</label>
          <div class="input-group qty-group">
            <button class="btn btn-outline-secondary" type="button" id="qty-minus" aria-label="Decrease quantity">−</button>
            <input type="number" class="form-control text-center" id="qty" value="1" min="1" max="${MAX_QTY}">
            <button class="btn btn-outline-secondary" type="button" id="qty-plus" aria-label="Increase quantity">+</button>
          </div>
          <small class="text-muted">Max ${MAX_QTY} per order</small>
        </div>
        <div class="col-sm-6">
          <label class="form-label fw-semibold" for="pincode">Delivery</label>
          <div class="input-group">
            <input type="text" class="form-control" id="pincode" placeholder="Enter pincode" maxlength="6" inputmode="numeric">
            <button class="btn btn-outline-primary" id="check-pin">Check</button>
          </div>
          <small id="pin-result" class="d-block mt-1 text-muted">Check delivery date for your area</small>
        </div>
      </div>

      <h6 class="fw-bold">Highlights</h6>
      <table class="table table-sm spec-table">
        <tbody>
          <tr><th>Brand</th><td>${p.brand}</td></tr>
          <tr><th>Model</th><td>${escapeHtml(p.name)}</td></tr>
          <tr><th>Colour</th><td>${p.color}</td></tr>
          <tr><th>Internal storage</th><td>${storageLabel(p.storage)}</td></tr>
          <tr><th>Network</th><td>${/5G/i.test(p.name) || p.price > 30000 ? "5G" : "4G"}</td></tr>
          <tr><th>Warranty</th><td>1 year manufacturer warranty</td></tr>
          <tr><th>Returns</th><td>7-day replacement</td></tr>
        </tbody>
      </table>

      <div class="d-flex flex-wrap gap-3 trust-row">
        <span><i class="bi bi-truck"></i> Free delivery</span>
        <span><i class="bi bi-arrow-repeat"></i> 7-day replacement</span>
        <span><i class="bi bi-shield-check"></i> Warranty</span>
        <span><i class="bi bi-cash-coin"></i> Cash on delivery</span>
      </div>
    </div>
  </div>`;

  const qtyInput = document.getElementById("qty");
  const clampQty = () => {
    let v = parseInt(qtyInput.value, 10);
    if (isNaN(v) || v < 1) v = 1;
    if (v > MAX_QTY) v = MAX_QTY;
    qtyInput.value = v;
    return v;
  };
  document.getElementById("qty-minus").onclick = () => { qtyInput.value = clampQty() - 1; clampQty(); };
  document.getElementById("qty-plus").onclick = () => { qtyInput.value = clampQty() + 1; clampQty(); };
  qtyInput.onchange = clampQty;

  const addBtn = document.getElementById("add-btn");
  if (addBtn) addBtn.onclick = () => { addToCart(p.id, clampQty()); renderProduct(p); };
  document.getElementById("buy-btn").onclick = () => buyNow(p.id, clampQty());
  document.getElementById("wish-toggle").onclick = () => { toggleWishlist(p.id); renderProduct(p); };

  document.getElementById("check-pin").onclick = () => {
    const pin = document.getElementById("pincode").value.trim();
    const out = document.getElementById("pin-result");
    if (!/^[1-9]\d{5}$/.test(pin)) {
      out.className = "d-block mt-1 text-danger";
      out.textContent = "Please enter a valid 6-digit pincode.";
      return;
    }
    // Metro pincodes (starting 11, 40, 56, 60, 70, 50) get faster delivery.
    const fast = ["11", "40", "56", "60", "70", "50"].includes(pin.slice(0, 2));
    out.className = "d-block mt-1 text-success";
    out.innerHTML = `<i class="bi bi-check-circle"></i> Delivery by <strong>${deliveryDate(fast ? 2 : 4)}</strong> · Free`;
  };
}

function renderSimilar(p) {
  const similar = PRODUCTS
    .filter((x) => x.id !== p.id)
    .sort((a, b) => (b.brand === p.brand) - (a.brand === p.brand) || Math.abs(a.price - p.price) - Math.abs(b.price - p.price))
    .slice(0, 5);
  const grid = document.getElementById("similar-grid");
  grid.innerHTML = similar.map(productCard).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const p = getProduct(getParam("id"));
  if (!p) {
    document.getElementById("product-page").innerHTML = `
      <div class="empty-state">
        <i class="bi bi-phone"></i>
        <h5>Product not found</h5>
        <a href="index.html" class="btn btn-primary">Continue shopping</a>
      </div>`;
    document.getElementById("similar-section").remove();
    return;
  }
  renderProduct(p);
  renderSimilar(p);
  bindProductActions(document.getElementById("similar-grid"), () => {
    renderSimilar(p);
    renderProduct(p);
  });
});
