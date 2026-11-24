(function () {
  "use strict";

  var data = window.FAQ_DATA || [];
  var state = { keyword: "", category: "all" };

  var searchInput = document.getElementById("search-input");
  var filterEl = document.getElementById("category-filter");
  var countEl = document.getElementById("result-count");
  var listEl = document.getElementById("faq-list");
  var emptyEl = document.getElementById("empty-message");
  var faqPanel = document.getElementById("faq-panel");
  var historyPanel = document.getElementById("history-panel");
  var historyListEl = document.getElementById("history-list");
  var historyEmptyEl = document.getElementById("history-empty");
  var viewTabs = document.getElementById("view-tabs");

  // 閲覧履歴: "カテゴリID:インデックス" の配列(新しい順)を localStorage に保存
  var HISTORY_KEY = "bob-faq-history";
  var HISTORY_MAX = 20;

  function loadHistory() {
    try {
      var list = JSON.parse(localStorage.getItem(HISTORY_KEY));
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function addHistory(key) {
    var list = loadHistory().filter(function (k) { return k !== key; });
    list.unshift(key);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_MAX)));
    } catch (e) {}
  }

  function renderHistory() {
    historyListEl.textContent = "";
    var shown = 0;
    loadHistory().forEach(function (key) {
      var parts = String(key).split(":");
      var cat = data.filter(function (c) { return c.id === parts[0]; })[0];
      var item = cat && cat.items[Number(parts[1])];
      if (!item) return;
      var li = document.createElement("li");
      li.textContent = item.q;
      historyListEl.appendChild(li);
      shown++;
    });
    historyEmptyEl.hidden = shown !== 0;
  }

  function showView(view) {
    var isHistory = view === "history";
    if (isHistory) renderHistory();
    faqPanel.hidden = isHistory;
    historyPanel.hidden = !isHistory;
    Array.prototype.forEach.call(viewTabs.children, function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.view === view));
    });
  }

  Array.prototype.forEach.call(viewTabs.children, function (btn) {
    btn.addEventListener("click", function () { showView(btn.dataset.view); });
  });

  // セグメント(文字列 / {code} / {strong})をノードとして親に追加する
  function appendSegments(parent, segments) {
    segments.forEach(function (seg) {
      if (typeof seg === "string") {
        parent.appendChild(document.createTextNode(seg));
      } else if (seg.code !== undefined) {
        var code = document.createElement("code");
        code.textContent = seg.code;
        parent.appendChild(code);
      } else if (seg.strong !== undefined) {
        var strong = document.createElement("strong");
        strong.textContent = seg.strong;
        parent.appendChild(strong);
      }
    });
  }

  // 回答ブロックのプレーンテキスト(検索用)
  function segmentsToText(segments) {
    return segments.map(function (seg) {
      if (typeof seg === "string") return seg;
      return seg.code !== undefined ? seg.code : seg.strong;
    }).join("");
  }

  function answerToText(blocks) {
    return blocks.map(function (block) {
      if (block.p) return segmentsToText(block.p);
      return block.ul.map(segmentsToText).join(" ");
    }).join(" ");
  }

  function matches(item) {
    if (!state.keyword) return true;
    var target = (item.q + " " + answerToText(item.a)).toLowerCase();
    return target.indexOf(state.keyword) !== -1;
  }

  function buildItem(item, id, historyKey) {
    var wrapper = document.createElement("div");
    wrapper.className = "faq-item";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "faq-question";
    btn.id = id + "-q";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", id + "-a");
    btn.textContent = item.q;

    var answer = document.createElement("div");
    answer.className = "faq-answer";
    answer.id = id + "-a";
    answer.setAttribute("role", "region");
    answer.setAttribute("aria-labelledby", id + "-q");
    answer.hidden = true;

    item.a.forEach(function (block) {
      if (block.p) {
        var p = document.createElement("p");
        appendSegments(p, block.p);
        answer.appendChild(p);
      } else if (block.ul) {
        var ul = document.createElement("ul");
        block.ul.forEach(function (segments) {
          var li = document.createElement("li");
          appendSegments(li, segments);
          ul.appendChild(li);
        });
        answer.appendChild(ul);
      }
    });

    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      answer.hidden = expanded;
      if (!expanded) addHistory(historyKey);
    });

    wrapper.appendChild(btn);
    wrapper.appendChild(answer);
    return wrapper;
  }

  function render() {
    listEl.textContent = "";
    var total = 0;

    data.forEach(function (cat) {
      if (state.category !== "all" && state.category !== cat.id) return;

      var hits = [];
      cat.items.forEach(function (item, index) {
        if (matches(item)) hits.push({ item: item, index: index });
      });
      if (hits.length === 0) return;

      var section = document.createElement("section");
      var title = document.createElement("h2");
      title.className = "faq-category-title";
      title.textContent = cat.title;
      section.appendChild(title);

      hits.forEach(function (hit) {
        section.appendChild(buildItem(hit.item, "faq-" + cat.id + "-" + hit.index, cat.id + ":" + hit.index));
      });

      listEl.appendChild(section);
      total += hits.length;
    });

    countEl.textContent = total + " 件のFAQ";
    emptyEl.hidden = total !== 0;
  }

  function updateCategoryButtons() {
    Array.prototype.forEach.call(filterEl.children, function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.category === state.category));
    });
  }

  function buildCategoryButtons() {
    var categories = [{ id: "all", title: "すべて" }].concat(data);
    categories.forEach(function (cat) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "category-btn";
      btn.dataset.category = cat.id;
      btn.textContent = cat.title;
      btn.addEventListener("click", function () {
        state.category = cat.id;
        updateCategoryButtons();
        render();
      });
      filterEl.appendChild(btn);
    });
    updateCategoryButtons();
  }

  searchInput.addEventListener("input", function () {
    state.keyword = searchInput.value.trim().toLowerCase();
    render();
  });

  buildCategoryButtons();
  render();

  // テーマ切替
  var themeToggle = document.getElementById("theme-toggle");
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function isDark() {
    var theme = document.documentElement.getAttribute("data-theme");
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return darkQuery.matches;
  }

  function updateToggle() {
    themeToggle.setAttribute("aria-pressed", String(isDark()));
  }

  themeToggle.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("bob-faq-theme", next);
    } catch (e) {}
    updateToggle();
  });

  darkQuery.addEventListener("change", updateToggle);
  updateToggle();
})();
