/**
 * Core type definitions for SigPlot.
 *
 * This file contains ONLY type declarations (interfaces, types, enums).
 * No runtime code is emitted.
 */

// ---------------------------------------------------------------------------
// Primitive / utility types
// ---------------------------------------------------------------------------

/** Union of typed arrays commonly used for vector math operations. */
export type NumericArray = Float32Array | Float64Array | Int16Array | Int32Array | Uint8ClampedArray | number[];

/** Union of actual TypedArray types (excludes number[]). */
export type TypedArray = Float32Array | Float64Array | Int16Array | Int32Array | Uint8ClampedArray;

/** Union type for PointArray (Float32Array on iOS/legacy, Float64Array otherwise). */
export type PointArray = Float32Array | Float64Array;

/** Return type of m.vmxmn() */
export interface MinMaxResult {
    smax: number;
    smin: number;
    imax: number;
    imin: number;
}

/** Shape of each entry in the m.UNITS lookup table. [name, unit, flag1, flag2] */
export type UnitEntry = [string, string, boolean, boolean];

/** Canvas fill/stroke style value. */
export type CanvasStyle = string | CanvasGradient | CanvasPattern;

/** Highlight entry for layer highlighting. */
export interface HighlightEntry {
    xstart: number;
    xend: number;
    color: string;
    fill?: string;
}

/** Represents the main SigPlot plotting object. */
export interface Plot {
    // This will be expanded as needed; for now, keep minimal
    [key: string]: any;
}

// ---------------------------------------------------------------------------
// Coordinate helpers
// ---------------------------------------------------------------------------

export interface PixelPoint {
    x: number;
    y: number;
}

export interface DataPoint {
    x: number;
    y: number;
}

// ---------------------------------------------------------------------------
// Colormap types
// ---------------------------------------------------------------------------

export interface ColormapColor {
    pos: number;
    red: number;
    green: number;
    blue: number;
}

export interface ColormapEntry {
    name: string;
    colors: ColormapColor[];
}

export interface Mc {
    colormap: ColormapEntry[];
}

// ---------------------------------------------------------------------------
// BlueHeader (HCB) — derived from m.initialize() and bluefile.BlueHeader
// ---------------------------------------------------------------------------

export interface BlueHeader {
    version?: string;
    size?: number;
    type?: number;
    format?: string;
    timecode?: number;
    xstart?: number;
    xdelta?: number;
    xunits?: number;
    subsize?: number;
    ystart?: number;
    ydelta?: number;
    yunits?: number;
    enabled_streaming_pcut?: boolean;
    cleanup?: (() => void) | undefined;
    class?: number;

    // Pipe-mode fields
    pipe?: boolean;
    in_byte?: number;
    out_byte?: number;
    buf?: ArrayBuffer;
    data_free?: number;
    pipesize?: number;
    lps?: number;

    // Data access fields set by bluefile.BlueHeader
    file_name?: string;
    spa?: number;
    dview?: Float32Array | Float64Array | Int16Array | Int32Array | Uint8Array;
    buf_type?: string;

    // Methods from bluefile.BlueHeader
    setData?(data: ArrayBuffer | NumericArray | DataView): void;
    createArray?(buf: ArrayBuffer | null, offset: number, length: number): NumericArray;

    // Allow arbitrary override fields
    [key: string]: any;
}

// ---------------------------------------------------------------------------
// MxContext — derived from MX constructor in mx.js
// ---------------------------------------------------------------------------

