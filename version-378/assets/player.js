(function () {
  var hlsPromise = null;
  var hlsUrl = 'https://cdn.jsdelivr.net/npm/hls.js@latest';

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!hlsPromise) {
      hlsPromise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = hlsUrl;
        script.async = true;
        script.onload = function () {
          resolve(window.Hls);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    return hlsPromise;
  }

  function connect(video, stream) {
    if (!video || !stream) {
      return Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== stream) {
        video.src = stream;
      }
      return Promise.resolve();
    }

    return loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        if (video._hlsInstance) {
          video._hlsInstance.destroy();
        }

        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });

        video._hlsInstance = hls;
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.src !== stream) {
        video.src = stream;
      }
    }).catch(function () {
      if (video.src !== stream) {
        video.src = stream;
      }
    });
  }

  function setup(root) {
    var video = root.querySelector('video');
    var button = root.querySelector('[data-play-button]');
    var stream = (button && button.getAttribute('data-stream')) || (video && video.getAttribute('data-stream')) || '';
    var started = false;

    function start() {
      connect(video, stream).then(function () {
        root.classList.add('is-playing');
        started = true;
        var playResult = video.play();

        if (playResult && playResult.catch) {
          playResult.catch(function () {
            root.classList.remove('is-playing');
          });
        }
      });
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('play', function () {
        root.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!started || video.paused) {
          root.classList.remove('is-playing');
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setup);
    });
  } else {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setup);
  }
})();
