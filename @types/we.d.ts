declare const __we: any;
declare const cordova: any;
declare let events: {};
declare let eventCache: {};
declare function callEvent(type: string, data: {
    type: string;
    data?: any;
}): void;
declare function onceEvent(type: string): Promise<unknown>;
declare let sourceID: number;
declare class We {
    _config: WeConfig;
    config: WeConfig;
    constructor();
    get v8(): any;
    on(type: string, cb: (data: {
        type: string;
        data?: any;
    }) => void): void;
    once<T>(type: string, cb?: (data: {
        type: string;
        data?: any;
    }) => T): Promise<T>;
    off(type: string, cb: (data: {
        type: string;
        data?: any;
    }) => void): void;
    offAll(): void;
    request(url: string, method: string, data?: any, headers?: any): Promise<any>;
    ajax(url: string, method: string, data?: any, config?: any): Promise<any>;
    get(url: string, data?: any, config?: any): Promise<any>;
    post(url: string, data?: any, config?: any): Promise<any>;
    eval8(url: string): Promise<any>;
    initV8(restart?: boolean, config?: Partial<WeConfig>): any;
    eval(name: string, code: string): any;
    eval(code: string): any;
    emit(data: string, mode: number): Promise<any>;
    checkNetwork(): Promise<any>;
    getIp(): Promise<any>;
    deviceID(): Promise<string>;
    info(msg: string): Promise<any>;
    error(msg: string): Promise<any>;
    sleep(ms: number): Promise<any>;
    getBatteryLevel(): Promise<any>;
    copy(text: string, label?: string): any;
    paste(): Promise<string>;
    toast(text: string, duration?: number): any;
    open(pkg?: string, cls?: string, extra?: any): Promise<any>;
    isInstall(pkg: string): any;
    setData(key: string, value: any): any;
    getData(key: string, def?: any): any;
    dbset<K extends keyof WeSettings>(key: K, value: WeSettings[K]): Promise<number>;
    dbget<K extends keyof WeSettings>(key: K): Promise<WeSettings[K]>;
    dbkeys(): Promise<string[]>;
    deviceInfo(): Promise<{
        product: string;
        brand: string;
        model: string;
        fingerprint: string;
        manufacturer: string;
        host: string;
        version: string;
        hardware: string;
    }>;
    isDebuggerConnected(): any;
    clickXY(x: number, y: number, duration?: number): any;
    openAccessibilitySetting(): any;
    isAccessibilitySettingsOn(): any;
    disableAccessibility(): any;
    printTree(): any;
    setIgnore(pkgs: string[], clss: string[], eventTypes: number[]): any;
    getNodes(needText?: boolean | number, subText?: string, area?: Rect): Promise<AccessibilityNode[]>;
    findSubText(text: string, maxLen?: number): Promise<AccessibilityNode[]>;
    getCurrentPackage(): Promise<string>;
    clickByText(text: string): any;
    clickByView(id: string): any;
    clickById(id: number): any;
    clickSubText(text: string, maxLen?: number): any;
    getAllText(): Promise<string>;
    performGlobalAction(action: number): any;
    dispatchGesture(paths: string, startTime: number, duration: number): any;
    sendNotification(title: string, text: string, json: any): any;
    notificationCancel(id: string): any;
    isNotificationEnabled(): any;
    openNotificationSetting(): any;
    screenSize(): Promise<Point>;
    getApps(flag: number): Promise<AppInfo[]>;
    addFlags(flag: number): any;
    clearFlags(flag: number): any;
    setSystemUiVisibility(flag: number): any;
    setStatusBarColor(argb: number): any;
    canDrawOverlays(): any;
    checkFloatWindow(): any;
    applyFloatWindow(): any;
    newFloatWindow(key: string, opts?: FloatWindowOptions): FloatWindow;
    openFloatWindow(key: string, opts?: FloatWindowOptions): Promise<any>;
    closeFloatWindow(key: string, msg?: any): any;
    destroyFloatWindow(key: string, msg?: any): Promise<any>;
    evalFloatWindow(key: string, code: string): Promise<any>;
    openLink(url: string, data?: any, color?: number): Promise<any>;
    checkMoveTop(): Promise<any>;
    applyMoveTop(): Promise<any>;
    applyVirtualDisplay(): Promise<unknown>;
    initScreenCapture(): Promise<any>;
    initScreenRecord(): Promise<any>;
    getScreenCapture(): Promise<any>;
    closeVirtualDisplay(): Promise<any>;
    jdinit(appid: string, appsecret: string): any;
    jdopen(url: string): Promise<any>;
    setCookie(url: string, cookie: string): Promise<any>;
    getCookie(url: string): Promise<any>;
    getCookies(url: string): Promise<any>;
    setStatusBarLight(light: boolean): any;
    setImmersive(light: boolean): Promise<[any, any]>;
    keepFloat(): Promise<any>;
    shareText(text: string, scene?: "TIMELINE" | "SESSION" | "FAVORITE"): Promise<unknown>;
    shareLink(data: {
        url: string;
        title: string;
        description: string;
        thumb: string;
    }, scene?: "TIMELINE" | "SESSION" | "FAVORITE"): Promise<unknown>;
    shareImage(data: {
        url: string;
        title: string;
        description: string;
        thumb: string;
    }, scene?: "TIMELINE" | "SESSION" | "FAVORITE"): Promise<unknown>;
    scanQR(opts?: ScanOptions): Promise<{
        text: string;
        format: string;
        cancelled: boolean;
    }>;
    encodeQR(data: string, type?: "TEXT" | "EMAIL" | "PHONE" | "SMS"): Promise<unknown>;
    get gpsWin(): FloatWindow & {
        text: string;
    };
    setText(s: string): Promise<any>;
    getCouponWord(data: any, type: "history" | "material"): Promise<string>;
    openCouponWord(data: any, coupon_word: string, share?: boolean): Promise<void>;
}
declare function exec(method: string, args: any[]): Promise<any>;
declare function optJSON(def: any): (text: string) => any;
declare const we: We;
interface FloatWindowOptions {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    url?: string;
    baseURL?: string;
    data?: string;
    movable?: boolean;
    forceLayout?: boolean;
}
interface FloatWindow {
    r: any;
    onclose: Promise<any>;
    once: (type: string) => Promise<any>;
    on: (type: string, cb: (data: {
        type: string;
        data?: any;
    }) => void) => void;
    destroy: (v?: any) => Promise<any>;
    close: (v?: any) => Promise<any>;
    open: (v?: FloatWindowOptions) => Promise<any>;
    eval: (v: string) => Promise<any>;
}
interface AppInfo {
    flags: number;
    name: string;
    pkg: string;
    version: string;
    ver: number;
    logo: string;
}
interface WeConfig {
    baseURL: string;
    dev: boolean;
    online: boolean;
}
interface Point {
    x: number;
    y: number;
}
interface AccessibilityNode {
    text: string;
    cls: string;
    view: string;
    left: number;
    right: number;
    top: number;
    bottom: number;
    pkg?: string;
    id: number;
}
interface Rect {
    left: number;
    right: number;
    top: number;
    bottom: number;
}
interface WeSettings {
    DEBUG: boolean;
    plugins: string[];
}
interface ScanOptions {
    preferFrontCamera: boolean;
    showFlipCameraButton: boolean;
    showTorchButton: boolean;
    torchOn: boolean;
    saveHistory: boolean;
    prompt: string;
    resultDisplayDuration: number;
    formats: string;
    orientation: string;
    disableAnimations: boolean;
    disableSuccessBeep: boolean;
}