export interface StkEntry {
    xmin: number;
    xmax: number;
    ymin: number;
    ymax: number;
    xscl: number;
    yscl: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface Scrollbar {
    flag: number | null;
    action: number | null;
    smin: number | null;
    srange: number | null;
    tmin: number | null;
    trange: number | null;
    step: number | null;
    page: number | null;
    scale: number | null;
    dragoutline: boolean | null;
    initial_pause: number | null;
    repeat_pause: number | null;
    x: number | null;
    y: number | null;
    w: number | null;
    h: number | null;
    s1: number | null;
    sw: number | null;
    swmin: number | null;
    soff: number | null;
    a1: number | null;
    a2: number | null;
    arrow: number | null;
    mxevent: boolean | null;
    origin: number | null;
    repeat_count: number | null;
}

export interface WarpBoxStyle {
    opacity?: number;
    fill_color?: string;
    return_value?: number | string | boolean | object;
}

export interface WarpBox {
    xo: number;
    yo: number;
    xl: number;
    yl: number;
    xmin: number;
    xmax: number;
    ymin: number;
    ymax: number;
    func?: ((warpbox: WarpBox) => void) | undefined;
    mode?: "box" | "vertical" | "horizontal" | undefined;
    style?: WarpBoxStyle;
    def_style?: WarpBoxStyle;
    alt_style?: WarpBoxStyle;
}

export interface MxContext {
    // DOM elements
    root: HTMLElement;
    parent: HTMLDivElement;
    canvas: HTMLCanvasElement;
    active_canvas: HTMLCanvasElement;
    wid_canvas: HTMLCanvasElement;

    // Font
    font?: string;
    font_family: string;
    font_width: number;
    font_scaled: boolean;
    text_w: number;
    text_h: number;

    // Zoom & coordinate system
    level: number;
    width: number;
    height: number;
    xpos: number;
    ypos: number;
    xmrk: number;
    ymrk: number;
    origin: number;
    stk: StkEntry[];
    mouseOver: boolean;

    // Color scheme
    bg: string;
    fg: string;
    xi: boolean | string;
    xwfg: string;
    xwbg: string;
    xwts: string;
    xwbs: string;
    xwms: string;
    xwlo: string;
    hi: string;

    // Drawing state
    rmode: boolean;
    linewidth: number;
    style?: CanvasStyle;

    // Button & event state
    button_release: number;
    button_press: number;
    state_mask: number;

    // Display field boundaries
    l: number;
    r: number;
    t: number;
    b: number;

    // Scrollbars
    scrollbar_x: Scrollbar;
    scrollbar_y: Scrollbar;

    // UI state
    prompt?: { redraw: () => void; input: any } | undefined;
    pixel?: PixelPoint | undefined;
    event_cb?: ((event: MouseEvent | KeyboardEvent) => boolean) | undefined;
    warpbox?: WarpBox;

    // Rendering
    _renderCanvas: HTMLCanvasElement;
    _syncRender: boolean;

    // DOM menu mode
    useDomMenu?: boolean;
}

// ---------------------------------------------------------------------------
// GxContext — derived from GX() constructor and plot_init() in sigplot.js
// ---------------------------------------------------------------------------

export interface GxContext {
    initialized: boolean;

    // Pointer data
    xptr?: NumericArray | undefined;
    yptr?: NumericArray | undefined;

    // Mouse coordinates
    retx: number;
    rety: number;
    xmrk: number;
    ymrk: number;
    aretx: number;
    arety: number;
    dretx?: number;
    drety?: number;

    // Axis ranges
    xstart: number;
    xdelta: number;
    xmin: number;
    xmax: number;
    xmult?: number;
    ymin: number;
    ymax: number;
    ymult?: number;
    zmin?: number;
    zmax?: number;
    zoff: number;

    // Pan limits
    panxmin: number;
    panxmax: number;
    panymin: number;
    panymax: number;
    panxpad?: number;
    panypad?: number;

    // Scale
    pxscl: number;
    pyscl: number;
    pmt: number;
    dbmin: number;

    // Display text
    note: string;
    format: string;

    // Plot field pixel bounds
    pl: number;
    pr: number;
    pt: number;
    pb: number;
    px1: number;
    px2: number;
    py1: number;
    py2: number;
    pyl: number;
    pthk: number;

    // Layer management
    modlayer: number;
    modsource: number;
    modified: boolean;
    modmode: number;
    lyr: Layer[];
    HCB: BlueHeader[];
    HCB_UUID: Record<string, BlueHeader>;
    plugins: PluginInterface[];

    // Axis labels/units
    xdiv: number;
    ydiv: number;
    xlab?: number;
    xlabel?: string;
    ylab?: number;
    ylabel?: string | number;

