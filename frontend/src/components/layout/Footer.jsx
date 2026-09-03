function Footer() {
  const linkClass =
    "pr-[11px] border-r tracking-[0.028em] hover:underline";
  const linkStyle = { borderColor: "var(--footer-border)", color: "inherit" };

  return (
    <div
      className="h-[82px] py-[30px] w-full flex items-center justify-center mt-auto"
      style={{ background: "var(--footer-bg)" }}
    >
      <div className="max-w-[345px] sm:max-w-[690px] lg:max-w-[1035px] w-full px-4">
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[5px] sm:gap-[12px] text-[11.6px] font-[400]"
          style={{ color: "var(--footer-text)" }}
        >
          <div className="flex items-center gap-[10px] flex-wrap">
            <a
              href="https://www.apple.com/support/systemstatus/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={linkStyle}
            >
              System Status
            </a>
            <a
              href="https://www.apple.com/legal/privacy/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={linkStyle}
            >
              Privacy Policy
            </a>
            <a
              href="https://www.apple.com/legal/internet-services/icloud/"
              target="_blank"
              rel="noopener noreferrer"
              className="tracking-[0.028em] hover:underline"
              style={{ color: "inherit" }}
            >
              Terms & Conditions
            </a>
          </div>
          <div>
            <p className="tracking-[0.034em]">
              Copyright &#169; {new Date().getFullYear()} Apple Inc. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
