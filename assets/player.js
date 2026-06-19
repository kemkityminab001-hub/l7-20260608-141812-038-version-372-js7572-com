(function() {
  function setupMoviePlayer(video, cover, button, streamUrl) {
    if (!video || !cover || !button || !streamUrl) {
      return;
    }
    var attached = false;
    var hls = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      attach();
      cover.classList.add('is-hidden');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function() {
          cover.classList.remove('is-hidden');
        });
      }
    }

    function toggle() {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    }

    cover.addEventListener('click', start);
    button.addEventListener('click', function(event) {
      event.stopPropagation();
      start();
    });
    video.addEventListener('click', toggle);
    video.addEventListener('play', function() {
      cover.classList.add('is-hidden');
    });
    video.addEventListener('pause', function() {
      if (video.currentTime === 0 || video.ended) {
        cover.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function() {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
