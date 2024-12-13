// hook
import {Controller, UseFormReturn, useFieldArray, useForm} from "react-hook-form";
import {useMutation} from "react-query";
import {useLocation, useNavigate} from "react-router-dom";

// component
import Breadcrumb from "@/components/Breadcrumb";
import ToastBody from "@/components/ToastBody";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Textarea} from "@/components/ui/textarea";

// utils
import settledHandler from "@/helper/settledHandler";
import ApiService from "@/lib/ApiService";
import PageServices from "@/services/page";
import {TODO} from "@/types";
import {zodResolver} from "@hookform/resolvers/zod";
import React, {useEffect, useState} from "react";
import {toast} from "react-toastify";
import {z} from "zod";

const title_page = "Role";
const action_context = "Create";

const formSchema = z.object({
  name: z.string({required_error: "Please Input role name"}).min(1),
  description: z.string({required_error: "Please Input description"}).min(1),
  permissions: z
    .object({
      name: z.string(),
      actions: z.object({
        create: z.boolean(),
        update: z.boolean(),
        delete: z.boolean(),
        view: z.boolean(),
      }),
    })
    .array(),
});

type RoleFormValue = z.infer<typeof formSchema>;

type RolePermissionTableType = {
  form: UseFormReturn<RoleFormValue>;
};

const RolePermissionTable: React.FC<RolePermissionTableType> = ({form}) => {
  const [selectAllState, setSelectAllState] = useState<{name: string; checked: boolean}[]>([]);

  const {fields} = useFieldArray({
    control: form.control,
    name: "permissions",
  });

  const checkboxListener = (name: string, index: number) => {
    form.setValue(`permissions.${index}.actions.view`, true);

    const currentValue = form.getValues(`permissions.${index}.actions`);
    if (currentValue.create && currentValue.update && currentValue.delete && currentValue.view) {
      selectAllHandler(name, true);
    }
  };

  const selectAllHandler = (name: string, checked: boolean | string) => {
    let override = selectAllState;
    let currentIndex = override.findIndex((state) => state.name === name);

    if (currentIndex > -1) {
      override[currentIndex].checked = !!checked;
    } else {
      override.push({name: name, checked: !!checked});
    }
    setSelectAllState(override);
  };

  return (
    <React.Fragment>
      <label>Permissions</label>
      <div className="mt-2 max-h-[400px] overflow-y-auto relative">
        <Table>
          <TableHeader className="sticky top-0 bg-[#FFFFFF] shadow-sm dark:bg-[#09090B]">
            <TableRow>
              <TableHead className="w-1/2">Page Name</TableHead>
              <TableHead>Create</TableHead>
              <TableHead>Update</TableHead>
              <TableHead>Delete</TableHead>
              <TableHead>View</TableHead>
              <TableHead>All</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell>{field.name}</TableCell>
                <TableCell>
                  <Controller
                    control={form.control}
                    name={`permissions.${index}.actions.create` as const}
                    render={({field}) => (
                      <div className="flex flex-col space-y-2">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            checkboxListener(field.name, index);
                            if (!checked) {
                              selectAllHandler(field.name, checked);
                            }
                          }}
                        />
                      </div>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Controller
                    control={form.control}
                    name={`permissions.${index}.actions.update` as const}
                    render={({field}) => (
                      <div className="flex flex-col space-y-2">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            checkboxListener(field.name, index);
                            if (!checked) {
                              selectAllHandler(field.name, checked);
                            }
                          }}
                        />
                      </div>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Controller
                    control={form.control}
                    name={`permissions.${index}.actions.delete` as const}
                    render={({field}) => (
                      <div className="flex flex-col space-y-2">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            checkboxListener(field.name, index);
                            if (!checked) {
                              selectAllHandler(field.name, checked);
                            }
                          }}
                        />
                      </div>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Controller
                    control={form.control}
                    name={`permissions.${index}.actions.view` as const}
                    render={({field}) => (
                      <div className="flex flex-col space-y-2">
                        <Checkbox
                          disabled={
                            form.getValues(`permissions.${index}`).actions.create ||
                            form.getValues(`permissions.${index}`).actions.update ||
                            form.getValues(`permissions.${index}`).actions.delete
                          }
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked)}
                        />
                      </div>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={selectAllState.find((state) => state.name === field.name)?.checked}
                    onCheckedChange={(checked) => {
                      let override = selectAllState;
                      let currentIndex = override.findIndex((state) => state.name === field.name);

                      if (currentIndex > -1) {
                        override[currentIndex].checked = !!checked;
                      } else {
                        override.push({name: field.name, checked: !!checked});
                      }

                      if (checked) {
                        form.setValue(`permissions.${index}.actions.create`, true);
                        form.setValue(`permissions.${index}.actions.update`, true);
                        form.setValue(`permissions.${index}.actions.delete`, true);
                        form.setValue(`permissions.${index}.actions.view`, true);
                      } else {
                        form.setValue(`permissions.${index}.actions.create`, false);
                        form.setValue(`permissions.${index}.actions.update`, false);
                        form.setValue(`permissions.${index}.actions.delete`, false);
                        form.setValue(`permissions.${index}.actions.view`, false);
                      }

                      setSelectAllState([]);
                      setTimeout(() => {
                        setSelectAllState(override);
                      }, 5);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </React.Fragment>
  );
};

const RoleCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prevLocation = location.pathname.split("/").slice(0, 3).join("/");
  const breadcrumbItems = [
    {title: title_page, link: prevLocation},
    {title: title_page + " " + action_context, link: location.pathname},
  ];
  const form = useForm<RoleFormValue>({
    resolver: zodResolver(formSchema),
  });

  const {mutate, isLoading} = useMutation(
    async (payload: RoleFormValue) => await ApiService.secure().post("role", payload),
    {
      onSettled: (response) =>
        settledHandler({response, contextAction: "Create", onFinish: () => navigate(prevLocation)}),
    }
  );

  const onSubmit = (data: RoleFormValue) => {
    mutate(data);
  };

  useEffect(() => {
    const getPage = async ({pageIndex, pageSize}: {pageIndex: number; pageSize: number}) => {
      try {
        const response = await PageServices.get({page: pageIndex + 1, limit: pageSize});

        if (response.data.status !== 200) {
          throw new Error(response.data.err);
        }

        let results = response.data.data;
        let formShape: TODO = [];

        results.forEach((result) => {
          formShape.push({
            name: result.name,
            actions: {
              create: false,
              update: false,
              delete: false,
              view: false,
              approval: false,
              import: false,
              export: false,
            },
          });
        });
        form.reset({permissions: formShape});
      } catch (error: any) {
        toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
      }
    };

    getPage({pageIndex: 0, pageSize: 100});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-full mt-5 space-y-4">
        <Controller
          control={form.control}
          name="name"
          render={({field}) => (
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Role Name
              </label>
              <Input
                id="name"
                ref={field.ref}
                type="text"
                placeholder="Enter role name"
                disabled={isLoading}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              />
              {form?.formState?.errors?.name ? (
                <p className="text-xs font-medium text-destructive">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
          )}
        />
        <Controller
          control={form.control}
          name="description"
          render={({field}) => (
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Description
              </label>
              <Textarea
                id="description"
                ref={field.ref}
                placeholder="Enter role description"
                className="resize-none"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              />
              {form?.formState?.errors?.description ? (
                <p className="text-xs font-medium text-destructive">{form.formState.errors.description.message}</p>
              ) : null}
            </div>
          )}
        />

        <div className="mt-2 ">
          <RolePermissionTable form={form} />
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
    </section>
  );
};

export default RoleCreate;

