// hook
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";

// component
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// utils
import settledHandler from "@/helper/settledHandler";
import ApiService from "@/lib/ApiService";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import ImageRepository from "@/components/ImageRepository";
import IMG_TYPE from "@/helper/img-type";
import CONTENT_TYPE from "@/helper/content-type";
import { ContentType } from "@/types/content";
import ToastBody from "@/components/ToastBody";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import MultipleSelector from "@/components/ui/MultipleSelector";
import PopConfirm from "@/components/PopConfirm";
import { Trash } from "lucide-react";
import Ckeditor5 from "@/components/Ckeditor5";

const title_page = "Home";

const formSchema = z.object({
  meta_title: z.string({ required_error: "Field required" }).min(1),
  meta_description: z.string({ required_error: "Field required" }).min(1),
  images: z.string().array(),
  banner: z.string().array(),
  thumbnail_images: z.string().array(),
  title: z.string({ required_error: "Field required" }).min(0).default("About Us"),
  small_text: z.string({ required_error: "Field required" }).min(1),
  small_text2: z.string({ required_error: "Field required" }).min(1),
  bottom_button_name: z.string({ required_error: "Field required" }).min(1),
  bottom_text: z.string({ required_error: "Field required" }).min(1),
  description: z.string({ required_error: "Field required" }).min(1),
  active_status: z.boolean().default(true),
  body: z
    .object({
      title: z.string({ required_error: "Field required" }).min(1),
      text: z.string({ required_error: "Field required" }).min(1),
    })
    .array()
    .default([]),
  body2: z
    .object({
      title: z.string({ required_error: "Field required" }).min(1),
      text: z.string({ required_error: "Field required" }).min(1),
    })
    .array()
    .default([]),
  related: z
    .object({
      label: z.string({ required_error: "Field required" }),
      value: z.string({ required_error: "Field required" }),
    })
    .array()
    .min(0)
    .default([]),
});