    // Boolean flags
    all: boolean;
    expand: boolean;
    cross: boolean;
    grid: boolean;
    gridBackground?: string;
    gridStyle?: string;
    index: boolean;
    pan: boolean;
    specs: boolean;
    legend: boolean;
    xdata: boolean;
    hold: boolean | number;

    // Axis visibility
    show_x_axis: boolean;
    show_y_axis: boolean;
    show_readout: boolean;
    hide_note: boolean;
    autohide_readout?: boolean;
    autohide_panbars?: boolean;

    // Sections
    sections: number;
    iysec: number;
    nsec: number;
    isec: number;

    // Compression / smoothing
    xcompression: number;
    rasterDownscale: number;
    rasterSmoothing: boolean;
    lineSmoothing: boolean;

    // Mouse/pan controls
    cntrls: number;
    panmode: number;
    panning?: { axis: string; xpos: number; ypos: number } | undefined;
    stillPanning?: number;
    repeatPanning?: number;
    mouseClickActive?: boolean;
    cross_xpos?: number;
    cross_ypos?: number;

    // Rubberbox / selection
    default_rubberbox_action: string;
    default_rubberbox_mode: string;
    default_rightclick_rubberbox_action: string | null;
    default_rightclick_rubberbox_mode: string;

    // Zoom / scroll
    wheelZoom?: boolean;
    wheelZoomPercent?: number;
    wheelscroll_mode_natural: boolean;
    inContinuousZoom: boolean;
    scroll_time_interval: number;
    autol: number;

    // Color / rendering
    ncolors: number;
    cmap: number | null;
    cmode: number;
    basemode?: number;
    plab: number;
    fillStyle?: string;

    // Format / units
    xfmt: string;
    yfmt: string;
    anno_type: number;
    iabsc: number;

    // UI / interaction
    nomenu: boolean;
    no_legend_button: boolean;
    legendBtnLocation: { x: number; y: number; width: number; height: number } | null;
    nmark: number;
    bufmax: number;
    always_show_marker: boolean;
    forcelab: boolean;
    segment: boolean;
    x_scrollbar_location?: string;

    // Auto-scaling
    autox: number;
    autoy: number;
    autoz: number;

    // Plot data canvas
    plotData: HTMLCanvasElement & { valid?: boolean };

    // Colorbar (2D)
    lg_colorbar: boolean;
    cbb_top_x1: number;
    cbb_top_y1: number;
    cbb_bot_x1: number;
    cbb_bot_y1: number;
    cbb_width: number;
    cbb_height: number;

    // P-cuts (2D)
    p_cuts: boolean;
    x_box_x: number;
    x_box_y: number;
    x_box_h: number;
    x_box_w: number;
    y_box_x: number;
    y_box_y: number;
    y_box_h: number;
    y_box_w: number;
    p_cuts_xpos?: number;
    p_cuts_ypos?: number;
    x_cut_data: NumericArray[];
    y_cut_data: NumericArray[];
    xcut?: Layer | undefined;
    xcut_layer?: number;
    x_cut_press_on: boolean;
    xcut_now: boolean;
    ycut?: Layer | undefined;
    ycut_layer?: number;
    y_cut_press_on: boolean;
    ycut_now: boolean;
    ylabel_stash?: string | number | undefined;
    cut_stash?: object | undefined;
    element1?: HTMLElement;
    element2?: HTMLElement;

    // Sticky keys
    xyKeys: string;
    x_pop_now: boolean;
    y_pop_now: boolean;

    // State
    old_drawmode?: string;
    old_autol?: number;
    refresh_after_ctr: number;

