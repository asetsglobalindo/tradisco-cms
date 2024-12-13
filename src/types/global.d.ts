import {RowData} from "@tanstack/react-table";
import {Permissions} from ".";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    refetch?: () => void;
    permissions?: Permissions;
    shippingStatus?: number;
    isEditable?: boolean;
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}
