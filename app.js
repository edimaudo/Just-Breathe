/* ================================
   Just Breathe — App Logic
   ================================ */

const TECHNIQUES = {
  box: {
    title: "Box Breathing",
    short: "Inhale 4 • Hold 4 • Exhale 4 • Hold 4",
    details:
      "Box breathing calms the nervous system and improves focus. Sit upright. Inhale through the nose for 4, hold for 4, exhale for 4, hold for 4. Repeat for 3–5 minutes.",
    pattern: [4, 4, 4, 4],
    labels: ["Inhale", "Hold", "Exhale", "Hold"],
  },
  "478": {
    title: "4-7-8 Breathing",
    short: "Inhale 4 • Hold 7 • Exhale 8",
    details:
      "Popularized by Dr. Andrew Weil. Helps reduce anxiety and improve sleep onset. Inhale quietly 4, hold 7, exhale audibly 8. Repeat 4 cycles.",
    pattern: [4, 7, 8, 0],
    labels: ["Inhale", "Hold", "Exhale", ""],
  },
  bhramari: {
    title: "Bhramari Pranayama",
    short: "Inhale deep • Exhale with humming sound",
    details:
      "Optionally close the ears gently. Inhale comfortably, then exhale through the nose while humming like a bee. The vibration can quiet mental chatter and ease tension.",
    pattern: [4, 0, 6, 0],
    labels: ["Inhale", "", "Hum (Exhale)", ""],
  },
  lion: {
    title: "Lion’s Breath",
    short: "Inhale nose • Exhale with a gentle ‘ha’",
    details:
      "Inhale through the nose. Exhale through the mouth with a relaxed tongue and a soft ‘ha’. Releases jaw/face tension and boosts alertness.",
    pattern: [3, 0, 6, 0],
    labels: ["Inhale", "", "Exhale", ""],
  },
  equal: {
    title: "Equal Breathing",
    short: "Inhale = Exhale (e.g., 4 and 4)",
    details:
      "Match inhale and exhale length. Smooth nasal breathing balances the autonomic nervous system and builds control.",
    pattern: [4, 0, 4, 0],
    labels: ["Inhale", "", "Exhale", ""],
  },
  humming: {
    title: "Humming Bee Breathing",
    short: "Inhale nose • Exhale humming",
    details:
      "Gentle humming on the exhale creates soothing resonance that relaxes facial muscles and calms the mind.",
    pattern: [4, 0, 6, 0],
    labels: ["Inhale", "", "Humming Exhale", ""],
  },
};

/* ---------- Theme ---------- */
function applyThemeFromStorage() {
  const saved = localStorage.getItem("theme") || "light";
  document.body.classList.toggle("dark", saved === "dark");
  const t = document.getElementById("themeToggle");
  if (t) t.textContent = saved === "dark" ? "Light Mode" : "Dark Mode";
}
function initThemeToggle() {
  const t = document.getElementById("themeToggle");
  if (!t) return;
  applyThemeFromStorage();
  t.addEventListener("click", () => {
    const next = document.body.classList.contains("dark") ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyThemeFromStorage();
  });
}

/* ---------- Stats ---------- */
function loadStatsIntoDOM() {
  const streakEl = document.getElementById("streak");
  const sessionsEl = document.getElementById("sessions");
  if (streakEl) streakEl.textContent = localStorage.getItem("streak") || "0";
  if (sessionsEl) sessionsEl.textContent = localStorage.getItem("sessions") || "0";
}

function updateStatsOnSessionComplete() {
  const todayISO = new Date().toISOString().slice(0, 10);
  const last = localStorage.getItem("lastSession");
  let streak = parseInt(localStorage.getItem("streak") || "0", 10);
  let sessions = parseInt(localStorage.getItem("sessions") || "0", 10);

  if (!last) {
    streak = 1;
  } else {
    const lastDate = new Date(last + "T00:00:00");
    const todayDate = new Date(todayISO + "T00:00:00");
    const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) streak += 1;
    else if (diffDays > 1) streak = 1;
  }

  sessions += 1;
  localStorage.setItem("lastSession", todayISO);
  localStorage.setItem("streak", String(streak));
  localStorage.setItem("sessions", String(sessions));
  loadStatsIntoDOM();
}

/* ---------- Technique Page ---------- */
function initTechniquePage() {
  if (document.body.dataset.page !== "technique") return;

  const params = new URLSearchParams(window.location.search);
  const key = params.get("technique");
  const t = key && TECHNIQUES[key];
  if (!t) return;

  const titleEl = document.getElementById("techniqueTitle");
  const descEl = document.getElementById("techniqueDesc");
  const circle = document.getElementById("breathingCircle");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const infoBtn = document.getElementById("infoBtn");
  const modal = document.getElementById("infoModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const closeModal = document.getElementById("closeModal");

  titleEl.textContent = t.title;
  descEl.textContent = t.short;
  modalTitle.textContent = t.title;
  modalDesc.textContent = t.details;

  if (infoBtn && modal && closeModal) {
    infoBtn.addEventListener("click", () => (modal.style.display = "block"));
    closeModal.addEventListener("click", () => (modal.style.display = "none"));
    window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });
  }

  // Breathing engine
  let step = 0;
  let timer = null;
  function runPhase() {
    const growScale = 1.35;
    const duration = t.pattern[step];
    const label = t.labels[step] || "";
    circle.style.transition = `transform ${Math.max(duration, 0.2)}s ease-in-out`;
    circle.textContent = label;

    if (label.toLowerCase().includes("inhale")) {
      circle.style.transform = `scale(${growScale})`;
    } else if (label.toLowerCase().includes("exhale") || label.toLowerCase().includes("hum")) {
      circle.style.transform = `scale(1)`;
    }

    if (duration > 0) {
      timer = setTimeout(() => { step = (step + 1) % t.pattern.length; runPhase(); }, duration * 1000);
    } else {
      step = (step + 1) % t.pattern.length;
      runPhase();
    }
  }
  function stopBreathing() {
    if (timer) clearTimeout(timer);
    timer = null;
    step = 0;
    circle.style.transform = "scale(1)";
    circle.textContent = "Ready";
  }
  startBtn.addEventListener("click", () => { stopBreathing(); runPhase(); updateStatsOnSessionComplete(); });
  stopBtn.addEventListener("click", stopBreathing);
}

/* ---------- Index Page ---------- */
function initIndexPage() {
  if (document.body.dataset.page !== "app") return;
  // grid and footer layout handled in CSS; nothing dynamic needed
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  loadStatsIntoDOM();
  initIndexPage();
  initTechniquePage();
});
