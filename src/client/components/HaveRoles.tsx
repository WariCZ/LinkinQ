import React, { ReactNode } from "react";
import useStore from "../store";

type HaveRoleProps = {
  roles: string[]; // požadované role
  children: ReactNode; // co zobrazit, když role sedí
  fallback?: ReactNode; // volitelné – co zobrazit, když nesedí
};

export const HaveRole: React.FC<HaveRoleProps> = ({
  roles,
  children,
  fallback = null,
}) => {
  const user = useStore((state) => state.user);

  if (user) {
    const hasAccess = roles.some((role) => user.roles?.includes(role));

    return hasAccess ? <>{children}</> : <>{fallback}</>;
  } else {
    return <>{fallback}</>;
  }
};
