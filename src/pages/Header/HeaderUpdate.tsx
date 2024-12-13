// hook
import {Controller, FormProvider, useFieldArray, useForm, useFormContext} from "react-hook-form";
import {useMutation} from "react-query";
import {useLocation, useNavigate, useParams} from "react-router-dom";

// component
import Breadcrumb from "@/components/Breadcrumb";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {Switch} from "@/components/ui/switch";

// utils
import settledHandler from "@/helper/settledHandler";
import ApiService from "@/lib/ApiService";
import {zodResolver} from "@hookform/resolvers/zod";
import React, {useEffect} from "react";
import {z} from "zod";
import {ChevronUp, Grip} from "lucide-react";
import {DragDropContext, Draggable, Droppable, OnDragEndResponder} from "react-beautiful-dnd";
import {cn} from "@/lib/utils";
import HeaderServices from "@/services/header";
import ToastBody from "@/components/ToastBody";
import {toast} from "react-toastify";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

const title_page = "Header";
const action_context = "Update";

const formSchema = z.object({
  name: z.object({
    en: z.string({required_error: "Field required"}).min(1),
    id: z.string({required_error: "Field required"}).min(1),
  }),
  route: z.string({required_error: "Field required"}).min(1),
  order: z.number(),
  active_status: z.boolean(),
  childs: z
    .object({
      name: z.object({
        en: z.string({required_error: "Field required"}).min(1),
        id: z.string({required_error: "Field required"}).min(1),
      }),
      route: z.string(),
      order: z.number().default(0),
    })
    .array(),
});

type DataFormValue = z.infer<typeof formSchema>;

type FormArrayTpe = {
  isLoading: boolean;
};

interface Paylod extends DataFormValue {
  header_id: string;
}

