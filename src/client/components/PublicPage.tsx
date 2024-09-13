import { Spinner } from "flowbite-react";
import React from "react";

const PublicPage: React.FC = () => (
  <div>
    <h1>Public Page</h1>
    <p>This page is accessible by anyone.</p>
    <Spinner aria-label="Default status example" />
  </div>
);

export default PublicPage;
