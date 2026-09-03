import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout({ children }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--page-bg)" }}
    >
      <Navbar />
      <main className="flex-grow w-full">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
