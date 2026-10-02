import BrandLogo from "../ui/BrandLogo";

export default function SplashScreen() {
  return (
    <div className="splash-screen">
      <div className="splash-logo-wrap">
        <div className="logo-duo">
          <div className="crest xl">
            <BrandLogo />
          </div>
          <div className="crest xl">
            <BrandLogo src="/logos.png" alt="Alumni Affairs Office logo" />
          </div>
        </div>
        <p className="splash-loading-text">Loading…</p>
      </div>
    </div>
  );
}