import Icon from "../ui/Icon";
import BrandLogo from "../ui/BrandLogo";

export default function AuthShell({ children, onBack }) {
  return (
    <div className="auth-page">
      {onBack && (
        <button type="button" className="auth-back" onClick={onBack}>
          <Icon name="arrow" size={14} /> Back to home
        </button>
      )}
      <div className="auth-logo-wrap">
        <div className="logo-duo">
          <div className="crest xl">
            <BrandLogo />
          </div>
          <div className="crest xl">
            <BrandLogo src="/logos.png" alt="Alumni Affairs Office logo" />
          </div>
        </div>
      </div>
      <div className="auth-card-wrap">{children}</div>
    </div>
  );
}