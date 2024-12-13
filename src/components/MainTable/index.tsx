import {ChevronDown} from "lucide-react";
import {DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger} from "../ui/dropdown-menu";
import {Input} from "../ui/input";
import {ColumnDef, Table as TableType} from "@tanstack/react-table";
import {Button} from "../ui/button";
import DataTable from "./DataTable";
import {Separator} from "../ui/separator";
import DataTablePagination from "./DataTablePagination";
import React from "react";

interface Props<TData, TValue> {
  table: TableType<TData>;
  columns: ColumnDef<TData, TValue>[];
  isLoading: boolean;
  dataLength: number;
  limit: number;
  filterColumn: string;
  filterPlaceholder: string;
  hideSearch?: boolean;
  extraElement?: React.ReactNode;
}

export default function MainTable<TData, TValue>({
  table,
  isLoading,
  columns,
  dataLength,
  limit,
  filterColumn,
  filterPlaceholder,
  hideSearch = false,
  extraElement,
}: Props<TData, TValue>) {
  return (
    <div className="w-full ">
      <div className="flex items-center py-4">
        {!hideSearch ? (
          <Input
            placeholder={filterPlaceholder}
            value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn(filterColumn)?.setFilterValue(event.target.value)}
            className="max-w-sm mt-auto"
          />
        ) : null}

        <div className="flex gap-4 ml-auto">
          {extraElement ? extraElement : null}
          <div className="mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10">
                  Columns <ChevronDown className="ml-2 " />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()

                  .filter((column) => column.getCanHide())
                  .filter((column) => column.id !== "actions")

                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id.split("_").join(" ")}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="overflow-auto">
        <DataTable table={table} columns={columns} dataLength={dataLength} isLoading={isLoading} limit={limit} />
      </div>
      <Separator />
      <DataTablePagination table={table} />
    </div>
  );
}
