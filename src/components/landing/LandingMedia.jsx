import { useEffect, useState } from "react";

const slides = [
  { src: "/Landingimages-videos/alumni-image1.jpg", alt: "Alumni community gathering" },
  { src: "/Landingimages-videos/alumni-image2.jpg", alt: "Alumni sharing a moment together" },
  { src: "/Landingimages-videos/alumni-image3.jpg", alt: "Alumni event" },
  { src: "/Landingimages-videos/alumni-image4.jpg", alt: "Alumni community event" },
  { src: "/Landingimages-videos/alumni-image5.jpg", alt: "Alumni celebrating together" },
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
    <section className="lp-section landing-media-section" aria-labelledby="landing-media-title">
      <div className="lp-head">
        <span className="lp-eyebrow">Life after SPC</span>
        <h2 id="landing-media-title">Stories from our alumni community.</h2>
        <p>Take a look at the people and moments that keep our alumni connected.</p>
      </div>

      <div className="landing-media-grid">
        <article className="landing-media-card landing-video-card">
          <div className="landing-media-heading">
            <h3>Meet the alumni community</h3>
            <p>Watch a short look at our alumni community.</p>
          </div>
          <video
            className="landing-video"
            controls
            preload="metadata"
            playsInline
            poster="/Landingimages-videos/alumni-image1.jpg"
            aria-label="Alumni community video"
          >
            <source src="/Landingimages-videos/alumni-video.mp4" type="video/mp4" />
            Your browser does not support the video element.
          </video>
        </article>

        <article className="landing-media-card landing-slideshow-card">
          <div className="landing-media-heading">
            <h3>Moments together</h3>
            <p>Five snapshots from the SPC alumni community.</p>
          </div>
          <div className="landing-slideshow" aria-roledescription="carousel" aria-label="Alumni photo slideshow">
            <div className="landing-slide" aria-live="polite">
              <img
                src={slides[activeSlide].src}
                alt={slides[activeSlide].alt}
                loading="lazy"
              />
              <span className="landing-slide-count">{activeSlide + 1} / {slides.length}</span>
            </div>
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
        </article>
      </div>
    </section>
  );
}
