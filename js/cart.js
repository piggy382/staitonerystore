/** Key được dùng để lưu giỏ hàng trong LocalStorage */
const CART_KEY = "cartkey";

/**
 * Hàm phụ: Chuyển chuỗi định dạng tiền tệ "10.000" thành số nguyên 10000 để tính toán.
 * @function parsePrice
 * @param {string} priceStr - Chuỗi giá tiền (VD: "25.000")
 * @returns {number} Giá trị dạng số
 */
function parsePrice(priceStr) {
    return parseInt(priceStr.replace(/\./g, ''));
}

/**
 * 2. Hàm hiển thị giỏ hàng.
 * Đọc dữ liệu từ LocalStorage và tạo HTML render lên trang cart.html.
 * Nếu giỏ hàng trống, hiển thị thông báo trống theo đa ngôn ngữ.
 * 
 * @function renderCart
 * @returns {void}
 */
function renderCart() {
    const cartContainer = document.getElementById("cart-items-list");
    if (!cartContainer) return;
    const localCart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

    if (localCart.length === 0) {
        const emptyText = window.t ? window.t("cart_empty") : "Giỏ hàng trống!";
        cartContainer.innerHTML = emptyText;
        updateSummary(0);
        return;
    }

    let html = "";
    let subtotal = 0;

    localCart.forEach((item) => {
        const price = parsePrice(item.price);
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;

        const removeText = window.t ? window.t("cart_clear").split(" ")[0] : "Xóa";

        html += `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="info">
                <h3>${item.name}</h3>
                <p class="price" style="color: var(--price-color);">${item.price}đ</p>
            </div>
            <div class="controls">
                <div class="qty">
                    <button onclick="changeQty('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQty('${item.id}', 1)">+</button>
                </div>
                <button class="remove" onclick="removeFromCart('${item.id}')">${removeText}</button>
            </div>
        </div>`;
    });

    cartContainer.innerHTML = html;
    updateSummary(subtotal);
}

/**
 * 3. Thay đổi số lượng sản phẩm trực tiếp trong giỏ hàng.
 * Hàm này ghi đè lên LocalStorage, sau đó gọi lại renderCart và updateCartCount.
 * 
 * @function changeQty
 * @param {string|number} id - ID sản phẩm
 * @param {number} delta - Khối lượng tăng/giảm (1 hoặc -1)
 */
window.changeQty = (id, delta) => {
    let localCart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    const item = localCart.find(i => String(i.id) === String(id));

    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            localCart = localCart.filter(i => String(i.id) !== String(id));
        }
    }

    localStorage.setItem(CART_KEY, JSON.stringify(localCart));
    renderCart(); // Render lại giao diện
    updateCartCount(); // Cập nhật số trên Navbar
};

/**
 * 4. Xóa vĩnh viễn một sản phẩm khỏi giỏ hàng.
 * 
 * @function removeFromCart
 * @param {string|number} id - ID sản phẩm cần xóa
 */
window.removeFromCart = (id) => {
    let localCart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    localCart = localCart.filter(i => String(i.id) !== String(id));

    localStorage.setItem(CART_KEY, JSON.stringify(localCart));
    renderCart();
    updateCartCount();
};

/**
 * 5. Cập nhật phần tổng tiền (Tạm tính & Tổng cộng) phía dưới giỏ hàng.
 * 
 * @function updateSummary
 * @param {number} total - Tổng tiền (dạng số) cần cập nhật.
 */
function updateSummary(total) {
    const subtotalEl = document.getElementById("subtotal");
    const totalEl = document.getElementById("final-total");

    if (subtotalEl) subtotalEl.innerText = total.toLocaleString() + "đ";
    if (totalEl) totalEl.innerText = total.toLocaleString() + "đ";
}

/**
 * 6. Tính tổng số lượng item và cập nhật con số vòng tròn đỏ trên icon giỏ hàng UI.
 * Hàm này có thể gọi từ bất kỳ trang nào.
 * 
 * @function updateCartCount
 */
window.updateCartCount = function () {
    const countSpan = document.getElementById("cart-count");
    if (countSpan) {
        const localCart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
        const totalQty = localCart.reduce((sum, item) => sum + item.quantity, 0);
        countSpan.innerText = totalQty;
    }
};

/**
 * 7. Xóa toàn bộ giỏ hàng với thông báo xác nhận.
 * @function clearCart
 */
function clearCart() {
    if (confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
        localStorage.removeItem(CART_KEY);
        renderCart();
        window.updateCartCount();
    }
}

// Khởi tạo khi load trang
document.addEventListener("DOMContentLoaded", () => {
    renderCart();
    window.updateCartCount();

    const clearCartBtn = document.getElementById("clear-all-cart");
    if (clearCartBtn) {
        clearCartBtn.addEventListener("click", clearCart);
    }
});