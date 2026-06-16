export class VideoTracker {
  constructor() {
    this.videoElements = document.querySelectorAll("[data-video-player]");
    this.thresholds = [0, 25, 50, 75]; // Default time thresholds in percentage
    this.initializeTrackers();
    this.initializeIntersectionObserver();
  }

  initializeTrackers() {
    this.videoElements.forEach((videoElement) => {
      const title = videoElement?.getAttribute("title") || "";
      const thresholds = this.thresholds;
      let reachedThreshold = -1;

      const checkTime = () => {
        const currentTime =
          (videoElement.currentTime / videoElement.duration) * 100;

        for (let i = thresholds.length - 1; i >= 0; i--) {
          if (
            currentTime >= thresholds[i] &&
            reachedThreshold < thresholds[i]
          ) {
            reachedThreshold = thresholds[i];
            this.sendVideoInteractionEvent(title, reachedThreshold);
          }
        }
      };

      const handleEnded = () => {
        if (reachedThreshold < 100) {
          this.sendVideoInteractionEvent(title, 100); // Send 100% threshold when the video ends
        }
      };

      videoElement.addEventListener("timeupdate", checkTime);
      videoElement.addEventListener("ended", handleEnded);
    });
  }

  sendVideoInteractionEvent(title, threshold) {
  }

  initializeIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5, // Configurable threshold based on your preference
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const videoElement = entry.target;
        if (entry.isIntersecting) {
          // Video is in the viewport
        } else {
          // Video is not in the viewport, pause it
          if (!videoElement.paused) {
            videoElement.pause();
          }
        }
      });
    }, options);

    this.videoElements.forEach((videoElement) => {
      observer.observe(videoElement);
    });
  }
}
