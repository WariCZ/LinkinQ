import { httpRequest } from "../services/httpBase";
import useStore from "../store";

export function useAppConfigurations() {
  const appConfigurations = useStore((state) => state.appConfigurations);
  const setToast = useStore((state) => state.setToast);
  const setAppConfigurations = useStore((state) => state.getAppConfigurations);

  const save = async (key: string, definition: Record<string, any>) => {
    const existingConfig = appConfigurations[key];

    try {
      if (existingConfig?.guid) {
        await httpRequest({
          method: "PUT",
          entity: "appConfigurations",
          data: {
            data: { definition: JSON.stringify(definition) },
            where: { guid: existingConfig.guid },
          },
        });
      } else {
        await httpRequest({
          method: "POST",
          entity: "appConfigurations",
          data: {
            key,
            definition: JSON.stringify(definition),
            kind: 2,
            // user: user.guid,
          },
        });
      }

      setToast({ type: "info", msg: "Settings saved" });
      await setAppConfigurations();
    } catch (error: any) {
      setToast({
        type: "error",
        msg: error.response?.statusText || error.message,
      });
    }
  };

  return {
    saveAppConfiguration: save,
  };
}
