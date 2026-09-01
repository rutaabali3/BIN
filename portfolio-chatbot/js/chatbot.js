(function () {
  if (window.__pfChatbotLoaded) return;
  window.__pfChatbotLoaded = true;

  var base = "";
  var current = document.currentScript;
  if (current && current.src) {
    var parts = current.src.split("/");
    parts.pop();
    parts.pop();
    base = parts.join("/");
  }

  function asset(path) {
    return base ? base + "/" + path : path;
  }

  if (!document.querySelector("link[data-portfolio-chatbot-css]")) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = asset("css/chatbot.css");
    link.setAttribute("data-portfolio-chatbot-css", "");
    document.head.appendChild(link);
  }

  var root = document.createElement("div");
  root.className = "pf-chat-root";
  root.innerHTML =
    '<button type="button" class="pf-chat-toggle" aria-label="Open portfolio chat" aria-expanded="false">' +
    '<i class="bi bi-chat-dots" aria-hidden="true"></i>' +
    "</button>" +
    '<section class="pf-chat-panel" role="dialog" aria-label="Portfolio assistant" aria-hidden="true">' +
    '<header class="pf-chat-header">' +
    "<div><h2>Ask Rutaab</h2>" +
    "<p>Answers come only from this portfolio — skills, work, projects, and contact.</p></div>" +
    '<button type="button" class="pf-chat-close" aria-label="Close chat"><i class="bi bi-x-lg"></i></button>' +
    "</header>" +
    '<div class="pf-chat-log" id="pf-chat-log"></div>' +
    '<div class="pf-chat-chips" id="pf-chat-chips"></div>' +
    '<form class="pf-chat-form" id="pf-chat-form">' +
    '<input type="text" id="pf-chat-input" maxlength="500" autocomplete="off" placeholder="Ask about skills, projects, or contact…" />' +
    "<button type=\"submit\">Send</button>" +
    "</form>" +
    "</section>";

  document.body.appendChild(root);

  var toggle = root.querySelector(".pf-chat-toggle");
  var panel = root.querySelector(".pf-chat-panel");
  var closeBtn = root.querySelector(".pf-chat-close");
  var logEl = root.querySelector("#pf-chat-log");
  var chipsEl = root.querySelector("#pf-chat-chips");
  var form = root.querySelector("#pf-chat-form");
  var input = root.querySelector("#pf-chat-input");
  var sendBtn = form.querySelector("button");

  var history = [];
  var busy = false;
  var greeted = false;

  var chips = [
    "What does Rutaab do?",
    "What skills does he have?",
    "Show me his projects",
    "How can I contact him?",
  ];

  chips.forEach(function (text) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pf-chat-chip";
    btn.textContent = text;
    btn.addEventListener("click", function () {
      input.value = text;
      form.dispatchEvent(new Event("submit", { cancelable: true }));
    });
    chipsEl.appendChild(btn);
  });

  function setOpen(open) {
    panel.classList.toggle("is-open", open);
    toggle.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close portfolio chat" : "Open portfolio chat");
    toggle.innerHTML = open
      ? '<i class="bi bi-x-lg" aria-hidden="true"></i>'
      : '<i class="bi bi-chat-dots" aria-hidden="true"></i>';
    if (open) {
      if (!greeted) {
        greeted = true;
        addBubble(
          "Assalamualaikum — I can answer questions about Muhammad Rutaab Ali using only this portfolio: who he is, skills, experience, projects, learning worlds, blog topics, and how to get in touch.",
          "bot"
        );
      }
      input.focus();
    }
  }

  function addBubble(text, kind) {
    var bubble = document.createElement("div");
    bubble.className = "pf-chat-bubble is-" + kind;
    if (kind === "bot") {
      bubble.innerHTML = linkify(text);
    } else {
      bubble.textContent = text;
    }
    logEl.appendChild(bubble);
    logEl.scrollTop = logEl.scrollHeight;
    return bubble;
  }

  function linkify(text) {
    var escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return escaped.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
  }

  function typing() {
    var bubble = document.createElement("div");
    bubble.className = "pf-chat-bubble is-bot";
    bubble.innerHTML =
      '<span class="pf-chat-typing" aria-label="Thinking"><span></span><span></span><span></span></span>';
    logEl.appendChild(bubble);
    logEl.scrollTop = logEl.scrollHeight;
    return bubble;
  }

  toggle.addEventListener("click", function () {
    setOpen(!panel.classList.contains("is-open"));
  });
  closeBtn.addEventListener("click", function () {
    setOpen(false);
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var text = (input.value || "").trim();
    if (!text || busy) return;
    send(text);
  });

  function send(text) {
    busy = true;
    sendBtn.disabled = true;
    input.value = "";
    addBubble(text, "user");
    history.push({ role: "user", content: text });
    if (history.length > 8) history = history.slice(-8);

    var pending = typing();

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        pending.remove();
        if (!result.ok || !result.data || !result.data.reply) {
          var err =
            (result.data && result.data.error) ||
            "I could not reply just now. Try again, or email rutaabali3@gmail.com.";
          addBubble(err, "error");
          history.pop();
          return;
        }
        history.push({ role: "assistant", content: result.data.reply });
        addBubble(result.data.reply, "bot");
      })
      .catch(function () {
        pending.remove();
        history.pop();
        addBubble(
          "The chat service is unreachable. You can still use the contact page.",
          "error"
        );
      })
      .finally(function () {
        busy = false;
        sendBtn.disabled = false;
        input.focus();
      });
  }
})();
