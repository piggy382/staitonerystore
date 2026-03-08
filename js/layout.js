// Tái sử dụng Navbar và Footer

const headerHTML = `
  <nav class="navbar" style="background-color: var(--nav-bg); color: var(--nav-text);">
    <div class="navbar-left">
      <div class="logo"><a href="../html/homepage.html" style="color:var(--nav-text); text-decoration:none;" data-i18n="app_name">MY SCHOOL</a></div>
    </div>

    <div class="navbar-center" style="display:flex; flex: 1; max-width: 600px; margin: 0 auto;">
      <form action="../html/productlist.html" method="GET" style="display:flex; width:100%; align-items: stretch; border-radius: 5px; overflow: hidden;">
        <select name="category" onchange="this.form.submit()" style="padding: 10px; border: none; outline: none; background: #fff; color: #333; cursor: pointer; border-right: 1px solid #ddd;">
          <option value="all" data-i18n="category_all">Tất cả danh mục</option>
          <option value="office" data-i18n="category_office">Văn phòng phẩm</option>
          <option value="notebook" data-i18n="category_notebooks">Vở học sinh</option>
          <option value="tool" data-i18n="category_tools">Dụng cụ học tập</option>
          <option value="backpack" data-i18n="category_backpacks">Balo học sinh</option>
          <option value="uniform" data-i18n="category_uniforms">Đồng phục</option>
          <option value="book" data-i18n="category_books">Sách giáo khoa</option>
          <option value="calculator" data-i18n="category_calculators">Máy tính cầm tay</option>
          <option value="art" data-i18n="category_art">Mỹ thuật</option>
        </select>
        <input type="text" name="query" data-i18n-placeholder="search_placeholder" placeholder="Tìm kiếm sản phẩm..." style="border: none; flex: 1; padding: 10px; outline: none; border-radius: 0;" />
        <button type="submit" style="background-color: var(--btn-primary); color: var(--btn-primary-text); border: none; padding: 10px 20px; cursor: pointer; border-radius: 0;"><i class="fas fa-search"></i> <span data-i18n="search_btn">Tìm kiếm</span></button>
      </form>
    </div>

    <div class="navbar-right">
      <div class="nav-controls" style="display:flex; gap:10px;">
        <button id="theme-toggle" class="theme-btn" style="background:transparent; border:1px solid var(--nav-text); color:var(--nav-text); cursor:pointer; padding:5px 10px; border-radius:5px;" title="Toggle Theme"><i class="fas fa-moon"></i></button>
        <button id="lang-toggle" class="lang-btn" style="background:transparent; border:1px solid var(--nav-text); color:var(--nav-text); cursor:pointer; padding:5px 10px; border-radius:5px;" title="Toggle Language"><i class="fas fa-globe"></i></button>
      </div>
      <div class="cart" id="cart-box" style="display:flex; align-items:center; gap:5px;">
          <!-- Dynamically managed by auth.js -->
          <a href="../html/cart.html" style="color:var(--nav-text); text-decoration:none;"><i class="fas fa-shopping-cart"></i> <span data-i18n="cart">Giỏ hàng</span></a>
          <span id="cart-count" style="background:var(--btn-primary); color:var(--btn-primary-text); padding:2px 6px; border-radius:50%; font-size:12px;">0</span>
      </div>
      <div class="account" id="user-box" style="display:flex; align-items:center; gap:10px;">
        <!-- Rendered by auth.js -->
        <a href="../html/login.html" style="color:var(--nav-text); text-decoration:none;"><i class="fas fa-sign-in-alt"></i> <span data-i18n="login">Đăng nhập</span></a>
        <a href="../html/signup.html" style="color:var(--nav-text); text-decoration:none;"><i class="fas fa-user-plus"></i> <span data-i18n="signup">Đăng ký</span></a>
        <a href="../html/profile.html" style="color:var(--nav-text); text-decoration:none;"><i class="fas fa-user-circle"></i> <span>Tài khoản</span></a>
      </div>
    </div>
  </nav>
`;

