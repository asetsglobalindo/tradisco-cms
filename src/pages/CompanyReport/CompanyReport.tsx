// hook
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { useMutation } from "react-query";
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
import { toast } from "react-toastify";
import ToastBody from "@/components/ToastBody";
import CONTENT_TYPE from "@/helper/content-type";
import { ContentType } from "@/types/content";
import React, { useEffect, useState } from "react";
import IMG_TYPE from "@/helper/img-type";
import ImageRepository from "@/components/ImageRepository";
import combineImageMultiLang from "@/helper/combineImageMultiLang";
import { Textarea } from "@/components/ui/textarea";
import { Trash } from "lucide-react";
import PopConfirm from "@/components/PopConfirm";
import Ckeditor5 from "@/components/Ckeditor5";

const title_page = "Company Report Page";

const formSchema = z.object({
  meta_title: z.object({
    en: z.string({ required_error: "Field required" }).min(1),
    id: z.string({ required_error: "Field required" }).min(1),
  }),
  meta_description: z.object({
    en: z.string({ required_error: "Field required" }).min(1),
    id: z.string({ required_error: "Field required" }).min(1),
  }),
  title: z.object({
    en: z.string({ required_error: "Field required" }).min(1),
    id: z.string({ required_error: "Field required" }).min(1),
  }),
  banner_en: z.string().array().default([]),
  banner_id: z.string().array().default([]),
  page_title: z.object({
    en: z.string({ required_error: "Field required" }).min(1),
    id: z.string({ required_error: "Field required" }).min(1),
  }),
  images_en: z.string().array().default([]),
  images_id: z.string().array().default([]),
  description: z.object({
    en: z.string({ required_error: "Field required" }).min(1),
    id: z.string({ required_error: "Field required" }).min(1),
  }),
  body: z
    .object({
      title: z.object({
        en: z.string({ required_error: "Field required" }).min(1),
        id: z.string({ required_error: "Field required" }).min(1),
      }),
      button_name: z.object({
        en: z.string({ required_error: "Field required" }).min(1),
        id: z.string({ required_error: "Field required" }).min(1),
      }),
      button_route: z.string({ required_error: "Field required" }).min(1),
      type: z.number().optional().default(1), // 1 mean section top
      image_en: z
        .string({ required_error: "Field required" })
        .array()
        .default([]),
      image_id: z
        .string({ required_error: "Field required" })
        .array()
        .default([]),
    })
    .array()
    .default([]),
  body_review: z
    .object({
      title: z.object({
        en: z.string({ required_error: "Field required" }).min(1),
        id: z.string({ required_error: "Field required" }).min(1),
      }),
      button_name: z.object({
        en: z.string({ required_error: "Field required" }).min(1),
        id: z.string({ required_error: "Field required" }).min(1),
      }),
      button_route: z.string({ required_error: "Field required" }).min(1),
      type: z.number().optional().default(2), // 1 mean section top
      image_en: z
        .string({ required_error: "Field required" })
        .array()
        .default([]),
      image_id: z
        .string({ required_error: "Field required" })
        .array()
        .default([]),
    })
    .array()
    .default([]),
  small_text: z.object({
    en: z.string({ required_error: "Field required" }).min(0).default(""),
    id: z.string({ required_error: "Field required" }).min(0).default(""),
  }),
  small_text2: z.object({
    en: z.string({ required_error: "Field required" }).min(1),
    id: z.string({ required_error: "Field required" }).min(1),
  }),
  bottom_button_name: z.object({
    en: z.string({ required_error: "Field required" }).min(0).default(""),
    id: z.string({ required_error: "Field required" }).min(0).default(""),
  }),
  active_status: z.boolean().default(true),
  type: z.string().default(CONTENT_TYPE.COMPANY_REPORT),
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
  images:
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
        type: number;
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

const CompanyReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [id, setId] = useState<string | null>(null);
  const prevLocation = location.pathname.split("/").slice(0, 3).join("/");
  const breadcrumbItems = [{ title: title_page, link: prevLocation }];

  const form = useForm<DataFormValue>({
    resolver: zodResolver(formSchema),
  });

  const { fields, remove, append } = useFieldArray({
    name: "body",
    control: form.control,
  });
  const {
    fields: fieldsReview,
    remove: removeReview,
    append: appendReview,
  } = useFieldArray({
    name: "body_review",
    control: form.control,
  });

  const { mutate, isLoading } = useMutation(
    async (payload: Payload) =>
      await ApiService.secure().post(id ? "/content/edit" : "/content", {
        ...payload,
        content_id: id || "",
      }),
    {
      onSettled: (response) =>
        settledHandler({
          response,
          contextAction: "Update",
          onFinish: () => navigate(prevLocation),
        }),
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
        type: item.type,
        button_route: item.button_route,
        images: combineImageMultiLang(item.image_en, item.image_id),
      }));

      const bodyReview = data.body_review.map((item) => ({
        title: {
          en: item.title.en,
          id: item.title.id,
        },
        button_name: {
          en: item.button_name.en,
          id: item.button_name.id,
        },
        type: item.type,
        button_route: item.button_route,
        images: combineImageMultiLang(item.image_en, item.image_id),
      }));

      const banner = combineImageMultiLang(data.banner_en, data.banner_id);
      const images = combineImageMultiLang(data.images_en, data.images_id);

      mutate({
        ...data,
        banner: banner,
        content_id: id || "",
        body: [...body, ...bodyReview],
        images: images,
      });

      // mutate();
    } catch (error) {
      toast.error(
        <ToastBody title="an error occurred" description={error as string} />
      );
    }
  };

  useEffect(() => {
    const getDetails = async () => {
      try {
        const params = {
          limit: 1,
          page: 1,
          active_status: true,
          type: CONTENT_TYPE.COMPANY_REPORT,
        };

        const response = await ApiService.get("/content", params);

        if (response.data.status !== 200) {
          throw new Error(response.data.message);
        }

        if (response.data.data.length) {
          const result: ContentType = response.data.data[0];
          form.reset({
            meta_title: {
              en: result?.meta_title?.en || "",
              id: result?.meta_title?.id || "",
            },
            meta_description: {
              en: result?.meta_description?.en || "",
              id: result?.meta_description?.id || "",
            },
            active_status: true,
            title: {
              en: result.title.en,
              id: result.title.id,
            },
            images_en: result.images.map((img) => img.en._id) || [],
            images_id: result.images.map((img) => img.id._id) || [],
            page_title: {
              en: result?.page_title?.en || "",
              id: result?.page_title?.id || "",
            },
            small_text: result.small_text,
            small_text2: result.small_text2,
            bottom_button_name: {
              en: result.bottom_button_name.en,
              id: result.bottom_button_name.id,
            },
            type: CONTENT_TYPE.COMPANY_REPORT,
            body: result.body
              .filter((d) => d.type === 1)
              .map((item) => ({
                button_name: {
                  en: item.button_name.en,
                  id: item.button_name.id,
                },
                image_en: item.images.map((img) => img.en._id) || [],
                image_id: item.images.map((img) => img.id._id) || [],
                title: {
                  en: item.title.en,
                  id: item.title.id,
                },

                button_route: item.button_route,
                type: item.type,
              })),
            body_review: result.body
              .filter((d) => d.type === 2)
              .map((item) => ({
                button_name: {
                  en: item.button_name.en,
                  id: item.button_name.id,
                },
                button_route: item.button_route,
                image_en: item.images.map((img) => img.en._id) || [],
                image_id: item.images.map((img) => img.id._id) || [],
                title: {
                  en: item.title.en,
                  id: item.title.id,
                },
                type: item.type,
              })),
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
        toast.error(
          <ToastBody
            title="an error occurred"
            description={error.message || "Something went wrong"}
          />
        );
      }
    };
    getDetails();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section>
      <Breadcrumb items={breadcrumbItems} />
      <section className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">{title_page}</h1>
        <Button onClick={() => navigate(prevLocation)}>
          Back to {title_page}
        </Button>
      </section>
      <Separator />

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col w-full mt-5 space-y-4"
        >
          <React.Fragment>
            <h4 className="pb-2 text-lg font-medium border-b border-primary/10">
              Meta Fields
            </h4>
            <Controller
              control={form.control}
              name="meta_title.en"
              render={({ field, fieldState: { error } }) => (
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
                  {error?.message ? (
                    <p className="text-xs font-medium text-destructive">
                      {error?.message}
                    </p>
                  ) : null}
                </div>
              )}
            />
            <Controller
              control={form.control}
              name="meta_description.en"
              render={({ field, fieldState: { error } }) => (
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
                  {error?.message ? (
                    <p className="text-xs font-medium text-destructive">
                      {error?.message}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="meta_title.id"
              render={({ field, fieldState: { error } }) => (
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
                  {error?.message ? (
                    <p className="text-xs font-medium text-destructive">
                      {error?.message}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="meta_description.id"
              render={({ field, fieldState: { error } }) => (
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
                  {error?.message ? (
                    <p className="text-xs font-medium text-destructive">
                      {error?.message}
                    </p>
                  ) : null}
                </div>
              )}
            />
          </React.Fragment>
          <React.Fragment>
            <h4 className="pb-2 text-lg font-medium border-b border-primary/10">
              Banner
            </h4>
            <Controller
              control={form.control}
              name={"banner_en"}
              render={({ field }) => {
                return (
                  <ImageRepository
                    label="Banner"
                    limit={1}
                    img_type={IMG_TYPE.COMPANY_REPORT}
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
            <Controller
              control={form.control}
              name="page_title.id"
              render={({ field, fieldState: { error } }) => (
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Page Title (ID)
                  </label>
                  <Textarea
                    id={field.name}
                    ref={field.ref}
                    placeholder="Enter meta description"
                    disabled={isLoading}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                  {error?.message ? (
                    <p className="text-xs font-medium text-destructive">
                      {error?.message}
                    </p>
                  ) : null}
                </div>
              )}
            />
            <Controller
              control={form.control}
              name="page_title.en"
              render={({ field, fieldState: { error } }) => (
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Page Title (EN)
                  </label>
                  <Textarea
                    id={field.name}
                    ref={field.ref}
                    placeholder="Enter meta description"
                    disabled={isLoading}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                  {error?.message ? (
                    <p className="text-xs font-medium text-destructive">
                      {error?.message}
                    </p>
                  ) : null}
                </div>
              )}
            />
          </React.Fragment>
          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">
            Content Fields
          </h4>
          <Controller
            control={form.control}
            name="title.en"
            render={({ field, fieldState: { error } }) => (
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
                {error?.message ? (
                  <p className="text-xs font-medium text-destructive">
                    {error?.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="title.id"
            render={({ field, fieldState: { error } }) => (
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
                {error?.message ? (
                  <p className="text-xs font-medium text-destructive">
                    {error?.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">
            Annual Report
          </h4>
          {/* <Controller
            control={form.control}
            name="small_text.en"
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
            name="small_text.id"
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
          /> */}
          <Controller
            control={form.control}
            name="description.en"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col w-full space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Description (EN)
                </label>
                <Ckeditor5
                  onBlur={field.onBlur}
                  ref={field.ref}
                  placeholder="Enter text"
                  value={field.value}
                  onChange={(e) => field.onChange(e)}
                />
                {error?.message ? (
                  <p className="text-xs font-medium text-destructive">
                    {error?.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="description.id"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col w-full space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Description (ID)
                </label>
                <Ckeditor5
                  onBlur={field.onBlur}
                  ref={field.ref}
                  placeholder="Enter text"
                  value={field.value}
                  onChange={(e) => field.onChange(e)}
                />
                {error?.message ? (
                  <p className="text-xs font-medium text-destructive">
                    {error?.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <section className="p-4 space-y-6 border">
            {fields.map((item, index) => (
              <div
                key={item.id}
                className="pb-8 space-y-4 border-b border-primary/10 "
              >
                <div className="flex justify-between space-x-4">
                  <Controller
                    control={form.control}
                    name={`body.${index}.title.en`}
                    render={({ field, fieldState: { error } }) => (
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
                          <p className="text-xs font-medium text-destructive">
                            {error?.message}
                          </p>
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
                  name={`body.${index}.title.id`}
                  render={({ field, fieldState: { error } }) => (
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
                      {error?.message ? (
                        <p className="text-xs font-medium text-destructive">
                          {error?.message}
                        </p>
                      ) : null}
                    </div>
                  )}
                />

                <Controller
                  control={form.control}
                  name={`body.${index}.image_en`}
                  render={({ field }) => {
                    return (
                      <ImageRepository
                        label="Image"
                        limit={1}
                        mobileSize={false}
                        showButtonRoute
                        img_type={IMG_TYPE.COMPANY_REPORT}
                        value={field.value?.length ? field.value : []}
                        onChange={(data) => {
                          let value = data.map((img) => img._id);
                          form.setValue(`body.${index}.image_id`, value);
                          field.onChange(value);
                        }}
                      />
                    );
                  }}
                />

                <Controller
                  control={form.control}
                  name={`body.${index}.button_name.en`}
                  render={({ field, fieldState: { error } }) => (
                    <div className="flex flex-col w-full space-y-2">
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
                      {error?.message ? (
                        <p className="text-xs font-medium text-destructive">
                          {error?.message}
                        </p>
                      ) : null}
                    </div>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`body.${index}.button_name.id`}
                  render={({ field, fieldState: { error } }) => (
                    <div className="flex flex-col w-full space-y-2">
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
                      {error?.message ? (
                        <p className="text-xs font-medium text-destructive">
                          {error?.message}
                        </p>
                      ) : null}
                    </div>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`body.${index}.button_route`}
                  render={({ field, fieldState: { error } }) => (
                    <div className="flex flex-col w-full space-y-2">
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
                      {error?.message ? (
                        <p className="text-xs font-medium text-destructive">
                          {error?.message}
                        </p>
                      ) : null}
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
                    title: { en: "", id: "" },
                    image_en: [],
                    image_id: [],
                    type: 1,
                    button_name: { en: "", id: "" },
                    button_route: "",
                  })
                }
              >
                Add Fields
              </Button>
            </div>
          </section>
          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">
            Sustainability Report
          </h4>
          {/* <Controller
            control={form.control}
            name="bottom_button_name.en"
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
            name="bottom_button_name.id"
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
          /> */}
          <Controller
            control={form.control}
            name="small_text2.en"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col w-full space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Description (EN)
                </label>
                <Ckeditor5
                  onBlur={field.onBlur}
                  ref={field.ref}
                  placeholder="Enter text"
                  value={field.value}
                  onChange={(e) => field.onChange(e)}
                />
                {error?.message ? (
                  <p className="text-xs font-medium text-destructive">
                    {error?.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="small_text2.id"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col w-full space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Description (ID)
                </label>
                <Ckeditor5
                  onBlur={field.onBlur}
                  ref={field.ref}
                  placeholder="Enter text"
                  value={field.value}
                  onChange={(e) => field.onChange(e)}
                />
                {error?.message ? (
                  <p className="text-xs font-medium text-destructive">
                    {error?.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <section className="p-4 space-y-6 border">
            {fieldsReview.map((item, index) => (
              <div
                key={item.id}
                className="pb-8 space-y-4 border-b border-primary/10 "
              >
                <div className="flex justify-between space-x-4">
                  <Controller
                    control={form.control}
                    name={`body_review.${index}.title.en`}
                    render={({ field, fieldState: { error } }) => (
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
                          <p className="text-xs font-medium text-destructive">
                            {error?.message}
                          </p>
                        ) : null}
                      </div>
                    )}
                  />
                  <div className="mt-auto ">
                    <PopConfirm onOk={() => removeReview(index)}>
                      <Button type="button" variant="destructive">
                        <Trash size={14} />
                      </Button>
                    </PopConfirm>
                  </div>
                </div>

                <Controller
                  control={form.control}
                  name={`body_review.${index}.title.id`}
                  render={({ field, fieldState: { error } }) => (
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
                      {error?.message ? (
                        <p className="text-xs font-medium text-destructive">
                          {error?.message}
                        </p>
                      ) : null}
                    </div>
                  )}
                />

                <Controller
                  control={form.control}
                  name={`body_review.${index}.image_en`}
                  render={({ field }) => {
                    return (
                      <ImageRepository
                        label="Image"
                        limit={1}
                        mobileSize={false}
                        showButtonRoute
                        img_type={IMG_TYPE.COMPANY_REPORT}
                        value={field.value?.length ? field.value : []}
                        onChange={(data) => {
                          let value = data.map((img) => img._id);
                          form.setValue(`body_review.${index}.image_id`, value);
                          field.onChange(value);
                        }}
                      />
                    );
                  }}
                />

                <Controller
                  control={form.control}
                  name={`body_review.${index}.button_name.en`}
                  render={({ field, fieldState: { error } }) => (
                    <div className="flex flex-col w-full space-y-2">
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
                      {error?.message ? (
                        <p className="text-xs font-medium text-destructive">
                          {error?.message}
                        </p>
                      ) : null}
                    </div>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`body_review.${index}.button_name.id`}
                  render={({ field, fieldState: { error } }) => (
                    <div className="flex flex-col w-full space-y-2">
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
                      {error?.message ? (
                        <p className="text-xs font-medium text-destructive">
                          {error?.message}
                        </p>
                      ) : null}
                    </div>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`body_review.${index}.button_route`}
                  render={({ field, fieldState: { error } }) => (
                    <div className="flex flex-col w-full space-y-2">
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
                      {error?.message ? (
                        <p className="text-xs font-medium text-destructive">
                          {error?.message}
                        </p>
                      ) : null}
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
                  appendReview({
                    title: { en: "", id: "" },
                    image_en: [],
                    image_id: [],
                    type: 2,
                    button_name: { en: "", id: "" },
                    button_route: "",
                  })
                }
              >
                Add Fields
              </Button>
            </div>
          </section>

          <div className="flex justify-center">
            <div className="flex gap-4 mt-5 mb-10">
              <Button
                className="w-[100px]"
                type="button"
                variant={"outline"}
                onClick={() => navigate(prevLocation)}
              >
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

export default CompanyReport;
