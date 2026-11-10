import { createHash } from "node:crypto";
export const hash = (value) =>
	createHash("sha256")
		.update(typeof value === "string" ? value : stable(value))
		.digest("hex");
function stable(value) {
	if (Array.isArray(value)) return "[" + value.map(stable).join(",") + "]";
	if (value && typeof value === "object")
		return (
			"{" +
			Object.keys(value)
				.sort()
				.map((k) => JSON.stringify(k) + ":" + stable(value[k]))
				.join(",") +
			"}"
		);
	return JSON.stringify(value);
}
const invariant = (ok, message) => {
	if (!ok) throw Error(message);
};
export function httpsUrl(value) {
	const url = new URL(value);
	invariant(
		url.protocol === "https:" && !url.username && !url.password,
		"HTTPS URL without credentials required",
	);
	return url.href;
}
export function instant(value) {
	const parts =
		typeof value === "string" &&
		value.match(
			/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-](\d{2}):(\d{2}))$/,
		);
	invariant(parts, "offset ISO timestamp required");
	const [
		,
		yearText,
		monthText,
		dayText,
		hourText,
		minuteText,
		secondText,
		,
		offsetHourText,
		offsetMinuteText,
	] = parts;
	const year = Number(yearText),
		month = Number(monthText),
		day = Number(dayText);
	const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
	const monthDays = [
		31,
		leapYear ? 29 : 28,
		31,
		30,
		31,
		30,
		31,
		31,
		30,
		31,
		30,
		31,
	];
	invariant(
		month >= 1 &&
			month <= 12 &&
			day >= 1 &&
			day <= monthDays[month - 1] &&
			Number(hourText) < 24 &&
			Number(minuteText) < 60 &&
			Number(secondText) < 60 &&
			Number(offsetHourText ?? 0) < 24 &&
			Number(offsetMinuteText ?? 0) < 60 &&
			Number.isFinite(Date.parse(value)),
		"real calendar date and valid offset time required",
	);
	return new Date(value).toISOString();
}
export function monthWindows(start, end) {
	let cursor = new Date(instant(start));
	const limit = new Date(instant(end));
	invariant(cursor < limit, "invalid period");
	const result = [];
	while (cursor < limit) {
		const next = new Date(
			Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1),
		);
		const stop = next < limit ? next : limit;
		result.push({ start: cursor.toISOString(), end: stop.toISOString() });
		cursor = stop;
	}
	return result;
}
export function makeSource({
	recordKey,
	platform,
	postId = null,
	accountKey = null,
	url,
	title = null,
	text = null,
	publishedAt = null,
	publishedOn = null,
	confirmed = false,
	dateLabel = null,
	observedAt,
	contentStatus = "metadata_only",
	metadata = {},
	method = "manual_review",
	metrics = {},
	requestContext = {},
}) {
	invariant(recordKey && observedAt, "identity and observation required");
	instant(observedAt);
	if (publishedAt) {
		publishedAt = instant(publishedAt);
		publishedOn = new Date(publishedAt).toLocaleDateString("en-CA", {
			timeZone: "Asia/Tokyo",
		});
	}
	const version = {
		text_content: text,
		published_at: publishedAt,
		published_on: publishedOn,
		date_precision: publishedAt ? "instant" : publishedOn ? "day" : "unknown",
		original_publication_confirmed: confirmed,
		original_date_label: dateLabel,
		content_status: contentStatus,
		usage_status: "unknown",
		public_metadata: metadata,
	};
	const digest = hash(version);
	const versionKey = recordKey + ":" + digest;
	return {
		record: {
			record_key: recordKey,
			platform,
			platform_post_id: postId,
			account_key: accountKey,
			canonical_url: httpsUrl(url),
			title,
			first_seen_at: observedAt,
			last_seen_at: observedAt,
		},
		version: {
			...version,
			version_key: versionKey,
			record_key: recordKey,
			content_hash: digest,
			observed_at: observedAt,
		},
		observation: {
			observation_key: hash([versionKey, observedAt, method]),
			version_key: versionKey,
			observed_at: observedAt,
			method,
			metrics,
			request_context: requestContext,
		},
	};
}
export function normalizePost(post, account, observedAt, context = {}) {
	invariant(
		typeof post.id === "string" && /^\d+$/.test(post.id),
		"post ID must be a decimal string",
	);
	invariant(
		typeof post.author_id === "string" &&
			account.platform_user_id === post.author_id,
		"author identity mismatch",
	);
	invariant(typeof post.text === "string", "post body missing");
	const long = post.note_post ?? post.note_tweet;
	const refs = (post.referenced_posts ?? post.referenced_tweets ?? []).map(
		(ref) => {
			invariant(
				["retweeted", "quoted", "replied_to"].includes(ref.type) &&
					typeof ref.id === "string" &&
					/^\d+$/.test(ref.id),
				"invalid post reference",
			);
			return { type: ref.type, id: ref.id };
		},
	);
	// Only selected public fields. Never copy arbitrary API payloads, headers or includes.users.
	const metadata = {
		post_id: post.id,
		author_id: post.author_id,
		conversation_id: post.conversation_id ?? null,
		lang: post.lang ?? null,
		references: refs,
		edit_history_ids:
			post.edit_history_post_ids ?? post.edit_history_tweet_ids ?? [],
		attachments: post.attachments
			? {
					media_keys: post.attachments.media_keys ?? [],
					poll_ids: post.attachments.poll_ids ?? [],
				}
			: null,
		urls: (post.entities?.urls ?? []).map((item) => ({
			url: item.url,
			expanded_url: item.expanded_url,
		})),
		hashtags: (post.entities?.hashtags ?? []).map((item) => ({
			tag: item.tag,
		})),
		has_long_text: Boolean(long?.text),
		has_article: Boolean(post.article || post.article_title),
		text_completeness: post.article ? "article_not_fetched" : "as_returned",
	};
	const recordKey = "x:" + post.id;
	return makeSource({
		recordKey,
		platform: "X",
		postId: post.id,
		accountKey: account.account_key,
		url: `https://x.com/i/web/status/${post.id}`,
		text: long?.text ?? post.text,
		publishedAt: post.created_at ?? null,
		confirmed: Boolean(post.created_at),
		observedAt,
		contentStatus: post.article ? "partial" : "body_observed",
		metadata,
		method: "x_api_full_archive",
		metrics: post.public_metrics ?? {},
		requestContext: { run_key: context.run_key ?? null },
	});
}
export function normalizeExistingCard(card, observedAt) {
	const platform = card.source.url.includes("ameblo.jp")
		? "Ameba"
		: card.source.url.includes("entax.news")
			? "Interview"
			: "Web";
	const key = "web:" + hash(httpsUrl(card.source.url));
	const source = makeSource({
		recordKey: key,
		platform,
		url: card.source.url,
		title: card.source.title,
		publishedAt: card.published_at,
		publishedOn: card.published_on,
		confirmed: card.original_publication_confirmed,
		dateLabel: card.original_date_label,
		observedAt,
		method: "prior_primary_source_review",
		metadata: {
			publisher: card.source.publisher,
			body_storage: "not_collected",
		},
	});
	const passageKey =
		"passage:" + hash([source.version.version_key, card.locator]);
	return {
		...source,
		passage: {
			passage_key: passageKey,
			version_key: source.version.version_key,
			locator: card.locator,
		},
		proposal: {
			// Keep previous unapproved drafts rather than silently rebinding their evidence.
			proposal_key: card.id + ":" + hash([passageKey, card.summary]),
			passage_key: passageKey,
			summary: card.summary,
			event_id: card.event_id,
		},
		contributor: {
			record_key: key,
			contributor_key: card.member_id
				? `member:${card.member_id}`
				: `unresolved:${card.speaker}`,
			member_id: card.member_id,
			label: card.speaker,
			role: card.member_id || platform === "Ameba" ? "author" : "publisher",
		},
	};
}
export function searchUrl(account, window, nextToken = null, maxResults = 100) {
	invariant(/^[A-Za-z0-9_]{1,15}$/.test(account.handle), "invalid X handle");
	invariant(
		typeof account.platform_user_id === "string" &&
			/^\d+$/.test(account.platform_user_id),
		"resolve immutable X ID first",
	);
	instant(window.start);
	instant(window.end);
	invariant(window.start < window.end, "invalid search window");
	invariant(
		Number.isInteger(maxResults) && maxResults >= 10 && maxResults <= 500,
		"invalid page size",
	);
	const url = new URL("https://api.x.com/2/tweets/search/all");
	url.searchParams.set("query", `from:${account.handle}`);
	url.searchParams.set("start_time", window.start);
	url.searchParams.set("end_time", window.end);
	url.searchParams.set("max_results", String(maxResults));
	url.searchParams.set("sort_order", "recency");
	url.searchParams.set(
		"post.fields",
		"created_at,text,note_post,lang,attachments,entities,conversation_id,public_metrics,article,article_title",
	);
	url.searchParams.set("expansions", "author_id");
	url.searchParams.set("user.fields", "id,username,protected");
	if (nextToken) url.searchParams.set("next_token", nextToken);
	return url;
}
export function validatePage(page, account) {
	invariant(
		page && typeof page === "object" && !Array.isArray(page),
		"invalid API page",
	);
	invariant(!page.errors?.length, "partial API errors: do not advance cursor");
	invariant(
		page.data === undefined || Array.isArray(page.data),
		"invalid data array",
	);
	invariant(
		page.data !== undefined || page.meta?.result_count === 0,
		"missing data and empty-page evidence",
	);
	const author = page.includes?.users?.find(
		(user) => user.id === account.platform_user_id,
	);
	invariant(!author?.protected, "protected account is out of scope");
	for (const post of page.data ?? [])
		invariant(
			post.author_id === account.platform_user_id,
			"unexpected author; do not advance cursor",
		);
	invariant(
		!page.meta?.next_token || typeof page.meta.next_token === "string",
		"invalid cursor",
	);
	return page.data ?? [];
}
