/**
 * User Authentication & Session Management
 * Handles login, signup, persistent sessions, and administrative seeding.
 * @module AuthService
 */
const USERS_KEY = "users";
const CURRENT_KEY = "currentUser";

/**
 * Retrieves the global users array from LocalStorage.
 * @returns {Array} List of all registered users.
 */
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch (error) {
    console.error("Failed to parse users from storage", error);
    return [];
  }
}

/**
 * Persists the users array to LocalStorage.
 * @param {Array} users - The updated users list.
 */
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Self-invoking seed function.
 * Ensures an admin exists. Fetches from /json/initial_users.json if the database is blank.
 */
(async function seedUsers() {
  let users = getUsers();
  if (users.length === 0) {
    try {
      const resp = await fetch("../json/initial_users.json");
      const initial = await resp.json();
      saveUsers(initial);
    } catch (e) {
      console.warn("Initial user seed failed, skipping...", e);
    }
  }
})();

/**
 * Stores the session of the authenticated user.
 * We only store a subset of data (public profile) for security.
 * @param {Object} user - Full user object from the DB.
 */
function setCurrentUser(user) {
  localStorage.setItem(
    CURRENT_KEY,
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || "user"
    })
  );
}

/**
 * Lấy thông tin người dùng đang đăng nhập hiện tại.
 * @function getCurrentUser
 * @returns {Object|null} Thuộc tính người dùng hoặc null nếu chưa login.
 */
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_KEY));
  } catch (error) {
    return null;
  }
}

/**
 * Đăng xuất người dùng bằng cách xóa key khỏi LocalStorage.
 * @function logout
 */
function logout() {
  localStorage.removeItem(CURRENT_KEY);
}

// --- XỬ LÝ ĐĂNG KÝ ---
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  if (getCurrentUser()) {
    window.location.href = "../html/homepage.html";
  }

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const password = document.getElementById("signup-password").value;

    const users = getUsers();

    // 1. Minimum name length validation
    if (name.length < 3) {
      const msg = window.t ? window.t("error_name_short") : "Họ tên phải có ít nhất 3 ký tự!";
      alert(msg);
      return;
    }

    // 2. Email formatting check (standard regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const msg = window.t ? window.t("error_invalid_email") : "Email không hợp lệ!";
      alert(msg);
      return;
    }

    // 3. Collision avoidance: Unique email constraint
    if (users.find((u) => u.email === email)) {
      const msg = window.t ? window.t("error_email_exists") : "Email này đã được sử dụng!";
      alert(msg);
      return;
    }

    // 4. Password Strength Policy
    // Requirement: At least 8 chars, 1 Uppercase, 1 Lowercase, 1 Digit, 1 Special Char.
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      const msg = window.t ? window.t("error_weak_pass") : "Mật khẩu phải lớn hơn 8 ký tự, có ít nhất 1 chữ cái viết thường, 1 chữ cái viết hoa, 1 số và 1 ký tự đặc biệt!";
      alert(msg);
      return;
    }

    const dob = document.getElementById("signup-dob") ? document.getElementById("signup-dob").value : "";
    const username = document.getElementById("signup-username") ? document.getElementById("signup-username").value.trim() : name;

    // 5. Persist the new user
    users.push({
      id: Date.now(),
      name,
      email,
      password,
      dob,
      username,
      role: "user", // Default role
      orders: []
    });
    saveUsers(users);

    if (typeof window.showToast === "function") {
      const msg = window.t ? window.t("signup_success") : "Đăng ký thành công! Đang chuyển hướng...";
      window.showToast(msg, "success");
      setTimeout(() => window.location.href = "../html/login.html", 1000);
    } else {
      window.location.href = "../html/login.html";
    }
  });
}

// --- XỬ LÝ ĐĂNG NHẬP ---
const loginForm = document.getElementById("login-form");

// Auto-fill Remember Me
document.addEventListener("DOMContentLoaded", () => {
  if (loginForm) {
    try {
      const rem = JSON.parse(localStorage.getItem("rememberedUser"));
      if (rem && rem.email && rem.password) {
        document.getElementById("login-email").value = rem.email;
        document.getElementById("login-password").value = rem.password;
        const remCheck = document.getElementById("login-remember");
        if (remCheck) remCheck.checked = true;
      }
    } catch (e) { }
  }
});

