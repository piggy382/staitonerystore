/**
 * Shopping Cart Logic
 * Manages item quantities, removal, and subtotal calculations.
 * Persistent storage is user-specific via LocalStorage.
 * @module CartService
 */

/**
 * Generates a unique LocalStorage key for the current user's cart.
 */
function getCartKey() {
    const u = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    return u ? "cart_" + u.id : null;
}

function parsePrice(priceStr) {
    if (!priceStr) return 0;
    return parseInt(String(priceStr).replace(/\./g, '')) || 0;
}

/**
 * Renders the cart items list with variant support.
 */
function renderCart() {
    const cartContainer = document.getElementById("cart-items-list");
    if (!cartContainer) return;
    const cartKey = getCartKey();
    if (!cartKey) {
        window.location.href = "./login.html";
        return;
    }
    const localCart = JSON.parse(localStorage.getItem(cartKey)) || [];

    if (localCart.length === 0) {
        const emptyText = window.t ? window.t("cart_empty") : "Giỏ hàng trống!";
        cartContainer.innerHTML = `<div style="text-align:center; padding: 40px; color: #888;">${emptyText}<br><br><a href="productlist.html" class="btn-primary" style="text-decoration:none;">Tiếp tục mua sắm</a></div>`;
        updateSummary(0);
        return;
    }

    cartContainer.innerHTML = "";
    let subtotal = 0;

    localCart.forEach((item, index) => {
        const price = parsePrice(item.price);
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;

        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.style = "display: flex; gap: 15px; background: var(--card-bg); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 15px; align-items: center;";

        const img = document.createElement("img");
        img.src = item.image;
        img.style = "width: 80px; height: 80px; object-fit: cover; border-radius: 4px;";

        const infoDiv = document.createElement("div");
        infoDiv.style = "flex: 1;";
        const title = document.createElement("h3");
        title.style = "margin: 0 0 5px 0; font-size: 1rem;";
        title.textContent = item.name;

        const variantLabel = item.variant ? `<p style="margin: 0; font-size: 0.8rem; color: #888;">Phân loại: ${item.variant}</p>` : '';
        const priceLabel = `<p style="margin: 5px 0; color: var(--btn-primary); font-weight: 600;">${item.price}đ</p>`;

        infoDiv.innerHTML = title.outerHTML + variantLabel + priceLabel;

        const controlsDiv = document.createElement("div");
        controlsDiv.style = "display: flex; flex-direction: column; align-items: flex-end; gap: 10px;";

        const qtyDiv = document.createElement("div");
        qtyDiv.style = "display: flex; align-items: center; border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden;";

        // Pass index to avoid conflicts with same-ID items
        qtyDiv.innerHTML = `
            <button onclick="changeQtyByIndex(${index}, -1)" style="padding: 4px 10px; border: none; background: none; cursor: pointer; color: var(--text-color);">-</button>
            <span style="padding: 0 10px; min-width: 30px; text-align: center;">${item.quantity}</span>
            <button onclick="changeQtyByIndex(${index}, 1)" style="padding: 4px 10px; border: none; background: none; cursor: pointer; color: var(--text-color);">+</button>
        `;

        const btnRemove = document.createElement("button");
        btnRemove.innerHTML = `<i class="fas fa-trash"></i>`;
        btnRemove.style = "background: none; border: none; color: #e3342f; cursor: pointer; font-size: 0.9rem;";
        btnRemove.onclick = () => removeFromCartByIndex(index);

        controlsDiv.appendChild(qtyDiv);
        controlsDiv.appendChild(btnRemove);

        cartItem.appendChild(img);
        cartItem.appendChild(infoDiv);
        cartItem.appendChild(controlsDiv);

        cartContainer.appendChild(cartItem);
    });

    updateSummary(subtotal);
}

/**
 * Changes quantity using index to distinguish items with same ID but different variants.
 */
window.changeQtyByIndex = function (index, delta) {
    const cartKey = getCartKey();
    if (!cartKey) return;
    let localCart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const item = localCart[index];

    if (item) {
        // Enforce Stock Limit if available
        let products = JSON.parse(localStorage.getItem("local_products")) || [];
        const product = products.find(p => String(p.id) === String(item.id));
        const stockLimit = product ? (product.stock !== undefined ? product.stock : 99) : 99;

        if (delta > 0 && item.quantity >= stockLimit) {
            if (window.showToast) window.showToast(`Chỉ còn ${stockLimit} sản phẩm trong kho!`, "warn");
            else alert(`Chỉ còn ${stockLimit} sản phẩm trong kho!`);
            return;
        }

        item.quantity += delta;
        if (item.quantity <= 0) {
            localCart.splice(index, 1);
        }
    }

    localStorage.setItem(cartKey, JSON.stringify(localCart));
    renderCart();
    window.updateCartCount();
};

/**
 * Removes item using index.
 */
window.removeFromCartByIndex = function (index) {
    const cartKey = getCartKey();
    if (!cartKey) return;
    let localCart = JSON.parse(localStorage.getItem(cartKey)) || [];
    localCart.splice(index, 1);

    localStorage.setItem(cartKey, JSON.stringify(localCart));
    renderCart();
    window.updateCartCount();
};

function updateSummary(total) {
    const subtotalEl = document.getElementById("subtotal");
    const totalEl = document.getElementById("final-total");
    const fm = new Intl.NumberFormat('vi-VN').format(total) + "đ";
    if (subtotalEl) subtotalEl.innerText = fm;
    if (totalEl) totalEl.innerText = fm;
}

window.updateCartCount = function () {
    const countSpan = document.getElementById("cart-count");
    if (!countSpan) return;
    const cartKey = getCartKey();
    if (!cartKey) { countSpan.innerText = "0"; return; }
    try {
        const localCart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const totalQty = localCart.reduce((sum, item) => sum + item.quantity, 0);
        countSpan.innerText = totalQty;
    } catch (e) { countSpan.innerText = "0"; }
};

function clearCart() {
    const cartKey = getCartKey();
    if (!cartKey) return;
    if (confirm("Xóa toàn bộ giỏ hàng?")) {
        localStorage.removeItem(cartKey);
        renderCart();
        window.updateCartCount();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const isCartPage = document.getElementById("cart-items-list") !== null;
    if (isCartPage) {
        if (!typeof getCurrentUser === "function" || !getCurrentUser()) {
            window.location.href = "./login.html";
            return;
        }
        renderCart();
        const clearCartBtn = document.getElementById("clear-all-cart");
        if (clearCartBtn) clearCartBtn.addEventListener("click", clearCart);
    }
    // window.updateCartCount(); // Now called by layout.js
});
