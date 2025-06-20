import * as LucideIcons from "lucide-react";
import { RefAttributes } from "react";

type IconProps = Omit<LucideIcons.LucideProps, "ref"> &
  RefAttributes<SVGSVGElement>;

function withDefaults(Icon: React.FC<IconProps>) {
  return (props: IconProps) => <Icon size={props.size ?? 15} {...props} />;
}

export const IconTasks = withDefaults(LucideIcons.LayoutList);
export const IconExport = withDefaults(LucideIcons.ArrowRightFromLine);
export const IconPlus = withDefaults(LucideIcons.Plus);
export const IconPaperclip = withDefaults(LucideIcons.Paperclip);
export const IconShare = withDefaults(LucideIcons.Share);
export const IconTrash = withDefaults(LucideIcons.Trash);
export const IconCopy = withDefaults(LucideIcons.Copy);
export const IconTag = withDefaults(LucideIcons.Tag);
export const IconChevronDown = withDefaults(LucideIcons.ChevronDown);
export const IconChevronRight = withDefaults(LucideIcons.ChevronRight);
export const IconMenu = withDefaults(LucideIcons.Menu);
