export interface Options {
    filename?: string;
    fieldSeparator?: string;
    quoteStrings?: string;
    decimalSeparator?: string;
    showLabels?: boolean;
    showTitle?: boolean;
    title?: string;
    useTextFile?: boolean;
    useBom?: boolean;
    headers?: string[];
    useKeysAsHeaders?: boolean;
}
export declare class CsvConfigConsts {
    static EOL: string;
    static BOM: string;
    static DEFAULT_FIELD_SEPARATOR: string;
    static DEFAULT_DECIMAL_SEPARATOR: string;
    static DEFAULT_QUOTE: string;
    static DEFAULT_SHOW_TITLE: boolean;
    static DEFAULT_TITLE: string;
    static DEFAULT_FILENAME: string;
    static DEFAULT_SHOW_LABELS: boolean;
    static DEFAULT_USE_TEXT_FILE: boolean;
    static DEFAULT_USE_BOM: boolean;
    static DEFAULT_HEADER: string[];
    static DEFAULT_KEYS_AS_HEADERS: boolean;
}
export declare const ConfigDefaults: Options;
export declare class ExportToCsv {
    private _data;
    private _options;
    private _csv;
    options: Options;
    constructor(options?: Options);
    /**
     * Generate and Download Csv
     */
    generateCsv(jsonData: any, shouldReturnCsv?: boolean): void | any;
    /**
     * Create Headers
     */
    private _getHeaders();
    /**
     * Create Body
     */
    private _getBody();
    /**
     * Format Data
     * @param {any} data
     */
    private _formatData(data);
    /**
     * Check if is Float
     * @param {any} input
     */
    private _isFloat(input);
    /**
     * Parse the collection given to it
     *
     * @private
     * @param {*} jsonData
     * @returns {any[]}
     * @memberof ExportToCsv
     */
    private _parseData(jsonData);
}
