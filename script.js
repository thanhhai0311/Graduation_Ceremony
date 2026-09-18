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
// Không trình duyệt nào cho phát audio có tiếng khi trang vừa mở, chưa có
// tương tác gì — đây là giới hạn cứng của nền tảng (autoplay policy), không
// phải lỗi code. Cách đáng tin cậy nhất: KHÔNG tạo player lúc tải trang, mà
// chỉ tạo + yêu cầu play (autoplay:1, mute:0) ngay bên trong handler của
// tương tác thật đầu tiên — nhờ vậy trình duyệt luôn nhận call này là do
// người dùng chủ động, không bị chặn ngầm như kiểu "mute trước rồi unmute
// sau". Gộp mọi loại sự kiện tương tác phổ biến trên cả desktop và mobile.
const MUSIC_VIDEO_ID = "OWFBxcY9_SY";
const INTERACTION_EVENTS = [
  "click",
  "mousedown",
  "pointerdown",
  "touchstart",
  "touchend",
  "keydown",
];

const musicToggleBtn = document.getElementById("music-toggle");

let ytPlayer = null;
let apiReady = false;
let musicStarted = false;
let pendingStart = false;
let isPlaying = false;

function setPlayingUI(playing) {
  isPlaying = playing;
  musicToggleBtn.classList.toggle("playing", playing);
  musicToggleBtn.setAttribute("aria-pressed", String(playing));
  musicToggleBtn.setAttribute("aria-label", playing ? "Tạm dừng nhạc nền" : "Phát nhạc nền");
}

function createPlayer() {
  ytPlayer = new YT.Player("yt-player", {
    height: "0",
    width: "0",
    videoId: MUSIC_VIDEO_ID,
    playerVars: {
      autoplay: 1,
      mute: 0,
      controls: 0,
      loop: 1,
      playlist: MUSIC_VIDEO_ID,
      playsinline: 1,
    },
    events: {
      onReady: (event) => event.target.playVideo(),
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.PLAYING) setPlayingUI(true);
        else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
          setPlayingUI(false);
        }
      },
      onError: (event) => {
        console.error("Không phát được nhạc nền, mã lỗi YouTube:", event.data);
      },
    },
  });
}

// YouTube IFrame API gọi hàm global này ngay khi script iframe_api tải xong
window.onYouTubeIframeAPIReady = () => {
  apiReady = true;
  if (pendingStart) createPlayer();
};

function startMusic() {
  if (musicStarted) return;
  musicStarted = true;

  INTERACTION_EVENTS.forEach((eventName) => {
    window.removeEventListener(eventName, startMusic);
  });

  if (apiReady) {
    createPlayer();
  } else {
    // API script (tải qua network) có thể chưa kịp sẵn sàng — tạo player
    // ngay khi nó báo ready, vẫn nằm trong "chuỗi" của lần tương tác này.
    pendingStart = true;
  }
}

INTERACTION_EVENTS.forEach((eventName) => {
  window.addEventListener(eventName, startMusic, { passive: true });
});

// Nút tạm dừng/tiếp tục: lần bấm đầu tiên (nếu là tương tác đầu tiên trên
// trang) sẽ tự khởi động nhạc như bình thường; các lần bấm sau đó chỉ
// toggle play/pause của player đã tồn tại.
musicToggleBtn.addEventListener("click", () => {
  if (!musicStarted) {
    startMusic();
    return;
  }
  if (!ytPlayer || typeof ytPlayer.playVideo !== "function") return;

  if (isPlaying) {
    ytPlayer.pauseVideo();
  } else {
    ytPlayer.playVideo();
  }
});
