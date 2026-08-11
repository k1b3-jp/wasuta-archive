import { execFileSync } from "node:child_process";

const tree = JSON.parse(
	execFileSync("npm", ["ls", "react", "react-dom", "--all", "--json"], {
		encoding: "utf8",
	}),
);
const versions = { react: new Set(), "react-dom": new Set() };

function visit(node) {
	for (const [name, dependency] of Object.entries(node.dependencies || {})) {
		if (name in versions && dependency.version) versions[name].add(dependency.version);
		visit(dependency);
	}
}

visit(tree);
for (const [name, found] of Object.entries(versions)) {
	if (found.size !== 1) {
		throw new Error(`${name} must resolve to one version, found: ${[...found].join(", ") || "none"}`);
	}
}

console.log(`React runtime OK: react ${[...versions.react][0]}, react-dom ${[...versions["react-dom"]][0]}`);