type DataFormValue = z.infer<typeof formSchema>;
type Payload = Omit<DataFormValue, "related"> & {
  related: string[] | [];
  type: string;
  content_id?: string;
};

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prevLocation = location.pathname.split("/").slice(0, 3).join("/");
  const breadcrumbItems = [{ title: title_page, link: prevLocation }];

  const [id, setID] = useState("");

  const form = useForm<DataFormValue>({
    resolver: zodResolver(formSchema),
  });
  const { fields, append, remove } = useFieldArray({ name: "body", control: form.control });

  const { mutate, isLoading } = useMutation(async (payload: Payload) => await ApiService.secure().post(id ? "/content/edit" : "content", payload), {
    onSettled: (response) =>
      settledHandler({
        response,
        contextAction: "Create",
        onFinish: () => {
          navigate(prevLocation);
          getDetails();
        },
      }),
  });
  const { data: relatedNews } = useQuery({
    queryKey: ["news", 999],
    queryFn: async () => await getNews({ pageIndex: 0, pageSize: 999 }),
  });

  const onSubmit = (data: DataFormValue) => {
    mutate({ ...data, type: CONTENT_TYPE.HOME, content_id: id, related: data.related.map((item) => item.value) });
  };
  const getDetails = async () => {
    try {
      const response = await ApiService.secure().get("/content/detail/home");

      if (response.data.status !== 200) {
        throw new Error(response.data.message);
      }

      const result = response.data.data as ContentType | null;

      if (result) {
        form.reset({
          active_status: result.active_status,
          description: result.description,
          title: result.title,
          meta_title: result.meta_title,
          meta_description: result.meta_description,
          related: result.related?.map((item) => ({ label: item.title, value: item._id })),
          images: result.images.map((img) => img._id),
          thumbnail_images: result.thumbnail_images.map((img) => img._id),
          banner: result.banner.map((img) => img._id),
          small_text: result.small_text,
          small_text2: result.small_text2,
          bottom_button_name: result.bottom_button_name,
          bottom_text: result.bottom_text,
          body: result.body.map((item) => ({
            title: item.title,
            text: item.text,
            button_route: item.button_route,
            images: item.images.map((img) => img._id),
            top: item.top,
            left: item.left,
          })),
        });
        setID(result._id);
      }
    } catch (error: any) {
      toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
    }
  };

  const getNews = async ({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
    try {
      let quries: any = {
        page: pageIndex + 1,
        limit: pageSize,
        type: CONTENT_TYPE.getTypeNumber(CONTENT_TYPE.NEWS_DETAIL),
      };

      const response = await ApiService.secure().get(`/content`, quries);

      if (response.data.status !== 200) {
        throw new Error(response.data.err);
      }

      return response.data.data as ContentType[] | [];
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
          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Meta Fields</h4>
          <Controller
            control={form.control}
            name="meta_title"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col space-y-2">
                <label htmlFor={field.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Meta Title
                </label>
                <Input id={field.name} ref={field.ref} type="text" placeholder="Enter meta title" disabled={isLoading} value={field.value} onChange={(e) => field.onChange(e.target.value)} />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="meta_description"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col space-y-2">
                <label htmlFor={field.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Meta Description
                </label>
                <Textarea id={field.name} ref={field.ref} placeholder="Enter meta description" disabled={isLoading} value={field.value} onChange={(e) => field.onChange(e.target.value)} />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Banner</h4>
          <Controller
            control={form.control}
            name={"banner"}
            render={({ field }) => {
              return (
                <ImageRepository
                  label="Banner"
                  limit={10}
                  showButtonRoute
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

          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">About Us</h4>
          <Controller
            control={form.control}
            name="small_text"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col space-y-2">
                <label htmlFor={field.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Title
                </label>
                <Input id={field.name} ref={field.ref} type="text" placeholder="Enter meta title" disabled={isLoading} value={field.value} onChange={(e) => field.onChange(e.target.value)} />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col space-y-2">
                <label htmlFor={field.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Description
                </label>
                <Ckeditor5 ref={field.ref} onBlur={field.onBlur} value={field.value} onChange={field.onChange} placeholder="Enter Body" />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name={"thumbnail_images"}
            render={({ field }) => {
              return (
                <ImageRepository
                  label="About Background"
                  limit={1}
                  showButtonRoute
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
          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Our Project</h4>
          <Controller
            control={form.control}
            name="bottom_button_name"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col space-y-2">
                <label htmlFor={field.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Title
                </label>
                <Input id={field.name} ref={field.ref} type="text" placeholder="Enter meta title" disabled={isLoading} value={field.value} onChange={(e) => field.onChange(e.target.value)} />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="bottom_text"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col space-y-2">
                <label htmlFor={field.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Description
                </label>
                <Ckeditor5 ref={field.ref} onBlur={field.onBlur} value={field.value} onChange={field.onChange} placeholder="Enter Body" />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name={"images"}
            render={({ field }) => {
              return (
                <ImageRepository
                  label="Project"
                  showButtonRoute
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
          <Controller
            control={form.control}
            name="related"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col space-y-2">
                <label htmlFor={field.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  News
                </label>
                <MultipleSelector
                  placeholder="Select item"
                  maxSelected={3}
                  onChange={(option) => {
                    field.onChange(option);
                  }}
                  emptyIndicator="No related contents"
                  value={field.value}
                  options={relatedNews?.map((option) => {
                    return {
                      label: option.title,
                      value: option._id,
                    };
                  })}
                />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Location</h4>
          <Controller
            control={form.control}
            name="small_text2"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col space-y-2">
                <label htmlFor={field.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Embed Map
                </label>
                <Input id={field.name} ref={field.ref} type="text" placeholder="Enter embed map" disabled={isLoading} value={field.value} onChange={(e) => field.onChange(e.target.value)} />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <section className="p-4 space-y-6 border">
            <p>Locations List</p>
            {fields.map((item, index) => (
              <div key={item.id} className="pb-8 space-y-4 border-b border-primary/10 ">
                <div className="flex justify-between space-x-4">
                  <Controller
                    control={form.control}
                    name={`body.${index}.title`}
                    render={({ field, fieldState: { error } }) => (
                      <div className="flex flex-col w-full space-y-2">
                        <label htmlFor={field.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Text
                        </label>
                        <Input id={field.name} ref={field.ref} type="text" placeholder="Enter name" disabled={isLoading} value={field.value} onChange={(e) => field.onChange(e.target.value)} />
                        {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
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
                  name={`body.${index}.text`}
                  render={({ field, fieldState: { error } }) => (
                    <div className="flex flex-col space-y-2">
                      <label htmlFor={field.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Icon
                      </label>
                      <Input id={field.name} ref={field.ref} type="text" placeholder="Enter icon" disabled={isLoading} value={field.value} onChange={(e) => field.onChange(e.target.value)} />
                      {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
                    </div>
                  )}
                />
              </div>
            ))}

            <div className="">
              <Button className="mt-2" type="button" onClick={() => append({ title: "", text: "" })}>
                Add Location List
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

export default HomePage;