if (loginForm) {
  if (getCurrentUser()) {
    window.location.href = "../html/homepage.html";
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;

    const users = getUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    // 1. Validation Logic
    if (!user) {
      const msg = window.t ? window.t("invalid_login") : "Sai email hoặc mật khẩu!";
      alert(msg);
      return;
    }

    // 2. Security Check (Banned users)
    if (user.isBanned) {
      const msg = window.t ? window.t("account_banned") : "Tài khoản của bạn đã bị khóa!";
      alert(msg);
      return;
    }

    // 3. Initiate Session
    setCurrentUser(user);

    // Xử lý Remember Me
    const rememberObj = document.getElementById("login-remember");
    if (rememberObj && rememberObj.checked) {
      localStorage.setItem("rememberedUser", JSON.stringify({ email, password }));
    } else {
      localStorage.removeItem("rememberedUser");
    }

    if (typeof window.showToast === "function") {
      window.showToast("Đăng nhập thành công!", "success");
      setTimeout(() => window.location.href = "../html/homepage.html", 1000);
    } else {
      window.location.href = "../html/homepage.html";
    }
  });
}

// --- HIỂN THỊ UI USER TẠI NAVBAR ---
/**
 * Render giao diện User (đăng nhập/đăng ký hoặc tên và nút đăng xuất) tại Navbar.
 * Gọi lại mỗi khi trang load.
 * @function renderUserUI
 */
function renderUserUI() {
  // Đảm bảo trong HTML navbar của bạn có <div id="user-box"></div>
  const box = document.getElementById("user-box");
  const cartBox = document.getElementById("cart-box");
  if (!box) return;

  let user = getCurrentUser();
  if (!user) {
    const loginText = window.t ? window.t("login") : "Đăng nhập";
    const signupText = window.t ? window.t("signup") : "Đăng ký";

    box.innerHTML = `
      <a href="../html/login.html" style="color:var(--nav-text); text-decoration:none;"><i class="fas fa-sign-in-alt"></i> <span>${loginText}</span></a>
      <a href="../html/signup.html" style="color:var(--nav-text); text-decoration:none;"><i class="fas fa-user-plus"></i> <span>${signupText}</span></a>
    `;
    if (cartBox) cartBox.style.display = "none";
  } else {
    // Refetch full user to ensure we have the latest fields (like role) even if session is old
    const allUsers = getUsers();
    const fullUser = allUsers.find(u => u.email === user.email);
    if (fullUser) {
      user = fullUser;
    }

    // Check for translation safely
    let helloText = "Xin chào";
    if (typeof window.t === "function") {
      const translated = window.t("greeting");
      if (translated && translated !== "greeting") helloText = translated;
    }

    box.innerHTML = `
      <div class="user-dropdown-container">
        <a href="../html/profile.html" style="text-decoration:none; color:inherit; display:flex; align-items:center; gap:5px; margin-right:15px; padding: 10px 0;" title="Vào trang quản lý">
          <i class="fas fa-user-circle" style="font-size:1.2rem; color:var(--nav-text);"></i> 
          <span style="color:var(--nav-text);">${helloText}, <strong>${user.name}</strong></span>
        </a>
        <div class="user-dropdown-menu">
          ${user.role === 'admin' ? '<a href="../html/admin.html" class="user-dropdown-item" style="color: var(--btn-primary) !important;"><i class="fas fa-user-shield"></i> Trang Quản Trị</a>' : ''}
          <a href="../html/profile.html?tab=info-section" class="user-dropdown-item"><i class="fas fa-user"></i> Tài khoản của tôi</a>
          <a href="../html/profile.html?tab=info-section" class="user-dropdown-item"><i class="fas fa-cog"></i> Cài đặt</a>
          <a href="../html/profile.html?tab=orders-section" class="user-dropdown-item"><i class="fas fa-box-open"></i> Đơn mua</a>
          <a href="../html/profile.html?tab=wishlist-section" class="user-dropdown-item"><i class="fas fa-heart"></i> Sản phẩm yêu thích</a>
          <a href="#" id="header-logout-btn" class="user-dropdown-item logout"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
        </div>
      </div>
    `;

    if (cartBox) cartBox.style.display = "flex";

    const logoutLnk = document.getElementById("header-logout-btn");
    if (logoutLnk) {
      logoutLnk.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
        window.location.href = "../html/homepage.html";
      });
    }
  }
}

// document.addEventListener("DOMContentLoaded", renderUserUI); // Now called by layout.js