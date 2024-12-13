import ToastBody from "@/components/ToastBody";
import {TODO} from "@/types";
import {toast} from "react-toastify";

interface Param {
  response: TODO;
  contextAction?: "Create" | "Update" | "Delete";
  success?: {
    title: string;
    description: string;
  };
  onFinish?: () => void;
  onFailed?: () => void;
}

const settledHandler = async ({response, success, contextAction, onFinish, onFailed}: Param) => {
  try {
    if (response.data.status !== 200) {
      throw new Error(response.data.err);
    }

    if (onFinish) {
      onFinish();
    }

    let description =
      success?.description || `Your data has been ${contextAction?.toLocaleLowerCase() + "d" || "created/updated"}`;
    toast.success(<ToastBody title={success?.title || "Action completed"} description={description} />);
  } catch (error: any) {
    toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
    if (onFailed) {
      onFailed();
    }
  }
};

export default settledHandler;

