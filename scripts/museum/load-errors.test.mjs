import assert from "node:assert/strict";
import test from "node:test";
import {
	isMissingMuseumRelation,
	museumCardsOrEmpty,
	publicExhibitLinkVisible,
} from "../../src/lib/museum/load.ts";

function withConsole(run) {
	const logged = [];
	const original = console.error;
	console.error = (...args) => {
		logged.push(args);
	};
	try {
		return { logged, result: run() };
	} finally {
		console.error = original;
	}
}

test("PGRST205 and 42P01 become an empty card list without logging", () => {
	for (const code of ["PGRST205", "42P01"]) {
		const error = { code, message: "museum relation missing" };
		const { logged, result } = withConsole(() =>
			museumCardsOrEmpty(error, [{ id: "should-not-leak" }]),
		);
		assert.deepEqual(result, []);
		assert.equal(logged.length, 0);
		assert.equal(isMissingMuseumRelation(error), true);
		assert.equal(publicExhibitLinkVisible(error, [{ id: "x" }]), false);
	}
});

test("other query errors are logged and propagate unchanged", () => {
	const error = { code: "42501", message: "permission denied" };
	const { logged } = withConsole(() => {
		assert.throws(
			() => museumCardsOrEmpty(error, [{ id: "kept" }]),
			(thrown) => thrown === error,
		);
	});
	assert.equal(logged.length, 1);
	assert.equal(logged[0][0], error);
	assert.equal(isMissingMuseumRelation(error), false);
	const link = withConsole(() =>
		publicExhibitLinkVisible(error, [{ id: "kept" }]),
	);
	assert.equal(link.result, false);
	assert.equal(link.logged.length, 1);
	assert.equal(link.logged[0][0], error);
});

test("a message that only looks like a missing relation is not treated as one", () => {
	const error = { message: "relation event_exhibit_cards does not exist" };
	assert.equal(isMissingMuseumRelation(error), false);
	const { logged } = withConsole(() => {
		assert.throws(
			() => museumCardsOrEmpty(error, []),
			(thrown) => thrown === error,
		);
	});
	assert.equal(logged.length, 1);
});
