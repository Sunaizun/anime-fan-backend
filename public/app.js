const API_BASE = "https://anime-fan-backend.onrender.com";

const tokenKey = "anime_token";

const el = (id) => document.getElementById(id);

const tabRegister = el("tabRegister");
const tabLogin = el("tabLogin");
const registerForm = el("registerForm");
const loginForm = el("loginForm");
const logoutBtn = el("logoutBtn");

const pUsername = el("pUsername");
const pEmail = el("pEmail");
const pCreated = el("pCreated");
const profileForm = el("profileForm");

const reviewForm = el("reviewForm");
const reviewFormTitle = el("reviewFormTitle");
const reviewSubmitBtn = el("reviewSubmitBtn");
const cancelEditBtn = el("cancelEditBtn");
const reviewsList = el("reviewsList");
const refreshBtn = el("refreshBtn");

let editReviewId = null;

function getToken() {
  return localStorage.getItem(tokenKey);
}
function setToken(t) {
  localStorage.setItem(tokenKey, t);
}
function clearToken() {
  localStorage.removeItem(tokenKey);
}

function toast(message, type = "success") {
  const m = el("message");
  m.textContent = message;
  m.className = `toast ${type}`;
  m.classList.remove("hidden");
  setTimeout(() => m.classList.add("hidden"), 3500);
}

async function api(path, options = {}) {
  const headers = options.headers || {};
  headers["Content-Type"] = "application/json";

  const t = getToken();
  if (t) headers["Authorization"] = `Bearer ${t}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = data?.message || data || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

tabRegister.addEventListener("click", () => {
  tabRegister.classList.add("active");
  tabLogin.classList.remove("active");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
});

tabLogin.addEventListener("click", () => {
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
});

// AUTH
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;

  const payload = {
    username: form.username.value.trim(),
    email: form.email.value.trim(),
    password: form.password.value
  };

  try {
    await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    toast("Registered! Now login.", "success");
    form.reset();
    tabLogin.click();
  } catch (err) {
    toast(err.message, "error");
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;

  const payload = {
    email: form.email.value.trim(),
    password: form.password.value
  };

  try {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!data.token) throw new Error("No token returned from server");
    setToken(data.token);

    toast("Login successful!", "success");
    form.reset();
    logoutBtn.classList.remove("hidden");

    await loadProfile();
    await loadReviews();
  } catch (err) {
    toast(err.message, "error");
  }
});

logoutBtn.addEventListener("click", () => {
  clearToken();
  logoutBtn.classList.add("hidden");
  toast("Logged out.", "success");
  resetProfileUI();
  reviewsList.innerHTML = "";
});

// PROFILE
function resetProfileUI() {
  pUsername.textContent = "—";
  pEmail.textContent = "—";
  pCreated.textContent = "—";
}

async function loadProfile() {
  try {
    const user = await api("/api/users/profile");
    pUsername.textContent = user.username || user.name || "—";
    pEmail.textContent = user.email || "—";
    pCreated.textContent = user.createdAt ? new Date(user.createdAt).toLocaleString() : "—";
  } catch (err) {
    toast("Login required to view profile.", "error");
  }
}

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;

  const payload = {};
  if (form.username.value.trim()) payload.username = form.username.value.trim();
  if (form.email.value.trim()) payload.email = form.email.value.trim();

  if (Object.keys(payload).length === 0) {
    toast("Enter username/email to update.", "error");
    return;
  }

  try {
    const updated = await api("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    toast("Profile updated!", "success");
    form.reset();
    pUsername.textContent = updated.username || pUsername.textContent;
    pEmail.textContent = updated.email || pEmail.textContent;
  } catch (err) {
    toast(err.message, "error");
  }
});

// REVIEWS
refreshBtn.addEventListener("click", loadReviews);

reviewForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;

  const payload = {
    title: form.title.value.trim(),
    animeName: form.animeName.value.trim(),
    content: form.content.value.trim(),
    rating: Number(form.rating.value),
  };

  try {
    if (editReviewId) {
      await api(`/api/reviews/${editReviewId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast("Review updated!", "success");
    } else {
      await api("/api/reviews", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast("Review created!", "success");
    }

    form.reset();
    stopEditMode();
    await loadReviews();
  } catch (err) {
    toast(err.message, "error");
  }
});

cancelEditBtn.addEventListener("click", () => {
  reviewForm.reset();
  stopEditMode();
});

function startEditMode(review) {
  editReviewId = review._id;
  reviewFormTitle.textContent = "Edit review";
  reviewSubmitBtn.textContent = "Update";
  cancelEditBtn.classList.remove("hidden");

  reviewForm.title.value = review.title || "";
  reviewForm.animeName.value = review.animeName || "";
  reviewForm.content.value = review.content || "";
  reviewForm.rating.value = review.rating ?? "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function stopEditMode() {
  editReviewId = null;
  reviewFormTitle.textContent = "Create review";
  reviewSubmitBtn.textContent = "Save";
  cancelEditBtn.classList.add("hidden");
}

async function loadReviews() {
  try {
    const reviews = await api("/api/reviews");
    renderReviews(reviews);
  } catch (err) {
    toast("Login required to view reviews.", "error");
  }
}

function renderReviews(reviews) {
  reviewsList.innerHTML = "";
  if (!Array.isArray(reviews) || reviews.length === 0) {
    reviewsList.innerHTML = `<p class="muted">No reviews yet.</p>`;
    return;
  }

  reviews.forEach((r) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <h4>${escapeHtml(r.title)}</h4>
      <p>${escapeHtml(r.content)}</p>
      <p class="meta">Anime: <b>${escapeHtml(r.animeName)}</b></p>
      <div class="badge">
        <span class="rating">⭐ ${r.rating}/10</span>
        <span class="meta">Updated: ${r.updatedAt ? new Date(r.updatedAt).toLocaleString() : ""}</span>
      </div>
      <div class="actions">
        <button class="btn" data-edit="${r._id}">Edit</button>
        <button class="btn danger" data-del="${r._id}">Delete</button>
      </div>
    `;
    reviewsList.appendChild(div);

    div.querySelector(`[data-edit="${r._id}"]`).addEventListener("click", () => startEditMode(r));
    div.querySelector(`[data-del="${r._id}"]`).addEventListener("click", () => deleteReview(r._id));
  });
}

async function deleteReview(id) {
  if (!confirm("Delete this review?")) return;
  try {
    await api(`/api/reviews/${id}`, { method: "DELETE" });
    toast("Review deleted.", "success");
    await loadReviews();
  } catch (err) {
    toast(err.message, "error");
  }
}

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (s) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[s]));
}

//Init
(async function init() {
  if (getToken()) {
    logoutBtn.classList.remove("hidden");
    await loadProfile();
    await loadReviews();
  }
})();