// hook
import React, {useEffect, useState} from "react";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import {useMutation, useQuery} from "react-query";
import {useDebounce} from "@/components/ui/MultipleSelector";

// component
import ToastBody from "@/components/ToastBody";
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

// utils
import UserServices from "@/services/user";
import {UserGetItemType} from "@/types/user";
import ApiService from "@/lib/ApiService";
import {Permissions, TODO} from "@/types";
import settledHandler from "@/helper/settledHandler";
import {toast} from "react-toastify";

// schema
const title_page = "Users";
interface MetaTable {
  refetch: () => void;
  permissions: Permissions;
}

// child components
const columns: ColumnDef<UserGetItemType>[] = [
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
    header: "E-mail",
    accessorKey: "email",
  },

  {
    header: "Role",
    accessorKey: "Role",
    cell: ({row}) => <span>{row?.original?.role_id?.name || "-"}</span>,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({row}) => <span>{row?.original?.active_status ? "Active" : "Inactive"}</span>,
  },
  {
    id: "actions",
    cell: ({row, table}) => <TableCallOut row={row} table={table} />,
  },
];

const TableCallOut: React.FC<{row: Row<UserGetItemType>; table: TODO}> = ({row, table}) => {
  const navigate = useNavigate();
  const metaTable: MetaTable | undefined = table.options.meta as any;
  const [showDelete, setShowDelete] = useState(false);

  const {mutate: removeUser, isLoading} = useMutation({
    mutationFn: async (data: {user_id: string[]}) => await ApiService.secure().delete("/user", data),
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
          onClick={() => navigate("/dashboard/users/update/" + row.original._id)}
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
          let payload = {user_id: [row.original._id]};
          removeUser(payload);
          setShowDelete(false);
        }}
      />
    </React.Fragment>
  );
};

// main component
const Users: React.FC<{permissions: Permissions}> = ({permissions}) => {
  const limit_table = 10;
  const location = useLocation();
  const navigate = useNavigate();
  const breadcrumbItems = [{title: title_page, link: location.pathname}];
  const [searchParams, setSearchParams] = useSearchParams();
  let getPageParam = searchParams.get("page");
  const pageParam: number = getPageParam && !isNaN(+getPageParam) ? +getPageParam : 1;

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
    queryFn: async () => await getUsers(pagination),
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
  const getUsers = async ({pageIndex, pageSize}: {pageIndex: number; pageSize: number}) => {
    try {
      const response = await UserServices.get({
        page: pageIndex + 1,
        limit: pageSize,
        query: searchTableQuery,
        user_level: "admin,clerk",
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
        addHandler={() => navigate("/dashboard/users/create")}
        disable={!permissions.create}
      />

      {/* Data Table */}
      <MainTable
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

export default Users;
