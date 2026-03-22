import { FiDisc, FiGrid, FiMusic, FiTrash2, FiUser } from "react-icons/fi";

import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";

export default function ArtistSidebar({ collapsed = false, tone = "artist" }) {
  return (
    <div className="space-y-4">
      <SidebarSection title="Tổng quan" collapsed={collapsed} tone={tone}>
        <SidebarItem
          to="/artist/dashboard"
          icon={FiGrid}
          label="Dashboard"
          collapsed={collapsed}
          tone={tone}
        />
      </SidebarSection>

      <SidebarSection title="Nội dung" collapsed={collapsed} tone={tone}>
        <SidebarItem
          to="/artist/albums"
          icon={FiDisc}
          label="Album"
          collapsed={collapsed}
          tone={tone}
        />
        <SidebarItem
          to="/artist/songs"
          icon={FiMusic}
          label="Bài hát"
          collapsed={collapsed}
          tone={tone}
        />
      </SidebarSection>

      <SidebarSection title="Tài khoản" collapsed={collapsed} tone={tone}>
        <SidebarItem
          to="/artist/profile"
          icon={FiUser}
          label="Hồ sơ nghệ sĩ"
          collapsed={collapsed}
          tone={tone}
        />
        <SidebarItem
          to="/artist/trash"
          icon={FiTrash2}
          label="Thùng rác"
          collapsed={collapsed}
          tone={tone}
        />
      </SidebarSection>
    </div>
  );
}
