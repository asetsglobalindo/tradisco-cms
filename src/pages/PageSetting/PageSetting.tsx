// hook
import React, {useState} from "react";
import {useLocation, useSearchParams} from "react-router-dom";
import {useMutation, useQuery} from "react-query";

// component
import {Button} from "@/components/ui/button";
import {ChevronUp, SquarePen, Trash2} from "lucide-react";
import TableHeaderPage from "@/components/TableHeaderPage";
import {AlertModal} from "@/components/Modal/AlertModal";
import MainTable from "@/components/MainTable";
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
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import MultipleSelector from "@/components/ui/MultipleSelector";
import ToastBody from "@/components/ToastBody";
import {Modal} from "@/components/ui/modal";

// utils
import ApiService from "@/lib/ApiService";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Input} from "@/components/ui/input";
import {Permissions, TODO} from "@/types";
import PageServices from "@/services/page";
import {PageType} from "@/types/page";
import settledHandler from "@/helper/settledHandler";
import {toast} from "react-toastify";

// schema
const title_page = "Page";
const group_options = [
  {name: "Dashboard", value: "Dashboard"},
  {name: "Journal Management", value: "Journal Management"},
  {name: "About Management", value: "About Management"},
  {name: "Destination Management", value: "Destination Management"},
  {name: "Vessel Management", value: "Vessel Management"},
  {name: "Travel Management", value: "Travel Management"},
  {name: "Life on Board Management", value: "Life on Board Management"},
  {name: "Blog Management", value: "Blog Management"},
  {name: "Hidden Group", value: "Hidden Group"},
  {name: "Promotions", value: "Promotions"},
  {name: "Report", value: "Report"},
  {name: "Content Management", value: "Content Management"},
  {name: "Product Management", value: "Product Management"},
  {name: "User Management", value: "User Management"},
  {name: "Transaction", value: "Transaction"},
  {name: "Transaction (Website)", value: "Transaction (Website)"},
  {name: "Transaction (Store)", value: "Transaction (Store)"},
  {name: "Pages Management", value: "Pages Management"},
  {name: "Setting", value: "Setting"},
  {name: "Skin Analytic", value: "Skin Analytic"},
];

interface ModalProps {
  show: boolean;
  update?: boolean;
  data?: PageType;
  itemId?: string;
  onHide: () => void;
  refetch: () => void;
}

interface MetaTable {
  refetch: () => void;
  permissions: Permissions;
}

// child components
const columns: ColumnDef<PageType>[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Route",
    accessorKey: "route",
    cell: ({row}) => <span className="p-2 border">{row.original.route}</span>,
  },
  {
    header: "Page Group",
    accessorKey: "group",
  },
  {
    header: "Order",
    accessorKey: "order",
  },
  {
    id: "actions",
    cell: ({row, table}) => <TableCallOut row={row} table={table} />,
  },
];

