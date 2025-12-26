import Header from "../components/header/Header";
import PlayerBar from "../components/player/PlayerBar";
import Sidebar from "../components/sidebar/Sidebar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="flex h-screen flex-col bg-[#0b0b15] text-white">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="scrollbar-muted relative flex-1 overflow-y-auto bg-gradient-to-br from-[#0f172a] via-[#0b1020] to-[#0a1628] px-6 py-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(56,189,248,0.08),transparent_45%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(167,139,250,0.08),transparent_45%)]" />
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>

      <PlayerBar />
    </div>
  );
}