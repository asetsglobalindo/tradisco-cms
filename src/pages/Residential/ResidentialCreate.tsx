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
import PopConfirm from "@/components/PopConfirm";
import {Trash} from "lucide-react";
import {useEffect} from "react";
import {Switch} from "@/components/ui/switch";

const title_page = "Residential";
const action_context = "Create";

const formSchema = z.object({
  meta_title: z.string({required_error: "Field required"}).min(1),
  meta_description: z.string({required_error: "Field required"}).min(1),

  title: z.string({required_error: "Field required"}).min(1),
  logo: z.string().array(),
  background: z.string().array(),
  thumbnail: z.string().array(),
  top_name: z.string({required_error: "Field required"}).min(1),
  top_description: z.string({required_error: "Field required"}).min(1),

  section1: z
    .object({
      title: z.string({required_error: "Field required"}).min(1),
      link: z.string({required_error: "Field required"}).min(1),
      description: z.string({required_error: "Field required"}).min(1),
      image: z.string({required_error: "Field required"}).array(),
    })
    .array()
    .default([]),

  section2_list: z.string().array().default([]),
  section2_description: z.string({required_error: "Field required"}).min(1),
  section2_image: z.string().array(),
  active_status: z.boolean().default(false),
  content: z
    .object({
      name: z.string({required_error: "Field required"}).min(1),
      link: z.string({required_error: "Field required"}).min(1),
      image: z.string({required_error: "Field required"}).array(),
    })
    .array()
    .default([]),
});

type DataFormValue = z.infer<typeof formSchema>;
type Payload = Omit<DataFormValue, "logo" | "background" | "section2_image" | "content" | "section1" | "thumbnail"> & {
  logo: string;
  background: string;
  thumbnail: string;
  section2_image: string;
  content: {name: string; link: string; image: string[]}[];
  section1: {title: string; link: string; description: string; image: string[]}[];
};

const ResidentialCreate = () => {
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

  const {
    fields: fieldsSection1,
    append: appendSection1,
    remove: removeSection1,
  } = useFieldArray({
    name: "section1",
    control: form.control,
  });
  const {fields, append, remove} = useFieldArray({
    name: "content",
    control: form.control,
  });

  const contentWatch = form.watch("content");
  const section1Watch = form.watch("section1");

  const {mutate, isLoading} = useMutation(
    async (payload: Payload) => await ApiService.secure().post("/residential", payload),
    {
      onSettled: (response) =>
        settledHandler({response, contextAction: action_context, onFinish: () => navigate(prevLocation)}),
    }
  );

  const onSubmit = (data: DataFormValue) => {
    mutate({
      ...data,
      section2_image: data.section2_image[0],
      background: data.background[0],
      logo: data.logo[0],
      thumbnail: data.thumbnail[0],
      content: data.content.map((item) => ({...item, image: item.image})),
      section1: data.section1.map((item) => ({...item, image: item.image})),
    });
  };

  // append if empty
  useEffect(() => {
    if (!contentWatch?.length) {
      append({name: "", link: "", image: []});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!section1Watch?.length) {
      appendSection1({title: "", link: "", description: "", image: []});
    }
  }, []); //  eslint-disable-line react-hooks/exhaustive-deps

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
          <Controller
            control={form.control}
            name="title"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Project Name
                </label>
                <Input
                  id={field.name}
                  ref={field.ref}
                  type="text"
                  placeholder="Enter project name"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />

          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Top Section</h4>
          <Controller
            control={form.control}
            name="top_name"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
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
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="top_description"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Description
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
            name={"thumbnail"}
            render={({field}) => {
              return (
                <ImageRepository
                  label="Thumbnail"
                  limit={1}
                  mobileSize={false}
                  img_type={IMG_TYPE.RESIDENTIAL}
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
            name={"background"}
            render={({field}) => {
              return (
                <ImageRepository
                  label="Background"
                  limit={1}
                  img_type={IMG_TYPE.RESIDENTIAL}
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
            name={"logo"}
            render={({field}) => {
              return (
                <ImageRepository
                  label="Residential Logo"
                  limit={1}
                  img_type={IMG_TYPE.RESIDENTIAL}
                  value={field.value?.length ? field.value : []}
                  onChange={(data) => {
                    let value = data.map((img) => img._id);
                    field.onChange(value);
                  }}
                />
              );
            }}
          />

          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Main Slider</h4>
          <section className="p-4 space-y-6 border">
            {fieldsSection1.map((item, index) => (
              <div key={item.id} className="pb-8 space-y-4 border-b border-primary/10 ">
                <div className="flex justify-between space-x-4">
                  <Controller
                    control={form.control}
                    name={`section1.${index}.title`}
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
                    <PopConfirm onOk={() => removeSection1(index)}>
                      <Button type="button" variant="destructive">
                        <Trash size={14} />
                      </Button>
                    </PopConfirm>
                  </div>
                </div>
                <Controller
                  control={form.control}
                  name={`section1.${index}.description`}
                  render={({field, fieldState: {error}}) => (
                    <div className="flex flex-col space-y-2">
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Description
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
                  name={`section1.${index}.link`}
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
                  name={`section1.${index}.image`}
                  render={({field}) => {
                    return (
                      <ImageRepository
                        label="Images"
                        limit={1}
                        img_type={IMG_TYPE.RESIDENTIAL}
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
                onClick={() => appendSection1({description: "", title: "", link: "", image: []})}
              >
                Add Field
              </Button>
            </div>
          </section>

          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Residential Intro</h4>
          <Controller
            control={form.control}
            name="section2_description"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Description
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
            name={"section2_image"}
            render={({field}) => {
              return (
                <ImageRepository
                  label="Logo"
                  limit={1}
                  mobileSize={false}
                  img_type={IMG_TYPE.RESIDENTIAL}
                  value={field.value?.length ? field.value : []}
                  onChange={(data) => {
                    let value = data.map((img) => img._id);
                    field.onChange(value);
                  }}
                />
              );
            }}
          />

          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Residential Types</h4>
          <section className="p-4 space-y-6 border">
            {fields.map((item, index) => (
              <div key={item.id} className="pb-8 space-y-4 border-b border-primary/10 ">
                <div className="flex justify-between space-x-4">
                  <Controller
                    control={form.control}
                    name={`content.${index}.name`}
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
                  name={`content.${index}.link`}
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
                  name={`content.${index}.image`}
                  render={({field}) => {
                    return (
                      <ImageRepository
                        label="Images"
                        limit={10}
                        img_type={IMG_TYPE.RESIDENTIAL}
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
              <Button className="mt-2" type="button" onClick={() => append({name: "", link: "", image: []})}>
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

export default ResidentialCreate;

