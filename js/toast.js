/**
 * Toast Notification System
 */

// Attach globally for easy access
window.showToast = function (message, type = "success") {
  let toastContainer = document.getElementById("toast-container");

  // Create container if it doesn't exist
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";

    // Inject CSS dynamically so we don't have to touch every single CSS file
    const style = document.createElement("style");
    style.innerHTML = `
      #toast-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      }
      .toast {
        background: #333;
        color: #fff;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: var(--font-primary, Arial, sans-serif);
        font-size: 0.95rem;
        transform: translateX(120%);
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s;
        opacity: 0;
        pointer-events: all;
      }
      .toast.show {
        transform: translateX(0);
        opacity: 1;
      }
      .toast.success { border-left: 4px solid #10b981; }
      .toast.error { border-left: 4px solid #ef4444; }
      .toast.info { border-left: 4px solid #3b82f6; }
      .toast i { font-size: 1.2rem; }
      .toast.success i { color: #10b981; }
      .toast.error i { color: #ef4444; }
      .toast.info i { color: #3b82f6; }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  // Choose icon
  let iconClass = "fas fa-info-circle";
  if (type === "success") iconClass = "fas fa-check-circle";
  if (type === "error") iconClass = "fas fa-exclamation-circle";

  toast.innerHTML = `<i class="${iconClass}"></i> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  // Trigger animation
  // Slight delay allows the browser to render the initial translated state before animating
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 400); // Wait for transition to finish
  }, 3000);
}
