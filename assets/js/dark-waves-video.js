(() => {
  const video = document.querySelector("[data-game-overview]");
  const source = video?.dataset.hlsSource;

  if (!video || !source) return;

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
    return;
  }

  if (!window.Hls?.isSupported()) {
    video.insertAdjacentText("afterend", "This browser cannot play the Game Overview stream.");
    return;
  }

  const hls = new window.Hls({
    enableWorker: true,
    backBufferLength: 30,
    maxBufferLength: 30
  });

  hls.loadSource(source);
  hls.attachMedia(video);

  hls.on(window.Hls.Events.ERROR, (_event, data) => {
    if (!data.fatal) return;

    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
      hls.startLoad();
      return;
    }

    if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
      hls.recoverMediaError();
      return;
    }

    hls.destroy();
  });

  window.addEventListener("pagehide", () => hls.destroy(), { once: true });
})();
