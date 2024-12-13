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
import {Textarea} from "@/components/ui/textarea";
import ImageRepository from "@/components/ImageRepository";
import IMG_TYPE from "@/helper/img-type";
import CONTENT_TYPE from "@/helper/content-type";
import {ContentType} from "@/types/content";
import ToastBody from "@/components/ToastBody";
import {toast} from "react-toastify";
import {useEffect, useState} from "react";
import PopConfirm from "@/components/PopConfirm";
import {Check, ChevronsUpDown, Trash} from "lucide-react";
import InputNumber from "@/components/ui/InputNumber";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";

const title_page = "Footer";

const formSchema = z.object({
  images: z.string().array(),
  bottom_text: z.string({required_error: "Field required"}).min(1),
  title: z.string({required_error: "Field required"}).min(0).default("footer"),
  active_status: z.boolean().default(true),
  body: z
    .object({
      title: z.string({required_error: "Field required"}).min(1),
      text: z.string({required_error: "Field required"}).min(1),
      button_route: z.string({required_error: "Field required"}).min(0),
      type: z.number({required_error: "Field required"}).default(0),
      top: z.number({required_error: "Field required"}).default(0),
    })
    .array()
    .default([]),
});

type DataFormValue = z.infer<typeof formSchema>;
type Payload = Omit<DataFormValue, "related"> & {
  type: string;
  content_id?: string;
};

const typeFooter = [
  {label: "General", value: 1},
  {label: "Social Media", value: 2},
];

const FooterContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prevLocation = location.pathname.split("/").slice(0, 3).join("/");
  const breadcrumbItems = [{title: title_page, link: prevLocation}];

  const [id, setID] = useState("");

  const form = useForm<DataFormValue>({
    resolver: zodResolver(formSchema),
  });
  const {fields, append, remove} = useFieldArray({name: "body", control: form.control});

  const {mutate, isLoading} = useMutation(
    async (payload: Payload) => await ApiService.secure().post(id ? "/content/edit" : "content", payload),
    {
      onSettled: (response) =>
        settledHandler({
          response,
          contextAction: "Update",
          onFinish: () => {
            navigate(prevLocation);
            getDetails();
          },
        }),
    }
  );

  const onSubmit = (data: DataFormValue) => {
    mutate({...data, type: CONTENT_TYPE.FOOTER, content_id: id});
  };
  const getDetails = async () => {
    try {
      const response = await ApiService.secure().get("/content/detail/footer");

      if (response.data.status !== 200) {
        throw new Error(response.data.message);
      }

      const result = response.data.data as ContentType | null;

      if (result) {
        form.reset({
          active_status: result.active_status,
          images: result.images.map((img) => img._id),
          bottom_text: result.bottom_text,
          body: result.body.map((item) => ({
            title: item.title,
            text: item.text,
            button_route: item.button_route,
            images: item.images.map((img) => img._id),
            top: item.top,
            type: item.type,
            left: item.left,
          })),
        });
        setID(result._id);
      }
    } catch (error: any) {
      toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
    }
  };

  useEffect(() => {
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
            name={"images"}
            render={({field}) => {
              return (
                <ImageRepository
                  label="Logo"
                  limit={1}
                  mobileSize={false}
                  img_type={IMG_TYPE.HOME_BANNER}
                  value={field.value?.length ? field.value : []}
                  onChange={(data) => {
                    let value = data.map((img) => img._id);
                    field.onChange(value);
                  }}
                />
              );
            }}
          />
          <section className="p-4 space-y-6 border">
            <p>Information List</p>
            {fields.map((item, index) => (
              <div key={item.id} className="pb-8 space-y-4 border-b border-primary/10 ">
                <div className="flex justify-between space-x-4">
                  <Controller
                    control={form.control}
                    name={`body.${index}.title`}
                    render={({field, fieldState: {error}}) => (
                      <div className="flex flex-col w-full space-y-2">
                        <label
                          htmlFor={field.name}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Title
                        </label>
                        <Input
                          id={field.name}
                          ref={field.ref}
                          type="text"
                          placeholder="Enter name"
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
                  name={`body.${index}.type`}
                  render={({field, fieldState: {error}}) => (
                    <div className="flex flex-col space-y-2">
                      <label
                        htmlFor="category"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Type
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              {
                                "text-muted-foreground": !field.value,
                              },
                              "justify-between font-normal"
                            )}
                          >
                            {field.value
                              ? typeFooter?.find((option) => option.value === field.value)?.label
                              : "Select type"}
                            <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Command>
                            <CommandInput placeholder="Search name..." />
                            <CommandList>
                              <CommandEmpty>No option found.</CommandEmpty>
                              <CommandGroup>
                                {typeFooter?.map((option) => (
                                  <CommandItem
                                    key={option.label}
                                    value={option.label}
                                    onSelect={() => {
                                      field.onChange(option.value);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === option.value ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {option.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
                    </div>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`body.${index}.text`}
                  render={({field, fieldState: {error}}) => (
                    <div className="flex flex-col space-y-2">
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Icons
                      </label>
                      <Input
                        id={field.name}
                        ref={field.ref}
                        type="text"
                        placeholder="Enter icon"
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
                  name={`body.${index}.button_route`}
                  render={({field, fieldState: {error}}) => (
                    <div className="flex flex-col space-y-2">
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Link
                      </label>
                      <Input
                        id={field.name}
                        ref={field.ref}
                        type="text"
                        placeholder="Enter link"
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
                  name={`body.${index}.top`}
                  render={({field, fieldState: {error}}) => (
                    <div className="flex flex-col space-y-2">
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Order (Position)
                      </label>
                      <InputNumber field={field} placeholder="Enter order" isLoading={isLoading} />
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
                onClick={() => append({title: "", text: "", button_route: "", type: 0, top: fields.length})}
              >
                Add List
              </Button>
            </div>
          </section>
          <Controller
            control={form.control}
            name="bottom_text"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Bottom Text
                </label>
                <Textarea
                  id={field.name}
                  ref={field.ref}
                  placeholder="Enter bottom text"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
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
      </FormProvider>
    </section>
  );
};

export default FooterContent;
