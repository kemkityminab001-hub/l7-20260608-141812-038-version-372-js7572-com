import { H as Hls } from './hls.js';

export function setupMoviePlayer(videoUrl, videoId) {
    var video = document.getElementById(videoId);

    if (!video) {
        return;
    }

    var shell = video.closest('.player-shell');
    var startButton = shell ? shell.querySelector('.player-start') : null;
    var attached = false;

    function attachSource() {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoUrl;
            return;
        }

        if (Hls && Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(videoUrl);
            hls.attachMedia(video);
            return;
        }

        video.src = videoUrl;
    }

    function playVideo() {
        attachSource();

        if (startButton) {
            startButton.classList.add('is-hidden');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (startButton) {
        startButton.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener('play', function () {
        if (startButton) {
            startButton.classList.add('is-hidden');
        }
    });
}
