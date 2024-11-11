import React from "react";
import useStore from "../store";
import _ from "lodash";

interface ProtectedProps {
  requiredRoles: string[];
  children: React.ReactNode;
}

const Protected: React.FC<ProtectedProps> = ({ requiredRoles, children }) => {
  const user = useStore((state) => state.user);

  if (_.intersection(requiredRoles, user?.roles).length > 0) {
    return <>{children}</>;
  }
  return null;
};

export default Protected;