    // Misc
    lbtn?: HTMLButtonElement | undefined;
    mimic?: object | undefined;
    parent?: HTMLElement;
}

// ---------------------------------------------------------------------------
// PlotSettings — keys handled by change_settings() in sigplot.js
// ---------------------------------------------------------------------------

export interface PlotSettings {
    xyKeys?: string;
    grid?: boolean | null;
    gridBackground?: string;
    gridStyle?: string;
    wheelZoom?: boolean;
    wheelZoomPercent?: number;
    autol?: number;
    index?: boolean | null;
    all?: boolean | null;
    show_x_axis?: boolean | null;
    show_y_axis?: boolean | null;
    show_readout?: boolean | null;
    specs?: boolean | null;
    xcnt?: string | number;
    legend?: boolean | null;
    pan?: boolean | null;
    cross?: boolean | null;
    cmode?: number | string;
    phunits?: string;
    rubberbox_action?: string;
    rubberbox_mode?: string;
    rightclick_rubberbox_action?: string;
    rightclick_rubberbox_mode?: string;
    wheelscroll_mode_natural?: boolean;
    colors?: { fg?: string; bg?: string };
    cmap?: number | ColormapColor[] | string | null;
    yinv?: boolean;
    rasterSmoothing?: boolean | null;
    fillStyle?: string;
    invert?: boolean | null;
    nomenu?: boolean | null;
    ymax?: number | null;
    ymin?: number | null;
    autoy?: number;
    xmin?: number;
    xmax?: number;
    zmin?: number;
    zmax?: number;
    autoz?: number;
    note?: string;
    lg_colorbar?: boolean | null;
    p_cuts?: boolean | null;
    xcut_now?: boolean | null;
    ycut_now?: boolean | null;
}

// ---------------------------------------------------------------------------
// LayerOptions — options accepted by overlay_array / overlay_href / overlay_pipe
// ---------------------------------------------------------------------------

export interface LayerOptions {
    // Common
    name?: string;
    color?: number | string;
    display?: boolean;
    opacity?: number;
    user_data?: any;
    layerType?: "1D" | "2D" | "1DSDS" | "2DSDS" | "SDS";
    expand?: boolean;

    // Layer1D
    framesize?: number;
    mode?: string;
    maxhold?: { decay?: number };
    drawmode?: string;
    tl?: number;
    line?: number;
    thick?: number;
    symbol?: number;
    radius?: number;
    fillStyle?: string | null;
    preferred_origin?: number;
    skip?: number;
    xsub?: number;
    ysub?: number;

    // Layer2D
    drawdirection?: string;
    xcmp?: string | number;
    p_cuts?: boolean;
    subsize?: number;
    downscale?: number;
    lps?: number;
    xcompression?: number;

    // Allow arbitrary overrides
    [key: string]: any;
}

// ---------------------------------------------------------------------------
// TraceOptions — options parameter for mx.trace()
// ---------------------------------------------------------------------------

export interface TraceHighlight {
    xstart: number;
    xend: number;
    color: string;
    fill?: string;
}

export interface TraceOptions {
    dashed?: boolean;
    noclip?: boolean;
    pixels?: boolean;
    vertsym?: boolean;
    horzsym?: boolean;
    highlight?: TraceHighlight[];
    fillStyle?: string | CanvasStyle[];
}

// ---------------------------------------------------------------------------
// Menu types — derived from mx.menu() and mx.dommenu
// ---------------------------------------------------------------------------

export interface MenuItem {
    text: string;
    handler?: () => void;
    checked?: boolean;
    selected?: boolean;
    style?: "normal" | "checkbox" | "separator";
    menu?: MenuItem[] | (() => MenuItem[]);
}

export interface Menu {
    title: string;
    items: MenuItem[];
    finalize?: () => void;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    val?: number;
}

// ---------------------------------------------------------------------------
// Plugin interface — derived from sigplot.plugin.js
// ---------------------------------------------------------------------------

export interface PluginInterface {
    /** Called when plugin is constructed (define properties/locals). */
    pluginConstructor?(): void;

    /** Called after plugin is added to plot. */
    pluginInit?(plot: Plot): void;

    /** Called after plugin is removed from plot. */
    pluginDispose?(): void;

    /** Called when plugin needs to redraw. Render to this.canvas. */
    pluginRefresh?(canvas: HTMLCanvasElement): void;

    /** Return menu structure for plugin. */
    pluginGetMenu?(): MenuItem[] | undefined;

