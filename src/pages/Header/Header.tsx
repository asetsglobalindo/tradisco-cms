// hook
import React, {useState} from "react";
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
import {Permissions, TODO} from "@/types";
import settledHandler from "@/helper/settledHandler";
import moment from "moment";
import {toast} from "react-toastify";
import HeaderServices from "@/services/header";
import {HeaderType} from "@/types/header";

// schema
const title_page = "Header";

interface MetaTable {
  refetch: () => void;
  permissions: Permissions;
}

// child components
const columns: ColumnDef<HeaderType>[] = [
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
    header: "Name (EN)",
    accessorKey: "name.en",
  },
  {
    header: "Name (ID)",
    accessorKey: "name.id",
  },
  {
    header: "Order",
    accessorKey: "order",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({row}) => <span>{row?.original?.active_status ? "Active" : "Inactive"}</span>,
  },

  {
    header: "Crated Date",
    accessorKey: "created_at",
    cell: ({row}) => <span>{moment(row.original.created_at).format("LL")}</span>,
  },
  {
    id: "actions",
    cell: ({row, table}) => <TableCallOut row={row} table={table} />,
  },
];

const TableCallOut: React.FC<{row: Row<HeaderType>; table: TODO}> = ({row, table}) => {
  const navigate = useNavigate();
  const metaTable: MetaTable | undefined = table.options.meta as any;
  const [showDelete, setShowDelete] = useState(false);
  const {mutate: removeUser, isLoading} = useMutation({
    mutationFn: async (data: {header_id: string[]}) => await ApiService.secure().delete("/header", data),
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
          onClick={() => navigate("/dashboard/header/update/" + row.original._id)}
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
          let payload = {header_id: [row.original._id]};
          removeUser(payload);
          setShowDelete(false);
        }}
      />
    </React.Fragment>
  );
};

// main component
const Header: React.FC<{permissions: Permissions}> = ({permissions}) => {
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
      const response = await HeaderServices.get({page: pageIndex + 1, limit: pageSize});

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
        addHandler={() => navigate("/dashboard/header/create")}
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
    </section>
  );
};

export default Header;
