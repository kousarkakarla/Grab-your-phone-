// Cart page: change quantity, remove, save for later, apply coupon, see totals.

function summaryHtml(s, couponCode) {
  return `
    <div class="summary-row"><span>Price (${s.count} item${s.count === 1 ? "" : "s"})</span><span>${rupees(s.mrp)}</span></div>
    <div class="summary-row text-success"><span>Discount</span><span>− ${rupees(s.productDiscount)}</span></div>
    ${s.couponDiscount ? `<div class="summary-row text-success"><span>Coupon (${couponCode})</span><span>− ${rupees(s.couponDiscount)}</span></div>` : ""}
    <div class="summary-row"><span>Delivery charges</span><span>${s.delivery ? rupees(s.delivery) : '<span class="text-success">FREE</span>'}</span></div>
    <hr>
    <div class="summary-row total"><span>Total amount</span><span>${rupees(s.total)}</span></div>
    <p class="text-success small fw-semibold mb-0">You will save ${rupees(s.productDiscount + s.couponDiscount)} on this order</p>`;
}

function renderCart() {
  const cart = getCart();
  const empty = cart.length === 0;
  document.getElementById("cart-layout").classList.toggle("d-none", empty);
  document.getElementById("empty-cart").classList.toggle("d-none", !empty);
  document.getElementById("cart-count").textContent = empty ? "" : `(${cartCount()} item${cartCount() === 1 ? "" : "s"})`;
  if (empty) return;

  document.getElementById("cart-items").innerHTML = cart.map((item) => {
    const p = getProduct(item.id);
    return `
    <div class="cart-item">
      <a href="product.html?id=${p.id}" class="cart-img"><img src="${p.image}" alt="${escapeHtml(p.name)}"></a>
      <div class="flex-grow-1">
        <a href="product.html?id=${p.id}" class="product-name">${escapeHtml(productTitle(p))}</a>
        <small class="d-block text-muted">Seller: Grab Your Mobile Retail</small>
        <div class="price-row my-1">
          <span class="price">${rupees(p.price * item.qty)}</span>
          <span class="mrp">${rupees(p.mrp * item.qty)}</span>
          <span class="off">${discountPercent(p)}% off</span>
        </div>
        ${item.qty > 1 ? `<small class="text-muted d-block">${rupees(p.price)} each</small>` : ""}
        <div class="d-flex flex-wrap align-items-center gap-3 mt-2">
          <div class="input-group input-group-sm qty-group">
            <button class="btn btn-outline-secondary" data-dec="${p.id}" aria-label="Decrease quantity">−</button>
            <span class="form-control text-center" aria-live="polite">${item.qty}</span>
            <button class="btn btn-outline-secondary" data-inc="${p.id}" aria-label="Increase quantity" ${item.qty >= MAX_QTY ? "disabled" : ""}>+</button>
          </div>
          <button class="btn btn-link btn-sm text-decoration-none p-0" data-later="${p.id}"><i class="bi bi-heart"></i> Save for later</button>
          <button class="btn btn-link btn-sm text-danger text-decoration-none p-0" data-remove="${p.id}"><i class="bi bi-trash"></i> Remove</button>
        </div>
      </div>
      <small class="text-muted delivery-note d-none d-md-block">Delivery in 2–4 days<br><span class="text-success">Free</span></small>
    </div>`;
  }).join("");

  const couponCode = load(STORE.coupon, "");
  const s = priceSummary(cart, couponCode);
  document.getElementById("summary").innerHTML = summaryHtml(s, couponCode);

  const msg = document.getElementById("coupon-msg");
  if (couponCode && s.couponError) {
    msg.className = "small mt-1 text-danger";
    msg.textContent = s.couponError;
  } else if (couponCode) {
    msg.className = "small mt-1 text-success";
    msg.innerHTML = `<i class="bi bi-check-circle"></i> ${couponCode} applied: ${COUPONS[couponCode].label}. <a href="#" id="remove-coupon">Remove</a>`;
    document.getElementById("remove-coupon").onclick = (e) => {
      e.preventDefault();
      save(STORE.coupon, "");
      renderCart();
    };
  } else {
    msg.textContent = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderCart();

  document.getElementById("cart-items").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const { inc, dec, remove, later } = btn.dataset;
    if (inc) setQty(inc, cartQty(inc) + 1);
    if (dec) setQty(dec, cartQty(dec) - 1);
    if (remove) {
      removeFromCart(remove);
      showToast(`${getProduct(remove).name} removed from cart`, "secondary");
    }
    if (later) {
      removeFromCart(later);
      if (!isWished(later)) toggleWishlist(later);
      else showToast("Moved to wishlist", "danger");
    }
    renderCart();
  });

  document.getElementById("coupon-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document.getElementById("coupon-input").value.trim().toUpperCase();
    if (!code) return;
    save(STORE.coupon, code);
    renderCart();
    // Invalid codes are shown once, then forgotten.
    if (!COUPONS[code]) save(STORE.coupon, "");
    document.getElementById("coupon-input").value = "";
  });
});
