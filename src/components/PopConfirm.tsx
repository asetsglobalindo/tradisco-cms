import {Popover, PopoverContent, PopoverTrigger} from "./ui/popover";
import {Button} from "./ui/button";
import {AlertCircle} from "lucide-react";
import {useState} from "react";

const PopConfirm: React.FC<{children: React.ReactNode; disabled?: boolean; onOk: () => void; alertMsg?: string}> = ({
  children,
  onOk,
  alertMsg = "Are you sure you want to continue the process?",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    if (disabled) {
      return;
    }
    setOpen((prev) => !prev);
  };

  return (
    <Popover open={open}>
      <PopoverTrigger>
        <div onClick={toggleOpen} className="flex gap-2">
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent sideOffset={10} className="relative">
        <div className="flex items-center space-x-3">
          <AlertCircle size={18} />
          <p>{alertMsg}</p>
        </div>

        {/* <Separator className="my-4" /> */}
        <div className="flex justify-end mt-4 space-x-2">
          <Button
            className="px-4 py-[6px] text-xs h-fit"
            onClick={toggleOpen}
            type="button"
            size={"sm"}
            variant={"outline"}
          >
            No
          </Button>
          <Button
            onClick={() => {
              onOk();
              toggleOpen();
            }}
            className="px-4 py-[6px] text-xs h-fit"
            type="button"
            size={"sm"}
          >
            Yes
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PopConfirm;

