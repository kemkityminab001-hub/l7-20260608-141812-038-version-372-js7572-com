import { H as Hls } from "./hls-module.js";

export function setupMoviePlayer(options) {
    const video = document.getElementById(options.videoId);
    const frame = document.getElementById(options.frameId);
    const button = document.getElementById(options.buttonId);
    const source = options.source;
    let loaded = false;
    let hls = null;

    if (!video || !frame || !button || !source) {
        return;
    }

    const hideButton = function () {
        button.classList.add("is-hidden");
    };

    const startVideo = function () {
        if (!loaded) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }

            loaded = true;
        }

        hideButton();

        const playRequest = video.play();

        if (playRequest && typeof playRequest.catch === "function") {
            playRequest.catch(function () {
                video.controls = true;
            });
        }
    };

    button.addEventListener("click", startVideo);

    frame.addEventListener("click", function (event) {
        if (event.target === video && !loaded) {
            startVideo();
        }
    });

    video.addEventListener("play", hideButton);

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
