// hook
import {Controller, FormProvider, useFieldArray, useForm} from "react-hook-form";
import {useMutation} from "react-query";
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
import {toast} from "react-toastify";
import ToastBody from "@/components/ToastBody";
import {useEffect} from "react";
import {Textarea} from "@/components/ui/textarea";
import PopConfirm from "@/components/PopConfirm";
import {Trash} from "lucide-react";
import InputNumber from "@/components/ui/InputNumber";
import {FooterType} from "@/types";

const title_page = "Footer Setting Page";

const formSchema = z.object({
  tagline: z.object({
    en: z.string({required_error: "Field required"}).min(1),
    id: z.string({required_error: "Field required"}).min(1),
  }),
  address: z.string({required_error: "Field required"}).min(0).default(""),
  mail: z.string({required_error: "Field required"}).min(0).default(""),
  url_mail: z.string({required_error: "Field required"}).min(0).default(""),
  copyright_link: z.string({required_error: "Field required"}).min(0).default(""), // will act for tlp link > coz no field for tel
  tel: z.string({required_error: "Field required"}).min(0).default(""),
  url_instagram: z.string({required_error: "Field required"}).min(0).default(""),
  url_facebook: z.string({required_error: "Field required"}).min(0).default(""),
  url_linkedin: z.string({required_error: "Field required"}).min(0).default(""),
  other_routes: z
    .object({
      title: z.object({
        en: z.string({required_error: "Field required"}).min(1),
        id: z.string({required_error: "Field required"}).min(1),
      }),
      route: z.string({required_error: "Field required"}).min(1).default(""),
      order: z.number().default(0),
    })
    .array()
    .default([]),
});
type DataFormValue = z.infer<typeof formSchema>;
type Payload = Omit<DataFormValue, "">;

const FooterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prevLocation = location.pathname.split("/").slice(0, 3).join("/");
  const breadcrumbItems = [{title: title_page, link: prevLocation}];

  const form = useForm<DataFormValue>({
    resolver: zodResolver(formSchema),
  });

  const {fields, remove, append} = useFieldArray({
    name: "other_routes",
    control: form.control,
  });

  const {mutate, isLoading} = useMutation(
    async (payload: Payload) => await ApiService.secure().post("/footer", {...payload}),
    {
      onSettled: (response) =>
        settledHandler({response, contextAction: "Update", onFinish: () => navigate(prevLocation)}),
    }
  );

  const onSubmit = async (data: DataFormValue) => {
    try {
      mutate({
        ...data,
      });

      // mutate();
    } catch (error) {
      toast.error(<ToastBody title="an error occurred" description={error as string} />);
    }
  };

  useEffect(() => {
    const getDetails = async () => {
      try {
        const response = await ApiService.get("/footer");
        const result: FooterType = response.data.data;

        if (response.data.status !== 200) {
          throw new Error(response.data.message);
        }
        form.reset({
          tagline: {
            en: result.tagline.en,
            id: result.tagline.id,
          },
          address: result.address,
          mail: result.mail,
          tel: result.tel,
          url_instagram: result.url_instagram,
          url_facebook: result.url_facebook,
          url_linkedin: result.url_linkedin,
          other_routes: result.other_routes,
          copyright_link: result.copyright_link,
          url_mail: result.url_mail,
        });
      } catch (error: any) {
        toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
      }
    };
    getDetails();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section>
      <Breadcrumb items={breadcrumbItems} />
      <section className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">{title_page}</h1>
        <Button onClick={() => navigate(prevLocation)}>Back to {title_page}</Button>
      </section>
      <Separator />

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-full mt-5 space-y-4">
          <Controller
            control={form.control}
            name="tagline.en"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Tagline (EN)
                </label>
                <Textarea
                  id={field.name}
                  ref={field.ref}
                  placeholder="Enter tagline"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="tagline.id"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Tagline (ID)
                </label>
                <Textarea
                  id={field.name}
                  ref={field.ref}
                  placeholder="Enter tagline"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Company Information</h4>
          <Controller
            control={form.control}
            name="address"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Company Address
                </label>
                <Textarea
                  id={field.name}
                  ref={field.ref}
                  placeholder="Enter address"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="mail"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email
                </label>
                <Input
                  id={field.name}
                  ref={field.ref}
                  type="text"
                  placeholder="Enter email"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="url_mail"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email Link
                </label>
                <Input
                  id={field.name}
                  ref={field.ref}
                  type="text"
                  placeholder="Enter email"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="tel"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Phone
                </label>
                <Input
                  id={field.name}
                  ref={field.ref}
                  type="text"
                  placeholder="Enter phone"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="copyright_link"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Phone Link
                </label>
                <Input
                  id={field.name}
                  ref={field.ref}
                  type="text"
                  placeholder="Enter phone"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />

          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Social Media</h4>
          <Controller
            control={form.control}
            name="url_facebook"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Youtube URL
                </label>
                <Input
                  id={field.name}
                  ref={field.ref}
                  type="text"
                  placeholder="Enter url"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="url_instagram"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Instagram URL
                </label>
                <Input
                  id={field.name}
                  ref={field.ref}
                  type="text"
                  placeholder="Enter url"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="url_linkedin"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Tiktok URL
                </label>
                <Input
                  id={field.name}
                  ref={field.ref}
                  type="text"
                  placeholder="Enter url"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />

          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Links</h4>
          <section className="p-4 space-y-6 border">
            {fields.map((item, index) => (
              <div key={item.id} className="pb-8 space-y-4 border-b border-primary/10 ">
                <div className="flex justify-between space-x-4">
                  <Controller
                    control={form.control}
                    name={`other_routes.${index}.title.en`}
                    render={({field, fieldState: {error}}) => (
                      <div className="flex flex-col w-full space-y-2">
                        <label
                          htmlFor={field.name}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Title (EN)
                        </label>
                        <Input
                          id={field.name}
                          ref={field.ref}
                          type="text"
                          placeholder="Enter title"
                          disabled={isLoading}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                        {error?.message ? (
                          <p className="text-xs font-medium text-destructive">{error?.message}</p>
                        ) : null}
                      </div>
                    )}
                  />
                  <div className="mt-auto ">
                    <PopConfirm onOk={() => remove(index)}>
                      <Button type="button" variant="destructive">
                        <Trash size={14} />
                      </Button>
                    </PopConfirm>
                  </div>
                </div>

                <Controller
                  control={form.control}
                  name={`other_routes.${index}.title.id`}
                  render={({field, fieldState: {error}}) => (
                    <div className="flex flex-col w-full space-y-2">
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Title (ID)
                      </label>
                      <Input
                        id={field.name}
                        ref={field.ref}
                        type="text"
                        placeholder="Enter title"
                        disabled={isLoading}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                      {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
                    </div>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`other_routes.${index}.route`}
                  render={({field, fieldState: {error}}) => (
                    <div className="flex flex-col w-full space-y-2">
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Route
                      </label>
                      <Input
                        id={field.name}
                        ref={field.ref}
                        type="text"
                        placeholder="Enter route"
                        disabled={isLoading}
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                        }}
                      />
                      {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
                    </div>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`other_routes.${index}.order`}
                  defaultValue={index}
                  render={({field, fieldState: {error}}) => (
                    <div className="flex flex-col w-full space-y-2">
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Order
                      </label>
                      <InputNumber field={field} isLoading={isLoading} placeholder="Enter order" />
                      {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
                    </div>
                  )}
                />
              </div>
            ))}

            <div className="">
              <Button
                className="mt-2"
                type="button"
                onClick={() =>
                  append({
                    title: {en: "", id: ""},
                    route: "",
                    order: 0,
                  })
                }
              >
                Add Fields
              </Button>
            </div>
          </section>
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
      </FormProvider>
    </section>
  );
};

export default FooterPage;

