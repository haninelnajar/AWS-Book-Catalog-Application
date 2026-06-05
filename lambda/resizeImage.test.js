const { test } = require("node:test");
const assert = require("node:assert");

const { decideAction } = require("./resizeImage");

test("skips objects already tagged resized=true", () => {
  const action = decideAction({ resizedFlag: "true", width: 4000, height: 4000, max: 300 });
  assert.strictEqual(action, "skip-flag");
});

test("skips images already within max on both dimensions (square)", () => {
  const action = decideAction({ resizedFlag: undefined, width: 300, height: 300, max: 300 });
  assert.strictEqual(action, "skip-size");
});

test("skips non-square images already within max (the infinite-loop trap)", () => {
  // 300x225 must NOT be resized again, even though it != 300x300
  const action = decideAction({ resizedFlag: undefined, width: 300, height: 225, max: 300 });
  assert.strictEqual(action, "skip-size");
});

test("resizes images larger than max", () => {
  const action = decideAction({ resizedFlag: undefined, width: 2000, height: 1500, max: 300 });
  assert.strictEqual(action, "resize");
});

test("flag check wins even if size would say resize", () => {
  const action = decideAction({ resizedFlag: "true", width: 2000, height: 1500, max: 300 });
  assert.strictEqual(action, "skip-flag");
});
