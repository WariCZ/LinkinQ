import React, { useRef } from "react";
import { Button, Modal } from "flowbite-react";
import { useModalStore } from "./modalStore";
import Draggable from "react-draggable";
import { useTranslation } from "react-i18next";

export type ModalPropsType = {
  closeModal?: () => void;
  formRef?: React.LegacyRef<HTMLFormElement> | undefined;
};

const ModalContainer = () => {
  const { modals, closeModal } = useModalStore();
  const formRef: React.LegacyRef<HTMLFormElement> | undefined = useRef(null);
  const { t, i18n } = useTranslation();

  return (
    <>
      {modals.map((content: any, index: number) => {
        console.log("formRef", formRef);
        let ComponentWithProps;
        if (typeof content.content === "function") {
          ComponentWithProps = content.content({ formRef, closeModal });
        } else {
          ComponentWithProps = React.cloneElement(content.content, {
            formRef,
            closeModal,
          });
        }

        return (
          <Draggable handle=".draggable-handle" key={index}>
            <Modal
              key={index}
              show={true}
              size="lg"
              onClose={closeModal}
              className={`fixed inset-0 flex items-center justify-center z-50`}
              style={{
                top: `${index * 20}px`, // Posun nahoru o 20px pro každé nové okno
                left: `${index * 20}px`, // Posun do strany o 20px pro každé nové okno
              }}
            >
              <Modal.Header className="draggable-handle cursor-move">
                <h3 className="text-sm font-semibold">Modální Okno</h3>
              </Modal.Header>
              <Modal.Body>
                {/* <ModalContent.content formRef={formRef} /> */}
                {ComponentWithProps}
              </Modal.Body>
              <Modal.Footer>
                <Button onClick={closeModal} color="light">
                  {t("modal.close")}
                </Button>
                <Button
                  onClick={() => {
                    if (formRef.current)
                      formRef.current.dispatchEvent(
                        new Event("submit", {
                          cancelable: true,
                          bubbles: true,
                        })
                      );
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
