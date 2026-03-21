import { FiDisc, FiGrid, FiMusic, FiTrash2, FiUser } from "react-icons/fi";

import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";

export default function ArtistSidebar({ collapsed = false }) {
  return (
    <div className="space-y-4">
      <SidebarSection title="Tổng quan" collapsed={collapsed}>
        <SidebarItem
          to="/artist/dashboard"
          icon={FiGrid}
          label="Dashboard"
          collapsed={collapsed}
        />
      </SidebarSection>

      <SidebarSection title="Nội dung" collapsed={collapsed}>
        <SidebarItem to="/artist/albums" icon={FiDisc} label="Album" collapsed={collapsed} />
        <SidebarItem to="/artist/songs" icon={FiMusic} label="Bài hát" collapsed={collapsed} />
      </SidebarSection>

      <SidebarSection title="Tài khoản" collapsed={collapsed}>
        <SidebarItem
          to="/me"
          icon={FiUser}
          label="Trang cá nhân"
          collapsed={collapsed}
        />
        <SidebarItem
          to="/artist/profile"
          icon={FiUser}
          label="Hồ sơ nghệ sĩ"
          collapsed={collapsed}
        />
        <SidebarItem
          to="/artist/trash"
          icon={FiTrash2}
          label="Thùng rác"
          collapsed={collapsed}
        />
      </SidebarSection>
    </div>
  );
}
