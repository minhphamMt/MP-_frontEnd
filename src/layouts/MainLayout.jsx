import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";
import PlayerBar from "../components/player/PlayerBar";

export default function MainLayout() {
  return (
    <div className="h-screen flex flex-col bg-[#170f23] text-white">
      {/* Header */}
      <Header />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-4">
          <Outlet />
        </main>
      </div>

      {/* Player */}
      <PlayerBar />
    </div>
  );
}
