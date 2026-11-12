// Orders page: confirmation after checkout, order history, cancel order.

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const STEPS = ["Confirmed", "Shipped", "Out for delivery", "Delivered"];

// Demo tracking: status moves forward with time since the order was placed.
function currentStatus(order) {
  if (order.status === "Cancelled") return "Cancelled";
  const hours = (Date.now() - new Date(order.placedAt).getTime()) / 36e5;
  if (hours > 96) return "Delivered";
  if (hours > 72) return "Out for delivery";
  if (hours > 24) return "Shipped";
  return "Confirmed";
}

function tracker(status) {
  if (status === "Cancelled") return `<div class="alert alert-danger py-2 small mb-0"><i class="bi bi-x-circle"></i> This order was cancelled.</div>`;
  const idx = STEPS.indexOf(status);
  return `<div class="tracker">${STEPS.map((s, i) => `
    <div class="track-step ${i <= idx ? "done" : ""}">
      <span class="dot">${i <= idx ? '<i class="bi bi-check"></i>' : ""}</span>
      <small>${s}</small>
    </div>`).join("")}</div>`;
}

function renderOrders() {
  const orders = load(STORE.orders, []);
  const list = document.getElementById("orders-list");
  if (orders.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-box-seam"></i>
        <h5>No orders yet</h5>
        <p class="text-muted">Your orders will appear here after you buy something.</p>
        <a href="index.html#shop" class="btn btn-primary">Start shopping</a>
      </div>`;
    return;
  }
  list.innerHTML = orders.map((o) => {
    const status = currentStatus(o);
    const canCancel = status === "Confirmed" || status === "Shipped";
    return `
    <div class="card order-card mb-3" id="order-${o.id}">
      <div class="card-header bg-white d-flex flex-wrap justify-content-between gap-2">
        <div class="small">
          <strong>Order #${o.id}</strong> · Placed on ${fmtDate(o.placedAt)}
        </div>
        <span class="badge ${status === "Cancelled" ? "text-bg-danger" : status === "Delivered" ? "text-bg-success" : "text-bg-primary"}">${status}</span>
      </div>
      <div class="card-body">
        ${o.items.map((i) => `
          <div class="d-flex gap-3 align-items-center mb-3">
            <img src="${i.image}" alt="" class="order-img">
            <div class="flex-grow-1">
              <a href="product.html?id=${i.id}" class="product-name">${escapeHtml(i.title)}</a>
              <small class="d-block text-muted">Qty ${i.qty} · ${rupees(i.price)} each</small>
            </div>
            <strong>${rupees(i.price * i.qty)}</strong>
          </div>`).join("")}
        ${tracker(status)}
        <div class="row g-3 mt-1 small">
          <div class="col-md-6">
            <strong class="d-block">Delivery address</strong>
            ${escapeHtml(o.address.name)} (${o.address.addrType}) · +91 ${o.address.phone}<br>
            ${escapeHtml(o.address.address)}, ${escapeHtml(o.address.city)}, ${o.address.state} – ${o.address.pincode}
          </div>
          <div class="col-md-6 text-md-end">
            <strong class="d-block">Payment: ${escapeHtml(o.payment)}</strong>
            ${o.coupon ? `Coupon ${o.coupon}: − ${rupees(o.summary.couponDiscount)}<br>` : ""}
            You saved ${rupees(o.summary.productDiscount + o.summary.couponDiscount)}<br>
            <span class="fs-6 fw-bold">Total: ${rupees(o.summary.total)}</span>
          </div>
        </div>
      </div>
      <div class="card-footer bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
        <small class="text-muted">${status === "Delivered" ? "Delivered" : status === "Cancelled" ? "" : `Expected delivery by <strong>${fmtDate(o.deliveryBy)}</strong>`}</small>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary" data-reorder="${o.id}"><i class="bi bi-arrow-repeat"></i> Buy again</button>
          ${canCancel ? `<button class="btn btn-sm btn-outline-danger" data-cancel="${o.id}">Cancel order</button>` : ""}
        </div>
      </div>
    </div>`;
  }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const placed = getParam("placed");
  const orders = load(STORE.orders, []);
  const just = orders.find((o) => o.id === placed);
  if (just) {
    document.getElementById("success-banner").innerHTML = `
      <div class="success-card mb-4">
        <i class="bi bi-check-circle-fill"></i>
        <div>
          <h2 class="h4 mb-1">Order placed successfully!</h2>
          <p class="mb-0">Thank you, ${escapeHtml(just.address.name.split(" ")[0])}. Your order <strong>#${just.id}</strong> of <strong>${rupees(just.summary.total)}</strong> will be delivered by <strong>${fmtDate(just.deliveryBy)}</strong>. Updates will be sent to ${escapeHtml(just.address.email)}.</p>
        </div>
        <a href="index.html#shop" class="btn btn-light fw-semibold ms-md-auto">Continue shopping</a>
      </div>`;
  }
  renderOrders();

  let cancelId = null;
  const modal = window.bootstrap ? new bootstrap.Modal(document.getElementById("cancelModal")) : null;

  document.getElementById("orders-list").addEventListener("click", (e) => {
    const cancel = e.target.closest("[data-cancel]");
    const reorder = e.target.closest("[data-reorder]");
    if (cancel) {
      cancelId = cancel.dataset.cancel;
      document.getElementById("cancel-id").textContent = "#" + cancelId;
      if (modal) modal.show();
    }
    if (reorder) {
      const order = load(STORE.orders, []).find((o) => o.id === reorder.dataset.reorder);
      order.items.forEach((i) => { if (getProduct(i.id)) addToCart(i.id, i.qty); });
      window.location.href = "cart.html";
    }
  });

  document.getElementById("confirm-cancel").addEventListener("click", () => {
    const all = load(STORE.orders, []);
    const o = all.find((x) => x.id === cancelId);
    if (o) o.status = "Cancelled";
    save(STORE.orders, all);
    if (modal) modal.hide();
    showToast(`Order #${cancelId} cancelled`, "secondary");
    renderOrders();
  });
});
