import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useStore from "../../store";
import { usePageflow } from "../../hooks/usePageflow";

const Page = () => {
  const { entity } = useParams();
  debugger;
  const { Component } = usePageflow({
    entity,
    onLoadList: true,
  });
  return <>{Component ? <Component entity={entity} /> : null}</>;
};

export default Page;
