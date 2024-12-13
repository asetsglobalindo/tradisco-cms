// hook
import {useForm} from "react-hook-form";
import {useMutation, useQuery} from "react-query";
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
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import UserServices from "@/services/user";
import ToastBody from "@/components/ToastBody";
import {toast} from "react-toastify";
import {Switch} from "@/components/ui/switch";
import React, {useEffect, useState} from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import MainTable from "@/components/MainTable";
import {UserActifityLogType, UserAddress} from "@/types/user";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {TODO} from "@/types";
import {Textarea} from "@/components/ui/textarea";
import moment from "moment";
import {SquarePen, Trash2} from "lucide-react";
import {AlertModal} from "@/components/Modal/AlertModal";

const title_page = "User";
const action_context = "Update";

interface UserAddressModalProps {
  show: boolean;
  setShow: React.Dispatch<boolean>;
  action: "Create" | "Update";
  data?: UserAddress;
  refetch: () => void;
}

const columns: ColumnDef<UserActifityLogType>[] = [
  {
    header: "Description",
    accessorKey: "description",
  },
  {
    header: "Time",
    accessorKey: "created_at",
    cell: ({row}) => <span className="w-fit">{row.original.created_at}</span>,
  },
];

const columnsAddress: ColumnDef<UserAddress>[] = [
  {
    header: "Address Name",
    accessorKey: "name",
  },
  {
    header: "Receiver Name",
    accessorKey: "user_name",
  },
  {
    header: "Phone Number",
    accessorKey: "phone_number",
  },
  {
    header: "Province",
    accessorKey: "province",
  },
  {
    header: "City",
    accessorKey: "city",
  },
  {
    header: "District",
    accessorKey: "district",
  },

  {
    header: "Created At",
    accessorKey: "created_at",
    cell: ({row}) => <span>{moment(row.original.created_at).format("LL")}</span>,
  },
  {
    id: "actions",
    cell: ({row, table}) => <TableCallOutAddress row={row} table={table} />,
  },
];

const TableCallOutAddress: React.FC<{row: Row<UserAddress>; table: TODO}> = ({row, table}) => {
  const [showDelete, setShowDelete] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);

  const {mutate: removeUser, isLoading} = useMutation({
    mutationFn: async (data: {address_ids: string[]}) => await ApiService.secure().delete("/user/address", data),
    onSettled: async (response) =>
      settledHandler({
        response,
        contextAction: "Delete",
        onFinish: () => {
          if (table.options.meta) {
            table.options.meta.refetch();
          }
        },
      }),
  });

  return (
    <React.Fragment>
      <section className="flex justify-end w-full gap-2">
        <Button variant="secondary" onClick={() => setShowModalUpdate(true)}>
          <SquarePen size={14} />
        </Button>
        <Button variant="destructive" onClick={() => setShowDelete(true)}>
          <Trash2 size={14} />
        </Button>
      </section>

      <UserAddressModal
        show={showModalUpdate}
        setShow={setShowModalUpdate}
        action="Update"
        data={row.original}
        refetch={() => table.options.meta.refetch()}
      />

      {/* delete modal */}
      <AlertModal
        loading={isLoading}
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Are you sure want to remove ?"
        description="Alert removed item cant be undo"
        onConfirm={() => {
          let payload = {address_ids: [row.original._id]};
          removeUser(payload);
          setShowDelete(false);
        }}
      />
    </React.Fragment>
  );
};

