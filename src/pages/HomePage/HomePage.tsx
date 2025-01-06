// hook
import {Controller, FormProvider, useFieldArray, useForm} from "react-hook-form";
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
import ImageRepository from "@/components/ImageRepository";
import IMG_TYPE from "@/helper/img-type";
import CONTENT_TYPE from "@/helper/content-type";
import {ContentType} from "@/types/content";
import ToastBody from "@/components/ToastBody";
import {toast} from "react-toastify";
import React, {useEffect} from "react";
import MultipleSelector from "@/components/ui/MultipleSelector";
import PopConfirm from "@/components/PopConfirm";
import {Trash} from "lucide-react";
import Ckeditor5 from "@/components/Ckeditor5";
import {cn} from "@/lib/utils";
import combineImageMultiLang from "@/helper/combineImageMultiLang";

const title_page = "Home";

type MultiLang = {
  id: string;
  en: string;
};

type HomeType = {
  meta_title: MultiLang;
  meta_description: MultiLang;
  section2: {
    title: MultiLang;
    tab: {
      title: MultiLang;
      content: string[];
      image: string;
      _id: string;
    }[];
  };
  section3: {
    small_text: MultiLang;
    title: MultiLang;
  };
  section5: {
    title: MultiLang;
    button_name: MultiLang;
    button_route: string;
    content: string[];
  };
  _id: string;
  banner: {
    id: string;
    en: string;
    _id: string;
  }[];
  section4: {
    tab: MultiLang;
    title: MultiLang;
    description: MultiLang;
    image: string;
    _id: string;
  }[];
  organization_id: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
};

const formSchema = z.object({
  meta_title: z.object({
    en: z.string({required_error: "Field required"}).min(1),
    id: z.string({required_error: "Field required"}).min(1),
  }),
  meta_description: z.object({
    en: z.string({required_error: "Field required"}).min(1),
    id: z.string({required_error: "Field required"}).min(1),
  }),
  banner_en: z.string().array(),
  banner_id: z.string().array(),
  section2: z.object({
    title: z.object({
      en: z.string({required_error: "Field required"}).min(1),
      id: z.string({required_error: "Field required"}).min(1),
    }),
    tab: z
      .object({
        title: z.object({
          en: z.string({required_error: "Field required"}).min(1),
          id: z.string({required_error: "Field required"}).min(1),
        }),
        content: z.string().array().default([]),
        image: z.string(),
      })
      .array()
      .default([]),
  }),
  section3: z.object({
    title: z.object({
      en: z.string({required_error: "Field required"}).min(1),
      id: z.string({required_error: "Field required"}).min(1),
    }),
    small_text: z.object({
      en: z.string({required_error: "Field required"}).min(1),
      id: z.string({required_error: "Field required"}).min(1),
    }),
  }),
  section4: z
    .object({
      tab: z.object({
        en: z.string({required_error: "Field required"}).min(1),
        id: z.string({required_error: "Field required"}).min(1),
      }),
      title: z.object({
        en: z.string({required_error: "Field required"}).min(1),
        id: z.string({required_error: "Field required"}).min(1),
      }),
      description: z.object({
        en: z.string({required_error: "Field required"}).min(1),
        id: z.string({required_error: "Field required"}).min(1),
      }),
      image: z.string(),
    })
    .array()
    .default([]),
  section5: z.object({
    title: z.object({
      en: z.string({required_error: "Field required"}).min(1),
      id: z.string({required_error: "Field required"}).min(1),
    }),
    button_name: z.object({
      en: z.string({required_error: "Field required"}).min(1),
      id: z.string({required_error: "Field required"}).min(1),
    }),
    button_route: z.string({required_error: "Field required"}).min(0),
    content: z.string().array().default([]),
  }),
});

