import { spawn } from "node:child_process";
const commands = [
  ["npm", ["run", "dev", "--workspace=@lawcall/api"]],
  ["npm", ["run", "dev", "--workspace=@lawcall/web"]]
];
const children = commands.map(([cmd, args]) => spawn(cmd, args, { stdio: "inherit", shell: process.platform === "win32" }));
for (const child of children) child.on("exit", (code) => {
  if (code && code !== 0) {
    for (const other of children) if (other !== child) other.kill();
    process.exitCode = code;
  }
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => {
  for (const child of children) child.kill(signal);
});
