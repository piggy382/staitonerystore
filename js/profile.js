document.addEventListener("DOMContentLoaded", () => {
    // Profile Auth Check
    let user = null;
    try {
        if (typeof getCurrentUser === "function") {
            user = getCurrentUser();
        }
    } catch (e) { }

    if (!user) {
        if (typeof window.showToast === "function") {
            window.showToast("Vui lòng đăng nhập để xem tài khoản!", "error");
        } else {
            alert("Vui lòng đăng nhập để xem tài khoản!");
        }
        window.location.href = "../html/login.html";
        return;
    }

    const menuItems = document.querySelectorAll(".menu-item[data-target]");
    const sections = document.querySelectorAll(".content-section");

    // Populate user profile info
    if (user) {
        document.querySelector('.user-name').innerText = user.name || "None";
        document.querySelector('.user-email').innerText = user.email || "None";

        let fullUser = null;
        try {
            const users = JSON.parse(localStorage.getItem("users")) || [];
            fullUser = users.find(u => u.id === user.id);
        } catch (e) { }

        if (fullUser) {
            window.currentUserFull = fullUser;
            if (!window.currentUserFull.addresses) window.currentUserFull.addresses = [];

            document.getElementById("profile-name").value = fullUser.name || "";
            document.getElementById("profile-username").value = fullUser.username || fullUser.name || "";
            document.getElementById("profile-email").value = fullUser.email || "";
            document.getElementById("profile-dob").value = fullUser.dob || "";
            if (fullUser.gender === "female") {
                document.getElementById("profile-gender-f").checked = true;
            } else {
                document.getElementById("profile-gender-m").checked = true;
            }
            renderAddresses();
            renderOrders();
        }
    }

    const updateForm = document.getElementById("profile-update-form");
    if (updateForm) {
        updateForm.addEventListener("submit", (e) => {
            e.preventDefault();
            try {
                const users = JSON.parse(localStorage.getItem("users")) || [];
                const userIndex = users.findIndex(u => u.id === user.id);

                if (userIndex > -1) {
                    users[userIndex].name = document.getElementById("profile-name").value.trim();
                    users[userIndex].username = document.getElementById("profile-username").value.trim();
                    users[userIndex].dob = document.getElementById("profile-dob").value;
                    users[userIndex].gender = document.getElementById("profile-gender-f").checked ? "female" : "male";

                    // Save users back
                    localStorage.setItem("users", JSON.stringify(users));

                    // Update session
                    localStorage.setItem("currentUser", JSON.stringify({
                        id: users[userIndex].id,
                        name: users[userIndex].name,
                        email: users[userIndex].email
                    }));

                    // Update sidebar
                    document.querySelector('.user-name').innerText = users[userIndex].name;

                    // Refresh global UI
                    if (typeof renderUserUI === "function") renderUserUI();

                    if (typeof window.showToast === "function") {
                        window.showToast("Cập nhật thông tin thành công!", "success");
                    }
                }
            } catch (error) {
                console.error("Save error", error);
            }
        });
    }

    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            // Remove active class from all menu items
            menuItems.forEach(i => i.classList.remove("active"));

            // Hide all content sections
            sections.forEach(s => s.classList.remove("active"));

            // Add active class to clicked item
            item.classList.add("active");

            // Show target section
            const targetId = item.getAttribute("data-target");
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                targetEl.classList.add("active");
            }
        });
    });

    // Check Params
    try {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab");
        if (tab) {
            const tgt = document.querySelector(`.menu-item[data-target='${tab}']`);
            if (tgt) tgt.click();
        }
    } catch (e) { }

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (typeof window.showToast === "function") {
                window.showToast("Đăng xuất thành công!", "info");
                setTimeout(() => {
                    window.location.href = "./homepage.html";
                }, 1000);
            } else {
                alert("Đăng xuất thành công!");
                window.location.href = "./homepage.html";
            }
        });
    }

    // Address Form Binding
    const btnAddAddr = document.getElementById("btn-add-new-address");
    if (btnAddAddr) {
        btnAddAddr.addEventListener("click", () => openAddressModal());
    }

    const addrForm = document.getElementById("address-form");
    if (addrForm) {
        addrForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const id = document.getElementById("addr-id").value;
            const name = document.getElementById("addr-name").value.trim();
            const phone = document.getElementById("addr-phone").value.trim();
            const detail = document.getElementById("addr-detail").value.trim();
            let isDef = document.getElementById("addr-default").checked;

            if (window.currentUserFull.addresses.length === 0) isDef = true; // First address defaults true

            if (isDef) {
                // Ensure only one default exists
                window.currentUserFull.addresses.forEach(a => a.isDefault = false);
            }

            if (id) {
                const index = window.currentUserFull.addresses.findIndex(a => a.id == id);
                if (index > -1) {
                    window.currentUserFull.addresses[index] = { id, name, phone, detail, isDefault: isDef };
                    // If disabled default, check if list is all false, then force element 0 as default natively
                    if (isDef === false && window.currentUserFull.addresses.every(a => !a.isDefault)) {
                        window.currentUserFull.addresses[0].isDefault = true;
                    }
                }
            } else {
                window.currentUserFull.addresses.push({ id: Date.now().toString(), name, phone, detail, isDefault: isDef });
            }

            saveUserToDB();
            closeAddressModal();
            renderAddresses();
            if (typeof window.showToast === "function") {
                window.showToast(id ? "Cập nhật địa chỉ thành công!" : "Thêm mới địa chỉ thành công!", "success");
            }
        });
    }

    // Tải Wishlist
    loadWishlist();
});

