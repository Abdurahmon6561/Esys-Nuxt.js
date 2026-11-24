// Share one import/registration across scopes without pulling GSAP into the entry.
let core;
let plugins;

export function loadGsap() {
  return (core ??= import("gsap").then(({ gsap }) => gsap));
}

export function loadGsapWithScrollTrigger() {
  return (plugins ??= Promise.all([
    loadGsap(),
    import("gsap/ScrollTrigger"),
  ]).then(([gsap, { ScrollTrigger }]) => {
    gsap.registerPlugin(ScrollTrigger);
    return { gsap, ScrollTrigger };
  }));
}
