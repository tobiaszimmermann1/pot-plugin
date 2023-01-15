/// <reference types="react" />
import type { MRT_Header, MRT_InternalFilterOption, MRT_Localization, MRT_TableInstance } from '..';
export declare const mrtFilterOptions: (localization: MRT_Localization) => MRT_InternalFilterOption[];
interface Props<TData extends Record<string, any> = {}> {
    anchorEl: HTMLElement | null;
    header?: MRT_Header<TData>;
    onSelect?: () => void;
    setAnchorEl: (anchorEl: HTMLElement | null) => void;
    setFilterValue?: (filterValue: any) => void;
    table: MRT_TableInstance<TData>;
}
export declare const MRT_FilterOptionMenu: <TData extends Record<string, any> = {}>({ anchorEl, header, onSelect, setAnchorEl, setFilterValue, table, }: Props<TData>) => JSX.Element;
export {};
