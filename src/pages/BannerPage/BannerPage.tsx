// hook
import React, {useEffect, useState} from "react";
import {useMutation, useQuery} from "react-query";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";

// component
import {Button} from "@/components/ui/button";
import {SquarePen, Trash2} from "lucide-react";
import {AlertModal} from "@/components/Modal/AlertModal";
import MainTable from "@/components/MainTable";
import {Checkbox} from "@/components/ui/checkbox";
import TableHeaderPage from "@/components/TableHeaderPage";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  Table,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import ToastBody from "@/components/ToastBody";

// utils
import ApiService from "@/lib/ApiService";
import {ImageItemType, Permissions} from "@/types";
import settledHandler from "@/helper/settledHandler";
import {toast} from "react-toastify";
import {useDebounce} from "@/components/ui/MultipleSelector";
import CONTENT_TYPE from "@/helper/content-type";
import moment from "moment";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import IMG_TYPE from "@/helper/img-type";

// schema
const title_page = "News";
const prefix_route = "/dashboard/news";

interface MetaTable {
  refetch: () => void;
  permissions: Permissions;
}

// child components
const columns: ColumnDef<ImageItemType>[] = [
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
    header: "Image (Desktop)",
    accessorKey: "images",
    cell: ({row}) => {
      return (
        <div>
          <img className="w-24" src={row.original.images[0].url} alt={row.original.title} />
        </div>
      );
    },
  },
  {
    header: "Image (Mobile)",
    accessorKey: "images",
    cell: ({row}) => {
      return (
        <div>
          <img className="w-24" src={row.original.images[0].url} alt={row.original.title} />
        </div>
      );
    },
  },
  {
    header: "Title",
    accessorKey: "title",
  },
  {
    header: "Description",
    accessorKey: "description",
  },

  {
    header: "Active Status",
    accessorKey: "active_status",

    cell: ({row}) => {
      return <div>{row.original.active_status ? "Active" : "Inactive"}</div>;
    },
  },
  {
    header: "Crated Date",
    accessorKey: "",
    cell: ({row}) => <span>{moment(row.original.created_at).format("LL")}</span>,
  },
  {
    id: "actions",
    cell: ({row, table}) => <TableCallOut row={row} table={table} />,
  },
];

const TableCallOut: React.FC<{row: Row<ImageItemType>; table: Table<ImageItemType>}> = ({row, table}) => {
  const metaTable: MetaTable | undefined = table.options.meta as any;
  const navigate = useNavigate();

  const [showDelete, setShowDelete] = useState(false);

  const {mutate: removeUser, isLoading} = useMutation({
    mutationFn: async (data: {content_id: string[]}) => await ApiService.secure().delete("/content", data),
    onSettled: async (response) =>
      settledHandler({
        response,
        contextAction: "Delete",
        onFinish: () => {
          if (metaTable) {
            metaTable.refetch();
          }
        },
      }),
  });

  return (
    <React.Fragment>
      <section className="flex justify-end w-full gap-2">
        <Button
          disabled={!metaTable?.permissions.update}
          variant="secondary"
          onClick={() => navigate(prefix_route + "/update/" + row.original._id)}
        >
          <SquarePen size={14} />
        </Button>
        <Button disabled={!metaTable?.permissions.delete} variant="destructive" onClick={() => setShowDelete(true)}>
          <Trash2 size={14} />
        </Button>
      </section>

      {/* delete modal */}
      <AlertModal
        loading={isLoading}
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Are you sure want to remove ?"
        description="Alert removed item cant be undo"
        onConfirm={() => {
          let payload = {content_id: [row.original._id]};
          removeUser(payload);
          setShowDelete(false);
        }}
      />
    </React.Fragment>
  );
};

// main component
const BannerPage: React.FC<{permissions: Permissions}> = ({permissions}) => {
  const limit_table = 10;
  const location = useLocation();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  let getPageParam = searchParams.get("page");
  const pageParam: number = getPageParam && !isNaN(+getPageParam) ? +getPageParam : 1;
  const breadcrumbItems = [{title: title_page, link: location.pathname}];

  // state
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
    queryFn: async () => await getDataHandler(pagination),
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
      permissions: permissions,
    },
  });

  // functions
  const getDataHandler = async ({pageIndex, pageSize}: {pageIndex: number; pageSize: number}) => {
    try {
      let quries: any = {
        page: pageIndex + 1,
        limit: pageSize,
        type: CONTENT_TYPE.getTypeNumber(CONTENT_TYPE.NEWS),
      };

      if (searchTableQuery?.length) {
        quries.query = searchTableQuery;
      }

      const response = await ApiService.secure().get(`/image`, quries);

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

  // will reset back to page 1 if search changes
  useEffect(() => {
    if (searchTableQuery?.length && pagination.pageIndex > 0) {
      setPagination({
        pageIndex: 0,
        pageSize: limit_table,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTableQuery]);

  return (
    <section>
      <TableHeaderPage
        title={title_page}
        item={breadcrumbItems}
        totalData={pageInfo.totalData || 0}
        addHandler={() => navigate(prefix_route + "/create")}
        disable={!permissions.create}
      />

      {/* Data Table */}
      <MainTable
        table={table}
        filterColumn="title"
        filterPlaceholder="Search title"
        columns={columns}
        extraElement={
          <section>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(IMG_TYPE).map((key) => (
                  <SelectItem value="light">{key}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>
        }
        dataLength={data?.length || 0}
        isLoading={isLoading}
        limit={limit_table}
      />
    </section>
  );
};

export default BannerPage;