    // Framework-provided methods (available after init)
    init?(plot: Plot, canvas: HTMLCanvasElement): void;
    dispose?(): void;
    refresh?(): void;
    menu?(): MenuItem[] | undefined;
    defineProperty?(name: string, definition: any): void;
    resetProperties?(overrides?: Record<string, any>): void;
    assignProperties?(properties: Record<string, any>): void;
    on?(type: string, fn: (...args: any[]) => void, context?: any): void;
    emit?(type: string, data?: any): void;
    off?(type: string, fn: (...args: any[]) => void, context?: any): void;
    addListener?(what: string, callback: (...args: any[]) => void): void;
    removeListener?(what: string, callback: (...args: any[]) => void): void;

    // Getters
    readonly plot?: Plot;
    readonly Mx?: MxContext;
    readonly Gx?: GxContext;
    readonly canvas?: HTMLCanvasElement;
    readonly Context?: CanvasRenderingContext2D;

    // Default property
    display?: boolean;
}

// ---------------------------------------------------------------------------
// Layer interface — common surface for Layer1D and Layer2D
// ---------------------------------------------------------------------------

export interface Layer {
    plot: Plot;

    // Geometry
    offset: number;
    xstart: number;
    xdelta: number;
    imin: number;
    xmin: number;
    xmax: number;
    name?: string;
    cx: boolean;
    hcb?: BlueHeader;
    size?: number;

    // Display
    display: boolean;
    color: number;
    line: number;
    thick: number;
    symbol: number;
    radius: number;
    skip: number;
    xsub: number;
    ysub: number;
    xdata: boolean;
    modified: boolean;
    opacity: number;
    preferred_origin: number;
    options: Record<string, any>;

    // Layer1D specific
    xbuf?: ArrayBuffer;
    ybuf?: ArrayBuffer;
    xbufn?: number;
    ybufn?: number;
    mode?: string;
    fillStyle?: string | null;
    pointbufsize?: number;
    xptr?: ArrayBuffer | null;
    yptr?: ArrayBuffer | null;
    mhptr?: ArrayBuffer | null;
    xpoint?: Float64Array | Float32Array | null;
    ypoint?: Float64Array | Float32Array | null;
    mhpoint?: Float64Array | Float32Array | null;
    maxhold?: { decay?: number };
    firstpush?: boolean;
    drawmode?: string;
    position?: number;
    tle?: number;
    xlab?: number;
    ylab?: number;

    // Layer2D specific
    ystart?: number;
    ydelta?: number;
    ymin?: number;
    ymax?: number;
    xframe?: number;
    yframe?: number;
    lpb?: number;
    yc?: number;
    xcompression?: number;
    downscale?: number;
    drawdirection?: string;
    img?: HTMLCanvasElement;
    frame?: number;
    lps?: number;
    buf?: NumericArray | undefined;
    zbuf?: PointArray | undefined;

    // Methods
    init(hcb: BlueHeader, options?: LayerOptions): void;
    get_data(xmin?: number, xmax?: number): number | void;
    change_settings(settings: Record<string, any>): void;
    reload(data: ArrayBuffer | NumericArray, hdrmod?: Partial<BlueHeader>): void;
    push(data: ArrayBuffer | NumericArray, hdrmod?: Partial<BlueHeader>, sync?: boolean): void;
    prep(xmin: number, xmax: number): { num: number; start: number; end: number };
    draw(): void;
    get_pan_bounds(view?: { xmin: number; xmax: number }): { xmin?: number; xmax?: number };
    add_highlight?(highlight: HighlightEntry | HighlightEntry[]): void;
    remove_highlight?(highlight: HighlightEntry): void;
    get_highlights?(): HighlightEntry[];
    clear_highlights?(): void;

    // Layer2D methods
    init_axes?(): void;
    get_z?(x: number, y: number): number | undefined;
    xCutData?(ypos: number, zData?: PointArray): NumericArray;
    xCut?(ypos: number): void;
    yCutData?(xpos: number, zData?: PointArray): NumericArray;
    yCut?(xpos: number): void;
}
