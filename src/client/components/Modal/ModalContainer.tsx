import React, { useRef } from "react";
import { Button, Modal } from "flowbite-react";
import { useModalStore } from "./modalStore";
import Draggable from "react-draggable";

export type ModalContentType = {
  content: any;
};
const ModalContainer = () => {
  const { modals, closeModal } = useModalStore();
  const formRef: any = useRef();

  return (
    <>
      {modals.map((ModalContent: any, index: number) => {
        return (
          <Draggable handle=".draggable-handle" key={index}>
            <Modal
              key={index}
              show={true}
              size="lg"
              onClose={closeModal}
              className={`xxx fixed inset-0 flex items-center justify-center z-50`}
              style={{
                top: `${index * 20}px`, // Posun nahoru o 20px pro každé nové okno
                left: `${index * 20}px`, // Posun do strany o 20px pro každé nové okno
              }}
            >
              <Modal.Header className="draggable-handle cursor-move">
                <h3 className="text-sm font-semibold">Modální Okno</h3>
              </Modal.Header>
              <Modal.Body>
                <ModalContent.content ref={formRef} />
              </Modal.Body>
              <Modal.Footer>
                <Button onClick={closeModal} color="light">
                  Zavřít
                </Button>
                <Button
                  onClick={() => {
                    if (formRef.current) {
                      formRef.current.handleSubmit();
                    }
                  }}
                >
                  Save
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
