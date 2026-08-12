export function getNested(obj, path, fallback = undefined) {
  const result = path
    .split(".")
    .reduce((current, key) => current?.[key], obj);

  return result ?? fallback;
};