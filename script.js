// script.js

// ====== DATA ======
const ebooks = [
  {
    title: "RS Aggarwal Quantitative Aptitude",
    description: "Popular book for quantitative aptitude for competitive exams.",
    file: "pdfs/ebooks/rs-aggarwal-quantitative-aptitude.pdf",
    subject: "Quantitative Aptitude",
    exam: "Competitive Exams",
    year: "—"
  },
];

const questionPapers = [
  {
    title: "Sample Question Paper 2023",
    description: "RRB NTPC previous year question paper.",
    file: "pdfs/question-papers/rs-aggarwal-quantitative-aptitude.pdf",
    subject: "General",
    exam: "RRB NTPC",
    year: "2023"
  },
];

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
  meta.textContent = `Exam: ${item.exam} | Subject: ${item.subject} | Year: ${item.year}`;
  article.appendChild(meta);

  const link = document.createElement("a");
  link.href = item.file;
  link.target = "_blank";
  link.className = "btn small";
  link.textContent = "View / Download";
  article.appendChild(link);

  return article;
}

// ====== RENDER LISTS ======
function renderList(list, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<p style="color:#6b7280;">No items found.</p>`;
    return;
  }

  list.forEach(item => container.appendChild(createCard(item)));
}

// ====== POPULATE DROPDOWNS ======
function populateDropdown(list, field, dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  const values = [...new Set(list.map(item => item[field]))];

  values.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    dropdown.appendChild(opt);
  });
}

// ====== FILTER FUNCTION ======
function filterItems(list, search, examFilter, yearFilter = "") {
  return list.filter(item => {
    const matchesSearch = (item.title + item.description + item.exam + item.subject + item.year)
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesExam = examFilter ? item.exam === examFilter : true;
    const matchesYear = yearFilter ? item.year === yearFilter : true;

    return matchesSearch && matchesExam && matchesYear;
  });
}

// ====== INIT ======
document.addEventListener("DOMContentLoaded", () => {

  // Year in footer
  document.getElementById("year").textContent = new Date().getFullYear();

  // Populate dropdowns
  populateDropdown(ebooks, "exam", "ebook-exam-filter");
  populateDropdown(questionPapers, "exam", "qp-exam-filter");
  populateDropdown(questionPapers, "year", "qp-year-filter");

  // Initial render
  renderList(ebooks, "ebooks-list");
  renderList(questionPapers, "qp-list");

  // === EBOOK FILTERS ===
  const ebookSearch = document.getElementById("ebook-search");
  const ebookExam = document.getElementById("ebook-exam-filter");

  function applyEbookFilters() {
    const filtered = filterItems(ebooks, ebookSearch.value, ebookExam.value);
    renderList(filtered, "ebooks-list");
  }

  ebookSearch.addEventListener("input", applyEbookFilters);
  ebookExam.addEventListener("change", applyEbookFilters);

  // === QUESTION PAPERS FILTERS ===
  const qpSearch = document.getElementById("qp-search");
  const qpExam = document.getElementById("qp-exam-filter");
  const qpYear = document.getElementById("qp-year-filter");

  function applyQPFilters() {
    const filtered = filterItems(questionPapers, qpSearch.value, qpExam.value, qpYear.value);
    renderList(filtered, "qp-list");
  }

  qpSearch.addEventListener("input", applyQPFilters);
  qpExam.addEventListener("change", applyQPFilters);
  qpYear.addEventListener("change", applyQPFilters);

});
