export function debounce(f, t) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => f.apply(this, args), t);
  };
}
