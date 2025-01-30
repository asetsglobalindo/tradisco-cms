// hook
import {useForm} from "react-hook-form";
import {useMutation, useQuery} from "react-query";
import {useLocation, useNavigate} from "react-router-dom";

// component
import Breadcrumb from "@/components/Breadcrumb";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";

// utils
import settledHandler from "@/helper/settledHandler";
import ApiService from "@/lib/ApiService";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import UserServices from "@/services/user";
import ToastBody from "@/components/ToastBody";
import {toast} from "react-toastify";
import {Switch} from "@/components/ui/switch";
import InputPassword from "@/components/ui/inputPassword";

const title_page = "User";
const action_context = "Create";

const formSchema = z.object({
  name: z.string({required_error: "Field Required"}).min(1),
  email: z.string({required_error: "Field Required"}).email({message: "Enter a valid email address"}),
  password: z.string({required_error: "Field Required"}).min(1),
  phone_number: z.string({required_error: "Field Required"}).min(1),
  role_id: z.string({required_error: "Field Required"}),
  active_status: z.boolean(),
});

type DataFormValue = z.infer<typeof formSchema>;
type Payload = Omit<DataFormValue, "type">;

const UsersCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prevLocation = location.pathname.split("/").slice(0, 3).join("/");
  const breadcrumbItems = [
    {title: title_page, link: prevLocation},
    {title: title_page + " " + action_context, link: location.pathname},
  ];

  const form = useForm<DataFormValue>({
    resolver: zodResolver(formSchema),
  });

  const {data: roles, isLoading: isLoadingRoles} = useQuery({
    queryKey: ["role"],
    queryFn: async () => await getRole(),
  });
  const {mutate, isLoading} = useMutation({
    mutationFn: async (payload: Payload) => ApiService.secure().post("/user", {...payload, user_level: "admin"}),
    onSettled: async (response) =>
      settledHandler({
        response,
        contextAction: action_context,
        onFinish: () => {
          navigate(prevLocation);
        },
      }),
  });

  const getRole = async () => {
    try {
      const response = await UserServices.getRole({page: 1, limit: 10});

      if (response.data.status !== 200) {
        throw new Error(response.data.err);
      }

      return response.data.data;
    } catch (error: any) {
      toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
    }
  };
  const onSubmit = (data: DataFormValue) => {
    mutate(data);
  };

  return (
    <section>
      <Breadcrumb items={breadcrumbItems} />
      <section className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">
          {action_context} {title_page}
        </h1>
        <Button onClick={() => navigate(prevLocation)}>Back to {title_page}</Button>
      </section>
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-full mt-5 space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({field}) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="Name" placeholder="Enter your name" disabled={isLoading} {...field} />
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
                  <Input type="text" placeholder="Enter your email" disabled={isLoading} className="pr-14" {...field} />
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
                  <Input
                    type="text"
                    placeholder="Enter your phone number"
                    disabled={isLoading}
                    className="pr-14"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role_id"
            render={({field}) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    disabled={isLoadingRoles}
                  >
                    <SelectTrigger value={field.value}>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles?.map((role) => (
                        <SelectItem key={role._id} value={role._id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            rules={{required: false}}
            render={({field}) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <InputPassword field={field} isLoading={isLoading} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="active_status"
            defaultValue={false}
            render={({field}) => (
              <FormItem>
                <div className="flex flex-row items-center gap-2 mt-4">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel>Active Status</FormLabel>
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="flex justify-center">
            <div className="flex gap-4 mt-5 mb-10">
              <Button className="w-[100px]" type="button" variant={"outline"} onClick={() => navigate(prevLocation)}>
                Back
              </Button>
              <Button className="w-[100px]" size={"sm"} isLoading={isLoading}>
                Submit
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default UsersCreate;
