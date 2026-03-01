const USERS_KEY = "users";
const CURRENT_KEY = "currentUser";

// --- CÁC HÀM XỬ LÝ LOCAL STORAGE ---

function getUsers() {
  // Lấy data ra, nếu lỗi hoặc chưa có thì trả về mảng rỗng []
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch (error) {
    return []; 
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setCurrentUser(user) {
  localStorage.setItem(
    CURRENT_KEY,
    JSON.stringify({ id: user.id, name: user.name, email: user.email })
  );
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_KEY));
  } catch (error) {
    return null;
  }
}

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
function renderUserUI() {
  // Đảm bảo trong HTML navbar của bạn có <div id="user-box"></div>
  const box = document.getElementById("user-box");
  if (!box) return;

  const user = getCurrentUser();

  if (!user) {
    box.innerHTML = `
      <a href="../html/login.html">Đăng nhập</a>
      <a href="../html/signup.html">Đăng ký</a>
    `;
  } else {
    box.innerHTML = `
      <span style="margin-right:10px;">Xin chào, <strong>${user.name}</strong></span>
      <button id="logout-btn" style="padding:6px 10px; border:none; border-radius:8px; cursor:pointer; background-color: #e74c3c; color: white;">
        Đăng xuất
      </button>
    `;
    
    document.getElementById("logout-btn").addEventListener("click", () => {
      logout();
      window.location.reload();
    });
  }
}

// Chạy hàm hiển thị UI khi file load
renderUserUI();