const footerHTML = `
  <footer style="margin-top: 60px; padding: 60px 20px 20px; background: var(--nav-bg); color: var(--nav-text); border-top: 5px solid var(--btn-primary);">
    <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 40px;">
      
      <!-- Footer Column 1: Brand -->
      <div class="footer-section" style="text-align: left;">
        <h3 style="margin-bottom: 20px; font-size: 1.6rem; color: var(--nav-text); display: flex; align-items: center; justify-content: flex-start; gap: 10px;">
          <i class="fas fa-graduation-cap" style="color: var(--btn-primary);"></i> <span data-i18n="app_name">MY SCHOOL</span>
        </h3>
        <p style="opacity: 0.8; line-height: 1.8; font-size: 0.95rem; margin-bottom: 20px;" data-i18n="footer_desc">
          Đồng hành cùng học sinh trên con đường tri thức. Cung cấp dụng cụ học tập, văn phòng phẩm chất lượng cao, giá cả hợp lý.
        </p>
        <div class="social-icons" style="display: flex; gap: 15px;">
          <a href="#" style="color: var(--nav-text); font-size: 1.2rem; transition: color 0.3s;" onmouseover="this.style.color='var(--btn-primary)'" onmouseout="this.style.color='var(--nav-text)'"><i class="fab fa-facebook-f"></i></a>
          <a href="#" style="color: var(--nav-text); font-size: 1.2rem; transition: color 0.3s;" onmouseover="this.style.color='var(--btn-primary)'" onmouseout="this.style.color='var(--nav-text)'"><i class="fab fa-instagram"></i></a>
          <a href="#" style="color: var(--nav-text); font-size: 1.2rem; transition: color 0.3s;" onmouseover="this.style.color='var(--btn-primary)'" onmouseout="this.style.color='var(--nav-text)'"><i class="fab fa-youtube"></i></a>
          <a href="#" style="color: var(--nav-text); font-size: 1.2rem; transition: color 0.3s;" onmouseover="this.style.color='var(--btn-primary)'" onmouseout="this.style.color='var(--nav-text)'"><i class="fab fa-tiktok"></i></a>
        </div>
      </div>

      <!-- Footer Column 2: Contact -->
      <div class="footer-section" style="text-align: left;">
        <h3 style="margin-bottom: 25px; font-size: 1.2rem; position: relative; display: inline-block; padding-bottom: 8px;">
          <span data-i18n="support">Hỗ trợ khách hàng</span>
          <div style="position: absolute; bottom: 0; left: 0; width: 40px; height: 3px; background: var(--btn-primary); border-radius: 2px;"></div>
        </h3>
        <div class="hotline" style="display:flex; flex-direction:column; gap: 15px; font-size: 1rem;">
          <div style="display: flex; align-items: flex-start; gap: 15px;">
             <i class="fas fa-map-marker-alt" style="color: var(--btn-primary); font-size: 1.2rem; margin-top: 3px;"></i>
             <span style="opacity: 0.8; line-height: 1.6;" data-i18n="footer_address">123 Đường Học Tập, Quận Tri Thức, TP. Kỷ Luật</span>
          </div>
          <div style="display: flex; align-items: center; gap: 15px;">
             <i class="fas fa-phone-alt" style="color: var(--btn-primary); font-size: 1.2rem;"></i>
             <div>
                <strong style="font-size: 1.2rem; display: block;">0987.548.889</strong>
                <span style="opacity: 0.7; font-size: 0.85rem;" data-i18n="footer_time">(Miễn phí gọi, 8:00 - 22:00)</span>
             </div>
          </div>
          <div style="display: flex; align-items: center; gap: 15px;">
            <i class="fas fa-envelope" style="color: var(--btn-primary); font-size: 1.2rem;"></i>
            <span style="opacity: 0.8;">support@myschool.vn</span>
          </div>
        </div>
      </div>

      <!-- Footer Column 3: Quick Links & Newsletter -->
      <div class="footer-section" style="text-align: left;">
        <h3 style="margin-bottom: 25px; font-size: 1.2rem; position: relative; display: inline-block; padding-bottom: 8px;">
          <span data-i18n="quick_links">Liên kết nhanh</span>
          <div style="position: absolute; bottom: 0; left: 0; width: 40px; height: 3px; background: var(--btn-primary); border-radius: 2px;"></div>
        </h3>
        <ul style="list-style: none; padding: 0; margin: 0; line-height: 2.2; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <li><a href="../html/homepage.html" style="color: var(--nav-text); text-decoration: none; opacity: 0.8; transition: opacity 0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8"><i class="fas fa-angle-right" style="color: var(--btn-primary); margin-right: 5px;"></i> <span data-i18n="nav_home">Trang chủ</span></a></li>
          <li><a href="../html/productlist.html" style="color: var(--nav-text); text-decoration: none; opacity: 0.8; transition: opacity 0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8"><i class="fas fa-angle-right" style="color: var(--btn-primary); margin-right: 5px;"></i> <span data-i18n="nav_products">Sản phẩm</span></a></li>
          <li><a href="../html/cart.html" style="color: var(--nav-text); text-decoration: none; opacity: 0.8; transition: opacity 0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8"><i class="fas fa-angle-right" style="color: var(--btn-primary); margin-right: 5px;"></i> <span data-i18n="nav_cart">Giỏ hàng</span></a></li>
          <li><a href="../html/profile.html" style="color: var(--nav-text); text-decoration: none; opacity: 0.8; transition: opacity 0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8"><i class="fas fa-angle-right" style="color: var(--btn-primary); margin-right: 5px;"></i> <span data-i18n="nav_profile">Tài khoản</span></a></li>
        </ul>
        
        <div class="newsletter" style="margin-top: 25px;">
          <h4 style="margin-bottom: 10px; font-size: 1rem; opacity: 0.9;" data-i18n="newsletter_title">Đăng ký nhận tin</h4>
          <div style="display: flex; height: 40px;">
            <input type="email" placeholder="Email của bạn..." data-i18n-placeholder="newsletter_input" style="flex: 1; padding: 0 15px; border: none; border-radius: 5px 0 0 5px; outline: none; font-size: 0.9rem;">
            <button style="background: var(--btn-primary); color: var(--btn-primary-text); border: none; padding: 0 20px; border-radius: 0 5px 5px 0; cursor: pointer; font-weight: bold; transition: opacity 0.3s;" onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1" data-i18n="newsletter_btn">Gửi</button>
          </div>
        </div>
      </div>
      
    </div>
    
    <!-- Footer Bottom -->
    <div style="text-align: center; margin-top: 50px; padding-top: 25px; border-top: 1px solid rgba(255,255,255,0.1); opacity: 0.7; font-size: 0.9rem; display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;">
      <span data-i18n="footer">© 2026 My School. All rights reserved.</span>
      <span>|</span>
      <a href="#" style="color: inherit; text-decoration: none;" data-i18n="terms">Điều khoản sử dụng</a>
      <span>|</span>
      <a href="#" style="color: inherit; text-decoration: none;" data-i18n="privacy">Chính sách bảo mật</a>
    </div>
  </footer>

  <!-- Back to Top Button -->
  <button id="back-to-top" title="Lên đầu trang">
    <i class="fas fa-arrow-up"></i>
  </button>
`;

