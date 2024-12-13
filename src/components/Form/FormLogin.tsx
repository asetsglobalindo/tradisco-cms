// hook
import {useState} from "react";
import {useForm} from "react-hook-form";
import {useMutation} from "react-query";
import {useNavigate} from "react-router-dom";
import useUserStore from "@/store/userStore";

// component
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Eye, EyeOff} from "lucide-react";

// utils
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import UserServices from "@/services/user";
import PageServices from "@/services/page";
import {UserPermissionType, UserType} from "@/types/user";
import {jwtDecode} from "jwt-decode";
import {PageMenuItemType} from "@/types/page";
import settledHandler from "@/helper/settledHandler";
import {TODO} from "@/types";
import Cookies from "js-cookie";

const formSchema = z.object({
  email: z.string({required_error: "Please Input your email"}).email({message: "Enter a valid email address"}),
  password: z.string({required_error: "Please Input your password"}).min(1, {message: "Enter your password"}),
}); 

type UserFormValue = z.infer<typeof formSchema>;

const FormLogin = () => {
  const userStore = useUserStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
  });

  const {isLoading, mutate: login} = useMutation(
    async (data: {email: string; password: string}) => await UserServices.login(data),
    {
      onSettled: (response: TODO) =>
        settledHandler({
          response,
          success: {
            title: "Welcomeback!",
            description: " ",
          },
          onFinish: () => {
            const {token, user} = response.data.data;
            const decodedToken = jwtDecode(token);
            const exp = decodedToken.exp as any;
            Cookies.set("token", token, exp);

            // set user to store
            if (user.role_id.permissions) {
              permissionHandler(user, user.role_id.permissions);
            } else {
              userStore.resetUser();
              Cookies.remove("token");
              navigate("/login");
              throw new Error("Your account doesn't have any permission.");
            }
          },
        }),
    }
  );

  const permissionHandler = async (user: UserType, permission: UserPermissionType[]) => {
    const response = await PageServices.getMenu();
    if (response.data.status !== 200) {
      throw new Error("An error has occured!");
    }

    const menu = response.data.data;
    const user_permissions = permission;

    // user dont have any permissions
    if (!user_permissions.length) {
      userStore.resetUser();
      localStorage.removeItem("token");
      return;
    }

    // user has permissions
    let user_route_permissions: string[] = [];
    let user_allowed_menu: PageMenuItemType[] = [];

    // find and store route with actions view true
    user_permissions.map((data) => {
      if (data.actions.view) {
        const result = data?.page_id?.route;
        user_route_permissions.push(result);
      }
    });

    // create new menu that related to user permissions
    for (let index = 0; index < menu.length; index++) {
      user_allowed_menu.push({label: menu[index].label, items: []});
      menu[index].items.map((item) => {
        const isExist = user_route_permissions.includes(item.to);
        return isExist && user_allowed_menu[index].items.push(item);
      });
    }

    // remove empty group menu
    const final_user_allowed_menu: PageMenuItemType[] = [];
    user_allowed_menu.map((data: any) => data.items.length && final_user_allowed_menu.push(data));

    // save user data in store and re derect
    userStore.setRouteMenu(final_user_allowed_menu);
    userStore.setRoutePermissions(permission);
    userStore.setUser(user);

    navigate("/dashboard");
  };

  const onSubmit = async (data: UserFormValue) => {
    login(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-2">
        <FormField
          control={form.control}
          name="email"
          render={({field}) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({field}) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <section className="relative flex items-center">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your Password"
                    disabled={isLoading}
                    className="pr-14"
                    {...field}
                  />

                  <button type="button" className="absolute right-4" onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </section>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button disabled={isLoading} isLoading={isLoading} className="flex items-center w-full" type="submit">
            Sign in
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FormLogin;

