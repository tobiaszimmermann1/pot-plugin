/// <reference types="react" />
import type { MRT_TableInstance } from '..';
interface Props<TData extends Record<string, any> = {}> {
    table: MRT_TableInstance<TData>;
}
export declare const MRT_ToolbarInternalButtons: <TData extends Record<string, any> = {}>({ table, }: Props<TData>) => JSX.Element;
export {};
