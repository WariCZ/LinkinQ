import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useStore from "../../../store";

const EntitaPage = () => {
  const { entita, guid } = useParams();
  const navigate = useNavigate();
  const schema = useStore((state) => state.schema);
  const pageflow = useStore((state) => state.pageflow);
  const [DynamicComponent, setDynamicComponent] = useState(null);
  debugger;

  useEffect(() => {
    if (!schema[entita]) {
      navigate("/", { replace: true });
    }
  }, [entita, navigate]);

  return (
    <div>
      Detail Entita: {entita} guid: {guid}
    </div>
  );
};

export default EntitaPage;
