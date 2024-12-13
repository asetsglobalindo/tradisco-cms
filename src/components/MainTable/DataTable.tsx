import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {ColumnDef, Table as TableType, flexRender} from "@tanstack/react-table";
import {Skeleton} from "@/components/ui/skeleton";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "../ui/collapsible";
import {Button} from "../ui/button";
import {ChevronUp} from "lucide-react";
import {useState} from "react";
import {cn} from "@/lib/utils";

interface DataTablePaginationProps<TData, TValue> {
  table: TableType<TData>;
  columns: ColumnDef<TData, TValue>[];
  isLoading: boolean;
  dataLength: number;
  limit: number;
}

const ExpandIcon = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      onClick={() => setIsOpen((prev) => !prev)}
      className="absolute top-0 bottom-0 flex items-center justify-center w-full h-full"
    >
      <ChevronUp
        className={cn(
          {
            "rotate-180": isOpen,
          },
          "transition-all"
        )}
        size={14}
      />
    </div>
  );
};

export default function DataTable<TData, TValue>({
  table,
  isLoading,
  dataLength,
  limit,
  columns,
}: DataTablePaginationProps<TData, TValue>) {
  const expandedColumn = columns.find((col) => col.id?.includes("expand"));
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {!isLoading && !dataLength ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        ) : !isLoading && dataLength ? (
          table.getRowModel().rows.map((row) => (
            <Collapsible key={row.id} asChild>
              <>
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.id.includes("expand") ? (
                        <CollapsibleTrigger asChild>
                          <Button className="relative w-8" variant={"ghost"}>
                            <ExpandIcon />
                          </Button>
                        </CollapsibleTrigger>
                      ) : (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {expandedColumn ? (
                  <CollapsibleContent asChild>
                    <TableRow>
                      <TableCell
                        colSpan={columns.length} // make sure to span all columns
                        className="w-full p-4 bg-muted"
                      >
                        {row.getVisibleCells()?.find((row) => row.id.includes("expand"))
                          ? flexRender(
                              row.getVisibleCells()?.find((row) => row.id.includes("expand"))?.column?.columnDef.cell,
                              row
                                .getVisibleCells()
                                ?.find((row) => row.id.includes("expand"))
                                ?.getContext() as any
                            )
                          : null}
                      </TableCell>
                    </TableRow>
                  </CollapsibleContent>
                ) : null}
              </>
            </Collapsible>
          ))
        ) : (
          Array(limit)
            .fill("")
            .map((_, i) => (
              <TableRow key={i + 5}>
                <TableCell colSpan={columns.length}>
                  <Skeleton className="w-full h-10" />
                </TableCell>
              </TableRow>
            ))
        )}
      </TableBody>
    </Table>
  );
}