const TableCallOut: React.FC<{row: Row<PageType>; table: TODO}> = ({row, table}) => {
  const metaTable: MetaTable | undefined = table.options.meta as any;
  const [showDelete, setShowDelete] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const {mutate: removeUser, isLoading} = useMutation({
    mutationFn: async (data: {page_id: string[]}) => await ApiService.secure().delete("/page", data),
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
        <Button disabled={!metaTable?.permissions.update} variant="secondary" onClick={() => setShowUpdateModal(true)}>
          <SquarePen size={14} />
        </Button>
        <Button disabled={!metaTable?.permissions.delete} variant="destructive" onClick={() => setShowDelete(true)}>
          <Trash2 size={14} />
        </Button>
      </section>

      <PageModal
        update
        show={showUpdateModal}
        data={row.original}
        onHide={() => setShowUpdateModal(false)}
        itemId={row.original._id}
        refetch={() => {
          if (metaTable) {
            metaTable.refetch();
          }
        }}
      />

      {/* delete modal */}
      <AlertModal
        loading={isLoading}
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Are you sure want to remove ?"
        description="Alert removed item cant be undo"
        onConfirm={() => {
          let payload = {page_id: [row.original._id]};
          removeUser(payload);
          setShowDelete(false);
        }}
      />
    </React.Fragment>
  );
};

const PageModal: React.FC<ModalProps> = ({show, data, update, itemId, onHide, refetch}) => {
  let endpoint = update ? "/page/edit" : "/page";

  const formSchema = z.object({
    name: z.string({required_error: "Field Required"}).min(1),
    group: z
      .object({
        label: z.string(),
        value: z.string(),
      })
      .array()
      .min(1, {message: "Please select group"}),
    route: z.string({required_error: "Field Required"}).min(1),
    order: z.number(),
  });

  type PageModalType = z.infer<typeof formSchema>;

  const form = useForm<PageModalType>({
    resolver: zodResolver(formSchema),
  });

  const {mutate, isLoading} = useMutation({
    mutationFn: async (payload: PageModalType[] | PageModalType) => ApiService.secure().post(endpoint, payload),
    onSettled: async (response) =>
      settledHandler({
        response,
        contextAction: update ? "Update" : "Create",
        onFinish: () => {
          onHide();
          refetch();
          form.reset({});
        },
      }),
  });

  const finish = async (payload: TODO) => {
    payload.icon = "";
    payload.group = payload.group[0].value;

    if (update) {
      payload.page_id = itemId;
      mutate(payload);
      return;
    }

    mutate([payload]);
  };

  React.useEffect(() => {
    if (update && data) {
      let result: TODO = {...data};
      result.group = [{label: data.group, value: data.group}];
      form.reset(result);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Modal isOpen={show} onClose={() => onHide()} title={`${update ? "Update" : "Create"} ${title_page}`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(finish)} className="w-full space-y-2">
          <FormField
            control={form.control}
            name="name"
            render={({field}) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="Name" placeholder="Enter page name" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="route"
            render={({field}) => (
              <FormItem>
                <FormLabel>Route</FormLabel>
                <FormControl>
                  <Input type="Name" placeholder="Enter page route" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="group"
            render={({field}) => (
              <FormItem>
                <FormLabel>Page Group</FormLabel>
                <FormControl>
                  <MultipleSelector
                    creatable
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                    maxSelected={1}
                    placeholder="Select page group"
                    options={group_options.map((g) => {
                      return {
                        label: g.name,
                        value: g.value,
                      };
                    })}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="order"
            render={({field}) => (
              <FormItem>
                <FormLabel>Order</FormLabel>
                <FormControl>
                  <section className="relative flex items-center">
                    <Input
                      type="Name"
                      placeholder="Enter page route"
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
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end w-full pt-4 space-x-2">
            <Button
              variant="outline"
              disabled={isLoading}
              isLoading={isLoading}
              onClick={() => onHide()}
              type="button"
              className="flex items-center w-fit"
            >
              Close
            </Button>
            <Button disabled={isLoading} isLoading={isLoading} className="flex items-center w-fit">
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
};

// main component
const PageSetting: React.FC<{permissions: Permissions}> = ({permissions}) => {
  const limit_table = 10;
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  let getPageParam = searchParams.get("page");
  const pageParam: number = getPageParam && !isNaN(+getPageParam) ? +getPageParam : 1;
  const breadcrumbItems = [{title: title_page, link: location.pathname}];

  // state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [pageInfo, setPageInfo] = useState({
    totalPage: 1,
    totalData: 1,
  });

  const [pagination, setPagination] = useState({
    pageIndex: pageParam - 1, // index count
    pageSize: limit_table,
  });

  // api calls
  const {data, isLoading, refetch} = useQuery({
    queryKey: [title_page, pagination.pageIndex],
    queryFn: async () => await getPage(pagination),
    enabled: !!pageParam,
  });

  // table
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
    pageCount: pageInfo.totalPage,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    meta: {
      refetch: () => refetch(),
      permissions,
    },
  });

  // functions
  const getPage = async ({pageIndex, pageSize}: {pageIndex: number; pageSize: number}) => {
    try {
      const response = await PageServices.get({page: pageIndex + 1, limit: pageSize});

      if (response.data.status !== 200) {
        throw new Error(response.data.err);
      }

      setPageInfo({
        totalPage: Math.ceil(response.data.pages.total_data / limit_table),
        totalData: response.data.pages.total_data,
      });

      setSearchParams({page: String(pageIndex + 1)}, {replace: true});
      return response.data.data;
    } catch (error: any) {
      toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
    }
  };

  return (
    <section>
      <TableHeaderPage
        title={title_page}
        item={breadcrumbItems}
        totalData={pageInfo.totalData || 0}
        addHandler={() => setShowCreateModal(true)}
        disable={!permissions.create}
      />

      {/* Data Table */}
      <MainTable
        table={table}
        filterColumn="name"
        filterPlaceholder="search page name"
        columns={columns}
        dataLength={data?.length || 0}
        isLoading={isLoading}
        limit={limit_table}
      />

      <PageModal show={showCreateModal} onHide={() => setShowCreateModal((prev) => !prev)} refetch={refetch} />
    </section>
  );
};

export default PageSetting;
