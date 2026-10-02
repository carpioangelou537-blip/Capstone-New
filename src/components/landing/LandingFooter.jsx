import { CURRENT_YEAR } from "../../lib/constants";
import BrandLogo from "../ui/BrandLogo";

export default function LandingFooter({ onLogin, onGetStarted }) {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-inner">
        <div className="lp-footer-grid">
          <div className="lp-footer">
            <div className="lp-footer-brand">
              <div className="crest small"><BrandLogo /></div>
              <div>
                <div style={{ color: "var(--black)", fontFamily: "var(--font-display)", fontWeight: 700 }}>Alumni Tracer</div>
                <div style={{ fontSize: "0.7rem" }}>St. Peter's College — Iligan City</div>
              </div>
            </div>
            <p>An AI-driven alumni tracking and job-course alignment analytics system for the IT and CS programs.</p>
          </div>
          <div className="lp-footer">
            <h5>Navigate</h5>
            <ul>
              <li><button onClick={onLogin}>Login</button></li>
              <li><button onClick={onGetStarted}>Create an account</button></li>
            </ul>
          </div>
          <div className="lp-footer">
            <h5>Alumni Affairs Office</h5>
            <ul>
              <li><span>Iligan City, Lanao del Norte</span></li>
              <li><span>aao@spc.edu.ph</span></li>
            </ul>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© {CURRENT_YEAR} St. Peter's College Alumni Affairs Office</span>
          <span>AI-Driven Alumni Tracer &amp; Job-Course Alignment Analytics System</span>
        </div>
      </div>
    </footer>
  );
}