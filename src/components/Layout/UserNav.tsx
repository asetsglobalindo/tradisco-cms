import {Avatar, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, {useState} from "react";
import Cookies from "js-cookie";
import useUserStore from "@/store/userStore";
import {Modal} from "../ui/modal";
import {Checkbox} from "../ui/checkbox";
import {useNavigate} from "react-router-dom";
const DEVELOPMENT_STATUS = `${import.meta.env.VITE_APP_STATUS}`;

const UserNav = () => {
  const userStore = useUserStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative w-8 h-8 rounded-full">
            <Avatar className="w-8 h-8">
              <AvatarImage
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFYoPFYMpFpua5QA4XDZNWezBifJ-LHTvT1b51G_2MJg&s"
                alt="profile"
              />
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userStore.user.name}</p>
              <p className="pt-1 text-xs leading-none text-muted-foreground">{userStore.user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => navigate("/dashboard/account")} className="cursor-pointer">
              Settings
            </DropdownMenuItem>
            {DEVELOPMENT_STATUS === "development" ? (
              <DropdownMenuItem className="cursor-pointer">
                <div className="flex items-center gap-2 p-2 cursor-pointer">
                  <Checkbox
                    id="development-mode"
                    checked={userStore.development}
                    onCheckedChange={(check: boolean) => {
                      userStore.setDevelopment(check);
                    }}
                  />
                  <label
                    htmlFor="development-mode"
                    className="text-sm font-medium leading-none cursor-pointer select-nonepeer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Development Mode
                  </label>
                </div>
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)} className="font-bold text-red-500 cursor-pointer">
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* modal logout */}
      <Modal
        isOpen={open}
        onClose={() => setOpen((prev) => !prev)}
        title="Logout confirmation"
        description="Logging out will end your current session and you will need to sign in again to access your account. Are you sure you want to proceed?"
      >
        <div className="flex items-center justify-end w-full pt-6 space-x-2">
          <Button variant="outline" onClick={() => setOpen((prev) => !prev)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              Cookies.remove("token");
              window.location.reload();
              setOpen(false);
            }}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </React.Fragment>
  );
};

export default UserNav;

