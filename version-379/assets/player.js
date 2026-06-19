(function () {
  window.setupPlayer = function (streamUrl) {
    var video = document.getElementById('videoPlayer');
    var overlay = document.getElementById('playOverlay');
    if (!video || !overlay || !streamUrl) return;
    var loaded = false;
    var hlsInstance = null;

    function loadStream() {
      if (loaded) return;
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      loadStream();
      overlay.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) overlay.classList.remove('is-hidden');
    });
    video.addEventListener('ended', function () {
      overlay.classList.remove('is-hidden');
    });
  };
})();
