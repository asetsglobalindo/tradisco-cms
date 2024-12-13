// hook
import {Controller, FormProvider, useForm} from "react-hook-form";
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
import {useEffect, useState} from "react";
import {ContentType} from "@/types/content";
import ToastBody from "@/components/ToastBody";
import {toast} from "react-toastify";
import Ckeditor5 from "@/components/Ckeditor5";

const title_page = "Career";

const formSchema = z.object({
  meta_title: z.string({required_error: "Field required"}).min(1),
  meta_description: z.string({required_error: "Field required"}).min(1),
  banner: z.string().array(),
  title: z.string({required_error: "Field required"}).min(1),
  description: z.string({required_error: "Field required"}).min(1),
  small_text: z.string().min(0).default(""),
  small_text2: z.string().min(0).default(""),
  bottom_button_route: z.string().min(0).default(""),
  active_status: z.boolean().default(true),
});

type DataFormValue = z.infer<typeof formSchema>;
type Payload = Omit<DataFormValue, "related"> & {
  related: string[] | [];
  type: string;
  content_id?: string;
};

const CareerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prevLocation = location.pathname.split("/").slice(0, 3).join("/");
  const breadcrumbItems = [{title: title_page, link: prevLocation}];

  const [id, setID] = useState("");

  const form = useForm<DataFormValue>({
    resolver: zodResolver(formSchema),
  });

  const {mutate, isLoading} = useMutation(
    async (payload: Payload) => await ApiService.secure().post(id ? "/content/edit" : "content", payload),
    {
      onSettled: (response) =>
        settledHandler({
          response,
          contextAction: id ? "Update" : "Create",
          onFinish: () => {
            navigate(prevLocation);
            getDetails();
          },
        }),
    }
  );

  const onSubmit = (data: DataFormValue) => {
    mutate({...data, type: CONTENT_TYPE.CAREER, content_id: id, related: []});
  };
  const getDetails = async () => {
    try {
      const response = await ApiService.secure().get("/content/detail/career");

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
          banner: result.banner.map((img) => img._id),
          small_text: result.small_text,
          small_text2: result.small_text2,
          bottom_button_route: result.bottom_button_route,
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
          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Overfiew Fields</h4>
          <Controller
            control={form.control}
            name="bottom_button_route"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Small Title
                </label>
                <Input
                  id={field.name}
                  ref={field.ref}
                  type="text"
                  placeholder="Enter small title"
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
            name="small_text"
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
            name="description"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Description
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
          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Banner</h4>
          <Controller
            control={form.control}
            name={"banner"}
            render={({field}) => {
              return (
                <ImageRepository
                  label="Banner"
                  limit={1}
                  showButtonRoute
                  img_type={IMG_TYPE.PROJECT}
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
            name="title"
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
            name="small_text2"
            render={({field, fieldState: {error}}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Description
                </label>
                <Ckeditor5
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter Description"
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

export default CareerPage;
