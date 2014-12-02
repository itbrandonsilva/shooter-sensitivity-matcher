var ref        = require("ref");
var struct     = require("ref-struct");
var ffi        = require("ffi");
var commader   = require("commander");
var progress   = require("progress");
var async      = require("async");

var BWIDTH = 20;

var program = require("commander")
    .version("1.0.0")
    .option("-w, --width <int>", "Pixel width of your desktop.", parseInt)
    .option("-s, --startup <int>", "Startup delay, in seconds. (10)", parseInt)
    .option("-d, --delay <int>", "Delay before each cursor offset, in seconds. (5)", parseInt)
    .parse(process.argv)
;

console.log("\n\n -- Sensitivity Matcher " + program.version() + "\n");

program.startup = program.startup || 10;
program.delay = program.delay || 5;
if ( ! program.width ) {
   console.error("ERROR: Missing --width argument. Enter \"cssm.js --help\" for more information.");
   process.exit();
}

var POINT = struct({
    x: ref.types.long,
    y: ref.types.long
});
var LPPOINT = ref.refType(POINT);

var user32 = ffi.Library('user32', {
    'SetCursorPos': [ "bool", ["long", "long"] ],
    'GetCursorPos': [ "bool", [LPPOINT] ]
});

var bar = new progress("Beginning: :current/:total :bar", { total: program.startup, width: BWIDTH, clear: true });
async.until(
    function () { return bar.complete; },
    function (cb) { setTimeout(function () { bar.tick(); cb(); }, 1000) },
    function (err) { offset(); }
);

function offset() {
    bar = new progress("Offsetting: :current/:total :bar", { total: program.delay, width: BWIDTH, clear: true });

    async.until(
        function () { return bar.complete; },
        function (cb) { setTimeout(function () { bar.tick(); cb(); }, 1000); },
        function (err) {

            var point = new POINT;
            var result = user32.GetCursorPos(point.ref());
            var newX = Math.round(point.x + (program.width/2));
            user32.SetCursorPos(newX, point.y);
            offset();

        }
    );
}