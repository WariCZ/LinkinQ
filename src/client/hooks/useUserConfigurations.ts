import { httpRequest } from "../services/httpBase";
import useStore from "../store";

export function useUserConfigurations() {
  const user = useStore((state) => state.user);
  const userConfigurations = useStore((state) => state.userConfigurations);
  const setToast = useStore((state) => state.setToast);
  const setUserConfigurations = useStore(
    (state) => state.getUserConfigurations
  );

  const save = async (key: string, definition: Record<string, any>) => {
    if (!user) {
      console.error("No user ID");
      return;
    }

    const existingConfig = userConfigurations[key];

    try {
      if (existingConfig?.guid) {
        await httpRequest({
          method: "PUT",
          entity: "userConfigurations",
          data: {
            data: { definition },
            where: { guid: existingConfig.guid },
          },
        });
      } else {
        await httpRequest({
          method: "POST",
          entity: "userConfigurations",
          data: {
            key,
            definition,
            user: user.guid,
            kind: 1,
          },
        });
      }

      setToast({ type: "info", msg: "Settings saved" });
      await setUserConfigurations();
    } catch (error: any) {
      setToast({
        type: "error",
        msg: error.response?.statusText || error.message,
      });
    }
  };

  return {
    saveUserConfiguration: save,
  };
}