type DataFormValue = z.infer<typeof formSchema>;
type Payload = Omit<DataFormValue, "banner_en" | "banner_id"> & {
  banner:
    | {
        id: string;
        en: string;
      }[]
    | [];
};

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prevLocation = location.pathname.split("/").slice(0, 3).join("/");
  const breadcrumbItems = [{title: title_page, link: prevLocation}];

  const form = useForm<DataFormValue>({
    resolver: zodResolver(formSchema),
  });
  const {
    fields: section2Fields,
    append: appendSection2,
    remove: removeSection2,
  } = useFieldArray({name: "section2.tab", control: form.control});
  const {
    fields: section4Fields,
    append: appendSection4,
    remove: removeSection4,
  } = useFieldArray({name: "section4", control: form.control});

  const {mutate, isLoading} = useMutation(
    async (payload: Payload) => await ApiService.secure().post("/home", payload),
    {
      onSettled: (response) =>
        settledHandler({
          response,
          contextAction: "Create",
          onFinish: () => {
            navigate(prevLocation);
            getDetails();
          },
        }),
    }
  );
  const {data: relatedBussines} = useQuery({
    queryKey: ["business", 999],
    queryFn: async () => await getContent({pageIndex: 0, pageSize: 999, type: CONTENT_TYPE.BUSINESS}),
  });
  const {data: relatedNews} = useQuery({
    queryKey: ["news", 999],
    queryFn: async () => await getContent({pageIndex: 0, pageSize: 999, type: CONTENT_TYPE.NEWS}),
  });

  const onSubmit = async (data: DataFormValue) => {
    try {
      const banner = combineImageMultiLang(data.banner_en, data.banner_id);

      mutate({
        banner: banner,
        meta_title: {
          en: data.meta_title.en,
          id: data.meta_title.id,
        },
        meta_description: {
          en: data.meta_description.en,
          id: data.meta_description.id,
        },
        section2: {
          tab: data.section2.tab.map((item) => ({
            title: {
              en: item.title.en,
              id: item.title.id,
            },
            image: item.image,
            content: item.content,
          })),
          title: {
            en: data.section2.title.en,
            id: data.section2.title.id,
          },
        },
        section3: {
          title: {
            en: data.section3.title.en,
            id: data.section3.title.id,
          },
          small_text: {
            en: data.section3.small_text.en,
            id: data.section3.small_text.id,
          },
        },
        section4: data.section4.map((item) => ({
          tab: {
            en: item.tab.en,
            id: item.tab.id,
          },
          title: {
            en: item.title.en,
            id: item.title.id,
          },
          description: {
            en: item.description.en,
            id: item.description.id,
          },
          image: item.image,
        })),
        section5: {
          button_name: {
            en: data.section5.button_name.en,
            id: data.section5.button_name.id,
          },
          button_route: data.section5.button_route,
          title: {
            en: data.section5.title.en,
            id: data.section5.title.id,
          },
          content: data.section5.content,
        },
      });
    } catch (error: any) {
      toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
    }
  };
  const getDetails = async () => {
    try {
      const response = await ApiService.secure().get("/home");

      if (response.data.status !== 200) {
        throw new Error(response.data.message);
      }

      const result = response.data.data as HomeType | null;

      if (result) {
        form.reset({
          meta_description: {
            en: result.meta_description.en,
            id: result.meta_description.id,
          },
          meta_title: {
            en: result.meta_title.en,
            id: result.meta_title.id,
          },
          banner_en: result.banner.map((img) => img.en) || [],
          banner_id: result.banner.map((img) => img.id) || [],
          section2: {
            title: {
              en: result.section2.title.en,
              id: result.section2.title.id,
            },
            tab: result.section2.tab.map((item) => ({
              title: {
                en: item.title.en,
                id: item.title.id,
              },
              content: item.content,
              image: item.image,
            })),
          },
          section3: {
            title: {
              en: result.section3.title.en,
              id: result.section3.title.id,
            },
            small_text: {
              en: result.section3.small_text.en,
              id: result.section3.small_text.id,
            },
          },
          section4: result.section4.map((item) => ({
            title: {
              en: item.title.en,
              id: item.title.id,
            },
            description: {
              en: item.description.en,
              id: item.description.id,
            },
            tab: {
              en: item.tab.en,
              id: item.tab.id,
            },
            image: item.image,
          })),
          section5: {
            button_name: {
              en: result.section5.button_name.en,
              id: result.section5.button_name.id,
            },
            button_route: result.section5.button_route,
            title: {
              en: result.section5.title.en,
              id: result.section5.title.id,
            },
            content: result.section5.content,
          },
        });
      }
    } catch (error: any) {
      toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
    }
  };

  const idToContent = (ids: string[], data: ContentType[] | []) => {
    if (!ids?.length || !data?.length) {
      return [];
    }

    let result: ContentType[] = [];

    for (let i = 0; i < ids.length; i++) {
      const currentValue = ids[i];
      const foundContent = data.find((content) => content._id === currentValue);

      if (foundContent) {
        result.push(foundContent);
      }
    }

    return result.map((item) => ({label: item.title.en, value: item._id}));
  };

  const getContent = async ({pageIndex, pageSize, type}: {pageIndex: number; pageSize: number; type: string}) => {
    try {
      let quries: any = {
        page: pageIndex + 1,
        limit: pageSize,
        type: type,
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
          {/* meta */}
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

          {/* banner */}
          <React.Fragment>
            <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Banner</h4>
            <Controller
              control={form.control}
              name={"banner_en"}
              render={({field}) => {
                return (
                  <ImageRepository
                    extraField="Extra"
                    label="Banner (EN)"
                    limit={10}
                    showButtonRoute
                    img_type={IMG_TYPE.HOME}
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
              name={"banner_id"}
              render={({field}) => {
                return (
                  <ImageRepository
                    label="Banner (ID)"
                    extraField="Extra"
                    limit={10}
                    showButtonRoute
                    img_type={IMG_TYPE.HOME}
                    value={field.value?.length ? field.value : []}
                    onChange={(data) => {
                      let value = data.map((img) => img._id);
                      field.onChange(value);
                    }}
                  />
                );
              }}
            />
          </React.Fragment>

          {/* our bussines */}
          <React.Fragment>
            <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Our Bussines</h4>
            <Controller
              control={form.control}
              name="section2.title.en"
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
              name="section2.title.id"
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
            {/* tab section 2 */}
            <section className="p-4 space-y-6 border">
              <p>Tab List</p>
              {section2Fields.map((item, index) => (
                <div key={item.id} className="pb-8 space-y-4 border-b border-primary/10 ">
                  <div className="flex justify-between space-x-4">
                    <Controller
                      control={form.control}
                      name={`section2.tab.${index}.title.en`}
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
                      <PopConfirm onOk={() => removeSection2(index)}>
                        <Button type="button" variant="destructive">
                          <Trash size={14} />
                        </Button>
                      </PopConfirm>
                    </div>
                  </div>
                  <Controller
                    control={form.control}
                    name={`section2.tab.${index}.title.id`}
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
                        {error?.message ? (
                          <p className="text-xs font-medium text-destructive">{error?.message}</p>
                        ) : null}
                      </div>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name={`section2.tab.${index}.image`}
                    render={({field}) => {
                      return (
                        <ImageRepository
                          label="Image"
                          limit={1}
                          mobileSize={false}
                          img_type={IMG_TYPE.HOME}
                          value={field.value?.length ? [field.value] : []}
                          onChange={(data) => {
                            let value = data.map((img) => img._id);
                            if (value.length) {
                              field.onChange(value[0]);
                            }
                          }}
                        />
                      );
                    }}
                  />
                  <Controller
                    control={form.control}
                    name={`section2.tab.${index}.content`}
                    render={({field, fieldState: {error}}) => (
                      <div className="flex flex-col space-y-2">
                        <label
                          htmlFor={field.name}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Related Bussines
                        </label>
                        <MultipleSelector
                          placeholder="Select item"
                          maxSelected={10}
                          onChange={(option) => {
                            field.onChange(option.map((item) => item.value));
                          }}
                          emptyIndicator="No related contents"
                          value={idToContent(field.value, relatedBussines || [])}
                          options={relatedBussines?.map((option) => {
                            return {
                              label: option.title.en,
                              value: option._id,
                            };
                          })}
                        />
                        {error?.message ? (
                          <p className="text-xs font-medium text-destructive">{error?.message}</p>
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
                  onClick={() => appendSection2({title: {en: "", id: ""}, content: [], image: ""})}
                >
                  Add Tab
                </Button>
              </div>
            </section>
          </React.Fragment>

          {/* map */}
          <React.Fragment>
            <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Map Section</h4>
            <Controller
              control={form.control}
              name={`section3.title.en`}
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
                  {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
                </div>
              )}
            />
            <Controller
              control={form.control}
              name={`section3.title.id`}
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
              name={`section3.small_text.en`}
              render={({field, fieldState: {error}}) => (
                <div className="flex flex-col w-full space-y-2">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Small Text (EN)
                  </label>
                  <Input
                    id={field.name}
                    ref={field.ref}
                    type="text"
                    placeholder="Enter small text"
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
              name={`section3.small_text.id`}
              render={({field, fieldState: {error}}) => (
                <div className="flex flex-col w-full space-y-2">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Small Text (ID)
                  </label>
                  <Input
                    id={field.name}
                    ref={field.ref}
                    type="text"
                    placeholder="Enter small text"
                    disabled={isLoading}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                  {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
                </div>
              )}
            />
          </React.Fragment>

          {/* Investor Relations */}
          <React.Fragment>
            <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Investor Relations</h4>
            <section className="p-4 space-y-6 border">
              {section4Fields.map((item, index) => (
                <div key={item.id} className="pb-8 space-y-4 border-b border-primary/10 ">
                  <div className="flex justify-between space-x-4">
                    <Controller
                      control={form.control}
                      name={`section4.${index}.tab.en`}
                      render={({field, fieldState: {error}}) => (
                        <div className="flex flex-col w-full space-y-2">
                          <label
                            htmlFor={field.name}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Tab (EN)
                          </label>
                          <Input
                            id={field.name}
                            ref={field.ref}
                            type="text"
                            placeholder="Enter tab"
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
                      <PopConfirm onOk={() => removeSection4(index)}>
                        <Button type="button" variant="destructive">
                          <Trash size={14} />
                        </Button>
                      </PopConfirm>
                    </div>
                  </div>
                  <Controller
                    control={form.control}
                    name={`section4.${index}.tab.id`}
                    render={({field, fieldState: {error}}) => (
                      <div className="flex flex-col w-full space-y-2">
                        <label
                          htmlFor={field.name}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Tab (ID)
                        </label>
                        <Input
                          id={field.name}
                          ref={field.ref}
                          type="text"
                          placeholder="Enter tab"
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
                  <Controller
                    control={form.control}
                    name={`section4.${index}.title.en`}
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
                  <Controller
                    control={form.control}
                    name={`section4.${index}.title.id`}
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
                        {error?.message ? (
                          <p className="text-xs font-medium text-destructive">{error?.message}</p>
                        ) : null}
                      </div>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name={`section4.${index}.description.en`}
                    render={({field, fieldState: {error}}) => (
                      <div className="flex flex-col w-full space-y-2">
                        <label
                          htmlFor={field.name}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Description (EN)
                        </label>
                        <Ckeditor5
                          ref={field.ref}
                          onBlur={field.onBlur}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Enter Body"
                        />
                        {error?.message ? (
                          <p className="text-xs font-medium text-destructive">{error?.message}</p>
                        ) : null}
                      </div>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name={`section4.${index}.description.id`}
                    render={({field, fieldState: {error}}) => (
                      <div className="flex flex-col w-full space-y-2">
                        <label
                          htmlFor={field.name}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Description (ID)
                        </label>
                        <Ckeditor5
                          ref={field.ref}
                          onBlur={field.onBlur}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Enter Body"
                        />
                        {error?.message ? (
                          <p className="text-xs font-medium text-destructive">{error?.message}</p>
                        ) : null}
                      </div>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name={`section4.${index}.image`}
                    render={({field}) => {
                      return (
                        <ImageRepository
                          label="Image"
                          limit={1}
                          mobileSize={false}
                          showButtonRoute
                          img_type={IMG_TYPE.HOME}
                          value={field.value?.length ? [field.value] : []}
                          onChange={(data) => {
                            let value = data.map((img) => img._id);
                            if (value.length) {
                              field.onChange(value[0]);
                            }
                          }}
                        />
                      );
                    }}
                  />
                </div>
              ))}

              <div className="">
                <Button
                  className={cn({
                    "mt-2": section4Fields.length > 0,
                  })}
                  type="button"
                  onClick={() =>
                    appendSection4({
                      title: {en: "", id: ""},
                      description: {en: "", id: ""},
                      image: "",
                      tab: {en: "", id: ""},
                    })
                  }
                >
                  Add Tab
                </Button>
              </div>
            </section>
          </React.Fragment>

          {/* news section */}
          <React.Fragment>
            <h4 className="pb-2 text-lg font-medium border-b border-primary/10">News Section</h4>
            <Controller
              control={form.control}
              name={`section5.title.en`}
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
                  {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
                </div>
              )}
            />
            <Controller
              control={form.control}
              name={`section5.title.id`}
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
              name={`section5.button_name.en`}
              render={({field, fieldState: {error}}) => (
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
                  {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
                </div>
              )}
            />
            <Controller
              control={form.control}
              name={`section5.button_name.id`}
              render={({field, fieldState: {error}}) => (
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
                  {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
                </div>
              )}
            />
            <Controller
              control={form.control}
              name={`section5.button_route`}
              render={({field, fieldState: {error}}) => (
                <div className="flex flex-col w-full space-y-2">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Route
                  </label>
                  <Input
                    id={field.name}
                    ref={field.ref}
                    type="text"
                    placeholder="Enter route"
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
              name={`section5.content`}
              render={({field, fieldState: {error}}) => (
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Related News
                  </label>
                  <MultipleSelector
                    placeholder="Select item"
                    maxSelected={10}
                    onChange={(option) => {
                      field.onChange(option.map((item) => item.value));
                    }}
                    emptyIndicator="No related contents"
                    value={idToContent(field.value, relatedNews || [])}
                    options={relatedNews?.map((option) => {
                      return {
                        label: option.title.en,
                        value: option._id,
                      };
                    })}
                  />
                  {error?.message ? <p className="text-xs font-medium text-destructive">{error?.message}</p> : null}
                </div>
              )}
            />
          </React.Fragment>

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
