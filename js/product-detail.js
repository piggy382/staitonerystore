document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("product-detail-content");

    // Lấy ID từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        container.innerHTML = `<h2 style="text-align:center; color: red;">Không tìm thấy mã sản phẩm.</h2>`;
        return;
    }

    try {
        // Fetch dữ liệu từ local_products trước (để thấy thay đổi từ admin)
        let products = JSON.parse(localStorage.getItem("local_products"));
        if (!products) {
            const response = await fetch("../json/data.json");
            products = await response.json();
            localStorage.setItem("local_products", JSON.stringify(products));
        }

        const product = products.find(p => String(p.id) === String(productId));

        if (!product) {
            container.innerHTML = `<h2 style="text-align:center; color: red;">Không tìm thấy sản phẩm.</h2>`;
            return;
        }

        const addText = window.t ? window.t("add_to_cart") : "Thêm vào giỏ";

        // Related products
        const relatedProducts = products
            .filter(p => p.category === product.category && String(p.id) !== String(productId))
            .slice(0, 4);

        let relatedHtml = '';
        if (relatedProducts.length > 0) {
            relatedHtml = `
                <div class="related-products-section">
                    <h3>Sản phẩm cùng danh mục</h3>
                    <div class="related-grid">
                        ${relatedProducts.map(rp => `
                            <a href="?id=${rp.id}" class="related-card">
                                <img src="${rp.image}" alt="${rp.name}">
                                <h4>${rp.name}</h4>
                                <p class="related-price">${rp.price}đ</p>
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Gallery
        const galleryImages = [
            product.image,
            product.image.replace('.jpg', '-2.jpg').replace('.png', '-2.png'),
            product.image.replace('.jpg', '-3.jpg').replace('.png', '-3.png')
        ];

        // Stock Logic
        const stockCount = product.stock !== undefined ? product.stock : 99;
        let stockLabel = `<span style="color: #28a745; font-weight: 600;"><i class="fas fa-check-circle"></i> Còn hàng</span>`;
        let isOutOfStock = false;
        if (stockCount <= 0) {
            stockLabel = `<span style="color: #e3342f; font-weight: 600;"><i class="fas fa-times-circle"></i> Hết hàng</span>`;
            isOutOfStock = true;
        } else if (stockCount <= 5) {
            stockLabel = `<span style="color: #f6993f; font-weight: 600;"><i class="fas fa-exclamation-triangle"></i> Chỉ còn ${stockCount} sản phẩm</span>`;
        }

        // Variants HTML
        let variantsHtml = '';
        if (product.variants && product.variants.length > 0) {
            variantsHtml = `
                <div class="product-variants" style="margin: 20px 0;">
                    ${product.variants.map(v => `
                        <div class="variant-group" style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem;">${v.name}:</label>
                            <div class="variant-options" style="display: flex; gap: 10px; flex-wrap: wrap;">
                                ${v.options.map((opt, idx) => `
                                    <button class="variant-btn ${idx === 0 ? 'active' : ''}" 
                                            data-group="${v.name}" 
                                            data-value="${opt}"
                                            onclick="selectVariant(this)"
                                            style="padding: 6px 15px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--card-bg); color: var(--text-color); cursor: pointer; font-size: 0.85rem; transition: all 0.2s;">
                                        ${opt}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Render dữ liệu
        container.innerHTML = `
            <nav class="breadcrumb" style="margin-bottom: 20px; font-size: 0.95rem; color: var(--text-color);">
                <a href="../html/homepage.html" style="color: var(--text-color); text-decoration: none;">Trang chủ</a> 
                <span style="margin: 0 8px; color: var(--text-color); opacity: 0.6;">/</span>
                <span style="font-weight: 600; color: var(--btn-primary);">${product.name}</span>
            </nav>

            <div class="product-wrapper">
                <div class="product-detail-layout">
                    <div class="product-gallery-box">
                        <div class="main-image-container">
                            <img id="main-product-image" src="${product.image}" alt="${product.name}" onerror="this.src='${product.image}'">
                        </div>
                        <div class="thumbnail-container">
                            ${galleryImages.map((src, idx) => `
                                <img src="${src}" class="thumbnail-img ${idx === 0 ? 'active' : ''}" onclick="window.changeMainImage('${src}')" onerror="this.style.display='none'">
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="product-info-box">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <h1>${product.name}</h1>
                            <div class="stock-badge" style="margin-top: 5px;">${stockLabel}</div>
                        </div>
                        <div id="header-rating-summary" class="rating-summary">
                            <span class="stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i></span>
                            <span class="review-count">(Phản hồi từ khách hàng)</span>
                        </div>
                        <p class="price">${product.price}đ</p>
                        
                        ${variantsHtml}

                        <div class="description-block">
                            <h3>Đặc điểm nổi bật</h3>
                            <ul>
                                <li>Thiết kế thông minh, tiện lợi cho học sinh và dân văn phòng.</li>
                                <li>Chất liệu cao cấp, an toàn sức khỏe.</li>
                                <li>Đã được kiểm định chất lượng nghiêm ngặt.</li>
                            </ul>
                        </div>

                        <div class="quantity-selector" style="margin-top: 20px;">
                            <label style="font-weight: 600; margin-right: 15px;">Số lượng:</label>
                            <div style="display: inline-flex; align-items: center; border: 1px solid var(--border-color); border-radius: 4px;">
                                <button onclick="changeQty(-1)" style="padding: 5px 12px; background: none; border: none; cursor: pointer; color: var(--text-color);"><i class="fas fa-minus"></i></button>
                                <input type="number" id="detail-qty" value="1" min="1" max="${stockCount}" style="width: 50px; text-align: center; border: none; background: transparent; color: var(--text-color); -moz-appearance: textfield;">
                                <button onclick="changeQty(1)" style="padding: 5px 12px; background: none; border: none; cursor: pointer; color: var(--text-color);"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>

                        <div class="actions" style="margin-top: 30px; display: flex; gap: 15px;">
                            <button class="btn-add" ${isOutOfStock ? 'disabled' : ''} onclick="window.handleAction('add', '${product.id}', '${product.name}', '${product.price}', '${product.image}')" style="flex: 1; padding: 12px; border-radius: 8px; border: 2px solid var(--btn-primary); background: transparent; color: var(--btn-primary); font-weight: 600; cursor: ${isOutOfStock ? 'not-allowed' : 'pointer'}; opacity: ${isOutOfStock ? '0.5' : '1'};">
                                <i class="fas fa-cart-plus"></i> ${addText}
                            </button>
                            <button class="btn-buy-now" ${isOutOfStock ? 'disabled' : ''} onclick="window.handleAction('buy', '${product.id}', '${product.name}', '${product.price}', '${product.image}')" style="flex: 1; padding: 12px; border-radius: 8px; border: none; background: var(--btn-primary); color: white; font-weight: 600; cursor: ${isOutOfStock ? 'not-allowed' : 'pointer'}; opacity: ${isOutOfStock ? '0.5' : '1'};">
                                <i class="fas fa-bolt"></i> Mua ngay
                            </button>
                        </div>
                    </div>
                </div>
                <div id="reviews-container-wrapper"></div>
                ${relatedHtml}
            </div>
        `;

        window.changeQty = function (delta) {
            const input = document.getElementById("detail-qty");
            let val = parseInt(input.value) + delta;
            const max = parseInt(input.getAttribute("max")) || 99;
            if (val < 1) val = 1;
            if (val > max) val = max;
            input.value = val;
        };

        window.selectVariant = function (btn) {
            const group = btn.getAttribute("data-group");
            const parent = btn.parentElement;
            parent.querySelectorAll(".variant-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // Add custom style for active variant
            const allBtns = document.querySelectorAll(".variant-btn");
            allBtns.forEach(b => {
                if (b.classList.contains("active")) {
                    b.style.borderColor = "var(--btn-primary)";
                    b.style.background = "var(--btn-primary)";
                    b.style.color = "white";
                } else {
                    b.style.borderColor = "var(--border-color)";
                    b.style.background = "var(--card-bg)";
                    b.style.color = "var(--text-color)";
                }
            });
        };
        // Initial style trigger
        const firstBtns = document.querySelectorAll(".variant-btn.active");
        firstBtns.forEach(b => window.selectVariant(b));

        window.handleAction = function (type, id, name, price, image) {
            const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
            if (!user) {
                if (window.showToast) window.showToast("Vui lòng đăng nhập!", "error");
                else alert("Vui lòng đăng nhập!");
                window.location.href = "../html/login.html";
                return;
            }

            const qty = parseInt(document.getElementById("detail-qty").value) || 1;

            // Get selected variants
            const selectedVariants = [];
            document.querySelectorAll(".variant-btn.active").forEach(btn => {
                selectedVariants.push(`${btn.getAttribute("data-group")}: ${btn.getAttribute("data-value")}`);
            });
            const variantStr = selectedVariants.join(", ");

            const CART_STORAGE_KEY = "cart_" + user.id;
            let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];

            const existingItem = cart.find(item => String(item.id) === String(id) && item.variant === variantStr);
            if (existingItem) {
                existingItem.quantity += qty;
            } else {
                cart.push({ id, name, price: price.trim(), image, quantity: qty, variant: variantStr });
            }

            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));

            if (type === 'add') {
                if (window.showToast) window.showToast(`Đã thêm ${qty} sản phẩm vào giỏ!`, "success");
                if (window.updateCartCount) window.updateCartCount();
            } else {
                window.location.href = "../html/checkout.html";
            }
        };

        // Reuse existing Review Logic...
        window.renderReviews = function () {
            const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
            let allProds = JSON.parse(localStorage.getItem("local_products")) || [];
            let rProduct = allProds.find(p => String(p.id) === String(productId));
            let reviews = (rProduct && rProduct.reviews) ? rProduct.reviews : [];

            if (reviews.length === 0) {
                reviews = [
                    { id: 'mock1', userId: 'mockH', userName: 'Hoàng Nam', date: '12/05/2026', rating: 5, text: 'Sản phẩm dùng cực kỳ thích, đúng như mô tả.' },
                    { id: 'mock2', userId: 'mockL', userName: 'Lê Thảo', date: '08/04/2026', rating: 4, text: 'Chất lượng tốt so với tầm giá.' }
                ];
                if (rProduct) {
                    rProduct.reviews = reviews;
                    localStorage.setItem("local_products", JSON.stringify(allProds));
                }
            }

            let totalStars = 0;
            reviews.forEach(r => totalStars += r.rating);
            let avgStar = reviews.length > 0 ? (totalStars / reviews.length).toFixed(1) : 0;

            const sumEl = document.getElementById("header-rating-summary");
            if (sumEl) {
                let starsHtml = '';
                for (let i = 1; i <= 5; i++) {
                    if (i <= Math.floor(avgStar)) starsHtml += '<i class="fas fa-star"></i>';
                    else if (i - avgStar >= -0.5 && i - avgStar < 0) starsHtml += '<i class="fas fa-star-half-alt"></i>';
                    else starsHtml += '<i class="far fa-star"></i>';
                }
                sumEl.innerHTML = `<span class="stars">${starsHtml}</span> <span class="review-count">(${avgStar}/5 từ ${reviews.length} đánh giá)</span>`;
            }

            let html = `<div class="reviews-section" style="margin-top: 40px; border-top: 1px solid var(--border-color); padding-top: 20px;"><h3>Khách hàng đánh giá</h3><div id="review-list">`;
            reviews.forEach(r => {
                let starsHtml = '';
                for (let i = 1; i <= 5; i++) starsHtml += i <= r.rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
                let actionHtml = '';
                if (user && String(user.id) === String(r.userId)) {
                    actionHtml = `<div class="review-actions" style="margin-top: 10px; font-size: 0.85rem;"><button onclick="window.editReview('${r.id}')" style="background:none; border:none; color:var(--btn-primary); cursor:pointer; margin-right: 15px; font-weight:600;"><i class="fas fa-edit"></i> Sửa</button><button onclick="window.deleteReview('${r.id}')" style="background:none; border:none; color:#e3342f; cursor:pointer; font-weight:600;"><i class="fas fa-trash"></i> Xóa</button></div>`;
                }
                html += `<div class="review-card" style="margin-bottom: 20px; padding: 15px; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--border-color);"><div class="review-header" style="display: flex; align-items: center; margin-bottom: 10px;"><div class="review-avatar" style="width: 40px; height: 40px; background: var(--btn-primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px;">${r.userName.charAt(0).toUpperCase()}</div><div class="review-meta" style="flex: 1;"><strong style="display: block;">${r.userName}</strong><small style="color: #888;">${r.date}</small></div><div class="stars" style="color: #f39c12;">${starsHtml}</div></div><p class="review-content" style="color: var(--text-color);">${r.text}</p>${actionHtml}</div>`;
            });
            html += `</div><div class="write-review-section" style="margin-top: 30px; background: var(--card-bg); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color);"><h4>Viết đánh giá của bạn</h4>`;
            if (user) {
                html += `<div id="rating-input-block" style="margin-bottom: 15px;"><span style="display:inline-block; margin-right: 10px; font-weight:600;">Đánh giá sao:</span><i class="far fa-star rating-star-input" data-val="1" style="cursor:pointer; color:#f39c12; font-size:1.2rem;"></i><i class="far fa-star rating-star-input" data-val="2" style="cursor:pointer; color:#f39c12; font-size:1.2rem;"></i><i class="far fa-star rating-star-input" data-val="3" style="cursor:pointer; color:#f39c12; font-size:1.2rem;"></i><i class="far fa-star rating-star-input" data-val="4" style="cursor:pointer; color:#f39c12; font-size:1.2rem;"></i><i class="far fa-star rating-star-input" data-val="5" style="cursor:pointer; color:#f39c12; font-size:1.2rem;"></i></div><div class="comment-block"><input type="hidden" id="edit-review-id" value=""><textarea id="comment-text-input" rows="3" placeholder="Nhập bình luận của bạn..." style="width:100%; padding:10px; border-radius:5px; border:1px solid var(--border-color); background:transparent; color:var(--text-color); margin-bottom:10px; font-family:inherit;"></textarea><div style="display: flex; gap: 10px;"><button id="btn-submit-review" onclick="window.submitReview()" style="padding:8px 20px; border:none; background:var(--btn-primary); color:white; border-radius:5px; cursor:pointer; font-weight:bold;">Gửi đánh giá</button><button id="btn-cancel-edit-review" onclick="window.cancelEditReview()" style="display:none; padding:8px 20px; border-radius:5px; border:1px solid var(--border-color); background:transparent; color:var(--text-color); cursor:pointer;">Hủy</button></div></div>`;
            } else {
                html += `<div class="comment-block locked" style="text-align:center; padding: 25px;"><p style="color: var(--text-color); margin-bottom: 10px;">Vui lòng đăng nhập để đánh giá.</p><a href="../html/login.html" style="display: inline-block; padding: 8px 20px; background: var(--btn-primary); color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Đăng nhập</a></div>`;
            }
            html += `</div></div>`;

            const wrapper = document.getElementById("reviews-container-wrapper");
            if (wrapper) {
                wrapper.innerHTML = html;
                document.querySelectorAll(".rating-star-input").forEach(star => {
                    star.addEventListener("click", function () {
                        const val = parseInt(this.getAttribute("data-val"));
                        window.currentSelectedRating = val;
                        document.querySelectorAll(".rating-star-input").forEach(s => {
                            if (parseInt(s.getAttribute("data-val")) <= val) s.classList.replace("far", "fas");
                            else s.classList.replace("fas", "far");
                        });
                    });
                });
                const star5 = document.querySelector('.rating-star-input[data-val="5"]');
                if (star5) star5.click();
            }
        };

        window.submitReview = function () {
            const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
            const text = document.getElementById("comment-text-input").value.trim();
            const idEl = document.getElementById("edit-review-id");
            const rating = window.currentSelectedRating || 5;
            if (!text || !user) return;

            let allProds = JSON.parse(localStorage.getItem("local_products")) || [];
            let rProduct = allProds.find(p => String(p.id) === String(productId));
            if (!rProduct) return;

            rProduct.reviews = rProduct.reviews || [];
            if (idEl.value) {
                const idx = rProduct.reviews.findIndex(r => String(r.id) === String(idEl.value));
                if (idx > -1) { rProduct.reviews[idx].text = text; rProduct.reviews[idx].rating = rating; }
            } else {
                rProduct.reviews.push({ id: Date.now().toString(), userId: String(user.id), userName: user.name, date: new Date().toLocaleDateString('vi-VN'), text, rating });
            }
            localStorage.setItem("local_products", JSON.stringify(allProds));
            window.renderReviews();
            window.cancelEditReview();
        };

        window.editReview = function (id) {
            let allProds = JSON.parse(localStorage.getItem("local_products")) || [];
            let rProduct = allProds.find(p => String(p.id) === String(productId));
            const review = rProduct?.reviews?.find(r => String(r.id) === String(id));
            if (review) {
                document.getElementById("edit-review-id").value = review.id;
                document.getElementById("comment-text-input").value = review.text;
                document.getElementById("btn-submit-review").innerText = "Lưu thay đổi";
                document.getElementById("btn-cancel-edit-review").style.display = "inline-block";
                const star = document.querySelector(`.rating-star-input[data-val="${review.rating}"]`);
                if (star) star.click();
            }
        };

        window.cancelEditReview = function () {
            document.getElementById("edit-review-id").value = "";
            document.getElementById("comment-text-input").value = "";
            document.getElementById("btn-submit-review").innerText = "Gửi đánh giá";
            document.getElementById("btn-cancel-edit-review").style.display = "none";
        };

        window.deleteReview = function (id) {
            if (confirm("Xóa đánh giá?")) {
                let allProds = JSON.parse(localStorage.getItem("local_products")) || [];
                let rProduct = allProds.find(p => String(p.id) === String(productId));
                if (rProduct) {
                    rProduct.reviews = rProduct.reviews.filter(r => String(r.id) !== String(id));
                    localStorage.setItem("local_products", JSON.stringify(allProds));
                    window.renderReviews();
                }
            }
        };

        window.renderReviews();

    } catch (error) {
        console.error("Lỗi khi tải dữ liệu sản phẩm", error);
        container.innerHTML = `<h2 style="text-align:center; color: red;">Đã xảy ra lỗi khi tải dữ liệu.</h2>`;
    }
});
