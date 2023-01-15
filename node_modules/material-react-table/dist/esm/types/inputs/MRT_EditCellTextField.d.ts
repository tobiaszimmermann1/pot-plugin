/// <reference types="react" />
import type { MRT_Cell, MRT_TableInstance } from '..';
interface Props<TData extends Record<string, any> = {}> {
    cell: MRT_Cell<TData>;
    table: MRT_TableInstance<TData>;
    showLabel?: boolean;
}
export declare const MRT_EditCellTextField: <TData extends Record<string, any> = {}>({ cell, showLabel, table, }: Props<TData>) => JSX.Element;
export {};
