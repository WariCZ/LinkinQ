import React, { useRef } from "react";
import { Button, Modal } from "flowbite-react";
import { useModalStore } from "./modalStore";
import Draggable from "react-draggable";
import { useTranslation } from "react-i18next";

export type ModalPropsType = {
  modalOnSuccess?: (data?: any) => void;
  closeModal?: () => void;
  formRef?: React.LegacyRef<HTMLFormElement> | undefined;
  modalLabel?: string;
  modalSingle?: boolean;
};

const ModalContainer = () => {
  const { modals, closeModal } = useModalStore();
  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useTranslation();

  return (
    <>
      {modals.map((content: any, index) => {

        let ComponentWithProps;
        if (typeof content === "function") {
          ComponentWithProps = content({ formRef, closeModal });
        } else {
          ComponentWithProps = React.cloneElement(content, {
            formRef,
            closeModal,
          });
        }

        return (
          <Draggable handle=".draggable-handle" key={index}>
            <Modal
              key={index}
              show={true}
              size={content.options.size || "lg"}
              onClose={closeModal}
              className="fixed inset-0 flex items-center justify-center z-50"
              style={{
                top: `${index * 20}px`,
                left: `${index * 20}px`,
              }}
            >
              <Modal.Header className="draggable-handle cursor-move">
                {content.options?.title &&
                  <h3 className="text-sm font-semibold">
                    {content.options?.title}
                  </h3>
                }
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
                        new Event("submit", { cancelable: true, bubbles: true })
                      );
                    } else {
                      content.options?.modalOnSuccess && content.options.modalOnSuccess();
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
