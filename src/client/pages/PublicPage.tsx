import { Button, Spinner } from "flowbite-react";
import React from "react";
import { Link } from "react-router-dom";
import WordTagInput from "../components/WordTagInput";

const PublicPage: React.FC = () => {
  console.log("PublicPage");
  return (
    <div>
      <h1>Public Page</h1>
      <p>This page is accessible by anyone.</p>
      <Spinner aria-label="Default status example" />
      <WordTagInput />
      <Button>
        <Link to="/public">Dvojka home</Link>
      </Button>
    </div>
  );
};

export default PublicPage;