(function () {
  const VIEWER_NAME_KEY = "note_viewer_name_session";

  // EmailJS configuration (use your own values)
  const EMAILJS_SERVICE_ID = "service_mp5kw13";
  const EMAILJS_TEMPLATE_ID = "template_mhbe4mn";
  const EMAILJS_PUBLIC_KEY = "QF0MOZngGzxnNGD0K";

  const whoModalBackdrop = document.getElementById("who-modal-backdrop");
  const whoNameInput = document.getElementById("who-name-input");
  const whoSubmitBtn = document.getElementById("who-submit-btn");
  const whoError = document.getElementById("who-error");

  const commentInput = document.getElementById("comment-input");
  const commentSendBtn = document.getElementById("comment-send-btn");
  const commentFeedback = document.getElementById("comment-feedback");

  function getSessionString(key, fallback = "") {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw === null) return fallback;
      return String(raw);
    } catch {
      return fallback;
    }
  }

  function setSessionString(key, value) {
    try {
      sessionStorage.setItem(key, String(value));
    } catch {
      // ignore
    }
  }

  function getViewerName() {
    return getSessionString(VIEWER_NAME_KEY, "").trim();
  }

  function setViewerName(name) {
    const trimmed = String(name || "").trim();
    setSessionString(VIEWER_NAME_KEY, trimmed);
  }

  function openWhoModal() {
    whoError.textContent = "";
    whoNameInput.value = "";
    whoModalBackdrop.style.display = "flex";
    setTimeout(() => whoNameInput.focus(), 50);
  }

  function closeWhoModal() {
    whoModalBackdrop.style.display = "none";
  }

  function initEmailJS() {
    try {
      if (
        typeof emailjs !== "undefined" &&
        EMAILJS_PUBLIC_KEY &&
        EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY_HERE"
      ) {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      }
    } catch {
      // ignore init errors
    }
  }

  function sendViewEmail(name) {
    try {
      if (
        typeof emailjs === "undefined" ||
        !EMAILJS_PUBLIC_KEY ||
        !EMAILJS_SERVICE_ID ||
        !EMAILJS_TEMPLATE_ID
      ) {
        return;
      }

      const viewedAt = new Date().toLocaleString();
      const params = {
        name: name,
        time: viewedAt,
        message: `${name} viewed your website on ${viewedAt}`,
      };

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
    } catch {
      // fail silently; user still proceeds
    }
  }

  function sendCommentEmail(fromName, commentText) {
    try {
      if (
        typeof emailjs === "undefined" ||
        !EMAILJS_PUBLIC_KEY ||
        !EMAILJS_SERVICE_ID ||
        !EMAILJS_TEMPLATE_ID
      ) {
        return false;
      }

      const sentAt = new Date().toLocaleString();
      const params = {
        name: fromName || "Someone",
        time: sentAt,
        message: `Comment from ${fromName || "Someone"}: ${commentText}`,
      };

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
      return true;
    } catch {
      return false;
    }
  }

  function handleWhoSubmit() {
    const name = whoNameInput.value.trim();
    if (!name || name.length === 0) {
      whoError.textContent = "Please enter your name to continue.";
      whoNameInput.focus();
      return;
    }

    whoError.textContent = "";
    setViewerName(name);
    sendViewEmail(name);
    closeWhoModal();
  }

  function handleCommentSubmit() {
    const text = (commentInput && commentInput.value || "").trim();
    if (!text) return;

    const fromName = getViewerName();
    const sent = sendCommentEmail(fromName, text);
    if (commentInput) commentInput.value = "";
    if (commentFeedback) {
      commentFeedback.textContent = sent ? "Sent! Makita rato niya :D" : "Could not send. Try again.";
      commentFeedback.setAttribute("aria-live", "polite");
      setTimeout(() => {
        if (commentFeedback) commentFeedback.textContent = "";
      }, 4000);
    }
  }

  whoSubmitBtn.addEventListener("click", handleWhoSubmit);
  whoNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleWhoSubmit();
    }
  });

  if (commentSendBtn) {
    commentSendBtn.addEventListener("click", handleCommentSubmit);
  }
  if (commentInput) {
    commentInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleCommentSubmit();
      }
    });
  }

  initEmailJS();

  const existingName = getViewerName();
  if (existingName) {
    closeWhoModal();
  } else {
    openWhoModal();
  }
})();
