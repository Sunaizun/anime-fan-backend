const API_BASE = "https://anime-fan-backend.onrender.com";

const TOKEN_KEY = "anime_token";

const $ = (id) => document.getElementById(id);

const authSection = $("authSection");
const appSection = $("appSection");
const logoutBtn = $("logoutBtn");

const registerForm = $("registerForm");
const loginForm = $("loginForm");
const goLogin = $("goLogin");
const goRegister = $("goRegister");
const authTitle = $("authTitle");

const pUsername = $("pUsername");
const pEmail = $("pEmail");
const pCreated = $("pCreated");
const reloadProfile = $("reloadProfile");

const postForm = $("postForm");
const postsList = $("postsList");
const refreshPosts = $("refreshPosts");

function toast(msg, type = "success") {
  const t = $("toast");
  t.textContent = msg;
  t.className = `toast ${type}`;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 3500);
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function api(path, options = {}) {
  const headers = options.headers || {};
  headers["Content-Type"] = "application/json";

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    throw new Error(data?.message || data || `HTTP ${res.status}`);
  }
  return data;
}

//UI
function showRegister() {
  authTitle.textContent = "Create account";
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
}
function showLogin() {
  authTitle.textContent = "Login";
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
}
function showApp() {
  authSection.classList.add("hidden");
  appSection.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
}
function showAuth() {
  authSection.classList.remove("hidden");
  appSection.classList.add("hidden");
  logoutBtn.classList.add("hidden");
  showRegister();
}

//EVENTS
goLogin.addEventListener("click", (e) => {
  e.preventDefault();
  showLogin();
});
goRegister.addEventListener("click", (e) => {
  e.preventDefault();
  showRegister();
});

logoutBtn.addEventListener("click", () => {
  clearToken();
  toast("Logged out", "success");
  showAuth();
});

//AUTH
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const payload = {
    username: f.username.value.trim(),
    email: f.email.value.trim(),
    password: f.password.value,
  };

  try {
    await api("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
    toast("Registered! Now login please.", "success");
    f.reset();
    showLogin(); 
  } catch (err) {
    toast(err.message, "error");
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const payload = {
    email: f.email.value.trim(),
    password: f.password.value,
  };

  try {
    const data = await api("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
    if (!data.token) throw new Error("No token returned from server");
    setToken(data.token);

    toast(" Login successful!", "success");
    f.reset();

    showApp();                
    await loadProfile();
    await loadPosts();
  } catch (err) {
    toast(err.message, "error");
  }
});

//PROFILE
reloadProfile.addEventListener("click", loadProfile);

async function loadProfile() {
  const user = await api("/api/users/profile");
  pUsername.textContent = user.username || "—";
  pEmail.textContent = user.email || "—";
  pCreated.textContent = user.createdAt ? new Date(user.createdAt).toLocaleString() : "—";
}

//POSTS
refreshPosts.addEventListener("click", loadPosts);

postForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;

  const payload = {
    animeName: f.animeName.value.trim(),
    title: f.title.value.trim(),
    content: f.content.value.trim(),
  };

  try {
    await api("/api/posts", { method: "POST", body: JSON.stringify(payload) });
    toast("✅ Post created!", "success");
    f.reset();
    await loadPosts();
  } catch (err) {
    toast(err.message, "error");
  }
});

async function loadPosts() {
  const posts = await api("/api/posts"); 
  renderPosts(Array.isArray(posts) ? posts : []);
}

function renderPosts(posts) {
  postsList.innerHTML = "";

  if (posts.length === 0) {
    postsList.innerHTML = `<p class="muted">No posts yet. Create one above.</p>`;
    return;
  }

  posts.forEach((post) => {
    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <h3>${escapeHtml(post.title)}</h3>
      <p class="small">Anime: <b>${escapeHtml(post.animeName)}</b></p>
      <p>${escapeHtml(post.content)}</p>

      <div class="reviewBox">
        <h4>Reviews under this post</h4>
        <form class="reviewForm">
          <label>Review</label>
          <textarea name="content" required placeholder="Write your review..."></textarea>

          <label>Rating (1–10)</label>
          <input type="number" name="rating" min="1" max="10" required />

          <button class="btn primary" type="submit">Add review</button>
        </form>

        <div class="reviewsList"></div>
      </div>
    `;

    postsList.appendChild(div);

   
    const reviewsList = div.querySelector(".reviewsList");
    loadReviewsForPost(post._id, reviewsList);

    
    const reviewForm = div.querySelector(".reviewForm");
    reviewForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const content = reviewForm.content.value.trim();
      const rating = Number(reviewForm.rating.value);

      try {
        await api("/api/reviews", {
          method: "POST",
          body: JSON.stringify({
            postId: post._id,   
            animeName: post.animeName,
            title: `Review for: ${post.title}`,
            content,
            rating
          }),
        });

        toast("✅ Review added!", "success");
        reviewForm.reset();
        await loadReviewsForPost(post._id, reviewsList);
      } catch (err) {
        toast(err.message, "error");
      }
    });
  });
}

//REVIEW
async function loadReviewsForPost(postId, container) {
  try {
    const reviews = await api(`/api/reviews?postId=${postId}`);
    renderReviews(container, Array.isArray(reviews) ? reviews : []);
  } catch {
    container.innerHTML = `<p class="muted">No reviews (or route not supported yet).</p>`;
  }
}

function renderReviews(container, reviews) {
  container.innerHTML = "";

  if (reviews.length === 0) {
    container.innerHTML = `<p class="muted">No reviews yet.</p>`;
    return;
  }

  reviews.forEach((r) => {
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `
      <p><b>⭐ ${r.rating}/10</b> — ${escapeHtml(r.content)}</p>
      <p class="small">by ${escapeHtml(r.user?.username || "user")} • ${r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}</p>
    `;
    container.appendChild(item);
  });
}

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (s) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[s]));
}

//INIT
(async function init() {
  showAuth(); 

  if (getToken()) {
    try {
      showApp();
      await loadProfile();
      await loadPosts();
    } catch {
      clearToken();
      showAuth();
    }
  }
})();