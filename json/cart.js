const CART_KEY = "cartkey";
// Hàm phụ: Chuyển chuỗi "10.000" thành số 10000 để tính toán
function parsePrice(priceStr) {
    return parseInt(priceStr.replace(/\./g, ''));
}

// 2. Hàm hiển thị giỏ hàng bằng cách "khớp" ID
function renderCart() {
    const cartContainer = document.getElementById("cart-items-list");
    if (!cartContainer) return;
    const localCart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

    if (localCart.length === 0) {
        cartContainer.innerHTML = "Giỏ hàng trống!";
        updateSummary(0);
        return;
    }

    let html = "";
    let subtotal = 0;

    localCart.forEach((item) => {
        const price = parsePrice(item.price);
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;

        html += `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="info">
                <h3>${item.name}</h3>
                <p class="price">${item.price}đ</p>
            </div>
            <div class="controls">
                <div class="qty">
                    <button onclick="changeQty('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQty('${item.id}', 1)">+</button>
                </div>
                <button class="remove" onclick="removeFromCart('${item.id}')">Xóa</button>
            </div>
        </div>`;
    });

    cartContainer.innerHTML = html;
    updateSummary(subtotal);
}

// 3. Thay đổi số lượng (Cập nhật LocalStorage)
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

// 4. Xóa sản phẩm khỏi giỏ
window.removeFromCart = (id) => {
    let localCart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    localCart = localCart.filter(i => String(i.id) !== String(id));

    localStorage.setItem(CART_KEY, JSON.stringify(localCart));
    renderCart();
    updateCartCount();
};

// 5. Cập nhật tổng tiền (Tạm tính & Tổng cộng)
function updateSummary(total) {
    const subtotalEl = document.getElementById("subtotal");
    const totalEl = document.getElementById("final-total");

    if (subtotalEl) subtotalEl.innerText = total.toLocaleString() + "đ";
    if (totalEl) totalEl.innerText = total.toLocaleString() + "đ";
}

// 6. Cập nhật số lượng trên icon giỏ hàng Navbar
function updateCartCount() {
    const countSpan = document.getElementById("cart-count");
    if (countSpan) {
        const localCart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
        const totalQty = localCart.reduce((sum, item) => sum + item.quantity, 0);
        countSpan.innerText = totalQty;
    }
}

// Khởi tạo khi load trang
document.addEventListener("DOMContentLoaded", () => {
    renderCart();
    updateCartCount();
});