import { Button, Spinner } from "flowbite-react";
import React from "react";
import { Link } from "react-router-dom";

const PublicPage2: React.FC = () => {
  console.log("PublicPage 2");
  return (
    <div>
      <h1>Public Page 2</h1>
      <Button>
        <Link to="/">Home</Link>
      </Button>
    </div>
  );
};

export default PublicPage2;
