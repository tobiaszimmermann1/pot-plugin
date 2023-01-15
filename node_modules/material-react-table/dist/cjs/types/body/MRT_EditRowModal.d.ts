/// <reference types="react" />
import type { MRT_Row, MRT_TableInstance } from '..';
interface Props<TData extends Record<string, any> = {}> {
    open: boolean;
    row: MRT_Row<TData>;
    table: MRT_TableInstance<TData>;
}
export declare const MRT_EditRowModal: <TData extends Record<string, any> = {}>({ open, row, table, }: Props<TData>) => JSX.Element;
export {};
