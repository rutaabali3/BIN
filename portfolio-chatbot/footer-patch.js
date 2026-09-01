// Add this block near the end of js/footer.js (inside the existing IIFE,
// after `base` is computed). It loads the chatbot on every page that
// already includes footer.js — no extra <script> on each HTML file.

if (!document.querySelector("script[data-portfolio-chatbot]")) {
  var chat = document.createElement("script");
  chat.src = hrefFor("js/chatbot.js");
  chat.defer = true;
  chat.setAttribute("data-portfolio-chatbot", "");
  document.body.appendChild(chat);
}
