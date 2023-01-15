"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CsvConfigConsts = (function () {
    function CsvConfigConsts() {
    }
    CsvConfigConsts.EOL = "\r\n";
    CsvConfigConsts.BOM = "\ufeff";
    CsvConfigConsts.DEFAULT_FIELD_SEPARATOR = ',';
    CsvConfigConsts.DEFAULT_DECIMAL_SEPARATOR = '.';
    CsvConfigConsts.DEFAULT_QUOTE = '"';
    CsvConfigConsts.DEFAULT_SHOW_TITLE = false;
    CsvConfigConsts.DEFAULT_TITLE = 'My Generated Report';
    CsvConfigConsts.DEFAULT_FILENAME = 'generated';
    CsvConfigConsts.DEFAULT_SHOW_LABELS = false;
    CsvConfigConsts.DEFAULT_USE_TEXT_FILE = false;
    CsvConfigConsts.DEFAULT_USE_BOM = true;
    CsvConfigConsts.DEFAULT_HEADER = [];
    CsvConfigConsts.DEFAULT_KEYS_AS_HEADERS = false;
    return CsvConfigConsts;
}());
exports.CsvConfigConsts = CsvConfigConsts;
exports.ConfigDefaults = {
    filename: CsvConfigConsts.DEFAULT_FILENAME,
    fieldSeparator: CsvConfigConsts.DEFAULT_FIELD_SEPARATOR,
    quoteStrings: CsvConfigConsts.DEFAULT_QUOTE,
    decimalSeparator: CsvConfigConsts.DEFAULT_DECIMAL_SEPARATOR,
    showLabels: CsvConfigConsts.DEFAULT_SHOW_LABELS,
    showTitle: CsvConfigConsts.DEFAULT_SHOW_TITLE,
    title: CsvConfigConsts.DEFAULT_TITLE,
    useTextFile: CsvConfigConsts.DEFAULT_USE_TEXT_FILE,
    useBom: CsvConfigConsts.DEFAULT_USE_BOM,
    headers: CsvConfigConsts.DEFAULT_HEADER,
    useKeysAsHeaders: CsvConfigConsts.DEFAULT_KEYS_AS_HEADERS,
};
var ExportToCsv = (function () {
    function ExportToCsv(options) {
        this._csv = "";
        var config = options || {};
        this._options = objectAssign({}, exports.ConfigDefaults, config);
        if (this._options.useKeysAsHeaders
            && this._options.headers
            && this._options.headers.length > 0) {
            console.warn('Option to use object keys as headers was set, but headers were still passed!');
        }
    }
    Object.defineProperty(ExportToCsv.prototype, "options", {
        get: function () {
            return this._options;
        },
        set: function (options) {
            this._options = objectAssign({}, exports.ConfigDefaults, options);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Generate and Download Csv
     */
    ExportToCsv.prototype.generateCsv = function (jsonData, shouldReturnCsv) {
        if (shouldReturnCsv === void 0) { shouldReturnCsv = false; }
        // Make sure to reset csv data on each run
        this._csv = '';
        this._parseData(jsonData);
        if (this._options.useBom) {
            this._csv += CsvConfigConsts.BOM;
        }
        if (this._options.showTitle) {
            this._csv += this._options.title + '\r\n\n';
        }
        this._getHeaders();
        this._getBody();
        if (this._csv == '') {
            console.log("Invalid data");
            return;
        }
        // When the consumer asks for the data, exit the function
        // by returning the CSV data built at this point
        if (shouldReturnCsv) {
            return this._csv;
        }
        // Create CSV blob to download if requesting in the browser and the
        // consumer doesn't set the shouldReturnCsv param
        var FileType = this._options.useTextFile ? 'plain' : 'csv';
        var fileExtension = this._options.useTextFile ? '.txt' : '.csv';
        var blob = new Blob([this._csv], { "type": "text/" + FileType + ";charset=utf8;" });
        if (navigator.msSaveBlob) {
            var filename = this._options.filename.replace(/ /g, "_") + fileExtension;
            navigator.msSaveBlob(blob, filename);
        }
        else {
            var attachmentType = this._options.useTextFile ? 'text' : 'csv';
            var uri = 'data:attachment/' + attachmentType + ';charset=utf-8,' + encodeURI(this._csv);
            var link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.setAttribute('visibility', 'hidden');
            link.download = this._options.filename.replace(/ /g, "_") + fileExtension;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    /**
     * Create Headers
     */
    ExportToCsv.prototype._getHeaders = function () {
        if (!this._options.showLabels && !this._options.useKeysAsHeaders) {
            return;
        }
        var useKeysAsHeaders = this._options.useKeysAsHeaders;
        var headers = useKeysAsHeaders ? Object.keys(this._data[0]) : this._options.headers;
        if (headers.length > 0) {
            var row = "";
            for (var keyPos = 0; keyPos < headers.length; keyPos++) {
                row += headers[keyPos] + this._options.fieldSeparator;
            }
            row = row.slice(0, -1);
            this._csv += row + CsvConfigConsts.EOL;
        }
    };
    /**
     * Create Body
     */
    ExportToCsv.prototype._getBody = function () {
        var keys = Object.keys(this._data[0]);
        for (var i = 0; i < this._data.length; i++) {
            var row = "";
            for (var keyPos = 0; keyPos < keys.length; keyPos++) {
                var key = keys[keyPos];
                row += this._formatData(this._data[i][key]) + this._options.fieldSeparator;
            }
            row = row.slice(0, -1);
            this._csv += row + CsvConfigConsts.EOL;
        }
    };
    /**
     * Format Data
     * @param {any} data
     */
    ExportToCsv.prototype._formatData = function (data) {
        if (this._options.decimalSeparator === 'locale' && this._isFloat(data)) {
            return data.toLocaleString();
        }
        if (this._options.decimalSeparator !== '.' && this._isFloat(data)) {
            return data.toString().replace('.', this._options.decimalSeparator);
        }
        if (typeof data === 'string') {
            data = data.replace(/"/g, '""');
            if (this._options.quoteStrings || data.indexOf(',') > -1 || data.indexOf('\n') > -1 || data.indexOf('\r') > -1) {
                data = this._options.quoteStrings + data + this._options.quoteStrings;
            }
            return data;
        }
        if (typeof data === 'boolean') {
            return data ? 'TRUE' : 'FALSE';
        }
        return data;
    };
    /**
     * Check if is Float
     * @param {any} input
     */
    ExportToCsv.prototype._isFloat = function (input) {
        return +input === input && (!isFinite(input) || Boolean(input % 1));
    };
    /**
     * Parse the collection given to it
     *
     * @private
     * @param {*} jsonData
     * @returns {any[]}
     * @memberof ExportToCsv
     */
    ExportToCsv.prototype._parseData = function (jsonData) {
        this._data = typeof jsonData != 'object' ? JSON.parse(jsonData) : jsonData;
        return this._data;
    };
    return ExportToCsv;
}());
exports.ExportToCsv = ExportToCsv;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;
/**
 * Convet to Object
 * @param {any} val
 */
function toObject(val) {
    if (val === null || val === undefined) {
        throw new TypeError('Object.assign cannot be called with null or undefined');
    }
    return Object(val);
}
/**
 * Assign data  to new Object
 * @param {any}   target
 * @param {any[]} ...source
 */
function objectAssign(target) {
    var source = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        source[_i - 1] = arguments[_i];
    }
    var from;
    var to = toObject(target);
    var symbols;
    for (var s = 1; s < arguments.length; s++) {
        from = Object(arguments[s]);
        for (var key in from) {
            if (hasOwnProperty.call(from, key)) {
                to[key] = from[key];
            }
        }
        if (Object.getOwnPropertySymbols) {
            symbols = Object.getOwnPropertySymbols(from);
            for (var i = 0; i < symbols.length; i++) {
                if (propIsEnumerable.call(from, symbols[i])) {
                    to[symbols[i]] = from[symbols[i]];
                }
            }
        }
    }
    return to;
}
//# sourceMappingURL=export-to-csv.js.map