let audio: HTMLAudioElement | null = null;

export function initAudio() {
  if (!audio) {
    audio = new Audio('/notif-dana.mp3');
    audio.preload = "auto";

    // 🎯 Unlock browser permission dengan silent play + pause
    audio.play().then(() => {
      audio!.pause();
      audio!.currentTime = 0;
    }).catch((err) => {
      console.log('Autoplay not allowed yet:', err);
    });
  }
}

export function playAudio() {
  if (audio) {
    audio.play().catch((e) => {
      console.warn('Audio play blocked:', e);
    });
  }
}