function saveUserToDB() {
    try {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const idx = users.findIndex(u => u.id === window.currentUserFull.id);
        if (idx > -1) {
            users[idx] = window.currentUserFull;
            localStorage.setItem("users", JSON.stringify(users));
        }
    } catch (e) { }
}

window.openAddressModal = function (id = null) {
    const modal = document.getElementById("address-modal");
    if (!modal) return;
    modal.style.display = "flex";

    document.getElementById("address-modal-title").innerText = id ? "Cập nhật địa chỉ" : "Thêm văn phòng / địa chỉ mới";

    if (id) {
        const addr = window.currentUserFull.addresses.find(a => a.id == id);
        if (addr) {
            document.getElementById("addr-id").value = addr.id;
            document.getElementById("addr-name").value = addr.name;
            document.getElementById("addr-phone").value = addr.phone;
            document.getElementById("addr-detail").value = addr.detail;
            document.getElementById("addr-default").checked = addr.isDefault;
        }
    } else {
        document.getElementById("addr-id").value = "";
        document.getElementById("addr-name").value = "";
        document.getElementById("addr-phone").value = "";
        document.getElementById("addr-detail").value = "";
        document.getElementById("addr-default").checked = window.currentUserFull.addresses.length === 0;
    }
}

window.closeAddressModal = function () {
    const modal = document.getElementById("address-modal");
    if (modal) modal.style.display = "none";
}

window.editAddress = function (id) {
    if (typeof window.openAddressModal === "function") {
        window.openAddressModal(id);
    }
}

window.deleteAddress = function (id) {
    if (confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
        window.currentUserFull.addresses = window.currentUserFull.addresses.filter(a => a.id != id);
        if (window.currentUserFull.addresses.length > 0 && window.currentUserFull.addresses.every(a => !a.isDefault)) {
            window.currentUserFull.addresses[0].isDefault = true;
        }
        saveUserToDB();
        renderAddresses();
        if (typeof window.showToast === "function") window.showToast("Đã xóa địa chỉ!", "info");
    }
}

window.setDefaultAddress = function (id) {
    window.currentUserFull.addresses.forEach(a => a.isDefault = (a.id == id));
    saveUserToDB();
    renderAddresses();
    if (typeof window.showToast === "function") window.showToast("Đã thay đổi địa chỉ mặc định!", "success");
}

