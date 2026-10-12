import { useEffect, useState } from "react";

const slides = [
  {
    src: "/Landingimages-videos/alumni-image1.jpg",
    alt: "SPC CCS alumni gathered for a banquet",
    caption: "SPC CCS alumni reconnect over a shared meal.",
  },
  {
    src: "/Landingimages-videos/alumni-image2.jpg",
    alt: "Alumni and guests gathered at an SPC CCS event",
    caption: "Alumni and guests come together for an SPC CCS celebration.",
  },
  {
    src: "/Landingimages-videos/alumni-image3.jpg",
    alt: "Alumni posing together at a college event",
    caption: "A group photo capturing the spirit of the SPC CCS community.",
  },
  {
    src: "/Landingimages-videos/alumni-image4.jpg",
    alt: "SPC CCS alumni posing together",
    caption: "Alumni share a moment together during the celebration.",
  },
  {
    src: "/Landingimages-videos/alumni-image5.jpg",
    alt: "Three alumni friends at a banquet",
    caption: "Friends and fellow alumni reconnect at an SPC CCS gathering.",
  },
];

export default function LandingMedia() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const showSlide = (index) => {
    setActiveSlide((index + slides.length) % slides.length);
  };

  return (
    <>
      <section className="lp-section landing-media-section landing-slideshow-section" aria-labelledby="landing-slideshow-title">
        <div className="landing-media-copy">
          <div className="lp-head">
            <span className="lp-eyebrow">Alumni photo gallery</span>
            <h2 id="landing-slideshow-title">Moments from the SPC CCS community.</h2>
            <p>Browse five snapshots of alumni reconnecting and celebrating together.</p>
          </div>
          <p className="landing-media-caption" aria-live="polite">
            {slides[activeSlide].caption}
          </p>
        </div>
        <div className="landing-media-frame">
          <div className="landing-slideshow" aria-roledescription="carousel" aria-label="Alumni photo slideshow">
            <figure className="landing-slide" aria-live="polite">
              <img src={slides[activeSlide].src} alt={slides[activeSlide].alt} loading="lazy" />
              <span className="landing-slide-count">{activeSlide + 1} / {slides.length}</span>
            </figure>
            <div className="landing-slideshow-controls">
              <button
                type="button"
                className="landing-slide-arrow"
                onClick={() => showSlide(activeSlide - 1)}
                aria-label="Show previous photo"
              >
                Previous
              </button>
              <div className="landing-slide-dots" aria-label="Choose a photo">
                {slides.map((slide, index) => (
                  <button
                    type="button"
                    key={slide.src}
                    className={`landing-slide-dot ${index === activeSlide ? "active" : ""}`}
                    onClick={() => showSlide(index)}
                    aria-label={`Show photo ${index + 1}`}
                    aria-current={index === activeSlide ? "true" : undefined}
                  />
                ))}
              </div>
              <button
                type="button"
                className="landing-slide-arrow"
                onClick={() => showSlide(activeSlide + 1)}
                aria-label="Show next photo"
              >
                Next
              </button>
            </div>
            <button
              type="button"
              className="landing-slideshow-toggle"
              onClick={() => setIsPlaying((playing) => !playing)}
              aria-pressed={isPlaying}
            >
              {isPlaying ? "Pause slideshow" : "Play slideshow"}
            </button>
          </div>
        </div>
      </section>

      <section className="lp-section landing-media-section landing-video-section" aria-labelledby="landing-video-title">
        <div className="landing-media-copy">
          <div className="lp-head">
            <span className="lp-eyebrow">Alumni video</span>
            <h2 id="landing-video-title">A closer look at our alumni community.</h2>
            <p>Watch a short feature celebrating the connections that continue beyond graduation.</p>
          </div>
          <p className="landing-media-caption">
            SPC CCS alumni come together to celebrate their shared experiences and lasting connections.
          </p>
        </div>
        <div className="landing-media-frame">
          <video
            className="landing-video"
            controls
            autoPlay
            muted
            loop
            preload="auto"
            playsInline
            aria-label="Alumni community video"
          >
            <source src="/Landingimages-videos/alumni-video.mp4" type="video/mp4" />
            Your browser does not support the video element.
          </video>
        </div>
      </section>
    </>
  );
}
