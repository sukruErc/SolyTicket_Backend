// eslint-disable-next-line @typescript-eslint/no-var-requires
const { execSync } = require("child_process");

// first two args can be ignored rest will be passed directly to the npm command
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const [ignore, ignore2, ...args] = process.argv;

// windowsHide option will hide the cmd window
execSync(`npm ${args.join(" ")}`, { windowsHide: true, stdio: "inherit" });
