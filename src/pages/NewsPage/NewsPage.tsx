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
import {toast} from "react-toastify";
import ToastBody from "@/components/ToastBody";
import CONTENT_TYPE from "@/helper/content-type";
import {ContentType} from "@/types/content";
import React, {useEffect, useState} from "react";
import IMG_TYPE from "@/helper/img-type";
import ImageRepository from "@/components/ImageRepository";
import combineImageMultiLang from "@/helper/combineImageMultiLang";
import Ckeditor5 from "@/components/Ckeditor5";

const title_page = "News Page";

const formSchema = z.object({
  title: z.object({
    en: z.string({required_error: "Field required"}).min(1),
    id: z.string({required_error: "Field required"}).min(1),
  }),
  banner_en: z.string().array().default([]),
  banner_id: z.string().array().default([]),
  description: z.object({
    en: z.string({required_error: "Field required"}).min(1),
    id: z.string({required_error: "Field required"}).min(1),
  }),
  body: z
    .object({
      title: z.object({
        en: z.string({required_error: "Field required"}).min(1),
        id: z.string({required_error: "Field required"}).min(1),
      }),
      image_en: z.string({required_error: "Field required"}).array().default([]),
      image_id: z.string({required_error: "Field required"}).array().default([]),
      button_name: z.object({
        en: z.string({required_error: "Field required"}).min(1),
        id: z.string({required_error: "Field required"}).min(1),
      }),
      button_route: z.string({required_error: "Field required"}).min(1),
    })
    .array()
    .default([]),

  active_status: z.boolean().default(true),
  type: z.string().default(CONTENT_TYPE.NEWS_PAGE),
  order: z.number().default(0),
});
type DataFormValue = z.infer<typeof formSchema>;
type Payload = Omit<DataFormValue, "body"> & {
  type: string;
  content_id: string;
  banner:
    | {
        id: string;
        en: string;
      }[]
    | [];
  body:
    | {
        title: {
          en: string;
          id: string;
        };
        images: {
          en: string;
          id: string;
        }[];
        button_name: {
          en: string;
          id: string;
        };
        button_route: string;
      }[]
    | [];
};

const NewsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [id, setId] = useState<string | null>(null);
  const prevLocation = location.pathname.split("/").slice(0, 3).join("/");
  const breadcrumbItems = [{title: title_page, link: prevLocation}];

  const form = useForm<DataFormValue>({
    resolver: zodResolver(formSchema),
  });

  const {mutate, isLoading} = useMutation(
    async (payload: Payload) =>
      await ApiService.secure().post(id ? "/content/edit" : "/content", {...payload, content_id: id || ""}),
    {
      onSettled: (response) =>
        settledHandler({response, contextAction: "Update", onFinish: () => navigate(prevLocation)}),
    }
  );

  const onSubmit = async (data: DataFormValue) => {
    try {
      for (let i = 0; i < data.body.length; i++) {
        const currentValue = data.body[i];
        const img_id = currentValue.image_id;
        const img_en = currentValue.image_en;

        if (img_en.length !== img_id.length) {
          throw new Error("Image english and indonesia must be same amount");
        }
      }

      const body = data.body.map((item) => ({
        title: {
          en: item.title.en,
          id: item.title.id,
        },
        button_name: {
          en: item.button_name.en,
          id: item.button_name.id,
        },

        button_route: item.button_route,
        images: combineImageMultiLang(item.image_en, item.image_id),
      }));

      const banner = combineImageMultiLang(data.banner_en, data.banner_id);

      mutate({
        ...data,
        banner: banner,
        content_id: id || "",
        body: body,
      });

      // mutate();
    } catch (error) {
      toast.error(<ToastBody title="an error occurred" description={error as string} />);
    }
  };

  useEffect(() => {
    const getDetails = async () => {
      try {
        const params = {
          limit: 1,
          page: 1,
          active_status: true,
          type: CONTENT_TYPE.NEWS_PAGE,
        };

        const response = await ApiService.get("/content", params);

        if (response.data.status !== 200) {
          throw new Error(response.data.message);
        }

        if (response.data.data.length) {
          const result: ContentType = response.data.data[0];
          form.reset({
            active_status: true,
            title: {
              en: result.title.en,
              id: result.title.id,
            },
            banner_en: result.banner.map((img) => img.en._id) || [],
            banner_id: result.banner.map((img) => img.id._id) || [],
            description: {
              en: result.description.en,
              id: result.description.id,
            },

            order: 1,
          });

          setId(result._id);
        }
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
          <React.Fragment>
            <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Banner</h4>
            <Controller
              control={form.control}
              name={"banner_en"}
              render={({field}) => {
                return (
                  <ImageRepository
                    label="Banner"
                    limit={1}
                    img_type={IMG_TYPE.NEWS}
                    value={field.value?.length ? field.value : []}
                    onChange={(data) => {
                      let value = data.map((img) => img._id);
                      form.setValue("banner_id", value);
                      field.onChange(value);
                    }}
                  />
                );
              }}
            />
          </React.Fragment>

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

export default NewsPage;

