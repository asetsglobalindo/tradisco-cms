import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Modal} from "@/components/ui/modal";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  ConfirmText?: string;
  CancleText?: string;
  title: string;
  description: string;
}

export const AlertModal: React.FC<AlertModalProps> = (props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      title={props.title}
      description={props.description}
      isOpen={props.isOpen}
      onClose={props.loading ? () => {} : props.onClose}
    >
      <div className="flex items-center justify-end w-full pt-6 space-x-2">
        <Button disabled={props.loading} variant="outline" onClick={props.onClose}>
          {props.CancleText || "Cancel"}
        </Button>
        <Button disabled={props.loading} variant="default" isLoading={props.loading} onClick={props.onConfirm}>
          {props.ConfirmText || "Confirm"}
        </Button>
      </div>
    </Modal>
  );
};

