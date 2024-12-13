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
import {Switch} from "@/components/ui/switch";
import ImageRepository from "@/components/ImageRepository";
import IMG_TYPE from "@/helper/img-type";
import CONTENT_TYPE from "@/helper/content-type";
import PopConfirm from "@/components/PopConfirm";
import {Trash} from "lucide-react";
import {useEffect} from "react";
import Ckeditor5 from "@/components/Ckeditor5";

const title_page = "Commercial";
const action_context = "Create";

const formSchema = z.object({
  meta_title: z.string({required_error: "Field required"}).min(1),
  meta_description: z.string({required_error: "Field required"}).min(1),
  images: z.string().array(),
  thumbnail_images: z.string().array(),
  title: z.string({required_error: "Field required"}).min(1),
  active_status: z.boolean().default(false),
  body: z
    .object({
      title: z.string({required_error: "Field required"}).min(1),
      text: z.string({required_error: "Field required"}).min(1),
      button_name: z.string({required_error: "Field required"}).min(1),
      images: z.string({required_error: "Field required"}).array(),
    })
    .array()
    .default([]),
  related: z
    .object({
      label: z.string({required_error: "Field required"}),
      value: z.string({required_error: "Field required"}),
    })
    .array()
    .min(0)
    .default([]),
});

type DataFormValue = z.infer<typeof formSchema>;
type Payload = Omit<DataFormValue, "related"> & {
  related: string[] | [];
  type: string;
};

const CommercialCreate = () => {
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

  const {fields, append, remove} = useFieldArray({
    name: "body",
    control: form.control,
  });

  const bodyWatch = form.watch("body");

  const {mutate, isLoading} = useMutation(
    async (payload: Payload) => await ApiService.secure().post("content", payload),
    {
      onSettled: (response) =>
        settledHandler({response, contextAction: "Create", onFinish: () => navigate(prevLocation)}),
    }
  );

  const onSubmit = (data: DataFormValue) => {
    mutate({...data, type: CONTENT_TYPE.COMMERCIAL, related: data.related.map((item) => item.value)});
  };

  // append if empty
  useEffect(() => {
    if (!bodyWatch?.length) {
      append({title: "", text: "", button_name: "", images: []});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
            name="meta_title"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Meta Title
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
            name="meta_description"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Meta Description
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
          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Banner</h4>
          <Controller
            control={form.control}
            name="title"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Main Title
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
            name={"thumbnail_images"}
            render={({field}) => {
              return (
                <ImageRepository
                  label="Thumbnail"
                  limit={1}
                  mobileSize={false}
                  img_type={IMG_TYPE.COMMERCIAL}
                  value={field.value?.length ? field.value : []}
                  onChange={(data) => {
                    let value = data.map((img) => img._id);
                    field.onChange(value);
                  }}
                />
              );
            }}
          />
          <Controller
            control={form.control}
            name={"images"}
            render={({field}) => {
              return (
                <ImageRepository
                  label="Banner"
                  limit={1}
                  showButtonRoute
                  img_type={IMG_TYPE.COMMERCIAL}
                  value={field.value?.length ? field.value : []}
                  onChange={(data) => {
                    let value = data.map((img) => img._id);
                    field.onChange(value);
                  }}
                />
              );
            }}
          />

          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Content Fields</h4>
          <section className="p-4 space-y-6 border">
            {fields.map((item, index) => (
              <div key={item.id} className="pb-8 space-y-4 border-b border-primary/10 ">
                <div className="flex justify-between space-x-4">
                  <Controller
                    control={form.control}
                    name={`body.${index}.button_name`}
                    render={({field, fieldState: {error}}) => (
                      <div className="flex flex-col w-full space-y-2">
                        <label
                          htmlFor={field.name}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Name
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
                  name={`body.${index}.title`}
                  render={({field, fieldState: {error}}) => (
                    <div className="flex flex-col space-y-2">
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
                  name={`body.${index}.text`}
                  render={({field, fieldState: {error}}) => (
                    <div className="flex flex-col space-y-2">
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Body
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
                  name={`body.${index}.images`}
                  render={({field}) => {
                    return (
                      <ImageRepository
                        label="Images"
                        limit={10}
                        showButtonRoute
                        img_type={IMG_TYPE.COMMERCIAL}
                        value={field.value?.length ? field.value : []}
                        onChange={(data) => {
                          let value = data.map((img) => img._id);
                          field.onChange(value);
                        }}
                      />
                    );
                  }}
                />
              </div>
            ))}

            <div className="">
              <Button
                className="mt-2"
                type="button"
                onClick={() => append({button_name: "", images: [], title: "", text: ""})}
              >
                Add Field
              </Button>
            </div>
          </section>

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

export default CommercialCreate;

