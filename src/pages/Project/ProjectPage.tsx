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
import CONTENT_TYPE from "@/helper/content-type";
import PopConfirm from "@/components/PopConfirm";
import {Trash} from "lucide-react";
import React, {useEffect, useState} from "react";
import ImageMarker, {Marker} from "react-image-marker";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {cn} from "@/lib/utils";
import {ContentType} from "@/types/content";
import ToastBody from "@/components/ToastBody";
import {toast} from "react-toastify";
import Ckeditor5 from "@/components/Ckeditor5";

const title_page = "Project";

const formSchema = z.object({
  meta_title: z.string({required_error: "Field required"}).min(1),
  meta_description: z.string({required_error: "Field required"}).min(1),
  images: z.string().array().default([]),
  banner: z.string().array(),
  thumbnail_images2: z.string().array(),
  thumbnail_images: z.string().array(),
  title: z.string({required_error: "Field required"}).min(1),
  small_text: z.string().default(""),
  small_text2: z.string().default(""),
  bottom_button_route: z.string().default(""),
  description: z.string({required_error: "Field required"}).min(1),
  active_status: z.boolean().default(true),
  body: z
    .object({
      title: z.string({required_error: "Field required"}).min(1),
      button_route: z.string({required_error: "Field required"}).min(0),
      images: z.string({required_error: "Field required"}).array(),
      top: z.number().default(0),
      left: z.number().default(0),
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
  content_id?: string;
};

const ProjectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prevLocation = location.pathname.split("/").slice(0, 3).join("/");
  const breadcrumbItems = [{title: title_page, link: prevLocation}];

  const [id, setID] = useState("");
  const [mapURL, setMapURL] = useState("");

  const form = useForm<DataFormValue>({
    resolver: zodResolver(formSchema),
  });

  const {fields, append, remove} = useFieldArray({
    name: "body",
    control: form.control,
  });

  const {mutate, isLoading} = useMutation(
    async (payload: Payload) => await ApiService.secure().post(id ? "/content/edit" : "content", payload),
    {
      onSettled: (response) =>
        settledHandler({
          response,
          contextAction: "Update",
          onFinish: () => {
            navigate(prevLocation);
            getDetails();
          },
        }),
    }
  );

  const onSubmit = (data: DataFormValue) => {
    mutate({...data, type: CONTENT_TYPE.PROJECT, content_id: id, related: []});
  };
  const getDetails = async () => {
    try {
      const response = await ApiService.secure().get("/content/detail/project");

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
          small_text: result.small_text,
          small_text2: result.small_text2,
          related: result.related?.map((item) => ({label: item.title, value: item._id})),
          images: result.images.map((img) => img._id),
          bottom_button_route: result.bottom_button_route,
          thumbnail_images: result.thumbnail_images.map((img) => img._id),
          thumbnail_images2: result.thumbnail_images2.map((img) => img._id),
          banner: result.banner.map((img) => img._id),
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

  useEffect(() => {
    getDetails();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    console.log(form.formState.errors);
  }, [form.formState]);

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

          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Features Fields</h4>
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
          <Controller
            control={form.control}
            name={"thumbnail_images"}
            render={({field}) => {
              return (
                <ImageRepository
                  label="Featur image"
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

          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">Map</h4>
          <Controller
            control={form.control}
            name={"thumbnail_images2"}
            render={({field}) => {
              return (
                <ImageRepository
                  label="Map Image"
                  limit={1}
                  showButtonRoute
                  img_type={IMG_TYPE.PROJECT}
                  value={field.value?.length ? field.value : []}
                  onChange={(data) => {
                    let value = data.map((img) => img._id);
                    if (data.length) {
                      setMapURL(data[0].images[0].url);
                    }
                    field.onChange(value);
                  }}
                />
              );
            }}
          />
          <section className="p-4 space-y-6 border">
            <ImageMarker
              src={mapURL}
              markers={fields}
              onAddMarker={(marker: Marker) =>
                append({
                  top: marker.top as any,
                  left: marker.left as any,
                  title: "New Mark",
                  button_route: "",
                  images: [],
                })
              }
              markerComponent={function MarkerComponent(props: any) {
                type MarkerExtended = {
                  top: number;
                  left: number;
                  title: string;
                  button_route: string;
                  images: string[];
                };

                console.log(props);

                const [showModal, setShowModal] = useState(false);
                const [itemData, setItemData] = useState<MarkerExtended>(props);

                const handleUpdate = () => {
                  let currentData = form.getValues("body");
                  currentData[props.itemNumber] = itemData;

                  form.setValue("body", [...currentData]);
                };

                const onClose = () => {
                  setShowModal(false);
                  setItemData(props);
                };

                return (
                  <React.Fragment>
                    <div className={cn("relative flex justify-center")}>
                      <img
                        onClick={() => setShowModal((prev) => !prev)}
                        className="w-8 -translate-y-6 -translate-x-[3.5px] cursor-pointer"
                        src="/images/pin.png"
                        alt=""
                      />
                      <div className="absolute flex space-x-1 font-bold text-black translate-x-2 -top-12 min-w-max">
                        <button
                          type="button"
                          onClick={() => setShowModal((prev) => !prev)}
                          className="px-1 text-xs tracking-wider bg-primary"
                        >
                          {itemData.title}
                        </button>
                        <PopConfirm
                          onOk={() => {
                            remove(props.itemNumber);
                          }}
                        >
                          <button className="p-1 space-x-2 bg-destructive" type="button">
                            <Trash size={14} color="#fff" />
                          </button>
                        </PopConfirm>
                      </div>
                    </div>
                    <Dialog open={showModal} onOpenChange={onClose}>
                      <DialogContent className="max-w-[625px]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <p>Marker Details</p>
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 ">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-right">
                              Title
                            </Label>
                            <Input
                              id="name"
                              value={itemData.title}
                              onChange={(e) => setItemData({...itemData, title: e.target.value})}
                              placeholder="Enter title"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="link" className="text-right">
                              Link
                            </Label>
                            <Input
                              id="link"
                              value={itemData.button_route}
                              onChange={(e) => setItemData({...itemData, button_route: e.target.value})}
                              placeholder="Enter Link"
                            />
                          </div>
                          <ImageRepository
                            label="Thumbnail"
                            limit={1}
                            size="sm"
                            mobileSize={false}
                            img_type={IMG_TYPE.PROJECT}
                            value={itemData.images?.length ? itemData.images : []}
                            onChange={(data) => {
                              let value = data.map((img) => img._id);
                              setItemData({...itemData, images: value});
                            }}
                          />
                        </div>
                        <div className="flex flex-col pt-4 space-y-2">
                          <Button onClick={handleUpdate} className="w-full" type="button">
                            Save
                          </Button>
                          <Button onClick={onClose} type="button" variant="outline">
                            Close
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </React.Fragment>
                );
              }}
            />
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

export default ProjectPage;
