/**
 * Storefront Product Listing Logic
 * Handles product loading, filtering (category, price, search), sorting, and pagination.
 * @module StorefrontApp
 */
let filteredProducts = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 12;

/**
 * Fetches the master product list from data.json and applies URL-based filters.
 * @async
 * @function loadProducts
 */
async function loadProducts() {
  try {
    let products = JSON.parse(localStorage.getItem("local_products"));
    if (!products) {
      const res = await fetch("../json/data.json");
      products = await res.json();
      localStorage.setItem("local_products", JSON.stringify(products));
    }

    // Check URL params for filtering
    const urlParams = new URLSearchParams(window.location.search);
    const categoryQuery = urlParams.get('category');
    const query = urlParams.get('query');
    const priceParam = urlParams.get('price');

    if (categoryQuery && categoryQuery !== 'all') {
      products = products.filter(p => p.category === categoryQuery);
    }

    if (query && query.trim() !== '') {
      const lowerQuery = query.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(lowerQuery));
    }

    if (priceParam && priceParam !== 'all') {
      products = products.filter(p => {
        const numPrice = parseInt(String(p.price).replace(/\./g, ""), 10);
        if (priceParam === 'under50') return numPrice < 50000;
        if (priceParam === '50to100') return numPrice >= 50000 && numPrice <= 100000;
        if (priceParam === 'over100') return numPrice > 100000;
        return true;
      });
    }

    const sortParam = urlParams.get('sort') || 'default';
    if (sortParam !== 'default') {
      products.sort((a, b) => {
        const pA = parseInt(String(a.price).replace(/\./g, ""), 10);
        const pB = parseInt(String(b.price).replace(/\./g, ""), 10);
        if (sortParam === 'price-asc') return pA - pB;
        if (sortParam === 'price-desc') return pB - pA;
        if (sortParam === 'name-asc') return a.name.localeCompare(b.name);
        if (sortParam === 'name-desc') return b.name.localeCompare(a.name);
        return 0;
      });
    }

    filteredProducts = products;
    currentPage = 1;

    renderProducts();
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

function renderProducts() {
  const productList = document.getElementById("product-list");
  if (!productList) return;

  productList.innerHTML = "";

  if (filteredProducts.length === 0) {
    const noResultText = window.t ? window.t("product_not_found") : "Không tìm thấy sản phẩm nào phù hợp.";
    productList.innerHTML = `<p style="text-align:center; width: 100%; color: var(--text-color);">${noResultText}</p>`;
    return;
  }

  const isHomepage = window.location.pathname.includes("homepage.html");
  let productsToRender = [];

  if (isHomepage) {
    productsToRender = filteredProducts.slice(0, 6);
  } else {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    productsToRender = filteredProducts.slice(startIndex, endIndex);
  }

  productsToRender.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");
    productCard.style.position = "relative";

    const isOutOfStock = product.stock !== undefined && product.stock <= 0;

    // Wishlist Heart Icon
    const heartIcon = document.createElement("i");
    heartIcon.classList.add("fa-heart");
    let wishlist = [];
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    try {
      if (user) {
        wishlist = JSON.parse(localStorage.getItem("wishlist_" + user.id)) || [];
      }
    } catch (e) { wishlist = []; }

    if (wishlist.includes(String(product.id))) {
      heartIcon.classList.add("fas");
      heartIcon.style.color = "#e3342f";
    } else {
      heartIcon.classList.add("far");
      heartIcon.style.color = "var(--text-color)";
    }

    heartIcon.style.position = "absolute";
    heartIcon.style.top = "15px";
    heartIcon.style.right = "15px";
    heartIcon.style.fontSize = "1.5rem";
    heartIcon.style.cursor = "pointer";
    heartIcon.style.zIndex = "10";
    heartIcon.style.transition = "all 0.2s";

    heartIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      toggleWishlist(product.id, heartIcon);
    });

    // Out of Stock Badge
    if (isOutOfStock) {
      const outOfStockBadge = document.createElement("div");
      outOfStockBadge.textContent = "HẾT HÀNG";
      outOfStockBadge.style = "position: absolute; top: 15px; left: 15px; background: rgba(227, 52, 47, 0.9); color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; z-index: 10;";
      productCard.appendChild(outOfStockBadge);
    }

    // Wrapper link
    const link = document.createElement("a");
    link.href = `../html/product-detail.html?id=${product.id}`;
    link.style.textDecoration = "none";
    link.style.color = "inherit";

    const img = document.createElement("img");
    img.src = product.image;
    img.alt = product.name;
    img.onerror = function () {
      this.onerror = null;
      this.src = 'https://placehold.co/300x300?text=Product';
    };
    if (isOutOfStock) img.style.filter = "grayscale(100%) opacity(0.6)";

    const title = document.createElement("h3");
    title.textContent = product.name;

    link.appendChild(img);
    link.appendChild(title);

    const priceText = document.createElement("p");
    priceText.classList.add("price");
    priceText.style.color = "var(--price-color)";
    priceText.textContent = `${product.price}đ`;

    const btn = document.createElement("button");
    const addText = window.t ? window.t("add_to_cart") : "Thêm vào giỏ";
    btn.innerHTML = `<i class="fas fa-cart-plus"></i> ${addText}`;
    if (isOutOfStock) {
      btn.innerHTML = `<i class="fas fa-times"></i> Hết hàng`;
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";
    } else {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        addToCart(product.id, product.name, product.price, product.image);
      });
    }

    productCard.appendChild(heartIcon);
    productCard.appendChild(link);
    productCard.appendChild(priceText);
    productCard.appendChild(btn);

    productList.appendChild(productCard);
  });

  if (!isHomepage) {
    renderPagination();
  }
}

