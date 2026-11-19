(function () {
  "use strict";

  var THEME_KEY = "bob-faq-theme";
  var themeToggleBtn = document.getElementById("theme-toggle");

  function getStoredTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark" || saved === "light") {
        return saved;
      }
    } catch (e) {
      // localStorage is inaccessible (e.g. strict security settings)
    }
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeToggleBtn) {
      var icon = themeToggleBtn.querySelector(".theme-toggle-icon");
      if (theme === "dark") {
        if (icon) icon.textContent = "☀️";
        themeToggleBtn.setAttribute("aria-label", "ライトテーマに切り替え");
      } else {
        if (icon) icon.textContent = "🌙";
        themeToggleBtn.setAttribute("aria-label", "ダークテーマに切り替え");
      }
    }
  }

  function initTheme() {
    var initialTheme = getStoredTheme();
    applyTheme(initialTheme);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme") || "light";
        var nextTheme = current === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
        try {
          localStorage.setItem(THEME_KEY, nextTheme);
        } catch (e) {}
      });
    }

    if (window.matchMedia) {
      var mql = window.matchMedia("(prefers-color-scheme: dark)");
      var listener = function (e) {
        try {
          if (!localStorage.getItem(THEME_KEY)) {
            applyTheme(e.matches ? "dark" : "light");
          }
        } catch (err) {
          applyTheme(e.matches ? "dark" : "light");
        }
      };
      if (mql.addEventListener) {
        mql.addEventListener("change", listener);
      } else if (mql.addListener) {
        mql.addListener(listener);
      }
    }
  }

  initTheme();

  var data = window.FAQ_DATA;
  var query = "";
  var category = "all";
  var HISTORY_KEY = "bob-faq-history";
  var historyIds = [];
  try {
    var savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      var parsed = JSON.parse(savedHistory);
      if (Array.isArray(parsed)) {
        historyIds = parsed;
      }
    }
  } catch (e) {}

  function recordHistory(id) {
    if (historyIds.indexOf(id) === -1) {
      historyIds.push(id);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(historyIds));
      } catch (e) {}
    }
  }

  var tabsEl = document.getElementById("category-tabs");
  var listEl = document.getElementById("faq-list");
  var countEl = document.getElementById("result-count");
  var emptyEl = document.getElementById("empty-state");
  var inputEl = document.getElementById("search-input");

  // 回答 HTML からタグを除いたプレーンテキストを取得する（検索対象用）
  var answerText = {};
  var tmp = document.createElement("div");
  data.forEach(function (cat) {
    cat.items.forEach(function (item, i) {
      tmp.innerHTML = item.a;
      answerText[cat.id + "-" + i] = tmp.textContent;
    });
  });

  function matches(cat, item, i, words) {
    var target = (item.q + " " + answerText[cat.id + "-" + i]).toLowerCase();
    return words.every(function (w) {
      return target.indexOf(w) !== -1;
    });
  }

  function renderTabs() {
    tabsEl.textContent = "";
    var tabs = [{ id: "all", name: "すべて" }].concat(
      data.map(function (c) {
        return { id: c.id, name: c.name };
      }),
      [{ id: "history", name: "閲覧履歴" }]
    );
    tabs.forEach(function (t) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tab";
      btn.textContent = t.name;
      btn.setAttribute("aria-pressed", String(t.id === category));
      btn.addEventListener("click", function () {
        category = t.id;
        renderTabs();
        render();
      });
      tabsEl.appendChild(btn);
    });
  }

  function render() {
    var words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    var total = 0;
    listEl.textContent = "";

    data.forEach(function (cat) {
      if (category !== "all" && category !== "history" && category !== cat.id) return;

      var hits = [];
      cat.items.forEach(function (item, i) {
        var id = cat.id + "-" + i;
        if (category === "history" && historyIds.indexOf(id) === -1) return;
        if (matches(cat, item, i, words)) hits.push({ item: item, index: i });
      });
      if (hits.length === 0) return;

      var section = document.createElement("section");
      var title = document.createElement("h2");
      title.className = "category-title";
      title.textContent = cat.name;
      section.appendChild(title);

      hits.forEach(function (h) {
        var panelId = "answer-" + cat.id + "-" + h.index;

        var wrap = document.createElement("div");
        wrap.className = "faq-item";

        var heading = document.createElement("h3");
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "faq-question";
        btn.setAttribute("aria-expanded", "false");
        btn.setAttribute("aria-controls", panelId);
        btn.textContent = h.item.q;

        var panel = document.createElement("div");
        panel.className = "faq-answer";
        panel.id = panelId;
        panel.hidden = true;
        panel.innerHTML = h.item.a; // faq-data.js の固定データのみ

        btn.addEventListener("click", function () {
          var open = btn.getAttribute("aria-expanded") === "true";
          btn.setAttribute("aria-expanded", String(!open));
          panel.hidden = open;
          if (!open) {
            recordHistory(cat.id + "-" + h.index);
          }
        });

        heading.appendChild(btn);
        wrap.appendChild(heading);
        wrap.appendChild(panel);
        section.appendChild(wrap);
        total++;
      });

      listEl.appendChild(section);
    });

    countEl.textContent = total + " 件の質問が見つかりました";
    emptyEl.hidden = total !== 0;
    listEl.hidden = total === 0;
  }

  inputEl.addEventListener("input", function () {
    query = inputEl.value;
    render();
  });

  renderTabs();
  render();
})();
