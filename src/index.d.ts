declare module '*.png' {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value: any;
    export = value;
}

declare module '*.scss' {
    // style imports are handled by the bundler
    const value: string;
    export default value;
}

declare module '*.svg' {
    // svg imports resolve to the emitted asset's URL
    const value: string;
    export default value;
}