const UsersLogs = ({endpoint}: {endpoint: string}) => {
  const limit_table = 10;
  const {id} = useParams();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [pageInfo, setPageInfo] = useState({
    totalPage: 1,
    totalData: 1,
  });
  const [pagination, setPagination] = useState({
    pageIndex: 0, // index count
    pageSize: limit_table,
  });

  const {data, isLoading, refetch} = useQuery({
    queryKey: ["user", "log", endpoint, id, pagination.pageIndex],
    queryFn: async () => await getLogs(pagination),
    enabled: !!id,
  });

  const table = useReactTable({
    data: data || [],
    columns: columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    manualPagination: true,
    manualFiltering: true,
    pageCount: pageInfo.totalPage,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    meta: {
      refetch: () => refetch(),
    },
  });

  const getLogs = async ({pageIndex, pageSize}: {pageIndex: number; pageSize: number}) => {
    try {
      const response = await ApiService.get(`${endpoint}?page=${pageIndex + 1}&limit=${pageSize}&user_id=${id || ""}`);

      if (response.data.status !== 200) {
        throw new Error(response.data.err);
      }

      setPageInfo({
        totalPage: Math.ceil(response.data.pages.total_data / limit_table),
        totalData: response.data.pages.total_data,
      });

      return response.data.data;
    } catch (error: any) {
      toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
    }
  };

  return (
    <section className="table-two-column">
      <MainTable
        hideSearch
        filterColumn="email"
        filterPlaceholder="Search user"
        table={table}
        columns={columns}
        dataLength={data?.length || 0}
        isLoading={isLoading}
        limit={limit_table}
      />
    </section>
  );
};

