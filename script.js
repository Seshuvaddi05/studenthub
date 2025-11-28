// script.js

let ebooks = [];
let questionPapers = [];

// ====== CARD CREATION ======
function createCard(item) {
  const article = document.createElement("article");
  article.className = "card";

  const h3 = document.createElement("h3");
  h3.textContent = item.title;
  article.appendChild(h3);

  const pDesc = document.createElement("p");
  pDesc.textContent = item.description;
  article.appendChild(pDesc);

  const meta = document.createElement("p");
  meta.style = "font-size: 0.8rem; color: #6b7280; margin-bottom: 0.7rem;";
  meta.textContent = `Exam: ${item.exam || "—"} | Subject: ${item.subject || "—"} | Year: ${item.year || "—"}`;
  article.appendChild(meta);

  // DOWNLOAD COUNTER
  const dcount = document.createElement("p");
  dcount.style = "font-size: 0.8rem; color: #374151;";
  dcount.textContent = `Downloads: ${item.downloads || 0}`;
  article.appendChild(dcount);

  // DOWNLOAD LINK (with tracking)
  const link = document.createElement("a");
  link.href = `/api/download/${item.type}/${item.index}`;
  link.target = "_blank";
  link.className = "btn small";
  link.textContent = "View / Download";
  article.appendChild(link);

  return article;
}

// ====== RECENT CARD CREATION ======
function createRecentCard(item) {
  const article = document.createElement("article");
  article.className = "card";

  const tag = document.createElement("div");
  tag.className = "recent-card-tag";
  tag.textContent = item.type === "ebook" ? "E-Book" : "Question Paper";
  article.appendChild(tag);

  const h3 = document.createElement("h3");
  h3.textContent = item.title;
  article.appendChild(h3);

  const pDesc = document.createElement("p");
  pDesc.textContent = item.description;
  article.appendChild(pDesc);

  const meta = document.createElement("p");
  meta.style = "font-size: 0.8rem; color: #6b7280; margin-bottom: 0.7rem;";
  meta.textContent = `Exam: ${item.exam || "—"} | Subject: ${item.subject || "—"} | Year: ${item.year || "—"}`;
  article.appendChild(meta);

  const link = document.createElement("a");
  link.href = `/api/download/${item.type}/${item.index}`;
  link.target = "_blank";
  link.className = "btn small";
  link.textContent = "View / Download";
  article.appendChild(link);

  return article;
}

