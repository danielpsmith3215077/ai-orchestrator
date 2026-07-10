(() => {
  const log = document.getElementById("log");
  const form = document.getElementById("form");
  const input = document.getElementById("input");
  const send = document.getElementById("send");
  const forceSearch = document.getElementById("forceSearch");
  const evolveBtn = document.getElementById("evolveBtn");
  let sessionId = localStorage.getItem("orch_session") || null;

  function addBubble(role, text) {
    const el = document.createElement("div");
    el.className = `bubble ${role}`;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }

  function addMeta(text) {
    const el = document.createElement("div");
    el.className = "bubble meta-line";
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    addBubble("user", message);
    input.value = "";
    send.disabled = true;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          session_id: sessionId,
          force_web_search: forceSearch.checked,
        }),
      });
      const data = await res.json();
      if (data.session_id) {
        sessionId = data.session_id;
        localStorage.setItem("orch_session", sessionId);
      }
      addBubble("assistant", data.reply || "(empty reply)");
      const bits = [];
      if (data.provider) bits.push(`provider=${data.provider}`);
      if (data.used_web_search) bits.push("web_search");
      if (data.memories_used && data.memories_used.length) bits.push(`memories=${data.memories_used.length}`);
      if (data.error) bits.push(`note=${data.error}`);
      if (bits.length) addMeta(bits.join(" · "));
    } catch (err) {
      addBubble("assistant", `Request failed: ${err}`);
    } finally {
      send.disabled = false;
      input.focus();
    }
  });

  evolveBtn.addEventListener("click", async () => {
    evolveBtn.disabled = true;
    addMeta("Running evolution cycle…");
    try {
      const res = await fetch("/admin/evolve", { method: "POST" });
      const data = await res.json();
      addMeta(`Evolution: ${data.evolution?.status || "done"}`);
    } catch (err) {
      addMeta(`Evolution failed: ${err}`);
    } finally {
      evolveBtn.disabled = false;
    }
  });

  addMeta("Ready. Messages are vectorized into cloud/local memory.");
})();
