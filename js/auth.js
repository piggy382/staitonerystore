const USERS_KEY = "users";
const CURRENT_KEY = "currentUser";

// --- CÁC HÀM XỬ LÝ LOCAL STORAGE ---

/**
 * Lấy danh sách người dùng từ LocalStorage.
 * @function getUsers
 * @returns {Array<Object>} Mảng danh sách người dùng.
 */
function getUsers() {
  // Lấy data ra, nếu lỗi hoặc chưa có thì trả về mảng rỗng []
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch (error) {
    return [];
  }
}

/**
 * Lưu danh sách người dùng vào LocalStorage.
 * @function saveUsers
 * @param {Array<Object>} users - Mảng người dùng cần lưu.
 */
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Lưu thông tin người dùng đang đăng nhập hiện tại vào LocalStorage.
 * @function setCurrentUser
 * @param {Object} user - Đối tượng người dùng (id, name, email).
 */
function setCurrentUser(user) {
  localStorage.setItem(
    CURRENT_KEY,
    JSON.stringify({ id: user.id, name: user.name, email: user.email })
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
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const password = document.getElementById("signup-password").value;

    const users = getUsers();

    // Kiểm tra email trùng
    if (users.find((u) => u.email === email)) {
      alert("Email này đã được sử dụng!");
      return;
    }

    // Thêm user mới và lưu lại
    users.push({ id: Date.now(), name, email, password });
    saveUsers(users);

    alert("Đăng ký thành công! Hãy đăng nhập.");
    window.location.href = "../html/login.html"; // Nhớ check lại đường dẫn file login
  });
}

// --- XỬ LÝ ĐĂNG NHẬP ---
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;

    const users = getUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      alert("Sai email hoặc mật khẩu!");
      return;
    }

    setCurrentUser(user);
    alert("Đăng nhập thành công!");
    window.location.href = "../html/homepage.html"; // Sửa lại đường dẫn cho phù hợp với cấu trúc thư mục của bạn
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
  if (!box) return;

  const user = getCurrentUser();

  if (!user) {
    const loginText = window.t ? window.t("login") : "Đăng nhập";
    const signupText = window.t ? window.t("signup") : "Đăng ký";

    box.innerHTML = `
      <a href="../html/login.html" style="color:var(--nav-text); text-decoration:none;"><i class="fas fa-sign-in-alt"></i> <span>${loginText}</span></a>
      <a href="../html/signup.html" style="color:var(--nav-text); text-decoration:none;"><i class="fas fa-user-plus"></i> <span>${signupText}</span></a>
    `;
  } else {
    // Check for translation of "Hello" if it exists, otherwise "Xin chào"
    const helloText = window.t && window.translations && window.translations[window.appLang] && window.translations[window.appLang]["hello"]
      ? window.t("hello")
      : "Xin chào";

    box.innerHTML = `
      <span style="margin-right:10px; color:var(--nav-text); display:inline-flex; align-items:center; gap:5px;"><i class="fas fa-user-circle" style="font-size:1.2rem;"></i> ${helloText}, <strong>${user.name}</strong></span>
      <button id="logout-btn" style="padding:4px 8px; border:none; border-radius:5px; cursor:pointer; background-color: var(--btn-primary); color: var(--btn-primary-text);">
        <i class="fas fa-sign-out-alt"></i>
      </button>
    `;

    document.getElementById("logout-btn").addEventListener("click", () => {
      logout();
      window.location.href = "../html/homepage.html";
    });
  }
}

// Chạy hàm hiển thị UI khi file load
document.addEventListener("DOMContentLoaded", renderUserUI);