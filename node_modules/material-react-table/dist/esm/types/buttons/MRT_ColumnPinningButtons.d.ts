/// <reference types="react" />
import type { MRT_Column, MRT_TableInstance } from '..';
interface Props<TData extends Record<string, any> = {}> {
    column: MRT_Column<TData>;
    table: MRT_TableInstance<TData>;
}
export declare const MRT_ColumnPinningButtons: <TData extends Record<string, any> = {}>({ column, table, }: Props<TData>) => JSX.Element;
export {};
