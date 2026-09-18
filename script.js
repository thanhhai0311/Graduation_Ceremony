// Đón tiếp từ 13:00, Thứ Bảy 26/09/2026 (theo lịch trình chính thức)
const EVENT_DATE = new Date("2026-09-26T13:00:00+07:00").getTime();

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
// tương tác thật đầu tiên.
//
// Tách 2 nhóm sự kiện:
// - STRONG_EVENTS: gesture được browser công nhận chính thức (click/chạm/
//   phím) — đáng tin cậy, chỉ cần dùng 1 lần rồi gỡ hết listener.
// - WEAK_EVENTS ("wheel"): cuộn chuột KHÔNG phải gesture hợp lệ, lệnh phát
//   có thể bị chặn ngầm. Vì vậy nó CHỈ được phép "thử" phát (và có thể thử
//   lại nhiều lần khi người dùng tiếp tục cuộn) — không được phép tiêu tốn
//   cơ hội của nhóm STRONG_EVENTS bằng cách gỡ listener của nhóm đó. Đây là
//   lỗi ở phiên bản trước: gộp chung 1 nhóm khiến wheel "dùng hết lượt" rồi
//   im luôn dù có click/chạm thật sau đó.
const MUSIC_VIDEO_ID = "OWFBxcY9_SY";
const STRONG_EVENTS = ["click", "mousedown", "pointerdown", "touchstart", "touchend", "keydown"];
const WEAK_EVENTS = ["wheel"];
const WEAK_RETRY_THROTTLE_MS = 500;

const musicToggleBtn = document.getElementById("music-toggle");

let ytPlayer = null;
let apiReady = false;
let playerCreated = false;
let pendingStart = false;
let isPlaying = false;
let lastWeakAttempt = 0;

function setPlayingUI(playing) {
  isPlaying = playing;
  musicToggleBtn.classList.toggle("playing", playing);
  musicToggleBtn.setAttribute("aria-pressed", String(playing));
  musicToggleBtn.setAttribute("aria-label", playing ? "Tạm dừng nhạc nền" : "Phát nhạc nền");
  if (playing) removeAllTriggers();
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

// Gọi ở mọi lần trigger (strong lẫn weak): tạo player nếu chưa có, hoặc thử
// playVideo() lại nếu player đã tồn tại nhưng chưa thực sự phát được.
function retryPlay() {
  if (isPlaying) return;
  if (!playerCreated) {
    playerCreated = true;
    if (apiReady) {
      createPlayer();
    } else {
      // API script (tải qua network) có thể chưa kịp sẵn sàng — tạo player
      // ngay khi nó báo ready, vẫn nằm trong "chuỗi" của lần tương tác này.
      pendingStart = true;
    }
    return;
  }
  if (ytPlayer && typeof ytPlayer.playVideo === "function") {
    ytPlayer.playVideo();
  }
}

function removeAllTriggers() {
  STRONG_EVENTS.forEach((eventName) => window.removeEventListener(eventName, handleStrongInteraction));
  WEAK_EVENTS.forEach((eventName) => window.removeEventListener(eventName, handleWeakInteraction));
}

function handleStrongInteraction() {
  retryPlay();
  STRONG_EVENTS.forEach((eventName) => window.removeEventListener(eventName, handleStrongInteraction));
}

function handleWeakInteraction() {
  const now = Date.now();
  if (now - lastWeakAttempt < WEAK_RETRY_THROTTLE_MS) return;
  lastWeakAttempt = now;
  retryPlay();
}

STRONG_EVENTS.forEach((eventName) => {
  window.addEventListener(eventName, handleStrongInteraction, { passive: true });
});
WEAK_EVENTS.forEach((eventName) => {
  window.addEventListener(eventName, handleWeakInteraction, { passive: true });
});

// Nút tạm dừng/tiếp tục: lần bấm đầu tiên (nếu là tương tác đầu tiên trên
// trang) sẽ tự khởi động nhạc như bình thường; các lần bấm sau đó chỉ
// toggle play/pause của player đã tồn tại.
musicToggleBtn.addEventListener("click", () => {
  if (!playerCreated) {
    retryPlay();
    return;
  }
  if (!ytPlayer || typeof ytPlayer.playVideo !== "function") return;

  if (isPlaying) {
    ytPlayer.pauseVideo();
  } else {
    ytPlayer.playVideo();
  }
});

// --- Link Messenger: mobile mở app Messenger, desktop mở thẳng hộp thoại
// nhắn tin trên facebook.com ---
// m.me/<username> được thiết kế để mở app Messenger trên điện thoại (tự
// fallback sang web nếu chưa cài app), nhưng trên desktop nó chỉ hiện màn
// hình trung gian yêu cầu "tiếp tục trên messenger.com" thay vì mở thẳng
// hộp thoại — nên desktop dùng link facebook.com/messages/t/ thay thế.
const MESSENGER_USERNAME = "thanh.hai.497457";
const messengerLink = document.getElementById("messenger-link");
if (messengerLink) {
  const isMobileDevice = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
  messengerLink.href = isMobileDevice
    ? `https://m.me/${MESSENGER_USERNAME}`
    : `https://www.facebook.com/messages/t/${MESSENGER_USERNAME}`;
}
