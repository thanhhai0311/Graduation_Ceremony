// Ngày giờ diễn ra lễ tốt nghiệp: 15:00, Thứ Bảy 26/09/2026
const EVENT_DATE = new Date("2026-09-26T15:00:00+07:00").getTime();

const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const messageEl = document.getElementById("countdown-message");

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const now = Date.now();
  const diff = EVENT_DATE - now;

  if (diff <= 0) {
    daysEl.textContent = "00";
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";
    messageEl.textContent = "🎉 Chúc mừng tốt nghiệp! Hẹn gặp bạn tại buổi lễ.";
    clearInterval(timer);
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  daysEl.textContent = pad(days);
  hoursEl.textContent = pad(hours);
  minutesEl.textContent = pad(minutes);
  secondsEl.textContent = pad(seconds);

  messageEl.textContent = `Còn ${days} ngày nữa thôi!`;
}

updateCountdown();
const timer = setInterval(updateCountdown, 1000);

// --- Nhạc nền (YouTube) ---
const MUSIC_VIDEO_ID = "OWFBxcY9_SY";
const musicToggle = document.getElementById("music-toggle");
let ytPlayer = null;
let isPlaying = false;

function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player("yt-player", {
    height: "0",
    width: "0",
    videoId: MUSIC_VIDEO_ID,
    playerVars: {
      autoplay: 0,
      controls: 0,
      loop: 1,
      playlist: MUSIC_VIDEO_ID,
    },
    events: {
      onReady: () => {
        musicToggle.disabled = false;
      },
    },
  });
}
// YouTube IFrame API calls this global function once loaded
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

musicToggle.addEventListener("click", () => {
  if (!ytPlayer || typeof ytPlayer.playVideo !== "function") return;

  if (isPlaying) {
    ytPlayer.pauseVideo();
  } else {
    ytPlayer.playVideo();
  }
  isPlaying = !isPlaying;
  musicToggle.classList.toggle("playing", isPlaying);
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
  musicToggle.setAttribute("aria-label", isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền");
});
