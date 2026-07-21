declare module '@yume-chan/adb-daemon-webusb' {
  export class AdbDaemonWebUsbDeviceManager {
    static readonly BROWSER: AdbDaemonWebUsbDeviceManager | undefined;
    constructor(usbManager: USB);
    requestDevice(options?: { filters?: readonly USBDeviceFilter[] }): Promise<AdbDaemonWebUsbDevice | undefined>;
  }
  export class AdbDaemonWebUsbDevice {
    get raw(): USBDevice;
    get serial(): string;
    get name(): string;
    constructor(device: USBDevice, interface_: any, usbManager: USB);
    connect(): Promise<any>;
  }
}

declare module '@yume-chan/adb' {
  export class AdbDaemonTransport {
    static authenticate(options: any): Promise<AdbDaemonTransport>;
    get serial(): string;
    get banner(): any;
    get disconnected(): Promise<void>;
    close(): Promise<void>;
    connect(service: string): any;
  }
  export class Adb {
    constructor(transport: AdbDaemonTransport);
    get transport(): AdbDaemonTransport;
    get serial(): string;
    get banner(): any;
    get subprocess(): any;
    get tcpip(): any;
    getProp(key: string): Promise<string>;
    close(): Promise<void>;
  }
  export interface AdbCredentialStore {
    generateKey(): Promise<AdbPrivateKey>;
    iterateKeys(): AsyncIterable<AdbPrivateKey>;
  }
  export interface AdbPrivateKey {
    buffer: Uint8Array;
    name?: string;
  }
}
