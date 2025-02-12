// hook
import React, {useEffect, useRef, useState} from "react";
import {useForm} from "react-hook-form";

// component
import {Button} from "./ui/button";
import {Check, MoreHorizontal, Pencil, Plus, Trash, Upload} from "lucide-react";
import {Dialog, DialogContent} from "./ui/dialog";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "./ui/tabs";
import {Input} from "./ui/input";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "./ui/form";

// utils
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import settledHandler from "@/helper/settledHandler";
import {UseInfiniteQueryResult, useInfiniteQuery, useMutation} from "react-query";
import ApiService from "@/lib/ApiService";
import {ImageItemType, TODO} from "@/types";
import ImageServices from "@/services/image";
import ToastBody from "./ToastBody";
import {toast} from "react-toastify";
import {cn} from "@/lib/utils";
import autoAnimate from "@formkit/auto-animate";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {useDebounce} from "./ui/MultipleSelector";
import {Carousel, CarouselContent, CarouselItem} from "./ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const limit_table = 20;

interface Props {
  img_type: string;
  mobileSize?: boolean;
  label: string;
  onChange: (images: ImageItemType[]) => void;
  value: string[] | [];
  limit?: number;
  showButtonRoute?: boolean;
  extraField?: string;
  size?: "sm" | "md" | "lg";
}

interface ImageItemProps {
  image: ImageItemType;
  selected?: boolean;
  extraField?: string;
  showButtonRoute?: boolean;
  type: "thumbnail" | "crud";
  refetch: () => void;
  setSelectedImage: React.Dispatch<React.SetStateAction<ImageItemType[]>>;
  limit?: number;
  totalImage: number;
  mobileSize: boolean;
}

interface ImageRepositoryUploadProps {
  extraField?: string;
  handleFinish: () => void;
  showButtonRoute?: boolean;
  img_type?: string;
  update?: boolean;
  data?: ImageItemType;
  mobileSize: boolean;
}

