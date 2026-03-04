import {
  FiBarChart2,
  FiDisc,
  FiGrid,
  FiShield,
  FiTag,
  FiTrash2,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { BsMusicNoteList } from "react-icons/bs";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";

export default function AdminSidebar() {
  return (
    <div className="space-y-4">
      <SidebarSection title="Tổng quan">
        <SidebarItem to="/admin/dashboard" icon={FiGrid} label="Dashboard" />
        <SidebarItem to="/admin/analytics" icon={FiBarChart2} label="Thống kê" />
        <SidebarItem to="/admin/search" icon={FiShield} label="Global Search" />
      </SidebarSection>

      <SidebarSection title="Nội dung">
        <SidebarItem to="/admin/songs" icon={BsMusicNoteList} label="Quản lý bài hát" end />
        <SidebarItem to="/admin/songs/review" icon={BsMusicNoteList} label="Duyệt bài hát" />
        <SidebarItem to="/admin/albums" icon={FiDisc} label="Quản lý album" />
        <SidebarItem to="/admin/genres" icon={FiTag} label="Thể loại" />
      </SidebarSection>

      <SidebarSection title="Người dùng">
        <SidebarItem to="/admin/users" icon={FiUsers} label="Người dùng" />
        <SidebarItem to="/admin/artists" icon={FiUser} label="Nghệ sĩ" />
        <SidebarItem to="/admin/artist-requests" icon={FiShield} label="Duyệt yêu cầu nghệ sĩ" />
        <SidebarItem to="/admin/trash" icon={FiTrash2} label="Thùng rác" />
      </SidebarSection>
    </div>
  );
}
