import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useStore from "../../store";

const EntitaPage = () => {
  const { entita } = useParams();
  const navigate = useNavigate();
  const schema = useStore((state) => state.schema);
  debugger;
  useEffect(() => {
    if (!schema[entita]) {
      navigate("/", { replace: true });
    }
  }, [entita, navigate]);

  return <div>Entita: {entita}</div>;
};

export default EntitaPage;
