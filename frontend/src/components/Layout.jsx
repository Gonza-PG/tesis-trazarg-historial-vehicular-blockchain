import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-xs text-slate-500 flex items-center justify-between">
          <span>Historial 0km - Tesis 2026</span>
          <span className="font-mono">Polygon</span>
        </div>
      </footer>
    </div>
  );
}
