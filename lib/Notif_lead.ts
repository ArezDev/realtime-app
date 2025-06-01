let audio: HTMLAudioElement | null = null;

export function initAudio() {
  if (!audio) {
    audio = new Audio('/notif-dana.mp3');
  }
}

export function playAudio() {
  if (audio) {
    audio.play().catch((e) => {
      console.warn('Audio play blocked:', e);
    });
  }
}
