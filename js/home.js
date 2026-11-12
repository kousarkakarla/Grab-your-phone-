// Home page: brand strip, filters, sorting, search and product grid.

const PRICE_RANGES = [
  { id: "any", label: "Any price", min: 0, max: Infinity },
  { id: "u15", label: "Under ₹15,000", min: 0, max: 15000 },
  { id: "15-30", label: "₹15,000 – ₹30,000", min: 15000, max: 30000 },
  { id: "30-50", label: "₹30,000 – ₹50,000", min: 30000, max: 50000 },
  { id: "50-100", label: "₹50,000 – ₹1,00,000", min: 50000, max: 100000 },
  { id: "100", label: "Above ₹1,00,000", min: 100000, max: Infinity },
];
const STORAGES = [...new Set(PRODUCTS.map((p) => p.storage))].sort((a, b) => a - b);

const state = {
  q: (getParam("q") || "").trim(),
  brands: getParam("brand") ? [getParam("brand")] : [],
  price: "any",
  storages: [],
  bankOnly: false,
  sort: "relevance",
};

function renderBrandStrip() {
  document.getElementById("brand-strip").innerHTML = BRANDS.map((b) => `
    <button class="brand-tile ${state.brands.length === 1 && state.brands[0] === b.name ? "active" : ""}" data-brand-tile="${b.name}">
      <img src="${b.logo}" alt="">
      <span>${b.name}</span>
    </button>`).join("");
}

function renderFilterControls() {
  document.getElementById("brand-filters").innerHTML = BRANDS.map((b) => {
    const count = PRODUCTS.filter((p) => p.brand === b.name).length;
    return `
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="${b.name}" id="brand-${b.name}" data-filter="brand" ${state.brands.includes(b.name) ? "checked" : ""}>
      <label class="form-check-label d-flex justify-content-between" for="brand-${b.name}">${b.name}<small class="text-muted">${count}</small></label>
    </div>`;
  }).join("");

  document.getElementById("price-filters").innerHTML = PRICE_RANGES.map((r) => `
    <div class="form-check">
      <input class="form-check-input" type="radio" name="price" value="${r.id}" id="price-${r.id}" data-filter="price" ${state.price === r.id ? "checked" : ""}>
      <label class="form-check-label" for="price-${r.id}">${r.label}</label>
    </div>`).join("");

  document.getElementById("storage-filters").innerHTML = STORAGES.map((s) => `
    <input type="checkbox" class="btn-check" id="st-${s}" value="${s}" data-filter="storage" autocomplete="off" ${state.storages.includes(s) ? "checked" : ""}>
    <label class="btn btn-outline-primary btn-sm" for="st-${s}">${storageLabel(s)}</label>`).join("");

  document.getElementById("bank-only").checked = state.bankOnly;
  document.getElementById("sort").value = state.sort;
}

function filteredProducts() {
  const q = state.q.toLowerCase();
  const range = PRICE_RANGES.find((r) => r.id === state.price);
  let list = PRODUCTS.filter((p) => {
    if (q && !`${p.brand} ${p.name} ${p.color} ${p.storage}gb`.toLowerCase().includes(q)) return false;
    if (state.brands.length && !state.brands.includes(p.brand)) return false;
    if (p.price < range.min || p.price >= range.max) return false;
    if (state.storages.length && !state.storages.includes(p.storage)) return false;
    if (state.bankOnly && !p.bankOffer) return false;
    return true;
  });
  const sorters = {
    relevance: (a, b) => b.ratings - a.ratings,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    discount: (a, b) => discountPercent(b) - discountPercent(a),
    rating: (a, b) => b.rating - a.rating,
  };
  return list.sort(sorters[state.sort]);
}

function renderChips() {
  const chips = [];
  if (state.q) chips.push({ label: `Search: "${state.q}"`, clear: () => { state.q = ""; } });
  state.brands.forEach((b) => chips.push({ label: b, clear: () => { state.brands = state.brands.filter((x) => x !== b); } }));
  if (state.price !== "any") chips.push({ label: PRICE_RANGES.find((r) => r.id === state.price).label, clear: () => { state.price = "any"; } });
  state.storages.forEach((s) => chips.push({ label: storageLabel(s), clear: () => { state.storages = state.storages.filter((x) => x !== s); } }));
  if (state.bankOnly) chips.push({ label: "Bank offer", clear: () => { state.bankOnly = false; } });

  const box = document.getElementById("active-chips");
  box.innerHTML = chips.map((c, i) => `<button class="chip" data-chip="${i}">${escapeHtml(c.label)} <i class="bi bi-x"></i></button>`).join("");
  box.onclick = (e) => {
    const btn = e.target.closest("[data-chip]");
    if (!btn) return;
    chips[Number(btn.dataset.chip)].clear();
    refresh();
  };
}

function renderGrid() {
  const list = filteredProducts();
  document.getElementById("product-grid").innerHTML = list.map(productCard).join("");
  document.getElementById("results-count").textContent = `Showing ${list.length} of ${PRODUCTS.length} phones`;
  document.getElementById("results-title").textContent =
    state.q ? `Results for "${state.q}"` : state.brands.length === 1 ? `${state.brands[0]} phones` : "All smartphones";
  document.getElementById("empty-state").classList.toggle("d-none", list.length > 0);
}

function refresh() {
  renderFilterControls();
  renderBrandStrip();
  renderChips();
  renderGrid();
  // Keep the search box in sync after clearing a search chip.
  const box = document.querySelector('.search-form input[name="q"]');
  if (box) box.value = state.q;
}

function clearAll() {
  Object.assign(state, { q: "", brands: [], price: "any", storages: [], bankOnly: false });
  history.replaceState(null, "", "index.html#shop");
  refresh();
}

document.addEventListener("DOMContentLoaded", () => {
  refresh();

  document.querySelector(".filter-panel").addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.filter === "brand") {
      state.brands = t.checked ? [...state.brands, t.value] : state.brands.filter((b) => b !== t.value);
    } else if (t.dataset.filter === "price") {
      state.price = t.value;
    } else if (t.dataset.filter === "storage") {
      const v = Number(t.value);
      state.storages = t.checked ? [...state.storages, v] : state.storages.filter((s) => s !== v);
    } else if (t.id === "bank-only") {
      state.bankOnly = t.checked;
    }
    refresh();
  });

  document.getElementById("sort").addEventListener("change", (e) => {
    state.sort = e.target.value;
    renderGrid();
  });

  document.getElementById("brand-strip").addEventListener("click", (e) => {
    const tile = e.target.closest("[data-brand-tile]");
    if (!tile) return;
    const name = tile.dataset.brandTile;
    state.brands = state.brands.length === 1 && state.brands[0] === name ? [] : [name];
    refresh();
    document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
  });

  document.querySelector('[data-quick="bank"]').addEventListener("click", () => {
    state.bankOnly = true;
    refresh();
  });

  document.getElementById("clear-filters").addEventListener("click", clearAll);
  document.getElementById("empty-clear").addEventListener("click", clearAll);

  bindProductActions(document.getElementById("product-grid"), renderGrid);

  if (state.q || state.brands.length) {
    document.getElementById("shop").scrollIntoView();
  }
});
