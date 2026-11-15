declare module 'virtual:phishlens-sandbox-runtime' {
  /** Self-contained IIFE bundle of the guest runtime (src/sandbox/runtime). */
  const code: string;
  export default code;
}

declare module '*.css' {
  const css: string;
  export default css;
}
