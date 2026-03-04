import { FiDisc, FiGrid, FiMusic, FiTrash2, FiUser } from "react-icons/fi";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";

export default function ArtistSidebar() {
  return (
    <div className="space-y-4">
      <SidebarSection title="Tổng quan">
        <SidebarItem to="/artist/dashboard" icon={FiGrid} label="Dashboard" />
      </SidebarSection>

      <SidebarSection title="Nội dung">
        <SidebarItem to="/artist/albums" icon={FiDisc} label="Album" />
        <SidebarItem to="/artist/songs" icon={FiMusic} label="Bài hát" />
      </SidebarSection>

      <SidebarSection title="Tài khoản">
        <SidebarItem to="/artist/profile" icon={FiUser} label="Hồ sơ nghệ sĩ" />
        <SidebarItem to="/artist/trash" icon={FiTrash2} label="Thùng rác" />
      </SidebarSection>
    </div>
  );
}
