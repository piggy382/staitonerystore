const USERS_KEY = "users";
const CURRENT_KEY = "currentUser";

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
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
  return JSON.parse(localStorage.getItem(CURRENT_KEY));
}
function logout() {
  localStorage.removeItem(CURRENT_KEY);
}

// ===== Signup =====
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const password = document.getElementById("signup-password").value;

    const users = getUsers();
    if (users.find((u) => u.email === email)) {
      alert("Email đã tồn tại!");
      return;
    }

    users.push({ id: Date.now(), name, email, password });
    saveUsers(users);

    alert("Đăng ký thành công! Hãy đăng nhập.");
    window.location.href = "./login.html";
  });
}

// ===== Login =====
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;

    const user = getUsers().find((u) => u.email === email && u.password === password);
    if (!user) return alert("Sai email hoặc mật khẩu!");

    setCurrentUser(user);
    alert("Đăng nhập thành công!");
    window.location.href = "./homepage.html";
  });
}

// ===== Render UI trên navbar: #user-box =====
function renderUserUI() {
  const box = document.getElementById("user-box");
  if (!box) return;

  const user = getCurrentUser();

  if (!user) {
    box.innerHTML = `
      <a href="./login.html">Đăng nhập</a>
      <a href="./signup.html">Đăng ký</a>
    `;
  } else {
    box.innerHTML = `
      <span style="margin-right:10px;">Xin chào, <strong>${user.name}</strong></span>
      <button id="logout-btn" style="padding:6px 10px;border:none;border-radius:8px;cursor:pointer;">
        Đăng xuất
      </button>
    `;
    document.getElementById("logout-btn").onclick = () => {
      logout();
      window.location.reload();
    };
  }
}

renderUserUI()