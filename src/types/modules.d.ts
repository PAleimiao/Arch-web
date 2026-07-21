declare module 'gsap' {
  const gsap: any;
  export default gsap;
  export const Timeline: any;
  export const Tween: any;
}

declare module 'zustand' {
  const create: any;
  export { create };
}

declare module '@gsap/react' {
  export const useGSAP: any;
}

declare module 'zustand/shallow' {
  const shallow: any;
  export { shallow };
}

declare module 'zustand/middleware' {
  export const persist: any;
}
