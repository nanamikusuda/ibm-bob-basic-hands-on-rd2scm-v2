let selectedCategory = "all";
let keyword = "";

const searchInput = document.getElementById("search-input");
const categoryNav = document.getElementById("category-nav");
const faqList = document.getElementById("faq-list");
const emptyMessage = document.getElementById("empty-message");
const themeToggle = document.getElementById("theme-toggle");

// 閲覧履歴（開いた質問の文言）を localStorage に保存する
const HISTORY_KEY = "faq-history";

function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function recordHistory(question) {
  const history = loadHistory();
  if (history.includes(question)) return;
  history.push(question);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    // 保存できない環境では、保存せずに動作を継続する
  }
}

function applyThemeLabel() {
  const isDark = document.documentElement.dataset.theme === "dark";
  themeToggle.textContent = isDark ? "ライト表示" : "ダーク表示";
  themeToggle.setAttribute("aria-pressed", String(isDark));
}

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("faq-theme", next);
  } catch (e) {
    // 保存できない環境では、保存せずに動作を継続する
  }
  applyThemeLabel();
});

// 回答HTMLからタグを除いた検索用テキストを作る
function toPlainText(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent;
}

function matchesKeyword(item) {
  if (keyword === "") return true;
  const target = (item.question + " " + toPlainText(item.answer)).toLowerCase();
  return target.includes(keyword.toLowerCase());
}

function renderCategoryButtons() {
  const categories = [{ id: "all", title: "すべて" }]
    .concat(FAQ_DATA.map((c) => ({ id: c.id, title: c.title })))
    .concat([{ id: "history", title: "閲覧履歴" }]);
  categoryNav.textContent = "";
  categories.forEach((c) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-button";
    button.textContent = c.title;
    button.setAttribute("aria-pressed", String(c.id === selectedCategory));
    button.addEventListener("click", () => {
      selectedCategory = c.id;
      renderCategoryButtons();
      renderFaq();
    });
    categoryNav.appendChild(button);
  });
}

function createItem(item, id) {
  const wrapper = document.createElement("div");
  wrapper.className = "faq-item";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "faq-question";
  button.textContent = item.question;
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", id);

  const answer = document.createElement("div");
  answer.className = "faq-answer";
  answer.id = id;
  answer.hidden = true;
  answer.innerHTML = item.answer;

  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    answer.hidden = expanded;
    if (!expanded) recordHistory(item.question);
  });

  wrapper.appendChild(button);
  wrapper.appendChild(answer);
  return wrapper;
}

function renderFaq() {
  faqList.textContent = "";
  let total = 0;
  const isHistory = selectedCategory === "history";
  const history = isHistory ? loadHistory() : [];

  FAQ_DATA.forEach((category) => {
    if (!isHistory && selectedCategory !== "all" && selectedCategory !== category.id) return;

    const items = category.items.filter(
      (item) => matchesKeyword(item) && (!isHistory || history.includes(item.question))
    );
    if (items.length === 0) return;

    const section = document.createElement("section");
    const heading = document.createElement("h2");
    heading.className = "category-title";
    heading.textContent = category.title;
    section.appendChild(heading);

    items.forEach((item) => {
      total += 1;
      section.appendChild(createItem(item, "faq-answer-" + total));
    });
    faqList.appendChild(section);
  });

  emptyMessage.hidden = total !== 0;
}

searchInput.addEventListener("input", () => {
  keyword = searchInput.value.trim();
  renderFaq();
});

applyThemeLabel();
renderCategoryButtons();
renderFaq();
