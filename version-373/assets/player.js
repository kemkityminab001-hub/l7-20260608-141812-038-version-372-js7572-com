function mountPlayer(options) {
  var video = document.getElementById(options.videoId);
  var trigger = document.getElementById(options.triggerId);
  var layer = document.getElementById(options.posterLayerId);
  var source = options.source;
  if (!video || !source) {
    return;
  }

  var hls = null;
  if (window.Hls && window.Hls.isSupported()) {
    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource(source);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  }

  function start() {
    if (layer) {
      layer.classList.add('is-hidden');
    }
    var playTask = video.play();
    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function() {});
    }
  }

  if (trigger) {
    trigger.addEventListener('click', start);
  }
  if (layer) {
    layer.addEventListener('click', start);
  }
  video.addEventListener('click', function() {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  });
  video.addEventListener('play', function() {
    if (layer) {
      layer.classList.add('is-hidden');
    }
  });
  window.addEventListener('pagehide', function() {
    if (hls) {
      hls.destroy();
    }
  });
}
