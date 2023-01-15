/// <reference types="react" />
import type { MRT_Row, MRT_TableInstance } from '..';
interface Props<TData extends Record<string, any> = {}> {
    row: MRT_Row<TData>;
    table: MRT_TableInstance<TData>;
    variant?: 'icon' | 'text';
}
export declare const MRT_EditActionButtons: <TData extends Record<string, any> = {}>({ row, table, variant, }: Props<TData>) => JSX.Element;
export {};
