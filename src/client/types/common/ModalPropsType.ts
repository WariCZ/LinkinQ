export type ModalPropsType = {
  modalOnSuccess?: (data?: any) => void;
  closeModal?: () => void;
  formRef?: React.LegacyRef<HTMLFormElement> | undefined;
  modalLabel?: string;
  modalSingle?: boolean;
};