const ImageRepositoryUpload: React.FC<ImageRepositoryUploadProps> = ({
  handleFinish,
  img_type,
  data,
  mobileSize,
  update,
  showButtonRoute,
  extraField,
}) => {
  let endpoint = update ? "/image/edit" : "/image";

  type UserFormValue = z.infer<typeof formSchema>;
  const formSchema = z.object({
    title: z.string({required_error: "Field required"}).min(0).default(" "),
    description: z.string({required_error: "Field required"}).min(0).default(""),
    button_name: z.string({required_error: "Field required"}).min(0).default(""),
    button_route: z.string({required_error: "Field required"}).min(0).default("/"),
    is_embedded_video: z.boolean().default(false),
  });

  const [selectedFile, setSelectedFile] = useState<HTMLInputElement["files"]>(null);
  const [showRequiredFile, setShowRequiredFile] = useState(false);

  const [selectedFileMobile, setSelectedFileMobile] = useState<HTMLInputElement["files"]>(null);
  const [showRequiredFileMobile, setShowRequiredFileMobile] = useState(false);

  const [desktopPreview, setDesktopPreview] = useState<string>();
  const [mobilePreview, setMobilePreview] = useState<string>();

  const {isLoading, mutate} = useMutation(async (data: TODO) => await ApiService.post(endpoint, data), {
    onSettled: (response: TODO) =>
      settledHandler({
        response,
        success: {
          title: "Image Uploaded!",
          description: " ",
        },
        onFinish: () => {
          setSelectedFile(null);
          setSelectedFileMobile(null);
          setDesktopPreview(undefined);
          setMobilePreview(undefined);

          form.reset({
            title: "",
            description: "",
          });

          handleFinish();
        },
      }),
  });

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
  });
  const isUseEmbedVideo = form.watch("is_embedded_video");

  const onSubmit = (payload: UserFormValue) => {
    if (!desktopPreview) {
      setShowRequiredFile(true);
      return;
    }

    if (mobileSize && !mobilePreview) {
      setShowRequiredFileMobile(true);
      return;
    }

    const formData = new FormData();

    formData.append("title", payload.title);
    formData.append("description", payload.description);
    formData.append("type", String(img_type));
    formData.append("button_name", payload.button_name);
    formData.append("button_route", payload.button_route);
    formData.append("is_embedded_video", payload.is_embedded_video ? "1" : "0");

    if (update && data) {
      formData.append("image_id", data?._id);
    }

    if (selectedFile) {
      formData.append("files", selectedFile[0]);
    }

    if (!selectedFile && update && data) {
      formData.append("images", JSON.stringify(data.images[0]));
    }

    if (selectedFileMobile) {
      formData.append("files_mobile", selectedFileMobile[0]);
    }

    if (!selectedFileMobile && update && data) {
      formData.append("images_mobile", JSON.stringify(data.images_mobile[0]));
    }

    // if (selectedFile) {
    //   // new file
    //   formData.append("files", selectedFile[0]);
    //   if (!mobileSize) {
    //     formData.append("files_mobile", selectedFile[0]);
    //   }
    // } else {
    //   if (update && data) {
    //     formData.append("images", JSON.stringify(data.images[0]));
    //     if (!mobileSize) {
    //       formData.append("images_mobile", JSON.stringify(data.images[0]));
    //     }
    //   }
    // }

    // if (mobileSize && selectedFileMobile) {
    //   formData.append("files_mobile", selectedFileMobile[0]);
    // } else {
    //   if (update && data) {
    //     formData.append("images_mobile", JSON.stringify(data.images_mobile[0]));
    //   }
    // }

    mutate(formData);
  };

  useEffect(() => {
    if (update) {
      form.reset(data);
      setDesktopPreview(data?.images[0].url);
      setMobilePreview(data?.images_mobile[0].url);
    }
  }, [update]);

  return (
    <Form {...form}>
      <form className="w-full space-y-2">
        <FormField
          control={form.control}
          name="title"
          render={({field}) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter title" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <FormField
          control={form.control}
          name="is_embedded_video"
          render={({field}) => (
            <FormItem>
              <div className="space-y-0.5">
                <FormLabel>Embed Video</FormLabel>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        /> */}
        <FormField
          control={form.control}
          name="description"
          render={({field}) => (
            <FormItem>
              <FormLabel>{isUseEmbedVideo ? "Video URL" : "Description"}</FormLabel>
              <FormControl>
                <Input placeholder="Enter description" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {extraField?.length ? (
          <section className="grid grid-cols-1 space-x-4">
            <FormField
              control={form.control}
              name="button_name"
              render={({field}) => (
                <FormItem>
                  <FormLabel>{extraField}</FormLabel>
                  <FormControl>
                    <Input placeholder={`Enter ${extraField.toLocaleLowerCase()}`} disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>
        ) : null}

        {showButtonRoute ? (
          <FormField
            control={form.control}
            name="button_route"
            render={({field}) => (
              <FormItem>
                <FormLabel>Link (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter button route" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <section className="flex items-center gap-4">
          <section className="w-full">
            <label className="block pt-1 pb-3 text-sm font-medium leading-none">Desktop Size</label>
            <section className="h-[120px]   w-full flex justify-center  border-dashed border-2 border-gray-400 rounded-lg items-center mx-auto text-center cursor-pointer">
              <label htmlFor="picture" className="flex items-center justify-center w-full h-full">
                <div className="flex flex-col items-center justify-center">
                  <Upload />
                  <span className="mt-1 font-semibold text-md">Upload picture</span>
                  <p className="text-sm font-normal text-gray-400 md:px-6">
                    Choose photo size should be less than <b className="text-gray-600">1MB</b>
                  </p>
                  {selectedFile?.length ? (
                    <p className="text-sm font-normal text-gray-400 md:px-6">{selectedFile[0].name}</p>
                  ) : null}
                </div>
              </label>

              <Input
                onChange={(e) => {
                  if (e.target.files?.length) {
                    setSelectedFile(e.target.files);
                    if (!mobileSize) {
                      setSelectedFileMobile(e.target.files);
                    }
                    setShowRequiredFile(false);
                    setDesktopPreview(URL.createObjectURL(e.target.files[0]));
                  }
                }}
                className="hidden"
                id="picture"
                type="file"
              />
            </section>
            {showRequiredFile ? <p className="mt-2 text-xs font-medium text-destructive">Image required</p> : null}
          </section>
          <div className="relative flex flex-col gap-2">
            <p>Preview Image</p>
            <img
              className="max-w-[80px] md:max-w-[120px] aspect-square object-cover"
              src={desktopPreview || "/images/image-404.jpg"}
              alt=""
            />
            {selectedFileMobile || mobilePreview ? (
              <Button
                onClick={() => {
                  setDesktopPreview(undefined);
                  setSelectedFile(null);
                }}
                variant={"destructive"}
                className="absolute bottom-0 w-full rounded-none"
              >
                Remove
              </Button>
            ) : null}
          </div>
        </section>

        {mobileSize ? (
          <section className="flex items-center gap-4">
            <section className="w-full">
              <label className="block pt-1 pb-3 text-sm font-medium leading-none">Mobile Size</label>
              <section className="h-[120px]   w-full flex justify-center  border-dashed border-2 border-gray-400 rounded-lg items-center mx-auto text-center cursor-pointer">
                <label htmlFor="picture-mobile" className="flex items-center justify-center w-full h-full">
                  <div className="flex flex-col items-center justify-center">
                    <Upload />
                    <span className="mt-1 font-semibold text-md">Upload picture</span>
                    <p className="text-sm font-normal text-gray-400 md:px-6">
                      Choose photo size should be less than <b className="text-gray-600">1MB</b>
                    </p>
                    {selectedFileMobile?.length ? (
                      <p className="text-sm font-normal text-gray-400 md:px-6">{selectedFileMobile[0].name}</p>
                    ) : null}
                  </div>
                </label>
                <Input
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      setSelectedFileMobile(e.target.files);
                      setShowRequiredFileMobile(false);
                      setMobilePreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className="hidden"
                  id="picture-mobile"
                  type="file"
                />
              </section>
              {showRequiredFileMobile ? (
                <p className="mt-2 text-xs font-medium text-destructive">Image required</p>
              ) : null}
            </section>

            <div className="relative flex flex-col gap-2">
              <p>Preview Image</p>
              <img
                className="max-w-[80px] md:max-w-[120px] aspect-square object-cover"
                src={mobilePreview || "/images/image-404.jpg"}
                alt=""
              />

              {selectedFileMobile || mobilePreview ? (
                <Button
                  onClick={() => {
                    setMobilePreview(undefined);
                    setSelectedFileMobile(null);
                  }}
                  variant={"destructive"}
                  className="absolute bottom-0 w-full rounded-none"
                >
                  Remove
                </Button>
              ) : null}
            </div>
          </section>
        ) : null}

        <div className="flex justify-center gap-2 pt-4">
          <Button variant="outline" disabled={isLoading} isLoading={isLoading} type="button">
            Close
          </Button>
          <Button disabled={isLoading} isLoading={isLoading} type="button" onClick={form.handleSubmit(onSubmit)}>
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};

const ImageItem: React.FC<ImageItemProps> = ({
  setSelectedImage,
  image,
  selected,
  type,
  refetch,
  limit,
  totalImage,
  mobileSize,
  extraField,
  showButtonRoute,
}) => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const {mutate} = useMutation({
    mutationFn: async (data: {image_id: string[]}) => await ApiService.secure().delete("/image", data),
    onSettled: async (response) =>
      settledHandler({
        response,
        contextAction: "Delete",
        onFinish: () => {
          refetch();
          setSelectedImage((prev) => prev.filter((img) => img._id !== image._id));
        },
      }),
  });

  const handleSelect = () => {
    if (type === "crud") {
      // to unselect
      if (selected) {
        setSelectedImage((prev) => prev.filter((img) => img._id !== image._id));
      } else {
        if (limit !== undefined) {
          if (totalImage < limit) {
            setSelectedImage((prev) => [...prev, image]);
          }
        } else {
          setSelectedImage((prev) => [...prev, image]);
        }
      }
    }
  };

  const handleRemove = () => {
    if (type === "thumbnail") {
      setSelectedImage((prev) => prev.filter((img) => img._id !== image._id));
    } else {
      setShowDelete(true);
    }
  };

  const handleUpdate = () => {
    setShowUpdate(true);
  };

  return (
    <React.Fragment>
      <div key={image._id} className={cn("w-full h-full rounded-[--radius] cursor-pointer")}>
        <div className="relative">
          {selected && (
            <div
              onClick={handleSelect}
              className="absolute z-20 p-2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-xl left-1/2 top-1/2 bg-primary"
            >
              <Check color="black" size={14} />
            </div>
          )}
          <img
            onClick={handleSelect}
            className={cn("object-cover w-full h-full aspect-square", selected && "brightness-50")}
            src={image.images[0].url}
            alt=""
          />
          <p
            className={cn(
              {
                "bg-red-500": image.is_embedded_video,
                "bg-slate-500": !image.is_embedded_video,
              },
              "text-[10px] p-1 uppercase absolute left-0 top-0 font-bold tracking-wider"
            )}
          >
            {image.is_embedded_video ? "Video" : "Image"}
          </p>
          <div className="absolute top-0 right-0 flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="w-8 h-8 p-0 rounded-r-none">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={handleUpdate}
                  className="flex gap-2 font-medium cursor-pointer hover:underline"
                >
                  <Pencil className="w-[8px] lg:w-[12px]" /> Update
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleRemove}
                  className="flex gap-2 font-medium cursor-pointer text-destructive hover:underline"
                >
                  <Trash className="w-[8px] lg:w-[12px]" /> {type === "thumbnail" ? "Remove" : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center mt-1 space-x-1">
          <p className="text-[10px]">{image.title}</p>
        </div>
      </div>

      <AlertDialog open={showDelete} onOpenChange={(state) => setShowDelete(state)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. br This will permanently delete <br /> from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                mutate({image_id: [image._id]});
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showUpdate} onOpenChange={(open) => setShowUpdate(open)}>
        <DialogContent className="">
          <ImageRepositoryUpload
            extraField={extraField}
            mobileSize={mobileSize}
            showButtonRoute={showButtonRoute}
            handleFinish={() => {
              refetch();
              setShowUpdate(false);
            }}
            img_type={image.type}
            update
            data={image}
          />
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

const ImageRepository: React.FC<Props> = ({
  label,
  onChange,
  value,
  img_type,
  limit,
  size = "lg",
  mobileSize = true,
  showButtonRoute,
  extraField,
}) => {
  const IMAGE_TYPE = img_type;
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageItemType[]>([]);
  const parentRef = useRef(null);
  const [search, setSearch] = useState("");
  const searchDebounce = useDebounce(search, 500);

  const {data, hasNextPage, isLoading, fetchNextPage, refetch}: UseInfiniteQueryResult<ImageItemType[] | []> =
    useInfiniteQuery({
      queryKey: ["images", IMAGE_TYPE, searchDebounce],
      queryFn: ({pageParam = 1}) => getImages({page: pageParam}),
      getNextPageParam: (lastPage, allPages) => {
        const nextPage = lastPage?.length === limit_table ? allPages.length + 1 : undefined;
        return nextPage;
      },
    });

  const getImages = async ({page}: {page: number}) => {
    try {
      const response = await ImageServices.get({
        page: page,
        limit: limit_table,
        query: searchDebounce,
        type: img_type,
      });

      if (response.data.status !== 200) {
        throw new Error(response.data.err);
      }

      return response.data.data;
    } catch (error: any) {
      toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
    }
  };

  const handleFinish = () => {
    refetch();
  };

  useEffect(() => {
    parentRef.current && autoAnimate(parentRef.current);
  }, [parentRef]);

  useEffect(() => {
    onChange(selectedImage);
  }, [selectedImage]);

  useEffect(() => {
    const getImagesValue = async () => {
      try {
        const response = await ImageServices.get({
          page: 1,
          limit: value.length,
          ids: value.join(","),
          type: img_type,
        });

        if (response.data.status !== 200) {
          throw new Error(response.data.err);
        }

        if (value.length) {
          setSelectedImage(response.data.data);
        }
        return response.data.data;
      } catch (error: any) {
        toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
      }
    };

    if (value.length && !selectedImage.length) {
      getImagesValue();
    }
  }, [value]);

  return (
    <React.Fragment>
      <section className="w-full">
        <label
          htmlFor=""
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label} {limit ? `(Max: ${limit} ${limit > 1 ? "Images" : "Image"})` : null}
        </label>
        <section className="p-5 mt-2 border">
          <section
            ref={parentRef}
            className={cn({
              "grid grid-cols-2 gap-5 md:grid-cols-6 lg:grid-cols-10": size === "lg",
              "grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-6": size === "md",
              "grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4": size === "sm",
            })}
          >
            {selectedImage.map((img) => {
              return (
                <ImageItem
                  extraField={extraField}
                  mobileSize={mobileSize}
                  showButtonRoute={showButtonRoute}
                  totalImage={selectedImage.length}
                  refetch={refetch}
                  image={{...img, type: img_type}}
                  setSelectedImage={setSelectedImage}
                  type="thumbnail"
                />
              );
            })}

            <section>
              <div
                onClick={() => setOpen((prev) => !prev)}
                className="w-full border cursor-pointer rounded-[--radius] flex gap-2 flex-col justify-center items-center aspect-square relative"
              >
                <Button type="button" variant="secondary">
                  <Plus size="14" />
                </Button>
                <span className="text-[10px]">Add Image</span>
              </div>
              {selectedImage.length ? <p className="text-[10px] mt-1 opacity-0">-</p> : null}
            </section>
          </section>
        </section>
      </section>

      <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
        <DialogContent className=" lg:min-w-[800px]">
          <Tabs defaultValue="media" className="">
            <TabsList>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="media">Media Library</TabsTrigger>
            </TabsList>
            <TabsContent
              className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0 ring-transparent"
              value="upload"
            >
              <ImageRepositoryUpload
                extraField={extraField}
                mobileSize={mobileSize}
                showButtonRoute={showButtonRoute}
                handleFinish={handleFinish}
                img_type={img_type}
              />
            </TabsContent>
            <TabsContent
              className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0 ring-transparent"
              value="media"
            >
              <div className="pt-2 pb-4">
                <Input onChange={(e) => setSearch(e.target.value)} value={search} placeholder="Search image name" />
              </div>
              <section className=" max-h-[320px] overflow-y-auto">
                <section className="grid grid-cols-3 gap-5 lg:grid-cols-5">
                  {data?.pages?.map((page) =>
                    page.map((image) => (
                      <ImageItem
                        extraField={extraField}
                        mobileSize={mobileSize}
                        showButtonRoute={showButtonRoute}
                        refetch={refetch}
                        image={{...image, type: img_type}}
                        type="crud"
                        setSelectedImage={setSelectedImage}
                        selected={!!selectedImage.find((img) => img._id === image._id)}
                        limit={limit}
                        totalImage={selectedImage.length}
                      />
                    ))
                  )}
                </section>
                {hasNextPage ? (
                  <div className="flex justify-center mt-4">
                    <Button type="button" onClick={() => fetchNextPage()} isLoading={isLoading}>
                      Load more
                    </Button>
                  </div>
                ) : null}

                {!data?.pages[0].length ? <p>No image available.</p> : null}
              </section>

              {selectedImage.length ? (
                <section className="mt-4 border-t-2 ">
                  <span className="block py-2">
                    Selected Item ({selectedImage.length}) {label}{" "}
                    {limit ? `(Max: ${limit} ${limit > 1 ? "Images" : "Image"})` : null}
                  </span>
                  <section>
                    <Carousel opts={{dragFree: true}}>
                      <CarouselContent>
                        {selectedImage.map((image) => (
                          <CarouselItem key={image._id} className="basis-1/3 lg:basis-1/6">
                            <ImageItem
                              extraField={extraField}
                              showButtonRoute={showButtonRoute}
                              mobileSize={mobileSize}
                              refetch={refetch}
                              image={{...image, type: img_type}}
                              type="thumbnail"
                              setSelectedImage={setSelectedImage}
                              selected={!!selectedImage.find((img) => img._id === image._id)}
                              totalImage={selectedImage.length}
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  </section>
                </section>
              ) : null}

              <section className="flex justify-center gap-4 mt-4">
                <Button
                  disabled={!selectedImage.length}
                  type="button"
                  className="w-20"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  Finish
                </Button>
              </section>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default ImageRepository;
