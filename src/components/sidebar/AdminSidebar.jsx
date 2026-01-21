import { FiDisc, FiGrid, FiSearch, FiTag, FiUsers } from "react-icons/fi";
import { BsMusicNoteList } from "react-icons/bs";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";

export default function AdminSidebar() {
  return (
    <SidebarSection title="Quản trị">
      <SidebarItem to="/admin/dashboard" icon={FiGrid} label="Tổng quan" />
      <SidebarItem to="/admin/users" icon={FiUsers} label="Người dùng" />
      <SidebarItem
        to="/admin/songs"
        icon={BsMusicNoteList}
        label="Quản lý bài hát"
      />
      <SidebarItem
        to="/admin/songs/review"
        icon={BsMusicNoteList}
        label="Duyệt bài hát"
      />
      <SidebarItem to="/admin/albums" icon={FiDisc} label="Quản lý album" />
      <SidebarItem to="/admin/genres" icon={FiTag} label="Thể loại" />
      <SidebarItem to="/admin/search" icon={FiSearch} label="Tìm kiếm" />
    </SidebarSection>
  );

}