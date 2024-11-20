import { Toast } from "flowbite-react";
import useStore from "../store";
import { FaExclamationTriangle, FaInfo } from "react-icons/fa";
import { useEffect, useState } from "react";

export type AppToastType = { msg: string; type: "info" | "error" };
const AppToast = () => {
  const toasts = useStore((state) => state.toasts);
  const removeToast = useStore((state) => state.removeToast);

  const [visibleToasts, setVisibleToasts] = useState(toasts.map(() => true));

  useEffect(() => {
    setVisibleToasts(toasts.map(() => true));
  }, [toasts]);

  const handleDismiss = (index: number) => {
    setVisibleToasts((prev) =>
      prev.map((visible, i) => (i === index ? false : visible))
    );

    setTimeout(() => removeToast(index), 200);
  };

  return (
    <div className="fixed right-0 bottom-0 m-2">
      <div className="gap-2 flex flex-wrap w-80">
        {toasts.map((t, i) => (
          <Toast
            key={i}
            className={`transition-opacity duration-500 ${
              visibleToasts[i] ? "opacity-100" : "opacity-0"
            }`}
          >
            {t.type == "error" ? (
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
                <FaExclamationTriangle className="h-5 w-5" />
              </div>
            ) : null}
            {t.type == "info" ? (
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
                <FaInfo className="h-5 w-5" />
              </div>
            ) : null}

            <div className="ml-3 text-sm font-normal">{t.msg}</div>
            <Toast.Toggle onDismiss={() => handleDismiss(i)} />
          </Toast>
        ))}
      </div>
    </div>
  );
};

export default AppToast;
