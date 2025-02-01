// hook
import {Controller, FormProvider, useFieldArray, useForm} from "react-hook-form";
import {useLocation, useNavigate} from "react-router-dom";

// component
import Breadcrumb from "@/components/Breadcrumb";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";

// utils
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
import {Textarea} from "@/components/ui/textarea";
import {Trash} from "lucide-react";
import PopConfirm from "@/components/PopConfirm";

const title_page = "About Profile Page";

const formSchema = z.object({
  meta_title: z.object({
    en: z.string({required_error: "Field required"}).min(1),
    id: z.string({required_error: "Field required"}).min(1),
  }),
  meta_description: z.object({
    en: z.string({required_error: "Field required"}).min(1),
    id: z.string({required_error: "Field required"}).min(1),
  }),
  title: z.object({
    en: z.string({required_error: "Field required"}).min(1),
    id: z.string({required_error: "Field required"}).min(1),
  }),
  banner_en: z.string().array().default([]),
  banner_id: z.string().array().default([]),
  body: z
    .object({
      title: z.object({
        en: z.string({required_error: "Field required"}).min(1),
        id: z.string({required_error: "Field required"}).min(1),
      }),
      text: z.object({
        en: z.string({required_error: "Field required"}).min(1),
        id: z.string({required_error: "Field required"}).min(1),
      }),
      type: z.number().optional().default(1), // 1 mean section top
      image_en: z.string({required_error: "Field required"}).array().default([]),
      image_id: z.string({required_error: "Field required"}).array().default([]),
    })
    .array()
    .default([]),
  tab: z
    .object({
      title: z.object({
        en: z.string({required_error: "Field required"}).min(0).default(""),
        id: z.string({required_error: "Field required"}).min(0).default(""),
      }),
      text: z.object({
        en: z.string({required_error: "Field required"}),
        id: z.string({required_error: "Field required"}),
      }),
      type: z.number().optional().default(1), // 1 mean section top
      image_en: z.string({required_error: "Field required"}).array().default([]),
      image_id: z.string({required_error: "Field required"}).array().default([]),
    })
    .array()
    .default([]),
  active_status: z.boolean().default(true),
  type: z.string().default(CONTENT_TYPE.CSR_LIST),
  order: z.number().default(0),
});

type DataFormValue = z.infer<typeof formSchema>;

