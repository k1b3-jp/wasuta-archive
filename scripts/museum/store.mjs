import { execFileSync } from "node:child_process";
// A fixed local address, no arbitrary DATABASE_URL or remote writes.
const connection = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const literal = (value) =>
	value === null || value === undefined
		? "null"
		: "'" +
			String(
				typeof value === "object" ? JSON.stringify(value) : value,
			).replaceAll("'", "''") +
			"'";
function insert(table, row, conflict, update) {
	const keys = Object.keys(row);
	return `insert into archive_research.${table}(${keys.join(",")}) values(${keys.map((key) => literal(row[key])).join(",")}) on conflict(${conflict}) ${update};`;
}
export function executeLocal(sql) {
	try {
		return execFileSync(
			"psql",
			[connection, "-X", "-q", "-v", "ON_ERROR_STOP=1", "-f", "-"],
			{
				input:
					"begin; set local standard_conforming_strings=on;\n" +
					sql +
					"\ncommit;",
				encoding: "utf8",
				stdio: ["pipe", "pipe", "pipe"],
				maxBuffer: 16 * 1024 * 1024,
			},
		);
	} catch {
		throw Error(
			"Local research transaction failed; cursor was not advanced. Inspect schema and validated input without printing private payloads.",
		);
	}
}
export function saveAccounts(accounts) {
	const statements = accounts
		.toSorted((a, b) => a.account_key.localeCompare(b.account_key))
		.map(
			({ handle, url, observed_at, ...row }) =>
				`select archive_research.lock_account(${literal(row.account_key)},${literal(row.platform_user_id)});` +
				insert(
					"accounts",
					row,
					"account_key",
					`do update set platform_user_id=coalesce(excluded.platform_user_id,accounts.platform_user_id)`,
				) +
				[handle ? ["handle", handle] : null, url ? ["url", url] : null]
					.filter(Boolean)
					.map(([kind, id]) =>
						insert(
							"account_identifiers",
							{
								account_key: row.account_key,
								identifier: id,
								identifier_kind: kind,
								observed_at,
							},
							"account_key,identifier_kind,identifier",
							"do nothing",
						),
					)
					.join(""),
		);
	executeLocal(statements.join("\n"));
}
export function saveCoverage(runs) {
	executeLocal(
		runs
			.map((row) => insert("coverage_runs", row, "run_key", "do nothing"))
			.join("\n"),
	);
}
export function sourcesSql(sources) {
	return sources
		.toSorted((a, b) => a.record.record_key.localeCompare(b.record.record_key))
		.map((source) => {
			const r = source.record;
			// Use the same transaction lock as suppression, including before the first insert.
			const guard = `select archive_research.lock_source(${literal(r.record_key)}); select 1/(case when exists(select 1 from archive_research.source_records where record_key=${literal(r.record_key)} and content_suppressed) then 0 else 1 end);`;
			return (
				guard +
				insert(
					"source_records",
					r,
					"record_key",
					"do update set last_seen_at=greatest(source_records.last_seen_at,excluded.last_seen_at)",
				) +
				insert("source_versions", source.version, "version_key", "do nothing") +
				insert(
					"source_observations",
					source.observation,
					"observation_key",
					"do nothing",
				) +
				(source.contributor
					? insert(
							"source_contributors",
							source.contributor,
							"record_key,contributor_key,role",
							"do nothing",
						)
					: "") +
				(source.passage
					? insert("passages", source.passage, "passage_key", "do nothing")
					: "") +
				(source.proposal
					? insert(
							"editorial_proposals",
							source.proposal,
							"proposal_key",
							"do nothing",
						)
					: "")
			);
		})
		.join("\n");
}
export function saveSources(sources, run = null) {
	let sql = sourcesSql(sources);
	if (run)
		sql += insert(
			"coverage_runs",
			run,
			"run_key",
			`do update set status=excluded.status,received_count=excluded.received_count,next_cursor=excluded.next_cursor,attempted_at=excluded.attempted_at`,
		);
	executeLocal(sql);
}

export function saveCoverageFailure(run) {
	// Do not overwrite the cursor/count of the most recently committed page.
	executeLocal(
		insert(
			"coverage_runs",
			run,
			"run_key",
			"do update set status=excluded.status,attempted_at=excluded.attempted_at,limitations=excluded.limitations",
		),
	);
}

export function readCoverage(runKey) {
	try {
		const result = execFileSync(
			"psql",
			[
				connection,
				"-X",
				"-At",
				"-v",
				"ON_ERROR_STOP=1",
				"-c",
				`select row_to_json(r) from (select run_key,status,received_count,next_cursor from archive_research.coverage_runs where run_key=${literal(runKey)}) r`,
			],
			{ encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
		).trim();
		return result ? JSON.parse(result) : null;
	} catch {
		throw Error("Local coverage read failed.");
	}
}

export function saveEvidence(sources, evidence) {
	executeLocal(
		sourcesSql(sources) +
			evidence
				.map((row) =>
					insert(
						"account_evidence",
						row,
						"account_key,passage_key,fact_kind",
						"do nothing",
					),
				)
				.join("\n"),
	);
}
