import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useStore from "../../../store";

const EntitaPage = () => {
  const { entita, guid } = useParams();
  const navigate = useNavigate();
  useStore();

  useEffect(() => {
    // Zde ověř, zda entita existuje
    // const exists = checkEntitaExists(entita); // Nahraď vlastním ověřením
    const exists = true;
    if (!exists) {
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
