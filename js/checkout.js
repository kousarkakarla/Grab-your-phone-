// Checkout page: address form, payment choice, place order.

const STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];

const ADDRESS_KEY = "gym_address";
const isBuyNow = getParam("mode") === "buynow";

// Buy Now checks out a single product; otherwise the whole cart.
function checkoutItems() {
  if (isBuyNow) {
    try {
      const b = JSON.parse(sessionStorage.getItem(STORE.buyNow));
      if (b && getProduct(b.id)) return [b];
    } catch (e) { /* fall through */ }
    return [];
  }
  return getCart();
}

function renderSummary(items) {
  const coupon = isBuyNow ? "" : load(STORE.coupon, "");
  const s = priceSummary(items, coupon);
  document.getElementById("order-items").innerHTML = items.map((i) => {
    const p = getProduct(i.id);
    return `
      <div class="d-flex gap-2 align-items-center mb-2 mini-item">
        <img src="${p.image}" alt="">
        <div class="flex-grow-1 small">
          <div class="fw-semibold lh-sm">${escapeHtml(productTitle(p))}</div>
          <span class="text-muted">Qty ${i.qty}</span>
        </div>
        <strong class="small">${rupees(p.price * i.qty)}</strong>
      </div>`;
  }).join("");
  document.getElementById("checkout-summary").innerHTML = `
    <div class="summary-row"><span>Price (${s.count} item${s.count === 1 ? "" : "s"})</span><span>${rupees(s.mrp)}</span></div>
    <div class="summary-row text-success"><span>Discount</span><span>− ${rupees(s.productDiscount)}</span></div>
    ${s.couponDiscount ? `<div class="summary-row text-success"><span>Coupon (${coupon})</span><span>− ${rupees(s.couponDiscount)}</span></div>` : ""}
    <div class="summary-row"><span>Delivery</span><span>${s.delivery ? rupees(s.delivery) : '<span class="text-success">FREE</span>'}</span></div>
    <hr>
    <div class="summary-row total"><span>Total payable</span><span>${rupees(s.total)}</span></div>`;
  document.getElementById("place-order").textContent = `Place Order · ${rupees(s.total)}`;
  return { s, coupon };
}

function fillSavedAddress(form) {
  const saved = load(ADDRESS_KEY, null);
  if (!saved) return;
  ["name", "phone", "email", "pincode", "address", "city", "state"].forEach((k) => {
    if (saved[k]) form.elements[k].value = saved[k];
  });
  if (saved.addrType) form.querySelector(`input[name="addrType"][value="${saved.addrType}"]`).checked = true;
}

document.addEventListener("DOMContentLoaded", () => {
  const items = checkoutItems();
  if (items.length === 0) {
    window.location.replace("cart.html");
    return;
  }
  if (isBuyNow) {
    const back = document.getElementById("back-link");
    back.textContent = "Back to product";
    back.href = `product.html?id=${items[0].id}`;
  }

  const form = document.getElementById("checkout-form");
  document.getElementById("state").insertAdjacentHTML("beforeend", STATES.map((s) => `<option>${s}</option>`).join(""));
  fillSavedAddress(form);
  const { s, coupon } = renderSummary(items);

  // Show the UPI field only when UPI is chosen.
  const upiBox = document.getElementById("upi-box");
  const upi = document.getElementById("upi");
  const syncPayment = () => {
    const isUpi = form.elements.payment.value === "UPI";
    upiBox.classList.toggle("d-none", !isUpi);
    upi.required = isUpi;
  };
  form.querySelectorAll('input[name="payment"]').forEach((r) => r.addEventListener("change", syncPayment));
  syncPayment();

  // Digits only for phone and pincode.
  ["phone", "pincode"].forEach((id) => {
    document.getElementById(id).addEventListener("input", (e) => { e.target.value = e.target.value.replace(/\D/g, ""); });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      const firstInvalid = form.querySelector(":invalid");
      if (firstInvalid) firstInvalid.focus();
      showToast("Please fix the highlighted fields.", "danger");
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const address = {
      name: data.name.trim(), phone: data.phone, email: data.email.trim(), pincode: data.pincode,
      address: data.address.trim(), city: data.city.trim(), state: data.state, addrType: data.addrType,
    };
    save(ADDRESS_KEY, address);

    const btn = document.getElementById("place-order");
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processing…';

    const now = new Date();
    const deliveryBy = new Date(now);
    deliveryBy.setDate(now.getDate() + 4);
    const order = {
      id: "GYM" + now.getTime().toString().slice(-8),
      placedAt: now.toISOString(),
      deliveryBy: deliveryBy.toISOString(),
      status: "Confirmed",
      items: items.map((i) => {
        const p = getProduct(i.id);
        return { id: p.id, title: productTitle(p), image: p.image, price: p.price, mrp: p.mrp, qty: i.qty };
      }),
      summary: s,
      coupon: s.couponDiscount ? coupon : "",
      address,
      payment: data.payment === "UPI" ? `UPI (${data.upi})` : data.payment,
    };

    setTimeout(() => {
      const orders = load(STORE.orders, []);
      orders.unshift(order);
      save(STORE.orders, orders);
      if (isBuyNow) sessionStorage.removeItem(STORE.buyNow);
      else {
        setCart([]);
        save(STORE.coupon, "");
      }
      window.location.href = `orders.html?placed=${order.id}`;
    }, 900);
  });
});
