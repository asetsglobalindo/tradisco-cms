// hook
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {useMutation} from "react-query";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";

// component
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import Breadcrumb from "@/components/Breadcrumb";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import InputPassword from "@/components/ui/inputPassword";
import {Separator} from "@/components/ui/separator";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

// utils
import settledHandler from "@/helper/settledHandler";
import ApiService from "@/lib/ApiService";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Permissions} from "@/types";
import UserServices from "@/services/user";
import useUserStore from "@/store/userStore";
import ToastBody from "@/components/ToastBody";
import {toast} from "react-toastify";

const title_page = "Account Setting";

const formSchema = z.object({
  name: z.string({required_error: "Please Input role name"}).min(1),
  phone_number: z.string({required_error: "Please Input phone number"}).min(1),
  email: z.string({required_error: "Please Input your email"}).email({message: "Enter a valid email address"}),
});
const formSchemaPassword = z
  .object({
    current_password: z.string({required_error: "Please Input current password"}).min(1),
    password: z.string({required_error: "Please Input new password"}).min(1),
    confirm_password: z.string({required_error: "Please Input new confirm password"}),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type AccountDetailType = z.infer<typeof formSchema>;
type AccountPasswordType = z.infer<typeof formSchemaPassword> & {
  user_id: string;
};

const AccountSetting: React.FC<{permissions: Permissions}> = ({permissions}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const prevLocation = location.pathname.split("/").slice(0, 3).join("/");
  const breadcrumbItems = [{title: title_page, link: prevLocation}];
  const [defaultTabValue, setDefaultTabValue] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const userStore = useUserStore((prev) => prev.user);

  const form = useForm<AccountDetailType>({
    resolver: zodResolver(formSchema),
  });
  const formPassword = useForm<AccountPasswordType>({
    resolver: zodResolver(formSchemaPassword),
  });

  const {mutate, isLoading} = useMutation(
    async (payload: AccountDetailType) => await ApiService.secure().post("role", payload),
    {
      onSettled: (response) =>
        settledHandler({response, contextAction: "Update", onFinish: () => navigate(prevLocation)}),
    }
  );
  const {mutate: mutatePassword, isLoading: isLoadingPassword} = useMutation(
    async (payload: AccountPasswordType) => await ApiService.secure().post("/user/change-password", payload),
    {
      onSettled: (response) =>
        settledHandler({response, contextAction: "Update", onFinish: () => navigate(prevLocation)}),
    }
  );

  const onSubmit = (data: AccountDetailType) => {
    mutate(data);
  };
  const onSubmitChangePassword = (data: AccountPasswordType) => {
    mutatePassword({...data, user_id: userStore._id || ""});
  };

  useEffect(() => {
    const getDetails = async () => {
      try {
        const response = await UserServices.getDetails({id: userStore._id || ""});

        if (response.data.status !== 200) {
          throw new Error(response.data.message);
        }

        const user = response.data.data;
        form.reset({
          name: user.name,
          email: user.email,
          phone_number: user.phone_number,
        });
      } catch (error: any) {
        toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
      }
    };

    getDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchParams.get("tab")) {
      setDefaultTabValue(searchParams.get("tab") || "");
    } else {
      setDefaultTabValue("account");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!defaultTabValue) {
    return null;
  }

  return (
    <section>
      <Breadcrumb items={breadcrumbItems} />
      <section className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">{title_page}</h1>
      </section>
      <Separator />
      <Tabs
        defaultValue={defaultTabValue}
        className="w-full mt-5"
        onValueChange={(event) => {
          setSearchParams({tab: event});
        }}
      >
        <TabsList>
          <TabsTrigger value="account">Details</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mt-5 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter name" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>E-Mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_number"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter phone number" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="flex justify-center">
                <div className="flex gap-4 mt-5 mb-10">
                  <Button
                    className="w-[100px]"
                    type="button"
                    variant={"outline"}
                    onClick={() => navigate(prevLocation)}
                  >
                    Back
                  </Button>
                  <Button disabled={!permissions.update} className="w-[100px]" size={"sm"} isLoading={isLoading}>
                    Submit
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="password">
          <Form {...formPassword}>
            <form onSubmit={formPassword.handleSubmit(onSubmitChangePassword)} className="w-full mt-5 space-y-4">
              <FormField
                control={formPassword.control}
                name="current_password"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <InputPassword field={field} placeholder="Input password" isLoading={isLoadingPassword} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={formPassword.control}
                name="password"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <InputPassword field={field} placeholder="Input password" isLoading={isLoadingPassword} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={formPassword.control}
                name="confirm_password"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <InputPassword field={field} placeholder="Input password" isLoading={isLoadingPassword} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="flex justify-center">
                <div className="flex gap-4 mt-5 mb-10">
                  <Button
                    disabled={!permissions.update}
                    className="w-[100px]"
                    type="button"
                    variant={"outline"}
                    onClick={() => navigate(prevLocation)}
                  >
                    Back
                  </Button>
                  <Button className="w-[100px]" size={"sm"} isLoading={isLoadingPassword}>
                    Submit
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default AccountSetting;
