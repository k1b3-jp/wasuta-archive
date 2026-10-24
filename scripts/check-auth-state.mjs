import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/build/swc");
const source = readFileSync(
	new URL("../src/contexts/AuthContext.tsx", import.meta.url),
	"utf8",
);
const { code } = transformSync(source, {
	filename: "AuthContext.tsx",
	jsc: {
		parser: { syntax: "typescript", tsx: true },
		transform: { react: { runtime: "automatic" } },
	},
	module: { type: "commonjs" },
});
const slots = [];
let cursor = 0;
let effect;
let authChanged;
const pending = [];
const react = {
	createContext: () => ({ Provider: "provider" }),
	useContext: () => {},
	useState(initial) {
		const index = cursor++;
		if (!(index in slots)) slots[index] = initial;
		return [
			slots[index],
			(value) => {
				slots[index] = value;
			},
		];
	},
	useRef(initial) {
		const index = cursor++;
		if (!(index in slots)) slots[index] = { current: initial };
		return slots[index];
	},
	useEffect(callback) {
		effect = callback;
	},
};
const exported = {};
vm.runInNewContext(code, {
	exports: exported,
	require(name) {
		if (name === "react") return react;
		if (name === "react/jsx-runtime")
			return { jsx: (type, props) => ({ type, props }) };
		if (name === "@/lib/supabaseClient")
			return {
				supabase: {
					auth: {
						getSession: () => new Promise(() => {}),
						onAuthStateChange(callback) {
							authChanged = callback;
							return { data: { subscription: { unsubscribe() {} } } };
						},
						signOut: async () => ({ error: null }),
					},
				},
			};
		throw new Error(`Unexpected import: ${name}`);
	},
	fetch: () =>
		new Promise((resolve) =>
			pending.push((admin) =>
				resolve({ ok: true, json: async () => ({ isAdmin: admin }) }),
			),
		),
	console,
});
function state() {
	cursor = 0;
	return exported.AuthProvider({ children: null }).props.value;
}
const session = (id, token = "token") => ({
	user: { id },
	access_token: token,
});
async function finish(admin) {
	pending.shift()(admin);
	await new Promise((resolve) => setImmediate(resolve));
}
assert.equal(state().loading, true);
effect();
authChanged("SIGNED_IN", session("admin"));
await finish(true);
assert.equal(state().isAdmin, true);
// Supabase emits SIGNED_IN again when returning to a visible tab.
for (const event of ["SIGNED_IN", "TOKEN_REFRESHED"]) {
	authChanged(event, session("admin", "renewed"));
	assert.equal(state().isAdmin, true, `${event} must keep the editor mounted`);
	assert.equal(state().loading, false);
	await finish(true);
}
authChanged("SIGNED_IN", session("other"));
assert.equal(
	state().isAdmin,
	false,
	"another user must not inherit admin access",
);
assert.equal(state().loading, true);
await finish(false);
assert.equal(state().loading, false);
authChanged("SIGNED_IN", session("admin"));
await finish(true);
authChanged("TOKEN_REFRESHED", session("admin"));
authChanged("SIGNED_OUT", null);
await new Promise((resolve) => setImmediate(resolve));
await finish(true);
assert.equal(
	state().isAdmin,
	false,
	"stale admin requests must not undo sign-out",
);
assert.equal(state().isLoggedIn, false);
authChanged("SIGNED_IN", session("admin"));
await finish(true);
authChanged("TOKEN_REFRESHED", session("admin"));
await finish(false);
assert.equal(
	state().isAdmin,
	false,
	"server revocation must still remove access",
);
console.log(
	"Auth state regression checks OK (tab return, refresh, user change, sign-out race, revocation)",
);
