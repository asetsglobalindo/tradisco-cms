// hook
import {Controller, FormProvider, useForm} from "react-hook-form";
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
import {Textarea} from "@/components/ui/textarea";
import {toast} from "react-toastify";
import ToastBody from "@/components/ToastBody";
import {Switch} from "@/components/ui/switch";
import ImageRepository from "@/components/ImageRepository";
import IMG_TYPE from "@/helper/img-type";
import CONTENT_TYPE from "@/helper/content-type";
import {CategoryType} from "../NewsCategory/NewsCategory";
import {cn} from "@/lib/utils";
import {Check, ChevronsUpDown} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import Ckeditor5 from "@/components/Ckeditor5";

const title_page = "Business";
const action_context = "Create";

const formSchema = z.object({
  meta_title: z.object({
    en: z.string({required_error: "Field required"}).min(1),
    id: z.string({required_error: "Field required"}).min(1),
  }),
  meta_description: z.object({
    en: z.string({required_error: "Field required"}).min(1),
    id: z.string({required_error: "Field required"}).min(1),
  }),
  thumbnail_images: z.object({
    id: z.string().array(),
    en: z.string().array(),
  }),
  title: z.object({
    en: z.string({required_error: "Field required"}).min(1),
    id: z.string({required_error: "Field required"}).min(1),
  }),
  description: z.object({
    en: z.string({required_error: "Field required"}).min(1),
    id: z.string({required_error: "Field required"}).min(1),
  }),
  small_text: z.object({
    en: z.string({required_error: "Field required"}).min(1),
    id: z.string({required_error: "Field required"}).min(1),
  }),
  // bottom_button_name: z.object({
  //   en: z.string({required_error: "Field required"}).min(1),
  //   id: z.string({required_error: "Field required"}).min(1),
  // }),
  // bottom_button_route: z.string({required_error: "Field required"}).min(1),
  category_id: z.string({required_error: "Field required"}).min(1),
  active_status: z.boolean().default(false),
  type: z.string().default(CONTENT_TYPE.NEWS),
  order: z.number().default(0),
});

type DataFormValue = z.infer<typeof formSchema>;
type Payload = Omit<DataFormValue, "thumbnail_images"> & {
  thumbnail_images: {
    id: string;
    en: string;
  };
};

const BusinessCreate = () => {
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

  const {mutate, isLoading} = useMutation(
    async (payload: Payload) => await ApiService.secure().post("content", payload),
    {
      onSettled: (response) =>
        settledHandler({response, contextAction: action_context, onFinish: () => navigate(prevLocation)}),
    }
  );

  const {data: categoryOptions} = useQuery({
    queryKey: ["category-option"],
    queryFn: async () => await getCategoryHandler({pageIndex: 0, pageSize: 200}),
  });

  const getCategoryHandler = async ({pageIndex, pageSize}: {pageIndex: number; pageSize: number}) => {
    try {
      const response = await ApiService.secure().get(`/category`, {
        page: pageIndex + 1,
        limit: pageSize,
        type: CONTENT_TYPE.NEWS,
      });

      if (response.data.status !== 200) {
        throw new Error(response.data.err);
      }

      return response.data.data as CategoryType[] | [];
    } catch (error: any) {
      toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
    }
  };

  const onSubmit = (data: DataFormValue) => {
    mutate({
      ...data,
      thumbnail_images: {
        id: data.thumbnail_images.id[0],
        en: data.thumbnail_images.en[0],
      },
    });
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

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-full mt-5 space-y-4">
          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Meta Fields</h4>
          <Controller
            control={form.control}
            name="meta_title.en"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Meta Title (EN)
                </label>
                <Input
                  id={field.name}
                  ref={field.ref}
                  type="text"
                  placeholder="Enter meta title"
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
            name="meta_description.en"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Meta Description (EN)
                </label>
                <Textarea
                  id={field.name}
                  ref={field.ref}
                  placeholder="Enter meta description"
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
            name="meta_title.id"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Meta Title (ID)
                </label>
                <Input
                  id={field.name}
                  ref={field.ref}
                  type="text"
                  placeholder="Enter meta title"
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
            name="meta_description.id"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Meta Description (ID)
                </label>
                <Textarea
                  id={field.name}
                  ref={field.ref}
                  placeholder="Enter meta description"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Content Fields</h4>
          <Controller
            control={form.control}
            name="title.en"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
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
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="title.id"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
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
            name="category_id"
            render={({field}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="category"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Category
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
                        ? categoryOptions?.find((option) => option._id === field.value)?.name.en
                        : "Select category"}
                      <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Search name..." />
                      <CommandList>
                        <CommandEmpty>No option found.</CommandEmpty>
                        <CommandGroup>
                          {categoryOptions?.map((option) => (
                            <CommandItem
                              key={option.name.en}
                              value={option.name.en}
                              onSelect={() => {
                                field.onChange(option._id);
                              }}
                            >
                              <Check
                                className={cn("mr-2 h-4 w-4", field.value === option._id ? "opacity-100" : "opacity-0")}
                              />
                              {option.name.en}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {form?.formState?.errors?.category_id ? (
                  <p className="text-xs font-medium text-destructive">{form.formState.errors.category_id.message}</p>
                ) : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="small_text.en"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Thumbnail Description (EN)
                </label>
                <Textarea
                  id={field.name}
                  ref={field.ref}
                  placeholder="Enter description"
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
            name="small_text.id"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Thumbnail Description (ID)
                </label>
                <Textarea
                  id={field.name}
                  ref={field.ref}
                  placeholder="Enter description"
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
            name="description.en"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Body (EN)
                </label>
                <Ckeditor5
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter Body"
                />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="description.id"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Body (ID)
                </label>
                <Ckeditor5
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter Body"
                />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="thumbnail_images.en"
            render={({field}) => {
              return (
                <ImageRepository
                  label="Thumbnail"
                  limit={1}
                  mobileSize={false}
                  img_type={IMG_TYPE.NEWS}
                  value={field.value?.length ? field.value : []}
                  onChange={(data) => {
                    let value = data.map((img) => img._id);
                    form.setValue("thumbnail_images.id", value);
                    field.onChange(value);
                  }}
                />
              );
            }}
          />

          <Controller
            control={form.control}
            name="order"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Order
                </label>
                <Input
                  type="Name"
                  {...field}
                  placeholder="Enter order"
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                  disabled={isLoading}
                  onChange={(e) => {
                    field.onChange(+e.target.value);
                  }}
                />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="active_status"
            defaultValue={false}
            render={({field}) => (
              <div className="flex items-center gap-2">
                <Switch id={field.name} checked={field.value} onCheckedChange={field.onChange} />
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Publish
                </label>
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

export default BusinessCreate;

