import React, { createContext, useContext, useState, useCallback } from 'react';

interface ModalContextType {
  isVisible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showModal: (options: ModalOptions) => void;
  hideModal: () => void;
}

interface ModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [title, setTitle] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [confirmText, setConfirmText] = useState<string>();
  const [cancelText, setCancelText] = useState<string>();
  const [onConfirm, setOnConfirm] = useState<(() => void) | undefined>();
  const [onCancel, setOnCancel] = useState<(() => void) | undefined>();

  const showModal = useCallback((options: ModalOptions) => {
    setTitle(options.title);
    setMessage(options.message);
    setConfirmText(options.confirmText || 'OK');
    setCancelText(options.cancelText);
    setOnConfirm(() => options.onConfirm);
    setOnCancel(() => options.onCancel);
    setIsVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <ModalContext.Provider
      value={{
        isVisible,
        title,
        message,
        confirmText,
        cancelText,
        onConfirm,
        onCancel,
        showModal,
        hideModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};
