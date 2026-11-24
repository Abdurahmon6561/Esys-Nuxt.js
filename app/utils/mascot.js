export function shouldDeferMascot({ smallScreen, coarsePointer, reducedMotion }) {
  return smallScreen || coarsePointer || reducedMotion;
}