async function loadLayout() {
  const headerContainer = document.getElementById("header-container");
  if (headerContainer) {
    headerContainer.innerHTML = headerHTML;
  }

  const footerContainer = document.getElementById("footer-container");
  if (footerContainer) {
    footerContainer.innerHTML = footerHTML;
  }

  // Preserve search parameters in form
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const query = urlParams.get('query');

    if (category) {
      const categorySelect = document.querySelector('select[name="category"]');
      if (categorySelect) categorySelect.value = category;
    }

    if (query) {
      const queryInput = document.querySelector('input[name="query"]');
      if (queryInput) queryInput.value = query;
    }
  } catch (e) { }

  // Coordinated Initialization
  if (typeof initI18n === 'function') await initI18n();
  if (typeof renderUserUI === 'function') renderUserUI();
  if (typeof window.updateCartCount === 'function') window.updateCartCount();

  // Khởi tạo tính năng Back to Top
  initBackToTop();

  // Reveal page after everything is ready
  document.body.style.opacity = '1';
}

function initBackToTop() {
  const backToTopBtn = document.getElementById("back-to-top");
  if (!backToTopBtn) return;

  let isShown = false;
  window.addEventListener("scroll", () => {
    const shouldShow = window.scrollY > 300;
    if (shouldShow !== isShown) {
      isShown = shouldShow;
      if (isShown) {
        backToTopBtn.classList.add("show");
      } else {
        backToTopBtn.classList.remove("show");
      }
    }
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

document.addEventListener("DOMContentLoaded", loadLayout);
