import { ReactNode } from 'react';
import { MRT_Cell, MRT_TableInstance } from '..';
interface Props<TData extends Record<string, any> = {}> {
    cell: MRT_Cell<TData>;
    children: ReactNode;
    table: MRT_TableInstance<TData>;
}
export declare const MRT_CopyButton: <TData extends Record<string, any> = {}>({ cell, children, table, }: Props<TData>) => JSX.Element;
export {};
