/* ---------- Tabs ---------- */
const navButtons = document.querySelectorAll(".nav-pill");
const tabPanels = document.querySelectorAll(".tab-panel");

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = `tab-${button.dataset.tab}`;

    navButtons.forEach((btn) => btn.classList.remove("active"));
    tabPanels.forEach((panel) => panel.classList.remove("active"));

    button.classList.add("active");
    document.getElementById(targetId).classList.add("active");
  });
});

/* ---------- Background music ---------- */
const bgMusic = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");
const musicIcon = musicToggle?.querySelector(".music-icon");
const musicLabelLeft = musicToggle?.querySelector(".music-label-left");
const musicLabelRight = musicToggle?.querySelector(".music-label-right");

function syncMusicButton() {
  if (!bgMusic || !musicToggle) return;
  const isPlaying = !bgMusic.paused;
  musicToggle.classList.toggle("playing", isPlaying);
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
  if (musicIcon) musicIcon.textContent = isPlaying ? "❚❚" : "▶";
  if (musicLabelLeft) musicLabelLeft.textContent = isPlaying ? "Pause" : "Play";
  if (musicLabelRight) musicLabelRight.textContent = "background music";
}

musicToggle?.addEventListener("click", async () => {
  if (!bgMusic) return;
  if (bgMusic.paused) {
    try {
      await bgMusic.play();
    } catch (err) {
      console.error("Audio playback failed:", err);
    }
  } else {
    bgMusic.pause();
  }
  syncMusicButton();
});

bgMusic?.addEventListener("play", syncMusicButton);
bgMusic?.addEventListener("pause", syncMusicButton);

/* ---------- Seamless moon video loop ----------
   Two copies of the video take turns: the next one fades in over the
   current one just before it ends, hiding the loop point. */
(function () {
  const vids = document.querySelectorAll(".banner-video");
  if (vids.length < 2) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const FADE = 1.5; // seconds; keep in sync with the CSS transition on .banner-video
  let active = 0;
  let swapping = false;

  vids[0].classList.add("is-active");

  function swap() {
    if (swapping) return;
    swapping = true;

    const cur = vids[active];
    const next = vids[1 - active];

    next.currentTime = 0;
    const p = next.play();
    if (p && p.catch) p.catch(() => {});

    cur.classList.remove("is-active");
    cur.classList.add("is-leaving"); // stays solid underneath while the new one fades in
    next.classList.add("is-active");
    active = 1 - active;

    setTimeout(() => {
      cur.classList.remove("is-leaving");
      cur.pause();
      swapping = false;
    }, FADE * 1000 + 150);
  }

  vids.forEach((v, i) => {
    v.addEventListener("timeupdate", () => {
      if (i !== active || !v.duration || !isFinite(v.duration)) return;
      const fade = Math.min(FADE, v.duration / 3); // never fade longer than a third of a short clip
      if (v.duration - v.currentTime <= fade) swap();
    });
    // safety net if timeupdate was throttled (e.g. background tab)
    v.addEventListener("ended", () => {
      if (i === active) swap();
    });
  });

  // resume if the browser paused the video while the tab was hidden
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      const p = vids[active].play();
      if (p && p.catch) p.catch(() => {});
    }
  });
})();