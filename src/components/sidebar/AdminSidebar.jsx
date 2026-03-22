import { BsMusicNoteList } from "react-icons/bs";
import {
  FiDisc,
  FiGrid,
  FiShield,
  FiTag,
  FiTrash2,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";

export default function AdminSidebar({ collapsed = false, tone = "admin" }) {
  return (
    <div className="space-y-4">
      <SidebarSection title="Tổng quan" collapsed={collapsed} tone={tone}>
        <SidebarItem
          to="/admin/dashboard"
          icon={FiGrid}
          label="Dashboard"
          collapsed={collapsed}
          tone={tone}
        />
      </SidebarSection>

      <SidebarSection title="Nội dung" collapsed={collapsed} tone={tone}>
        <SidebarItem
          to="/admin/songs"
          icon={BsMusicNoteList}
          label="Quản lý bài hát"
          end
          collapsed={collapsed}
          tone={tone}
        />
        <SidebarItem
          to="/admin/songs/review"
          icon={BsMusicNoteList}
          label="Duyệt bài hát"
          collapsed={collapsed}
          tone={tone}
        />
        <SidebarItem
          to="/admin/albums"
          icon={FiDisc}
          label="Quản lý album"
          collapsed={collapsed}
          tone={tone}
        />
        <SidebarItem
          to="/admin/genres"
          icon={FiTag}
          label="Thể loại"
          collapsed={collapsed}
          tone={tone}
        />
      </SidebarSection>

      <SidebarSection title="Người dùng" collapsed={collapsed} tone={tone}>
        <SidebarItem
          to="/admin/users"
          icon={FiUsers}
          label="Người dùng"
          collapsed={collapsed}
          tone={tone}
        />
        <SidebarItem
          to="/admin/artists"
          icon={FiUser}
          label="Nghệ sĩ"
          collapsed={collapsed}
          tone={tone}
        />
        <SidebarItem
          to="/admin/artist-requests"
          icon={FiShield}
          label="Duyệt yêu cầu nghệ sĩ"
          collapsed={collapsed}
          tone={tone}
        />
        <SidebarItem
          to="/admin/trash"
          icon={FiTrash2}
          label="Thùng rác"
          collapsed={collapsed}
          tone={tone}
        />
      </SidebarSection>
    </div>
  );
}