const CSROurPrograms = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [id, setId] = useState<string | null>(null);
  const [idTab, setIdTab] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const prevLocation = location.pathname.split("/").slice(0, 3).join("/");
  const breadcrumbItems = [{title: title_page, link: prevLocation}];

  const form = useForm<DataFormValue>({
    resolver: zodResolver(formSchema),
  });

  const {
    fields: fieldsTab,
    remove: removeTab,
    append: appendTab,
  } = useFieldArray({
    name: "tab",
    control: form.control,
  });
  const {fields, remove, append} = useFieldArray({
    name: "body",
    control: form.control,
  });

  const onSubmit = async (data: DataFormValue) => {
    try {
      setIsLoading(true);

      const body = data.body.map((item) => ({
        title: {
          en: item.title.en,
          id: item.title.id,
        },
        text: {
          en: item.text.en,
          id: item.text.id,
        },
        type: item.type,
        images: combineImageMultiLang(item.image_en, item.image_id),
      }));

      const bodyTab = data.tab.map((item) => ({
        title: {
          en: item.title.en,
          id: item.title.id,
        },
        text: {
          en: item.text.en,
          id: item.text.id,
        },
        type: item.type,
        images: item.image_en.length ? combineImageMultiLang(item.image_en, item.image_en) : [],
      }));

      const banner = combineImageMultiLang(data.banner_en, data.banner_id);

      const programsResponse = await ApiService.secure().post(id ? "/content/edit" : "/content", {
        ...data,
        banner: banner,
        content_id: id || "",
        body: [...body],
        type: CONTENT_TYPE.CSR_LIST,
      });
      if (programsResponse.data.status !== 200) {
        throw new Error(programsResponse.data.message);
      }

      const tabsResponse = await ApiService.secure().post(idTab ? "/content/edit" : "/content", {
        ...data,
        banner: [],
        title: {
          en: data.title.en + " - Tab",
          id: data.title.id + " - Tab",
        },
        content_id: idTab || "",
        body: [...bodyTab],
        type: CONTENT_TYPE.CSR_CONTENT,
      });
      if (tabsResponse.data.status !== 200) {
        throw new Error(tabsResponse.data.message);
      }

      toast.success(<ToastBody title="success" description="update successfully" />);
      setIsLoading(false);
    } catch (error) {
      toast.error(<ToastBody title="an error occurred" description={error as string} />);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getDetails = async (type: string) => {
      try {
        const params = {
          limit: 1,
          page: 1,
          type: type,
        };

        const response = await ApiService.get("/content", params);

        if (response.data.status !== 200) {
          throw new Error(response.data.message);
        }

        return response.data.data as ContentType[] | [];
      } catch (error: any) {
        toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
      }
    };

    getDetails(CONTENT_TYPE.CSR_LIST).then((data) => {
      if (data?.length) {
        const result: ContentType = data[0];
        setTimeout(() => {
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
              en: result?.title.en,
              id: result?.title.id,
            },

            type: CONTENT_TYPE.ABOUT_PROFILE,
            body: result.body
              .filter((d) => d.type === 1)
              .map((item) => ({
                image_en: item.images.map((img) => img.en._id) || [],
                image_id: item.images.map((img) => img.id._id) || [],
                text: {
                  en: item.text.en,
                  id: item.text.id,
                },
                title: {
                  en: item.title.en,
                  id: item.title.id,
                },
                type: item.type,
              })),

            banner_en: result.banner.map((img) => img.en._id) || [],
            banner_id: result.banner.map((img) => img.id._id) || [],

            order: 1,
          });
        }, 500);
        setId(result._id);
      }
    });
    getDetails(CONTENT_TYPE.CSR_CONTENT).then((data) => {
      if (data?.length) {
        const result: ContentType = data[0];

        setTimeout(() => {
          form.reset({
            tab: result.body
              .filter((d) => d.type === 1)
              .map((item) => ({
                image_en: item.images.map((img) => img.en._id) || [],
                image_id: item.images.map((img) => img.id._id) || [],
                text: {
                  en: item.text.en,
                  id: item.text.id,
                },
                title: {
                  en: item.title.en,
                  id: item.title.id,
                },
                type: item.type,
              })),
          });
        }, 300);

        setIdTab(result._id);
      }
    });
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
          </React.Fragment>
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
                    img_type={IMG_TYPE.CSR_PAGE}
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

          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Tab Section</h4>
          <section className="p-4 space-y-6 border">
            {fieldsTab.map((item, index) => (
              <div key={item.id} className="pb-8 space-y-4 border-b border-primary/10 ">
                <div className="flex justify-between space-x-4">
                  <Controller
                    control={form.control}
                    name={`tab.${index}.title.en`}
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
                    <PopConfirm onOk={() => removeTab(index)}>
                      <Button type="button" variant="destructive">
                        <Trash size={14} />
                      </Button>
                    </PopConfirm>
                  </div>
                </div>

                <Controller
                  control={form.control}
                  name={`tab.${index}.title.id`}
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
                  name={`tab.${index}.text.en`}
                  render={({field, fieldState: {error}}) => (
                    <div className="flex flex-col w-full space-y-2">
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Text (EN) (optional)
                      </label>
                      <Ckeditor5
                        onBlur={field.onBlur}
                        ref={field.ref}
                        placeholder="Enter text"
                        value={field.value}
                        onChange={(e) => field.onChange(e)}
                      />
                      {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
                    </div>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`tab.${index}.text.id`}
                  render={({field, fieldState: {error}}) => (
                    <div className="flex flex-col w-full space-y-2">
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Text (ID) (optional)
                      </label>
                      <Ckeditor5
                        onBlur={field.onBlur}
                        ref={field.ref}
                        placeholder="Enter text"
                        value={field.value}
                        onChange={(e) => field.onChange(e)}
                      />
                      {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
                    </div>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`tab.${index}.image_en`}
                  render={({field}) => {
                    return (
                      <ImageRepository
                        label="Image"
                        limit={1}
                        mobileSize={false}
                        img_type={IMG_TYPE.CSR_PAGE}
                        value={field.value?.length ? field.value : []}
                        onChange={(data) => {
                          let value = data.map((img) => img._id);
                          form.setValue(`tab.${index}.image_id`, value);
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
                onClick={() =>
                  appendTab({
                    title: {en: "", id: ""},
                    image_en: [],
                    image_id: [],
                    type: 1,
                    text: {en: "", id: ""},
                  })
                }
              >
                Add Fields
              </Button>
            </div>
          </section>
          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Programs Section</h4>
          <section className="p-4 space-y-6 border">
            {fields.map((item, index) => (
              <div key={item.id} className="pb-8 space-y-4 border-b border-primary/10 ">
                <div className="flex justify-between space-x-4">
                  <Controller
                    control={form.control}
                    name={`body.${index}.title.en`}
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
                  name={`body.${index}.title.id`}
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
                  name={`body.${index}.text.en`}
                  render={({field, fieldState: {error}}) => (
                    <div className="flex flex-col w-full space-y-2">
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Text (EN)
                      </label>
                      <Ckeditor5
                        onBlur={field.onBlur}
                        ref={field.ref}
                        placeholder="Enter text"
                        value={field.value}
                        onChange={(e) => field.onChange(e)}
                      />
                      {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
                    </div>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`body.${index}.text.id`}
                  render={({field, fieldState: {error}}) => (
                    <div className="flex flex-col w-full space-y-2">
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Text (ID)
                      </label>
                      <Ckeditor5
                        onBlur={field.onBlur}
                        ref={field.ref}
                        placeholder="Enter text"
                        value={field.value}
                        onChange={(e) => field.onChange(e)}
                      />
                      {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
                    </div>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`body.${index}.image_en`}
                  render={({field}) => {
                    return (
                      <ImageRepository
                        label="Image"
                        limit={1}
                        mobileSize={false}
                        img_type={IMG_TYPE.CSR_PAGE}
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
              </div>
            ))}

            <div className="">
              <Button
                className="mt-2"
                type="button"
                onClick={() =>
                  append({
                    title: {en: "", id: ""},
                    image_en: [],
                    image_id: [],
                    type: 1,
                    text: {en: "", id: ""},
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

export default CSROurPrograms;

