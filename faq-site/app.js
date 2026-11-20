(function () {
  "use strict";

  var HISTORY_KEY = "ibm-bob-faq-history";
  var HISTORY_TAB_ID = "history";

  function loadHistory() {
    try {
      var saved = JSON.parse(localStorage.getItem(HISTORY_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
    } catch (e) {
      // localStorage利用不可時はメモリ上のみで保持
    }
  }

  var state = {
    query: "",
    category: "all",
    openIds: new Set(),
    history: loadHistory()
  };

  var tabsEl = document.getElementById("tabs");
  var listEl = document.getElementById("faq-list");
  var countEl = document.getElementById("count");
  var emptyEl = document.getElementById("empty");
  var searchEl = document.getElementById("search-input");
  var themeToggleBtn = document.getElementById("theme-toggle");

  var THEME_KEY = "ibm-bob-faq-theme";

  function getPreferredTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") {
        return saved;
      }
    } catch (e) {
      // localStorageが利用できない環境への対策
    }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    if (themeToggleBtn) {
      var iconEl = themeToggleBtn.querySelector(".theme-icon");
      if (theme === "dark") {
        if (iconEl) iconEl.textContent = "☀️";
        themeToggleBtn.setAttribute("aria-label", "ライトテーマに切り替え");
        themeToggleBtn.setAttribute("title", "ライトテーマに切り替え");
      } else {
        if (iconEl) iconEl.textContent = "🌙";
        themeToggleBtn.setAttribute("aria-label", "ダークテーマに切り替え");
        themeToggleBtn.setAttribute("title", "ダークテーマに切り替え");
      }
    }
  }

  function initTheme() {
    var initialTheme = getPreferredTheme();
    applyTheme(initialTheme);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", function () {
        var isDark = document.documentElement.getAttribute("data-theme") === "dark";
        var nextTheme = isDark ? "light" : "dark";
        applyTheme(nextTheme);
        try {
          localStorage.setItem(THEME_KEY, nextTheme);
        } catch (e) {
          // localStorage利用不可時のフォールバック
        }
      });
    }

    if (window.matchMedia) {
      var mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      var handleChange = function (e) {
        try {
          if (!localStorage.getItem(THEME_KEY)) {
            applyTheme(e.matches ? "dark" : "light");
          }
        } catch (err) {
          applyTheme(e.matches ? "dark" : "light");
        }
      };
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
      }
    }
  }

  function normalize(s) {
    return String(s).trim().normalize("NFKC").toLowerCase();
  }

  function stripTags(html) {
    return html.replace(/<[^>]*>/g, " ");
  }

  // 検索対象テキスト（質問 + 回答）を事前に正規化して保持する
  var searchIndex = FAQ_ITEMS.map(function (item) {
    return normalize(item.question + " " + stripTags(item.answer));
  });

  function matches(item, index, terms) {
    if (state.category === HISTORY_TAB_ID) {
      if (state.history.indexOf(item.id) === -1) {
        return false;
      }
    } else if (state.category !== "all" && item.category !== state.category) {
      return false;
    }
    return terms.every(function (term) {
      return searchIndex[index].indexOf(term) !== -1;
    });
  }

  function renderTabs() {
    var tabs = [{ id: "all", label: "すべて" }]
      .concat(FAQ_CATEGORIES)
      .concat([{ id: HISTORY_TAB_ID, label: "閲覧履歴" }]);
    tabsEl.textContent = "";
    tabs.forEach(function (tab) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tab";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", String(tab.id === state.category));
      btn.textContent = tab.label;
      btn.addEventListener("click", function () {
        state.category = tab.id;
        renderTabs();
        renderList();
      });
      tabsEl.appendChild(btn);
    });
  }

  function createItem(item) {
    var isOpen = state.openIds.has(item.id);
    var answerId = "answer-" + item.id;

    var wrap = document.createElement("div");
    wrap.className = "faq-item";

    var heading = document.createElement("h2");
    heading.className = "faq-question";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "faq-toggle";
    btn.setAttribute("aria-expanded", String(isOpen));
    btn.setAttribute("aria-controls", answerId);
    btn.textContent = item.question;

    var answer = document.createElement("div");
    answer.className = "faq-answer";
    answer.id = answerId;
    answer.hidden = !isOpen;
    // answer は faq-data.js 内の固定データのみ（ユーザー入力は含まない）
    answer.innerHTML = item.answer;

    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      answer.hidden = !open;
      if (open) {
        state.openIds.add(item.id);
        state.history = state.history.filter(function (id) {
          return id !== item.id;
        });
        state.history.unshift(item.id);
        saveHistory();
      } else {
        state.openIds.delete(item.id);
      }
    });

    heading.appendChild(btn);
    wrap.appendChild(heading);
    wrap.appendChild(answer);
    return wrap;
  }

  function renderList() {
    var q = normalize(state.query);
    var terms = q === "" ? [] : q.split(/\s+/);

    var results = FAQ_ITEMS.filter(function (item, index) {
      return matches(item, index, terms);
    });

    if (state.category === HISTORY_TAB_ID) {
      results.sort(function (a, b) {
        return state.history.indexOf(a.id) - state.history.indexOf(b.id);
      });
    }

    listEl.textContent = "";
    results.forEach(function (item) {
      listEl.appendChild(createItem(item));
    });

    countEl.textContent = results.length + " 件の質問";
    emptyEl.hidden = results.length !== 0;
  }

  searchEl.addEventListener("input", function () {
    state.query = searchEl.value;
    renderList();
  });

  initTheme();
  renderTabs();
  renderList();
})();
