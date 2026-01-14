import { FiDisc, FiGrid, FiMusic, FiPlusCircle } from "react-icons/fi";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";

export default function ArtistSidebar() {
  return (
    <SidebarSection title="Nghệ sĩ">
      <SidebarItem to="/artist/dashboard" icon={FiGrid} label="Tổng quan" />
      <SidebarItem to="/artist/albums" icon={FiDisc} label="Album" />
      <SidebarItem
        to="/artist/albums/new"
        icon={FiPlusCircle}
        label="Tạo album"
      />
      <SidebarItem to="/artist/songs" icon={FiMusic} label="Bài hát" />
    </SidebarSection>
  );
}