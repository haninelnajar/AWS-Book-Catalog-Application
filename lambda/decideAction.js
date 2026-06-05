// Pure decision: what should the handler do with this object?
// Returns "skip-flag" | "skip-size" | "resize".
// Guard order matters: the flag check is the primary loop-breaker; the size
// check uses <= max (NOT ==) so a non-square resized image like 300x225 is
// recognized as already-done instead of being resized forever.
function decideAction({ resizedFlag, width, height, max }) {
  if (resizedFlag === "true") return "skip-flag";
  if (width <= max && height <= max) return "skip-size";
  return "resize";
}

module.exports = { decideAction };
