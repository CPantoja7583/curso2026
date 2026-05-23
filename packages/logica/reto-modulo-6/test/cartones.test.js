const assert = require("node:assert/strict");
const test = require("node:test");

const {
  generateCartonNumbers,
  mapCartonRow,
  getStaticFilePath
} = require("../server");

test("generateCartonNumbers creates 15 unique sorted numbers from 1 to 30", () => {
  const numbers = generateCartonNumbers();
  const uniqueNumbers = new Set(numbers);

  assert.equal(numbers.length, 15);
  assert.equal(uniqueNumbers.size, 15);
  assert.deepEqual(numbers, [...numbers].sort((left, right) => left - right));
  assert.ok(numbers.every((number) => Number.isInteger(number) && number >= 1 && number <= 30));
});

test("mapCartonRow returns the public carton JSON shape", () => {
  const row = {
    serie: 7,
    numeros: [12, 3, 18]
  };

  assert.deepEqual(mapCartonRow(row), {
    serie: 7,
    numeros: [12, 3, 18]
  });
});

test("getStaticFilePath keeps requests inside the public directory", () => {
  const publicDir = "C:\\app\\public";

  assert.equal(getStaticFilePath("/", publicDir), "C:\\app\\public\\index.html");
  assert.equal(getStaticFilePath("/cartones.html", publicDir), "C:\\app\\public\\cartones.html");
  assert.equal(getStaticFilePath("/../server.js", publicDir), null);
});
