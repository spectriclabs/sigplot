/**
 * Type declarations for the "sigfile" module.
 *
 * sigfile exposes two sub-modules: bluefile and matfile.
 * Usage in the codebase:
 *   import sigfile from "sigfile";
 *   const bluefile = sigfile.bluefile;
 *   const matfile  = sigfile.matfile;
 */

declare module "sigfile" {
    /** BlueHeader constructor returned by bluefile */
    class BlueHeader {
        constructor(buf: ArrayBuffer | null);

        version: string;
        size: number;
        type: number;
        format: string;
        timecode: number;
        xstart: number;
        xdelta: number;
        xunits: number;
        subsize: number;
        ystart: number;
        ydelta: number;
        yunits: number;
        class: number;
        file_name: string;
        spa: number;
        dview: Float32Array | Float64Array | Int16Array | Int32Array | Uint8Array;
        buf_type: string;
        pipe: boolean;
        in_byte: number;
        out_byte: number;
        buf: ArrayBuffer;
        data_free: number;
        lps: number;
        enabled_streaming_pcut: boolean;
        cleanup: (() => void) | undefined;

        setData(data: any): void;
        createArray(buf: ArrayBuffer | null, offset: number, length: number): any;

        [key: string]: any;
    }

    /** BlueFileReader for reading BLUE files from URLs or File objects */
    class BlueFileReader {
        constructor();
        read_http(href: string, onload: (header: BlueHeader) => void): XMLHttpRequest | any;
        read(file: File, onload: (header: BlueHeader) => void): void;
    }

    /** MatFileReader for reading MATLAB .mat files from URLs */
    class MatFileReader {
        constructor();
        read_http(href: string, onload: (header: any) => void): XMLHttpRequest | any;
    }

    interface BluefileModule {
        BlueHeader: typeof BlueHeader;
        BlueFileReader: typeof BlueFileReader;
    }

    interface MatfileModule {
        MatFileReader: typeof MatFileReader;
    }

    interface SigFile {
        bluefile: BluefileModule;
        matfile: MatfileModule;
    }

    export const bluefile: BluefileModule;
    export const matfile: MatfileModule;
}