// ====== RENDER LISTS ======
function renderList(list, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<p style="color:#6b7280;">No items found.</p>`;
    return;
  }

  list.forEach((item) => container.appendChild(createCard(item)));
}

// ====== RENDER RECENT (supports multiple sections) ======
function renderRecent(items, containerId = "recent-list") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  if (!items.length) {
    container.innerHTML = `<p style="color:#6b7280;">No materials found.</p>`;
    return;
  }

  items.forEach((item) => container.appendChild(createRecentCard(item)));
}

// ====== POPULATE DROPDOWNS ======
function populateDropdown(list, field, dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  while (dropdown.options.length > 1) {
    dropdown.remove(1);
  }

  const values = [...new Set(list.map((item) => item[field]).filter(Boolean))];

  values.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    dropdown.appendChild(opt);
  });
}

// ====== FILTER FUNCTION ======
function filterItems(list, search, examFilter, yearFilter = "") {
  const q = search.trim().toLowerCase();

  return list.filter((item) => {
    const text =
      (item.title || "") +
      " " +
      (item.description || "") +
      " " +
      (item.exam || "") +
      " " +
      (item.subject || "") +
      " " +
      (item.year || "");

    const matchesSearch = text.toLowerCase().includes(q);
    const matchesExam = examFilter ? item.exam === examFilter : true;
    const matchesYear = yearFilter ? item.year === yearFilter : true;

    return matchesSearch && matchesExam && matchesYear;
  });
}

// ====== LOAD DATA FROM BACKEND ======
async function loadMaterials() {
  try {
    const res = await fetch("/api/materials");
    const data = await res.json();

    ebooks = data.ebooks || [];
    questionPapers = data.questionPapers || [];

    // Add type + index to each item
    ebooks = ebooks.map((item, i) => ({ ...item, type: "ebook", index: i }));
    questionPapers = questionPapers.map((item, i) => ({ ...item, type: "questionPaper", index: i }));

  } catch (err) {
    console.error("Error loading materials:", err);
    ebooks = [];
    questionPapers = [];
  }
}

// ====== BUILD RECENT ITEMS ======
function getRecentItems(limit = 6) {
  const combined = [];

  ebooks.forEach((item) => combined.push({ ...item }));
  questionPapers.forEach((item) => combined.push({ ...item }));

  combined.sort((a, b) => {
    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return db - da;
  });

  return combined.slice(0, limit);
}

// ====== STEP 5: MOST DOWNLOADED ======
function getMostDownloaded(limit = 6) {
  const combined = [...ebooks, ...questionPapers];
  combined.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
  return combined.slice(0, limit);
}

// ====== THEME HANDLING ======
function applyTheme(theme) {
  const body = document.body;
  const toggleBtn = document.getElementById("theme-toggle");
  if (!body || !toggleBtn) return;

  if (theme === "dark") {
    body.classList.add("dark");
    toggleBtn.textContent = "☀️";
  } else {
    body.classList.remove("dark");
    toggleBtn.textContent = "🌙";
  }

  localStorage.setItem("studenthub_theme", theme);
}

// ====== INIT ======
document.addEventListener("DOMContentLoaded", async () => {
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // Load theme
  const savedTheme = localStorage.getItem("studenthub_theme") || "light";
  applyTheme(savedTheme);

  const themeToggleBtn = document.getElementById("theme-toggle");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const next = document.body.classList.contains("dark") ? "light" : "dark";
      applyTheme(next);
    });
  }

  // Load materials
  await loadMaterials();

  // Populate dropdowns
  populateDropdown(ebooks, "exam", "ebook-exam-filter");
  populateDropdown(questionPapers, "exam", "qp-exam-filter");
  populateDropdown(questionPapers, "year", "qp-year-filter");

  // Render lists
  renderList(ebooks, "ebooks-list");
  renderList(questionPapers, "qp-list");

  // Recently Added
  const recentItems = getRecentItems(6);
  renderRecent(recentItems, "recent-list");

  // ⭐ STEP 5 — Most Downloaded
  const popularItems = getMostDownloaded(6);
  renderRecent(popularItems, "popular-list");

  // Stats
  const ebooksLen = ebooks.length;
  const qpLen = questionPapers.length;
  const totalLen = ebooksLen + qpLen;

  document.getElementById("ebooks-count").textContent = `(${ebooksLen})`;
  document.getElementById("qp-count").textContent = `(${qpLen})`;
  document.getElementById("total-count").textContent = totalLen;
  document.getElementById("ebooks-count-stat").textContent = ebooksLen;
  document.getElementById("qp-count-stat").textContent = qpLen;

  // EBOOK Filters
  const ebookSearch = document.getElementById("ebook-search");
  const ebookExam = document.getElementById("ebook-exam-filter");

  function applyEbookFilters() {
    const filtered = filterItems(ebooks, ebookSearch.value, ebookExam.value);
    renderList(filtered, "ebooks-list");
  }

  ebookSearch.addEventListener("input", applyEbookFilters);
  ebookExam.addEventListener("change", applyEbookFilters);

  // QUESTION PAPER Filters
  const qpSearch = document.getElementById("qp-search");
  const qpExam = document.getElementById("qp-exam-filter");
  const qpYear = document.getElementById("qp-year-filter");

  function applyQPFilters() {
    const filtered = filterItems(
      questionPapers,
      qpSearch.value,
      qpExam.value,
      qpYear.value
    );
    renderList(filtered, "qp-list");
  }

  qpSearch.addEventListener("input", applyQPFilters);
  qpExam.addEventListener("change", applyQPFilters);
  qpYear.addEventListener("change", applyQPFilters);

  // Back to top button
  const backToTopBtn = document.getElementById("back-to-top");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) backToTopBtn.classList.add("show");
      else backToTopBtn.classList.remove("show");
    });

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Request Form
  const requestForm = document.getElementById("request-form");
  if (requestForm) {
    requestForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("req-name").value.trim();
      const email = document.getElementById("req-email").value.trim();
      const type = document.getElementById("req-type").value;
      const exam = document.getElementById("req-exam").value.trim();
      const details = document.getElementById("req-details").value.trim();

      const to = "seshuvaddi03@gmail.com";
      const subject = encodeURIComponent(`[StudentHub Request] ${type} - ${exam}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nMaterial Type: ${type}\nExam/Subject: ${exam}\n\nDetails:\n${details}`
      );

      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    });
  }

  // Quick filter chips
  const chips = document.querySelectorAll(".chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const targetId = chip.getAttribute("data-target");
      const text = chip.getAttribute("data-text") || "";
      const input = document.getElementById(targetId);
      if (!input) return;
      input.value = text;

      if (targetId === "ebook-search") applyEbookFilters();
      else applyQPFilters();
    });
  });
});
