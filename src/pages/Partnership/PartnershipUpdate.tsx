// hook
import {Controller, FormProvider, useForm} from "react-hook-form";
import {useMutation} from "react-query";
import {useLocation, useNavigate, useParams} from "react-router-dom";

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
import {Switch} from "@/components/ui/switch";
import ImageRepository from "@/components/ImageRepository";
import IMG_TYPE from "@/helper/img-type";
import CONTENT_TYPE from "@/helper/content-type";
import {ContentType} from "@/types/content";
import {useEffect} from "react";

import Ckeditor5 from "@/components/Ckeditor5";
import combineImageMultiLang from "@/helper/combineImageMultiLang";

const title_page = "Partnership";
const action_context = "Update";

const formSchema = z.object({
  thumbnail_images_en: z.string().array().default([]),
  thumbnail_images_id: z.string().array().default([]),
  title: z.object({
    en: z.string({required_error: "Field required"}).min(1),
    id: z.string({required_error: "Field required"}).min(1),
  }),
  description: z.object({
    en: z.string({required_error: "Field required"}).min(1),
    id: z.string({required_error: "Field required"}).min(1),
  }),
  bottom_button_name: z.object({
    en: z.string({required_error: "Field required"}).min(1),
    id: z.string({required_error: "Field required"}).min(1),
  }),
  sub_title1: z.object({
    en: z.string({required_error: "Field required"}).min(1),
    id: z.string({required_error: "Field required"}).min(1),
  }),
  sub_title2: z.object({
    en: z.string({required_error: "Field required"}).min(1),
    id: z.string({required_error: "Field required"}).min(1),
  }),
  sub_title3: z.object({
    en: z.string({required_error: "Field required"}).min(1),
    id: z.string({required_error: "Field required"}).min(1),
  }),
  bottom_button_route: z.string({required_error: "Field required"}).min(1),
  active_status: z.boolean().default(false),
  type: z.string().default(CONTENT_TYPE.MITRA),
  order: z.number().default(0),
});

type DataFormValue = z.infer<typeof formSchema>;
type Payload = Omit<DataFormValue, "thumbnail_images_en" | "thumbnail_images_id"> & {
  type: string;
  content_id: string;
  thumbnail_images:
    | {
        id: string;
        en: string;
      }[]
    | [];
};

const PartnershipUpdate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {id} = useParams();
  const prevLocation = location.pathname.split("/").slice(0, 3).join("/");
  const breadcrumbItems = [
    {title: title_page, link: prevLocation},
    {title: title_page + " " + action_context, link: location.pathname},
  ];

  const form = useForm<DataFormValue>({
    resolver: zodResolver(formSchema),
  });

  const {mutate, isLoading} = useMutation(
    async (payload: Payload) => await ApiService.secure().post("/content/edit", payload),
    {
      onSettled: (response) =>
        settledHandler({response, contextAction: action_context, onFinish: () => navigate(prevLocation)}),
    }
  );

  const onSubmit = async (data: DataFormValue) => {
    try {
      const thumbnail_images = combineImageMultiLang(data.thumbnail_images_en, data.thumbnail_images_id);

      mutate({
        ...data,
        content_id: id || "",
        thumbnail_images: thumbnail_images,
        type: CONTENT_TYPE.MITRA,
      });
    } catch (error: any) {
      toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
    }
  };

  useEffect(() => {
    const getDetails = async () => {
      try {
        const response = await ApiService.secure().get(`/content/detail/${id}`);
        if (response.data.status !== 200) {
          throw new Error(response.data.message);
        }

        const result: ContentType = response.data.data;

        form.reset({
          active_status: result.active_status,
          description: result.description,
          title: result.title,
          bottom_button_name: result.bottom_button_name,
          bottom_button_route: result.bottom_button_route,
          sub_title1: result.sub_title1,
          sub_title2: result.sub_title2,
          sub_title3: result.sub_title3,
          order: result.order,
          thumbnail_images_en: result.thumbnail_images.map((img) => img.en._id) || [],
          thumbnail_images_id: result.thumbnail_images.map((img) => img.id._id) || [],
        });
      } catch (error: any) {
        toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
      }
    };
    getDetails();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

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
            name="thumbnail_images_en"
            render={({field}) => {
              return (
                <ImageRepository
                  label="Thumbnail"
                  limit={1}
                  mobileSize={false}
                  img_type={IMG_TYPE.MITRA}
                  value={field.value?.length ? field.value : []}
                  onChange={(data) => {
                    let value = data.map((img) => img._id);
                    form.setValue("thumbnail_images_id", value);
                    field.onChange(value);
                  }}
                />
              );
            }}
          />

          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Link 1</h4>
          <Controller
            control={form.control}
            name="bottom_button_name.en"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Button Name (EN)
                </label>
                <Input
                  id={field.name}
                  ref={field.ref}
                  type="text"
                  placeholder="Enter button name"
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
            name="bottom_button_name.id"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Button Name (ID)
                </label>
                <Input
                  id={field.name}
                  ref={field.ref}
                  type="text"
                  placeholder="Enter button name"
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
            name="bottom_button_route"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Button Link
                </label>
                <Input
                  id={field.name}
                  ref={field.ref}
                  type="text"
                  placeholder="Enter button link"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />
          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Link 2</h4>
          <Controller
            control={form.control}
            name="sub_title1.en"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Button Name (EN)
                </label>
                <Input
                  id={field.name}
                  ref={field.ref}
                  type="text"
                  placeholder="Enter button name"
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
            name="sub_title1.id"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Button Name (ID)
                </label>
                <Input
                  id={field.name}
                  ref={field.ref}
                  type="text"
                  placeholder="Enter button name"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
              </div>
            )}
          />

          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Details</h4>
          <Controller
            control={form.control}
            name="sub_title3.en"
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
            name="sub_title3.id"
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
            name="sub_title2.en"
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
            name="sub_title2.id"
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

export default PartnershipUpdate;

