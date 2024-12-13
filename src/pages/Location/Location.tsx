// hook
import React, {useState} from "react";
import {useLocation, useSearchParams} from "react-router-dom";
import {useMutation, useQuery} from "react-query";

// component
import {Button} from "@/components/ui/button";
import {SquarePen, Trash2} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox";
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
import {useDebounce} from "@/components/ui/MultipleSelector";
import ToastBody from "@/components/ToastBody";
import {Modal} from "@/components/ui/modal";

// utils
import ApiService from "@/lib/ApiService";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Input} from "@/components/ui/input";
import {Permissions, TODO} from "@/types";
import settledHandler from "@/helper/settledHandler";
import {toast} from "react-toastify";
import {Textarea} from "@/components/ui/textarea";

// schema
const title_page = "Location";

interface ModalProps {
  show: boolean;
  update?: boolean;
  data?: LocationType;
  itemId?: string;
  onHide: () => void;
  refetch: () => void;
}

interface LocationType {
  _id: string;
  name: string;
  slug: string;
  code: string;
  address: string;
  lat: string;
  long: string;
  publish: 0;
  created_at: string;
  created_by: string;
  __v: 0;
  city: null | string;
}

interface MetaTable {
  refetch: () => void;
  permissions: Permissions;
}

// child components
const columns: ColumnDef<LocationType>[] = [
  {
    id: "select",
    header: ({table}) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({row}) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Name",
    accessorKey: "name",
  },

  {
    id: "actions",
    cell: ({row, table}) => <TableCallOut row={row} table={table} />,
  },
];

const TableCallOut: React.FC<{row: Row<LocationType>; table: TODO}> = ({row, table}) => {
  const metaTable: MetaTable | undefined = table.options.meta as any;
  const [showDelete, setShowDelete] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const {mutate: removeUser, isLoading} = useMutation({
    mutationFn: async (data: {location_id: string[]}) => await ApiService.secure().delete("/page", data),
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
          let payload = {location_id: [row.original._id]};
          removeUser(payload);
          setShowDelete(false);
        }}
      />
    </React.Fragment>
  );
};

const PageModal: React.FC<ModalProps> = ({show, data, update, itemId, onHide, refetch}) => {
  let endpoint = update ? "/location/edit" : "/location";

  const formSchema = z.object({
    name: z.string({required_error: "Field Required"}).min(1),
    lat: z.string({required_error: "Field Required"}).min(1),
    long: z.string({required_error: "Field Required"}).min(1),
    slug: z.string({required_error: "Field Required"}).min(1),
    code: z.string({required_error: "Field Required"}).min(1),
    address: z.string({required_error: "Field Required"}).min(1),
    // publish: z.string({required_error: "Field Required"}).default(""),
  });

  type PageModalType = z.infer<typeof formSchema>;

  const form = useForm<PageModalType>({
    resolver: zodResolver(formSchema),
  });
  console.log(form.formState.errors);

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
    if (update) {
      payload.location_id = itemId;
      mutate(payload);
      return;
    }

    mutate([payload]);
  };

  React.useEffect(() => {
    if (update && data) {
      let result: TODO = {...data};
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
                  <Input type="Name" placeholder="Enter name" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({field}) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input type="Name" placeholder="Enter slug" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({field}) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter address" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({field}) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter code" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="long"
            render={({field}) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Longitude" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lat"
            render={({field}) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Latitude" disabled={isLoading} {...field} />
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
const Location: React.FC<{permissions: Permissions}> = ({permissions}) => {
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
  const searchTableQuery = useDebounce(columnFilters.length ? String(columnFilters[0]?.value) : undefined, 500);

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
    queryKey: [title_page, pagination.pageIndex, searchTableQuery],
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
      permissions,
    },
  });

  // functions
  const getPage = async ({pageIndex, pageSize}: {pageIndex: number; pageSize: number}) => {
    try {
      const response = await ApiService.secure().get(`/location`, {
        page: pageIndex + 1,
        limit: pageSize,
        query: searchTableQuery,
      });

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
        filterPlaceholder="search name"
        columns={columns}
        dataLength={data?.length || 0}
        isLoading={isLoading}
        limit={limit_table}
      />

      <PageModal show={showCreateModal} onHide={() => setShowCreateModal((prev) => !prev)} refetch={refetch} />
    </section>
  );
};

export default Location;

