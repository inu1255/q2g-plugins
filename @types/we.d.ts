declare const __we: any;
declare const cordova: any;
declare const chcp: any;
declare let events: {};
declare let eventCache: {};
declare function callEvent(type: string, data: {
    type: string;
    data?: any;
}): void;
declare function onceEvent(type: string): Promise<unknown>;
/** 源码ID */
declare let sourceID: number;
declare let m_watchDB: any;
declare let m_watchLocal: any;
declare class We {
    ver: WeVer;
    pkgname: string;
    clsname: string;
    config: {
        _baseURL: string;
        apiURL: string;
        dev: any;
        online: boolean;
    };
    constructor();
    get v8(): any;
    getEvents(): {};
    getEventCache(): {};
    on(type: string, cb: (data: {
        type: string;
        data?: any;
    }) => void): void;
    once<T>(type: string, cb?: (data: {
        type: string;
        data?: any;
    }) => T): Promise<T>;
    off(type: string, cb?: (data: {
        type: string;
        data?: any;
    }) => void): void;
    offAll(): Promise<any>;
    bonjourFind(type?: string): any;
    bonjourStop(): any;
    newWS(url: string, key?: string, ms?: number): Promise<WS>;
    request(url: string, method: string, data?: any, headers?: any): Promise<any>;
    playSound(url: string, leftVolume: number, rightVolume: number, priority: number, loop: number, rate: number): Promise<number>;
    ajax(url: string, method: string, data?: any, config?: any): Promise<any>;
    get(url: string, data?: any, config?: any): Promise<any>;
    post(url: string, data?: any, config?: any): Promise<any>;
    eval8(url: string, ignore?: boolean): Promise<any>;
    reportText(pkg: string, cls: string, text: string): Promise<any>;
    initV8(restart?: boolean, config?: Partial<WeConfig>): any;
    setDebug(debug: boolean): any;
    /**
     * 在后台执行js代码
     */
    eval(code?: string | Function, ...args: any[]): any;
    /**
     * 广播消息
     * 辅助功能开启：     c
     * 辅助功能关闭：     d
     * 按键事件：        k:[keyCode]         [action]:[characters]
     * 辅助事件：        a:[eventType]       [pkg],[cls]
     * 消息事件：        n:[nid]             [data]
     * 函数回调：        cb:[random]
     * 浮窗权限申请结果： float               0/1
     * 录屏权限申请结果： screen_capture      0/1
     * 权限申请结果：     g:[权限]            0/1
     * kv写入事件：      db:[key]
     * 浮窗事件：        of:[key]:[type]     [msg]
     * @param {string} data
     * @param {number} mode 0x01 广播给前端 0x02 广播给后台
     */
    emit(data: string, mode?: number): any;
    emitData(type: string, data?: any): any;
    checkNetwork(): Promise<any>;
    getIp(): Promise<any>;
    deviceID(): Promise<string>;
    getLauncherName(): any;
    /**
     * 打印日志
     * @param {string} msg
     */
    info(msg: string): Promise<any>;
    /**
     * 打印日志
     * @param {string} msg
     */
    error(msg: string): Promise<any>;
    sleep(ms: number): any;
    getBatteryLevel(): Promise<any>;
    copy(text: string, label?: string): any;
    paste(): Promise<string>;
    /**
     * @param {string} text
     * @param {number} duration 0: short 1: long
     */
    toast(text: string, duration?: number): any;
    xtoast(base64: string, setting?: any): any;
    isScreenOn(): Promise<boolean>;
    wakeup(ms?: number): any;
    requestPermissions(permissions: string): Promise<boolean>;
    open(pkg?: string, cls?: string, extra?: any): Promise<any>;
    isInstall(pkg: string): any;
    setData(key: string, value: any, replacer?: (key: string, value: any) => any): any;
    getData(key: string, def?: any): any;
    dbset(key: string, value?: any, replacer?: (key: string, value: any) => any): Promise<number>;
    dbget(key: string): Promise<any>;
    ntget(k: string): Promise<any>;
    ntset(k: string, v: any): Promise<number>;
    watch(obj: any, fn: Function): any;
    watchDB<T>(key: string, def?: T, ms?: number): T & {
        _pms: Promise<any>;
    };
    watchLocal<T>(key: string, def?: T, ms?: number): T;
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
    autostartSetting(): any;
    isDebuggerConnected(): any;
    getApk(pkgname: string): any;
    getAppSign(pkgname: string, algorithm?: "MD5" | "SHA1"): any;
    md5(s: string, algorithm: string): any;
    throwException(access: boolean): any;
    readdir(dir: string): any;
    statFile(filename: string): any;
    readFile(filename: string, encode?: "utf8" | "base64"): any;
    writeFile(filename: string, b64: string): any;
    copyFile(src: string, dst: string): any;
    unlink(filename: string): any;
    isDeviceAdmin(): any;
    requestDeviceAdmin(): any;
    uninstallNormal(pkgname: string): any;
    installNormal(path: string): any;
    clickXY(x: number, y: number, duration?: number): Promise<number>;
    openAccessibilitySetting(): any;
    exit(code?: number): any;
    restart(ms?: number): any;
    isAccessibilitySettingsOn(): any;
    disableAccessibility(): any;
    printTree(): any;
    setIgnore(pkgs: string[], clss: string[], eventTypes: number[]): any;
    getNodes(needText?: boolean | number, subText?: string, area?: Rect): Promise<AccessibilityNode[]>;
    /**
     * @param {string} text
     * @param {number} [maxLen=6]
     * @returns {Promise<AccessibilityNode[]>}
     */
    findSubText(text: string, maxLen?: number): Promise<AccessibilityNode[]>;
    getCurrentPackage(): Promise<string>;
    /**
     * findAccessibilityNodeInfosByText 匹配的全部点击
     * @param {string} text
     */
    clickByText(text: string): any;
    /**
     * findAccessibilityNodeInfosByViewId 匹配的全部点击
     * @param {string} id
     */
    clickByView(id: string, flag?: number): any;
    /**
     * 通过 getNodes 获得的ID点击
     * @param {number} id
     * @param {number} flag 1:按坐标点击 2:按节点点击
     */
    clickById(id: number, flag?: number): any;
    getPathById(id: number, flag?: number): any;
    getNodeByPath(path: string, pkg?: string): Promise<AccessibilityNode>;
    clickByPath(path: string, pkg?: string, flag?: number): any;
    click(data: ClickInfo, pkg?: string, flag?: number): Promise<any>;
    setNodeText(id: number, text: string): any;
    /**
     * 包含关键词的都点击
     * @param {string} text
     * @param {number} [maxLen=6]
     */
    clickSubText(text: string, maxLen?: number): any;
    /**
     * 获取所有文字
     * @returns {Promise<string>}
     */
    getAllText(): Promise<string>;
    /**
     *
     * @param {number} action [null, BACK, HOME, RECENTS, ]
     * 1: go back.
     * 2: go home.
     * 3: toggle showing the overview of recent apps. Will fail on platforms that don't
     * 4: open the notifications.
     * 5: open the quick settings.
     * 6: open the power long-press dialog.
     * 7: toggle docking the current app's window
     * 8: lock the screen
     * 9: take a screenshot
     */
    performGlobalAction(action: number): any;
    /**
     * 执行手势
     * @param {string} paths "x0,y0,x1,y1,..."
     * @param {number} startTime
     * @param {number} duration
     */
    dispatchGesture(paths: string, startTime: number, duration: number): any;
    swape(direction: "up" | "right" | "left" | "down", duration: number): Promise<any>;
    sendNotification(title: string, text: string, json: any): any;
    notificationCancel(id: string): any;
    isNotificationEnabled(): any;
    openNotificationSetting(): any;
    screenSize(): Promise<Point & {
        h: number;
        f: number;
        dpi: number;
    }>;
    getIPLocal(): any;
    /**
     * @param {number} [flag] 0:全部 1:用户 2:系统
     */
    getApps(flag: number): Promise<AppInfo[]>;
    /**
     * @param {number} flag 0x04000000 全屏
     */
    addFlags(flag: number): any;
    /**
     * @param {number} flag 0x04000000 全屏
     */
    clearFlags(flag: number): any;
    setSystemUiVisibility(flag: number): any;
    setStatusBarColor(argb: number): any;
    canDrawOverlays(): any;
    checkFloatWindow(): any;
    applyFloatWindow(): any;
    getAllFloatWindow(): any;
    closeAllFloatWindow(): any;
    newFloatWindow(key: string, opts?: FloatWindowOptions): FloatWindow;
    /** 关闭时返回 */
    openFloatWindow(key: string, opts?: FloatWindowOptions): Promise<any>;
    /**
     * 关闭浮窗窗口并返回数据
     */
    closeFloatWindow(key: string, msg?: any): any;
    /**
     * 销毁浮窗窗口并返回数据
     */
    destroyFloatWindow(key: string, msg?: any): Promise<any>;
    evalFloatWindow(key: string, code: string | Function, ...args: any[]): Promise<any>;
    /** 关闭时返回 */
    openLink(url: string, opts?: OpenLinkOptions): Promise<ReturnType<typeof newWebActivity>>;
    webEval(no: string, code: string): any;
    getAllWebs(): any;
    checkMoveTop(): Promise<any>;
    applyMoveTop(): Promise<any>;
    applyVirtualDisplay(): Promise<unknown>;
    initScreenCapture(): Promise<any>;
    initScreenRecord(): Promise<any>;
    getScreenCapture(): Promise<any>;
    closeVirtualDisplay(): Promise<any>;
    screenCapture(): Promise<any>;
    scan(b64?: string): any;
    jdinit(appid: string, appsecret: string): any;
    jdopen(url: string): Promise<any>;
    alibcInit(): Promise<any>;
    alibcOpen(url: string): Promise<any>;
    /**
     * @param url
     * @param cookie name=value
     */
    setCookie(url: string, cookie: string): Promise<any>;
    setCookies(url: string, cookies: string): any;
    getCookie(url: string): Promise<any>;
    pushDebug(debug: boolean): any;
    pushRegister(other: boolean): any;
    /**
     * @param {boolean} [light] 状态栏亮色模式
     */
    setStatusBarLight(light: boolean): any;
    /**
     * 沉浸式访问
     * @param {boolean} [light] 状态栏亮色模式
     */
    setImmersive(light: boolean): Promise<[any, any]>;
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
    showPoint(x: number, y: number, forever?: boolean): void | (() => void);
    setText(s: string): Promise<any>;
    getCouponWord(data: any, type: "history" | "material"): Promise<string>;
    openCouponWord(data: any, coupon_word: string, share?: boolean): Promise<void>;
    meituan(): Promise<void>;
    pluginCompile<T>(code: string): QPlugin<T>;
    readonly<T>(obj: T): T;
    throttle<T extends Function>(fn: T, delay?: number): T;
    debounce<T extends Function>(fn: T, delay?: number): T;
    timestamp(t?: Date): string;
}
declare class WS {
    private key;
    private url;
    private ms;
    constructor(url: string, key: string, ms?: number);
    on(cb: (data: {
        type: string;
        data?: any;
    }) => void): void;
    once(cb?: (data: {
        type: string;
        data?: any;
    }) => unknown): Promise<unknown>;
    off(cb?: (data: {
        type: string;
        data?: any;
    }) => void): void;
    write(data: string, base64: boolean): any;
    open(): any;
    closed(): any;
    close(): any;
}
declare function exec(method: string, args: any[]): Promise<any>;
declare function optJSON(def: any): (text: string) => any;
declare function newWebActivity(no: string): {
    onclose: Promise<unknown>;
    eval: (code?: string | Function, ...args: any[]) => any;
    on(type: string, cb: (data: {
        type: string;
        data?: any;
    }) => void): void;
    once(type: string, cb?: (data: {
        type: string;
        data?: any;
    }) => void): Promise<void>;
};
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
    /** 是否强制设置layout */
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
    off: (type: string, cb?: (data: {
        type: string;
        data?: any;
    }) => void) => void;
    destroy: (v?: any) => Promise<any>;
    close: (v?: any) => Promise<any>;
    open: (v?: FloatWindowOptions) => Promise<any>;
    eval: (v: string | Function, ...args: any[]) => Promise<any>;
}
interface AppInfo {
    /** &1: 系统 &2: debug able */
    flags: number;
    name: string;
    pkg: string;
    version: string;
    ver: number;
    /** base64 图标 */
    logo: string;
}
interface WeConfig {
    /** public 相对路径 */
    _baseURL: string;
    /** API地址 */
    apiURL: string;
    /** 开发模式 */
    dev: boolean;
    /** 是否在线 */
    online: boolean;
}
interface WeVer {
    appVersion: string;
    buildVersion: string;
    previousWebVersion: string;
    readyToInstallWebVersion: string;
    currentWebVersion: string;
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
    /** findSubText 时返回 */
    pkg?: string;
    id: number;
}
interface Rect {
    left: number;
    right: number;
    top: number;
    bottom: number;
}
interface AppSetting {
    /** 读取剪贴板 */
    paste: boolean;
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
interface OpenLinkOptions {
    data?: any;
    preload?: string;
    methods?: string;
    color?: number;
}
interface ClickInfo {
    view?: string;
    text?: string;
    path?: string;
    dx?: number;
    dy?: number;
}
declare let _closeShowPoint: () => void;