window.addToCart = function (id, name, price, image) {
  const cartKey = getCartKey();
  if (!cartKey) {
    if (typeof window.showToast === "function") window.showToast("Vui lòng đăng nhập!", "error");
    else alert("Vui lòng đăng nhập!");
    window.location.href = "./login.html";
    return;
  }

  // Stock check
  const products = JSON.parse(localStorage.getItem("local_products")) || [];
  const p = products.find(prod => String(prod.id) === String(id));
  if (p && p.stock !== undefined && p.stock <= 0) {
    if (window.showToast) window.showToast("Sản phẩm đã hết hàng!", "error");
    return;
  }

  event.stopPropagation();
  let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  const existingItem = cart.find(item => String(item.id) === String(id));

  if (existingItem) {
    if (p && p.stock !== undefined && existingItem.quantity >= p.stock) {
      if (window.showToast) window.showToast(`Chỉ còn ${p.stock} sản phẩm trong kho!`, "warn");
      return;
    }
    existingItem.quantity += 1;
  } else {
    cart.push({ id, name, price: price.trim(), image, quantity: 1 });
  }

  localStorage.setItem(cartKey, JSON.stringify(cart));
  if (window.showToast) window.showToast(`Đã thêm "${name}" vào giỏ hàng!`, "success");
  if (window.updateCartCount) window.updateCartCount();
};

function initSidebarFilters() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category') || 'all';
  const price = urlParams.get('price') || 'all';
  const sort = urlParams.get('sort') || 'default';

  const catRadio = document.querySelector(`input[name="catFilter"][value="${category}"]`);
  if (catRadio) catRadio.checked = true;

  const priceRadio = document.querySelector(`input[name="priceFilter"][value="${price}"]`);
  if (priceRadio) priceRadio.checked = true;

  const sortSelect = document.getElementById('product-sort');
  if (sortSelect) sortSelect.value = sort;

  const filterInputs = document.querySelectorAll('input[name="catFilter"], input[name="priceFilter"]');
  filterInputs.forEach(input => {
    input.addEventListener('change', applyFilters);
  });

  if (sortSelect) sortSelect.addEventListener('change', applyFilters);

  const resetBtn = document.getElementById('resetFiltersBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const allCat = document.querySelector('input[name="catFilter"][value="all"]');
      const allPrice = document.querySelector('input[name="priceFilter"][value="all"]');
      if (allCat) allCat.checked = true;
      if (allPrice) allPrice.checked = true;
      applyFilters();
    });
  }
}

function applyFilters() {
  const catInput = document.querySelector('input[name="catFilter"]:checked');
  const priceInput = document.querySelector('input[name="priceFilter"]:checked');
  const sortSelect = document.getElementById('product-sort');

  if (!catInput || !priceInput) return;

  const url = new URL(window.location);
  const query = url.searchParams.get('query');
  url.search = '';

  if (catInput.value !== 'all') url.searchParams.set('category', catInput.value);
  if (priceInput.value !== 'all') url.searchParams.set('price', priceInput.value);
  if (sortSelect && sortSelect.value !== 'default') url.searchParams.set('sort', sortSelect.value);
  if (query) url.searchParams.set('query', query);

  window.history.pushState({}, '', url);
  loadProducts();
}

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  initSidebarFilters();
  initCarousel();
});

function initCarousel() {
  const carousel = document.getElementById('category-carousel');
  const btnPrev = document.getElementById('cat-prev');
  const btnNext = document.getElementById('cat-next');
  if (carousel && btnPrev && btnNext) {
    const scrollAmount = 480;
    btnPrev.addEventListener('click', () => carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
    btnNext.addEventListener('click', () => carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' }));
  }
}
