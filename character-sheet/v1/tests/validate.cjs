const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const directions = [
  "up","up-up-right","up-right","right-up-right","right",
  "right-right-down","right-down","down-right-down","down",
  "down-down-left","down-left","left-down-left","left",
  "left-left-up","left-up","up-left-up"
];
const read = name => JSON.parse(fs.readFileSync(path.join(root, "characters", name + ".json"), "utf8"));
for (const name of ["ash", "mona", "blank"]) {
  const c = read(name);
  assert.equal(c.schemaVersion, 1, name + ": schema version");
  assert.equal(typeof c.id, "string");
  assert.equal(typeof c.name, "string");
  assert.equal(c.gaze.frames.length, 16, name + ": must have 16 gaze directions");
  assert.deepEqual(new Set(c.gaze.frames.map(x => x.direction)), new Set(directions), name + ": gaze frame mapping");
  for (const f of c.gaze.frames) {
    if (name === "blank") {
      assert.equal(f.url, "", "blank starter should not use another character's assets");
    } else {
      assert.match(f.url, /^https:\/\//, name + ": gaze frame URL");
    }
  }
  if (c.turntable.enabled) {
    assert.equal(c.turntable.frames.length, 16, name + ": turntable frame count");
    assert.equal(new Set(c.turntable.frames.map(x => x.yaw)).size, 16, name + ": unique yaw values");
    c.turntable.frames.forEach(x => assert.match(x.url, /^https:\/\//));
  }
  for (const key of ["poses", "afterdark", "gallery"]) {
    (c[key] || []).forEach(x => assert.match(x.url, /^https:\/\//, key + ": asset URL"));
  }
  console.log("PASS", name, "manifest");
}
const css = fs.readFileSync(path.join(root, "engine.css"), "utf8");
const engine = fs.readFileSync(path.join(root, "engine.js"), "utf8");
assert.ok(css.includes("#characterApp .cs-frame{"), "Missing shared clipping container");
assert.ok(css.includes("overflow:hidden;contain:paint"), "Clipping containment missing");
assert.ok(engine.includes("const manifest=document.getElementById(\"characterManifest\")"), "Engine must read manifest, not hardcode character");
assert.ok(!engine.includes("const REGISTRY="), "Character data leaked into shared engine");
console.log("PASS shared rendering contracts");
