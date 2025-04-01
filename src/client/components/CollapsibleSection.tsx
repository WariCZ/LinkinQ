import { Accordion } from "flowbite-react";
import { IconType } from "react-icons";
interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: IconType;
}

export const CollapsibleSection = ({
  title,
  children,
  className,
  icon: Icon,
}: CollapsibleSectionProps) => {
  return (
    <Accordion className={`border-b border-gray-30 ${className}`}>
      <Accordion.Panel>
        <Accordion.Title className="text-md font-semibold text-gray-800 flex items-center gap-2 p-2 bg-gray-100">
          <div className="flex gap-2 items-center">
            {Icon && <Icon size={16} className="text-gray-600" />}
            {title}
          </div>
        </Accordion.Title>
        <Accordion.Content>
          <div className="p-2">{children}</div>
        </Accordion.Content>
      </Accordion.Panel>
    </Accordion>
  );
};