const UserAddressModal: React.FC<UserAddressModalProps> = ({show, setShow, refetch, action, data}) => {
  const addressSchema = z.object({
    name: z.string({required_error: "Field Required"}).min(1),
    user_name: z.string({required_error: "Field Required"}).min(1),
    address: z.string({required_error: "Field Required"}).min(1),
    province: z.string({required_error: "Field Required"}).min(1),
    district: z.string({required_error: "Field Required"}).min(1),
    urban: z.string({required_error: "Field Required"}).min(1),
    city: z.string({required_error: "Field Required"}).min(1),
    postal_code: z.string({required_error: "Field Required"}).min(1),
    phone_number: z.string({required_error: "Field Required"}).min(1),
    email: z.string({required_error: "Field Required"}).min(1),
    active_status: z.boolean(),
  });

  type DataFormValue = z.infer<typeof addressSchema>;
  type Payload = Omit<DataFormValue, "type"> & {user_id: string; type: string; address_id?: string};

  const {id} = useParams();
  const [province, setProvince] = useState<string[]>([]);
  const [city, setCity] = useState<string[]>([]);
  const [district, setDistrict] = useState<string[]>([]);
  const [urban, setUrban] = useState<string[]>([]);
  const [postalCode, setPostalCode] = useState<string[]>([]);

  const form = useForm<DataFormValue>({
    resolver: zodResolver(addressSchema),
  });
  const provinceWatch = form.watch("province");
  const districtWatch = form.watch("district");
  const urbanWatch = form.watch("urban");
  const cityWatch = form.watch("city");
  const postalCodeWatch = form.watch("postal_code");

  const {mutate, isLoading} = useMutation({
    mutationFn: async (payload: Payload) =>
      ApiService.secure().post(action === "Create" ? "/user/address" : "/user/edit-address", payload),
    onSettled: async (response) =>
      settledHandler({
        response,
        contextAction: action,
        onFinish: () => {
          setShow(false);
          refetch();
        },
      }),
  });

  const getAddress = async ({payload}: {payload: TODO}): Promise<string[] | []> => {
    try {
      const response = await ApiService.secure().post("/address", payload);

      if (response.data.status !== 200) {
        throw new Error(response.data.message);
      }
      let result: string[] | [] = response.data.data || [];
      return result;
    } catch (error: TODO) {
      toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
      return [];
    }
  };

  const onSubmit = (payload: DataFormValue) => {
    mutate({...payload, user_id: id || "", type: "destination", address_id: data?._id});
  };

  useEffect(() => {
    getAddress({
      payload: {
        all_province: true,
      },
    }).then((data: string[] | []) => {
      setProvince(data);
    });
  }, []);

  useEffect(() => {
    if (provinceWatch || data?.province) {
      getAddress({
        payload: {
          province: data?.province || provinceWatch,
        },
      }).then((data: string[] | []) => {
        setCity(data);
      });
    }

    if (cityWatch || data?.city) {
      getAddress({
        payload: {
          city: data?.city || cityWatch,
        },
      }).then((data: string[] | []) => {
        setDistrict(data);
      });
    }

    if (districtWatch || data?.district) {
      getAddress({
        payload: {
          district: data?.district || districtWatch,
        },
      }).then((data: string[] | []) => {
        setUrban(data);
      });
    }

    if ((districtWatch && urbanWatch) || (data?.district && data.urban)) {
      getAddress({
        payload: {
          district: data?.district || districtWatch,
          urban: data?.urban || urbanWatch,
        },
      }).then((data: string[] | []) => {
        setPostalCode(data);
      });
    }
  }, [provinceWatch, districtWatch, urbanWatch, cityWatch, postalCodeWatch, data]);

  useEffect(() => {
    form.reset(data);
  }, [data, form]);

  return (
    <Dialog open={show} onOpenChange={(open) => setShow(open)}>
      <DialogContent className="lg:min-w-[600px] ">
        <DialogHeader>
          <DialogTitle>
            {action} {title_page}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-2">
            <section className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="user_name"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Receiver Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter receiver name" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>
            <div className="grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="email"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>E-Mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone_number"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      id="description"
                      placeholder="Enter address"
                      className="resize-none"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="province"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <FormControl>
                      <Select
                        disabled={!province.length}
                        onValueChange={(value) => {
                          form.setValue("city", "");
                          form.setValue("district", "");
                          form.setValue("urban", "");
                          form.setValue("postal_code", "");
                          field.onChange(value);
                        }}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {province.map((data) => (
                            <SelectItem value={data}>{data}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Select
                        disabled={!city.length}
                        value={field.value}
                        onValueChange={(value) => {
                          form.setValue("district", "");
                          form.setValue("urban", "");
                          form.setValue("postal_code", "");
                          field.onChange(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {city.map((data) => (
                            <SelectItem value={data}>{data}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="district"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <FormControl>
                      <Select
                        disabled={!district.length}
                        value={field.value}
                        onValueChange={(value) => {
                          form.setValue("urban", "");
                          form.setValue("postal_code", "");
                          field.onChange(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {district.map((data) => (
                            <SelectItem value={data}>{data}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="urban"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Urban</FormLabel>
                    <FormControl>
                      <Select
                        disabled={!urban.length}
                        value={field.value}
                        onValueChange={(value) => {
                          form.setValue("postal_code", "");
                          field.onChange(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select urban" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {urban.map((data) => (
                            <SelectItem value={data}>{data}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="postal_code"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Select
                      disabled={!postalCode.length}
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select postal code" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {postalCode.map((data) => (
                          <SelectItem value={data}>{data}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active_status"
              defaultValue={false}
              render={({field}) => (
                <FormItem>
                  <div className="flex flex-row items-center gap-2 mt-4">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Active Status</FormLabel>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="flex justify-center gap-4 pt-4">
              <Button onClick={() => setShow(false)} type="button" variant="outline">
                Close
              </Button>
              <Button disabled={isLoading} isLoading={isLoading} className="flex items-center " type="submit">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const UsersAddress = () => {
  const limit_table = 10;
  const {id} = useParams();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [showModalCreate, setShowModalCreate] = useState(false);

  const [pageInfo, setPageInfo] = useState({
    totalPage: 1,
    totalData: 1,
  });

  const [pagination, setPagination] = useState({
    pageIndex: 0, // index count
    pageSize: limit_table,
  });

  const {data, isLoading, refetch} = useQuery({
    queryKey: ["user", "address", id, pagination.pageIndex],
    queryFn: async () => await getAddress(pagination),
    enabled: !!id,
  });

  const table = useReactTable({
    data: data || [],
    columns: columnsAddress,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    manualPagination: true,
    manualFiltering: true,
    pageCount: pageInfo.totalPage,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    meta: {
      refetch: () => refetch(),
    },
  });

  const getAddress = async ({pageIndex, pageSize}: {pageIndex: number; pageSize: number}) => {
    try {
      const response = await ApiService.get(`/user/addresses/${id}?page=${pageIndex + 1}&limit=${pageSize}`);

      if (response.data.status !== 200) {
        throw new Error(response.data.err);
      }

      setPageInfo({
        totalPage: Math.ceil(response.data.pages.total_data / limit_table),
        totalData: response.data.pages.total_data,
      });

      let results: UserAddress[] | [] = response.data.data;
      return results;
    } catch (error: any) {
      toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
    }
  };

  return (
    <section>
      <section className="flex my-5">
        <Button onClick={() => setShowModalCreate(true)}>Add Address</Button>
      </section>
      <MainTable
        hideSearch
        filterColumn="email"
        filterPlaceholder="Search user"
        table={table}
        columns={columnsAddress}
        dataLength={data?.length || 0}
        isLoading={isLoading}
        limit={limit_table}
      />
      <UserAddressModal show={showModalCreate} setShow={setShowModalCreate} action="Create" refetch={refetch} />
    </section>
  );
};

const User = () => {
  const formSchema = z.object({
    name: z.string({required_error: "Field Required"}).min(1),
    email: z.string({required_error: "Field Required"}).email({message: "Enter a valid email address"}),
    // password: z.string({required_error: "Field Required"}).min(1),
    phone_number: z.string({required_error: "Field Required"}).min(1),
    role_id: z.string({required_error: "Field Required"}),
    active_status: z.boolean(),
  });

  type DataFormValue = z.infer<typeof formSchema>;
  type Payload = Omit<DataFormValue, "type"> & {user_id: string};

  const {id} = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const prevLocation = location.pathname.split("/").slice(0, 3).join("/");
  const form = useForm<DataFormValue>({
    resolver: zodResolver(formSchema),
  });

  const {data: roles, isLoading: isLoadingRoles} = useQuery({
    queryKey: ["role"],
    queryFn: async () => await getRole(),
  });

  const {mutate, isLoading} = useMutation({
    mutationFn: async (payload: Payload) => ApiService.secure().post("/user/edit", payload),
    onSettled: async (response) =>
      settledHandler({
        response,
        contextAction: action_context,
        onFinish: () => {
          navigate(prevLocation);
        },
      }),
  });

  const getRole = async () => {
    try {
      const response = await UserServices.getRole({page: 1, limit: 50});

      if (response.data.status !== 200) {
        throw new Error(response.data.err);
      }

      return response.data.data;
    } catch (error: any) {
      toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
    }
  };

  const onSubmit = (data: DataFormValue) => {
    mutate({...data, user_id: id || ""});
  };

  useEffect(() => {
    const getDetails = async () => {
      try {
        const response = await UserServices.getDetails({id: id || ""});

        if (response.data.status !== 200) {
          throw new Error(response.data.message);
        }

        const user = response.data.data;
        form.reset({
          name: user.name,
          email: user.email,
          phone_number: user.phone_number,
          active_status: user.active_status,
          role_id: user.role_id,
        });
      } catch (error: any) {
        toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
      }
    };

    getDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-full mt-5 space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({field}) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="Name" placeholder="Enter your name" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({field}) => (
            <FormItem>
              <FormLabel>E-Mail</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Enter your email" disabled={isLoading} className="pr-14" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone_number"
          render={({field}) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Enter your phone number"
                  disabled={isLoading}
                  className="pr-14"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role_id"
          render={({field}) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
                  disabled={isLoadingRoles}
                >
                  <SelectTrigger value={field.value}>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles?.map((role) => (
                      <SelectItem key={role._id} value={role._id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        {/* <FormField
            control={form.control}
            name="password"
            rules={{required: false}}
            render={({field}) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <InputPassword field={field} isLoading={isLoading} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          /> */}
        <FormField
          control={form.control}
          name="active_status"
          defaultValue={false}
          render={({field}) => (
            <FormItem>
              <div className="flex flex-row items-center gap-2 mt-4">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>Active Status</FormLabel>
              </div>
              <FormMessage className="text-xs" />
            </FormItem>
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
    </Form>
  );
};

const UsersUpdate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prevLocation = location.pathname.split("/").slice(0, 3).join("/");
  const breadcrumbItems = [
    {title: title_page, link: prevLocation},
    {title: title_page + " " + action_context, link: location.pathname},
  ];

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
      <Tabs className="mt-5" defaultValue="account">
        <TabsList className="grid w-full grid-cols-4 max-w-[500px]">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="Address">Address</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          <TabsTrigger value="point">Point Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <User />
        </TabsContent>
        <TabsContent value="Address">
          <UsersAddress />
        </TabsContent>
        <TabsContent value="activity">
          <UsersLogs endpoint="/user/log" />
        </TabsContent>
        <TabsContent value="point">
          <UsersLogs endpoint="/user/point-log" />
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default UsersUpdate;
