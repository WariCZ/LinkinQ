import React from "react";
import useStore from "../store";

const ProtectedPage: React.FC = () => {
  const user = useStore((state) => state.user);

  return (
    <div>
      <h1>Protected Page</h1>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
      <p>Welcome, {user?.fullname}!</p>
    </div>
  );
};

export default ProtectedPage;
