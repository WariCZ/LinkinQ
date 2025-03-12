import React, { useRef } from "react";
import { Button, Modal } from "flowbite-react";
import { useModalStore } from "./modalStore";
import Draggable from "react-draggable";
import { useTranslation } from "react-i18next";

const ModalContainer = () => {
  const { modals, closeModal } = useModalStore();
  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useTranslation();

  return (
    <>
      {modals.map(({ content, options }, index) => {
        let ComponentWithProps:
          | string
          | number
          | boolean
          | React.ReactElement<any, string | React.JSXElementConstructor<any>>
          | Iterable<React.ReactNode>;

        if (typeof content === "function") {
          ComponentWithProps = content({ formRef, closeModal });
        } else if (React.isValidElement(content)) {
          const validProps = { ...(content.props || {}), formRef, closeModal };
          ComponentWithProps = React.cloneElement(content, validProps);
        } else {
          console.error("Invalid content type for modal:", content);
          return null;
        }
        return (
          <Draggable handle=".draggable-handle" key={index}>
            <Modal
              key={index}
              show={true}
              size={options?.size || "lg"}
              onClose={closeModal}
              className="fixed inset-0 flex items-center justify-center z-50"
              style={{ top: `${index * 20}px`, left: `${index * 20}px` }}
            >
              <Modal.Header className="draggable-handle cursor-move pt-2">
                {options?.title && (
                  <h3 className="text-sm font-semibold">{options.title}</h3>
                )}
              </Modal.Header>
              <Modal.Body className="max-h-[800px]">
                {ComponentWithProps}
              </Modal.Body>
              <Modal.Footer>
                <Button onClick={closeModal} color="light">
                  {t("modal.close")}
                </Button>
                <Button
                  onClick={() => {
                    if (formRef.current) {
                      formRef.current.dispatchEvent(
                        new Event("submit", {
                          cancelable: true,
                          bubbles: true,
                        })
                      );
                    } else {
                      options?.modalOnSuccess && options.modalOnSuccess();
                    }
                  }}
                >
                  {t("modal.save")}
                </Button>
              </Modal.Footer>
            </Modal>
          </Draggable>
        );
      })}
    </>
  );
};

export default ModalContainer;