const FormArray: React.FC<FormArrayTpe> = ({isLoading}) => {
  const {control} = useFormContext();
  const {fields, append, remove, move} = useFieldArray({
    control: control,
    name: "childs",
  });

  const handleDrag: OnDragEndResponder = ({source, destination}) => {
    if (destination) {
      move(source.index, destination.index);
    }
  };

  return (
    <React.Fragment>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Sub Header
      </label>

      <section className="p-5 mt-4 border">
        <DragDropContext onDragEnd={handleDrag}>
          <Droppable droppableId="test-items">
            {(provided) => (
              <div className="flex flex-col gap-6" {...provided.droppableProps} ref={provided.innerRef}>
                {fields.map((field, index) => {
                  return (
                    <Draggable key={`test[${index}]`} draggableId={`item-${index}`} index={index}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} key={field.id} className="flex gap-4">
                          <Controller
                            control={control}
                            name={`childs.${index}.name.en`}
                            render={({field}) => (
                              <div className="flex flex-col flex-1 space-y-2">
                                <label
                                  htmlFor={`childs.${index}.name.en`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Route Name (EN)
                                </label>
                                <Input
                                  id={`childs.${index}.name.en`}
                                  ref={field.ref}
                                  type="text"
                                  placeholder="Enter route name"
                                  disabled={isLoading}
                                  value={field.value}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </div>
                            )}
                          />
                          <Controller
                            control={control}
                            name={`childs.${index}.name.id`}
                            render={({field}) => (
                              <div className="flex flex-col flex-1 space-y-2">
                                <label
                                  htmlFor={`childs.${index}.name.id`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Route Name (ID)
                                </label>
                                <Input
                                  id={`childs.${index}.name.id`}
                                  ref={field.ref}
                                  type="text"
                                  placeholder="Enter route name"
                                  disabled={isLoading}
                                  value={field.value}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </div>
                            )}
                          />
                          <Controller
                            control={control}
                            name={`childs.${index}.route`}
                            render={({field}) => (
                              <div className="flex flex-col flex-1 space-y-2">
                                <label
                                  htmlFor={`childs.${index}.route`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Route Path
                                </label>
                                <Input
                                  id={`childs.${index}.route`}
                                  ref={field.ref}
                                  type="text"
                                  placeholder="Enter route path"
                                  disabled={isLoading}
                                  value={field.value}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </div>
                            )}
                          />
                          <div className="w-[100px] mt-auto">
                            <Button
                              className="w-full"
                              type="button"
                              onClick={() => remove(index)}
                              variant={"destructive"}
                            >
                              Remove
                            </Button>
                          </div>
                          <div className="mt-auto" {...provided.dragHandleProps}>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Button type="button">
                                    <Grip />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Drag Me!</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <Button
            type="button"
            className={cn(fields.length && "mt-5")}
            onClick={() => append({name: "", order: 0, route: ""})}
          >
            Add Field
          </Button>
        </DragDropContext>
      </section>
    </React.Fragment>
  );
};

const HeaderUpdate = () => {
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
    async (payload: Paylod) =>
      await ApiService.secure().post("/header/edit", {
        ...payload,
        meta_title: {
          id: "",
          en: "",
        },
        meta_description: {
          id: "",
          en: "",
        },
      }),
    {
      onSettled: (response) =>
        settledHandler({response, contextAction: "Update", onFinish: () => navigate(prevLocation)}),
    }
  );

  const onSubmit = (data: DataFormValue) => {
    data.childs = data.childs.map((child, index) => {
      return {...child, order: index};
    });
    mutate({...data, header_id: id || ""});
  };

  console.log(form.formState.errors);

  useEffect(() => {
    const getDetails = async () => {
      try {
        const response = await HeaderServices.getDetails({id: id || ""});
        if (response.data.status !== 200) {
          throw new Error(response.data.message);
        }

        form.reset({
          ...response.data.data,
        });
      } catch (error: any) {
        toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
      }
    };

    getDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
          <Controller
            control={form.control}
            name="name.en"
            render={({field, fieldState}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Route Name (EN)
                </label>
                <Input
                  id="name.en"
                  ref={field.ref}
                  type="text"
                  placeholder="Enter route name"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {fieldState.error?.message ? (
                  <p className="text-xs font-medium text-destructive">{fieldState.error?.message}</p>
                ) : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="name.id"
            render={({field, fieldState}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Route Name (ID)
                </label>
                <Input
                  id="name.en"
                  ref={field.ref}
                  type="text"
                  placeholder="Enter route name"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {fieldState.error?.message ? (
                  <p className="text-xs font-medium text-destructive">{fieldState.error?.message}</p>
                ) : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="route"
            render={({field}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="route"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Route Path
                </label>
                <Input
                  id="route"
                  ref={field.ref}
                  type="text"
                  placeholder="Enter route path"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {form?.formState?.errors?.route ? (
                  <p className="text-xs font-medium text-destructive">{form.formState.errors.route.message}</p>
                ) : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="order"
            render={({field}) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="order"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Order
                </label>
                <section className="relative flex items-center overflow-hidden">
                  <Input
                    id="order"
                    type="Name"
                    placeholder="Enter header order"
                    onKeyPress={(event) => {
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => {
                      field.onChange(+e.target.value);
                    }}
                  />
                  <div className="absolute right-0 h-full">
                    <div className="flex flex-col items-center justify-center h-full px-3 bg-white">
                      <button
                        type="button"
                        className=""
                        onClick={() => {
                          if (field.value === undefined) {
                            field.onChange(0);
                          } else {
                            field.onChange(+field.value + 1);
                          }
                        }}
                      >
                        <ChevronUp size={16} color="black" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (field.value === undefined) {
                            field.onChange(0);
                          } else {
                            if (+field.value > 0) {
                              field.onChange(+field.value - 1);
                            }
                          }
                        }}
                        className="rotate-180"
                      >
                        <ChevronUp size={16} color="black" />
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="active_status"
            defaultValue={false}
            render={({field}) => (
              <div className="flex items-center gap-2">
                <Switch id="active_status" checked={field.value} onCheckedChange={field.onChange} />
                <label
                  htmlFor="active_status"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Active Status
                </label>
              </div>
            )}
          />
          <div className="mt-2 ">
            <FormArray isLoading={isLoading} />
          </div>

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

export default HeaderUpdate;
