(function () {
  var TABS = [{ id: "all", label: "すべて" }]
    .concat(
      FAQ_DATA.categories.map(function (c) {
        return { id: c.id, label: c.label };
      })
    )
    .concat([{ id: "history", label: "閲覧履歴" }]);

  var HISTORY_KEY = "faq-history";
  var history = [];
  try {
    var saved = JSON.parse(localStorage.getItem(HISTORY_KEY));
    if (Array.isArray(saved)) history = saved;
  } catch (e) {}

  // FAQ項目にIDがないため、質問文を識別子として記録する
  function addHistory(question) {
    history = history.filter(function (q) {
      return q !== question;
    });
    history.unshift(question);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {}
  }

  var selectedCategory = "all";
  var query = "";

  var tabsEl = document.getElementById("tabs");
  var listEl = document.getElementById("faq-list");
  var countEl = document.getElementById("count");
  var emptyEl = document.getElementById("empty");
  var inputEl = document.getElementById("search-input");

  // インライン（文字列 / 配列 / { b } / { c }）をプレーンテキスト化
  function inlineToText(inline) {
    if (typeof inline === "string") return inline;
    return inline
      .map(function (s) {
        return typeof s === "string" ? s : s.b || s.c || "";
      })
      .join("");
  }

  function answerToText(answer) {
    return answer
      .map(function (block) {
        if (block.type === "ul") return block.items.map(inlineToText).join(" ");
        return inlineToText(block.text);
      })
      .join(" ");
  }

  function appendInline(parent, inline) {
    var segments = typeof inline === "string" ? [inline] : inline;
    segments.forEach(function (s) {
      if (typeof s === "string") {
        parent.appendChild(document.createTextNode(s));
      } else if (s.b !== undefined) {
        var strong = document.createElement("strong");
        strong.textContent = s.b;
        parent.appendChild(strong);
      } else if (s.c !== undefined) {
        var code = document.createElement("code");
        code.textContent = s.c;
        parent.appendChild(code);
      }
    });
  }

  function buildAnswer(answer) {
    var wrap = document.createElement("div");
    wrap.className = "answer";
    answer.forEach(function (block) {
      if (block.type === "ul") {
        var ul = document.createElement("ul");
        block.items.forEach(function (item) {
          var li = document.createElement("li");
          appendInline(li, item);
          ul.appendChild(li);
        });
        wrap.appendChild(ul);
      } else {
        var p = document.createElement("p");
        appendInline(p, block.text);
        wrap.appendChild(p);
      }
    });
    return wrap;
  }

  function matches(item) {
    if (!query) return true;
    var text = (item.question + " " + answerToText(item.answer)).toLowerCase();
    return text.indexOf(query) !== -1;
  }

  function renderTabs() {
    tabsEl.textContent = "";
    TABS.forEach(function (tab) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tab";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", String(tab.id === selectedCategory));
      btn.textContent = tab.label;
      btn.addEventListener("click", function () {
        selectedCategory = tab.id;
        renderTabs();
        renderList();
      });
      tabsEl.appendChild(btn);
    });
  }

  function renderList() {
    listEl.textContent = "";
    var total = 0;

    FAQ_DATA.categories.forEach(function (cat) {
      if (selectedCategory !== "all" && selectedCategory !== "history" && selectedCategory !== cat.id) return;
      var items = cat.items.filter(function (item) {
        if (selectedCategory === "history" && history.indexOf(item.question) === -1) return false;
        return matches(item);
      });
      if (items.length === 0) return;

      var section = document.createElement("section");
      var h2 = document.createElement("h2");
      h2.className = "category-title";
      h2.textContent = cat.label;
      section.appendChild(h2);

      items.forEach(function (item) {
        var details = document.createElement("details");
        var summary = document.createElement("summary");
        summary.textContent = item.question;
        details.addEventListener("toggle", function () {
          if (details.open) addHistory(item.question);
        });
        details.appendChild(summary);
        details.appendChild(buildAnswer(item.answer));
        section.appendChild(details);
        total++;
      });

      listEl.appendChild(section);
    });

    var filtered = query !== "" || selectedCategory !== "all";
    countEl.textContent = filtered ? total + "件が見つかりました" : total + "件のFAQ";
    emptyEl.hidden = total !== 0;
  }

  inputEl.addEventListener("input", function () {
    query = inputEl.value.trim().toLowerCase();
    renderList();
  });

  var themeBtn = document.getElementById("theme-toggle");
  var root = document.documentElement;

  function applyThemeLabel() {
    var isDark = root.getAttribute("data-theme") === "dark";
    themeBtn.textContent = isDark ? "ライトテーマ" : "ダークテーマ";
    themeBtn.setAttribute("aria-label", isDark ? "ライトテーマに切り替え" : "ダークテーマに切り替え");
  }

  themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("faq-theme", next);
    } catch (e) {}
    applyThemeLabel();
  });

  applyThemeLabel();
  renderTabs();
  renderList();
})();
