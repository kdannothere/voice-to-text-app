export function getSearchParams() {
  if (typeof window !== "undefined") {
    return new URLSearchParams(window.location.search);
  }
  return null; // Or handle the server-side case appropriately
}