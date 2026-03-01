// Tái sử dụng Navbar và Footer

const headerHTML = `
  <nav class="navbar" style="background-color: var(--nav-bg); color: var(--nav-text);">
    <div class="navbar-left">
      <div class="logo"><a href="../html/homepage.html" style="color:var(--nav-text); text-decoration:none;" data-i18n="app_name">MY SCHOOL</a></div>
    </div>

    <div class="navbar-center">
      <input type="text" data-i18n-placeholder="search_placeholder" placeholder="Tìm kiếm sản phẩm..." />
      <button style="background-color: var(--btn-primary); color: var(--btn-primary-text);"><i class="fas fa-search"></i> <span data-i18n="search_btn">Tìm kiếm</span></button>
    </div>

    <div class="navbar-right">
      <div class="hotline" style="display:flex; flex-direction:column; align-items:center;">
        <strong><i class="fas fa-phone-alt"></i> 0987548889</strong>
        <span data-i18n="support">Hỗ trợ khách hàng</span>
      </div>

      <div class="nav-controls" style="display:flex; gap:10px;">
        <button id="theme-toggle" class="theme-btn" onclick="toggleTheme()" style="background:transparent; border:1px solid var(--nav-text); color:var(--nav-text); cursor:pointer; padding:5px 10px; border-radius:5px;" title="Toggle Theme"><i class="fas fa-moon"></i></button>
        <button id="lang-toggle" class="lang-btn" onclick="toggleLang()" style="background:transparent; border:1px solid var(--nav-text); color:var(--nav-text); cursor:pointer; padding:5px 10px; border-radius:5px;" title="Toggle Language"><i class="fas fa-globe"></i></button>
      </div>

      <div class="account" id="user-box" style="display:flex; align-items:center; gap:10px;">
        <!-- Rendered by auth.js -->
        <a href="../html/login.html" style="color:var(--nav-text); text-decoration:none;"><i class="fas fa-sign-in-alt"></i> <span data-i18n="login">Đăng nhập</span></a>
        <a href="../html/signup.html" style="color:var(--nav-text); text-decoration:none;"><i class="fas fa-user-plus"></i> <span data-i18n="signup">Đăng ký</span></a>
      </div>
      <div class="cart" style="display:flex; align-items:center; gap:5px;">
          <a href="../html/cart.html" style="color:var(--nav-text); text-decoration:none;"><i class="fas fa-shopping-cart"></i> <span data-i18n="cart">Giỏ hàng</span></a>
          <span id="cart-count" style="background:var(--btn-primary); color:var(--btn-primary-text); padding:2px 6px; border-radius:50%; font-size:12px;">0</span>
      </div>
    </div>
  </nav>
`;

const footerHTML = `
  <footer style="margin-top: 30px; padding: 20px; background: var(--nav-bg); color: var(--nav-text); text-align: center;">
      <span data-i18n="footer">© 2026 My School. All rights reserved.</span>
  </footer>
`;

function loadLayout() {
  const headerContainer = document.getElementById("header-container");
  if (headerContainer) {
    headerContainer.innerHTML = headerHTML;
  }

  const footerContainer = document.getElementById("footer-container");
  if (footerContainer) {
    footerContainer.innerHTML = footerHTML;
  }
}

// Chạy ngay lập tức khi load script để DOM có sẵn cho các script khác
loadLayout();