function renderAddresses() {
    const container = document.getElementById("address-list-container");
    if (!container) return;

    if (!window.currentUserFull || !window.currentUserFull.addresses || window.currentUserFull.addresses.length === 0) {
        container.innerHTML = `<p style="opacity: 0.7; grid-column: 1/-1;">Bạn chưa có địa chỉ nào.</p>`;
        return;
    }

    let html = "";
    // Đảo lên để địa chỉ mặc định nằm đầu tiên
    const sorted = [...window.currentUserFull.addresses].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

    sorted.forEach(addr => {
        html += `
            <div class="address-card ${addr.isDefault ? 'default' : ''}">
                <div class="address-header">
                    <strong>${addr.name}</strong>
                    ${addr.isDefault ? '<span class="badge-default">Mặc định</span>' : ''}
                </div>
                <p>${addr.phone}</p>
                <p>${addr.detail}</p>
                <div class="address-actions">
                    <button class="btn-text" onclick="editAddress('${addr.id}')">Sửa</button>
                    ${!addr.isDefault ? `<button class="btn-text" onclick="deleteAddress('${addr.id}')">Xóa</button> <button class="btn-text" onclick="setDefaultAddress('${addr.id}')" style="color:var(--btn-primary); margin-left: auto;">Thiết lập mặc định</button>` : ''}
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function renderOrders() {
    const container = document.getElementById("order-list-container");
    if (!container) return;

    if (!window.currentUserFull || !window.currentUserFull.orders || window.currentUserFull.orders.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding: 30px; background: var(--card-bg); border-radius: 8px; border: 1px dashed var(--card-border); opacity: 0.8;">Bạn chưa có đơn hàng nào.</p>`;
        return;
    }

    let html = "";
    window.currentUserFull.orders.forEach(order => {
        let itemsSnippet = order.items.map(i => `${i.name} (x${i.quantity})`).join(", ");
        if (itemsSnippet.length > 70) itemsSnippet = itemsSnippet.substring(0, 70) + "...";

        // Simple logic to mock styling
        let statusClass = "status-pending";
        if (order.status === "Giao thành công") statusClass = "status-success";

        html += `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">Đơn hàng #${order.id}</span>
                    <span class="order-status ${statusClass}">${order.status}</span>
                </div>
                <div class="order-body">
                    <p>Ngày đặt: ${order.date}</p>
                    <p>Sản phẩm: ${itemsSnippet}</p>
                    <strong class="order-total">${new Intl.NumberFormat('vi-VN').format(order.totalPrice)}đ</strong>
                </div>
                <div class="order-footer">
                    <button class="btn-outline">Xem chi tiết</button>
                    ${order.status === 'Đang xử lý'
                ? `<button class="btn-danger-sm" onclick="cancelOrder('${order.id}')">Hủy đơn</button>`
                : `<button class="btn-primary-sm">Mua lại</button>`}
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

window.cancelOrder = function (orderId) {
    if (confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
        const order = window.currentUserFull.orders.find(o => o.id === orderId);
        if (order) {
            order.status = "Đã hủy";
            saveUserToDB();
            renderOrders();
            if (window.showToast) window.showToast("Đã hủy đơn hàng!", "info");
        }
    }
};

async function loadWishlist() {
    function getWishlistKey() {
        const u = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        return u ? "wishlist_" + u.id : null;
    }

    const listContainer = document.getElementById("wishlist-list");
    if (!listContainer) return;

    const wishlistKey = getWishlistKey();
    if (!wishlistKey) {
        listContainer.innerHTML = `<p style="color:var(--text-color); opacity:0.7; grid-column: 1/-1;">Vui lòng đăng nhập để xem sản phẩm yêu thích.</p>`;
        return;
    }

    let wishlistKeys = [];
    try {
        wishlistKeys = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    } catch (e) {
        wishlistKeys = [];
    }

    if (wishlistKeys.length === 0) {
        listContainer.innerHTML = `<p style="color:var(--text-color); opacity:0.7; grid-column: 1/-1;">Bạn chưa có sản phẩm yêu thích nào.</p>`;
        return;
    }

    try {
        const response = await fetch("../json/data.json");
        const products = await response.json();

        // Lọc các sp
        const displayProducts = products.filter(p => wishlistKeys.includes(String(p.id)));

        if (displayProducts.length === 0) {
            listContainer.innerHTML = `<p style="color:var(--text-color); opacity:0.7; grid-column: 1/-1;">Bạn chưa có sản phẩm yêu thích nào.</p>`;
            return;
        }

        let html = "";
        displayProducts.forEach(product => {
            html += `
                <div class="product-card" style="position:relative; background: var(--bg-color); border: 1px solid var(--card-border); border-radius: 8px; padding: 15px; text-align: center; display: flex; flex-direction: column;">
                    <i class="fas fa-heart" onclick="removeWishlistItem('${product.id}')" style="color: #e3342f; position: absolute; top: 10px; right: 10px; cursor: pointer; font-size: 1.2rem;" title="Bỏ yêu thích"></i>
                    <a href="./product-detail.html?id=${product.id}" style="text-decoration:none; color:inherit; flex: 1; display:flex; flex-direction:column;">
                        <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 120px; object-fit: contain; margin-bottom: 15px;">
                        <h3 style="font-size: 0.95rem; margin-bottom: 5px; height: 40px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${product.name}</h3>
                        <p style="color: var(--price-color); font-weight: bold; margin-top: auto;">${product.price}đ</p>
                    </a>
                </div>
            `;
        });
        listContainer.innerHTML = html;

    } catch (error) {
        console.error("Lỗi tải wishlist", error);
        listContainer.innerHTML = `<p style="color:red; grid-column: 1/-1;">Đã xảy ra lỗi khi tải danh sách.</p>`;
    }
}

window.removeWishlistItem = function (id) {
    function getWishlistKey() {
        const u = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        return u ? "wishlist_" + u.id : null;
    }

    const wishlistKey = getWishlistKey();
    if (!wishlistKey) return;

    let wishlistKeys = [];
    try {
        wishlistKeys = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    } catch (e) {
        wishlistKeys = [];
    }

    const index = wishlistKeys.indexOf(String(id));
    if (index > -1) {
        wishlistKeys.splice(index, 1);
        localStorage.setItem(wishlistKey, JSON.stringify(wishlistKeys));
        if (typeof window.showToast === "function") {
            window.showToast("Đã bỏ yêu thích sản phẩm", "info");
        }
        loadWishlist(); // reload the grid
    }
};
