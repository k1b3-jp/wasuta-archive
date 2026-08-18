import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const adminApis = [
	"src/pages/api/archive/member-relations.ts",
	"src/pages/api/archive/records.ts",
	"src/pages/api/archive/sources.ts",
	"src/pages/api/archive/check-links.ts",
	"src/pages/api/archive/quality.ts",
	"src/pages/api/milestones/audit.ts",
	"src/pages/api/milestones/discard.ts",
	"src/pages/api/milestones/withdraw.ts",
	"src/pages/api/events/create.ts",
	"src/pages/api/events/update.ts",
];
for (const path of adminApis) {
	const source = await readFile(new URL(`../${path}`, import.meta.url), "utf8");
	assert.match(source, /requireAdmin\(/, `${path} must require an administrator`);
	assert.match(source, /req\.method/, `${path} must restrict HTTP methods`);
}
const authenticatedApis = ["src/pages/api/milestones/create.ts", "src/pages/api/milestones/update.ts", "src/pages/api/milestones/publish.ts", "src/pages/api/milestones/manage.ts"];
for (const path of authenticatedApis) {
	const source = await readFile(new URL(`../${path}`, import.meta.url), "utf8");
	assert.match(source, /createAuthenticatedClient\(/, `${path} must use the caller JWT`);
	assert.match(source, /requireAuthenticatedUser\(/, `${path} must authenticate the caller`);
}
console.log(`API security contracts OK: ${adminApis.length + authenticatedApis.length} routes`);
