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

// --- Nhạc nền (YouTube, tự phát) ---
// Trình duyệt chặn autoplay có tiếng, nên phát ở chế độ mute ngay khi tải
// trang, rồi tự bật tiếng ngay khi người dùng có tương tác đầu tiên
// (chạm/cuộn/click bất kỳ đâu) — với thiệp mời, việc này gần như tức thì.
const MUSIC_VIDEO_ID = "OWFBxcY9_SY";
let ytPlayer = null;
let hasUnmuted = false;

function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player("yt-player", {
    height: "0",
    width: "0",
    videoId: MUSIC_VIDEO_ID,
    playerVars: {
      autoplay: 1,
      mute: 1,
      controls: 0,
      loop: 1,
      playlist: MUSIC_VIDEO_ID,
    },
    events: {
      onReady: (event) => {
        event.target.playVideo();
      },
    },
  });
}
// YouTube IFrame API calls this global function once loaded
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

function unmuteMusic() {
  if (hasUnmuted || !ytPlayer || typeof ytPlayer.unMute !== "function") return;
  ytPlayer.unMute();
  ytPlayer.playVideo();
  hasUnmuted = true;
}

["click", "touchstart", "keydown", "scroll"].forEach((eventName) => {
  window.addEventListener(eventName, unmuteMusic, { once: true, passive: true });
});
