export default function BrandLogo({ src = "/logo.png", alt = "SPC logo" }) {
  return (
    <img
      src={src}
      alt={alt}
      className="crest-logo"
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
  );
}