async function attachHls(video, sourceUrl) {
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = sourceUrl;
    return;
  }

  try {
    const module = await import('./hls-dru42stk.js');
    const Hls = module.H;

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return;
    }
  } catch (error) {
    console.warn('HLS 初始化失败，尝试使用浏览器默认播放能力。', error);
  }

  video.src = sourceUrl;
}

function setupPlayers() {
  const players = Array.from(document.querySelectorAll('.static-player'));

  players.forEach(function (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('.player-start');
    const sourceUrl = player.dataset.video;

    if (!video || !button || !sourceUrl) {
      return;
    }

    async function startPlayback() {
      if (!video.dataset.ready) {
        await attachHls(video, sourceUrl);
        video.controls = true;
        video.dataset.ready = 'true';
      }

      player.classList.add('is-ready');

      try {
        await video.play();
      } catch (error) {
        video.controls = true;
      }
    }

    button.addEventListener('click', startPlayback);
    player.addEventListener('dblclick', startPlayback);
  });
}

document.addEventListener('DOMContentLoaded', setupPlayers);
