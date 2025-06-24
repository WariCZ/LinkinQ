import { useParams, useNavigate } from "react-router-dom";
import _ from "lodash";
import { usePageflow } from "../../../hooks/usePageflow";

const Page = () => {
  const { entity, guid } = useParams();
  const { Component } = usePageflow({
    entity,
    guid,
    onLoad: true,
  });
  return <>{Component ? <Component /> : null}</>;
};

export default Page;
