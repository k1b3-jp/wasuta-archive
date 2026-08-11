export type ArchiveSource = {
	source_id: number;
	label: string;
	url: string;
	accessed_on: string;
	sources?: {
		availability_status: "unchecked" | "available" | "suspect" | "unavailable";
		archived_url?: string | null;
	} | null;
};

export type ArchiveEventRelation = {
	relation_type: string;
	events: {
		event_id: number;
		event_name: string;
		date: string;
		image_url?: string | null;
	} | null;
};

export type Song = {
	song_id: number;
	title: string;
	release_date?: string | null;
	first_performed_date?: string | null;
	description?: string | null;
	image_url?: string | null;
	song_sources?: ArchiveSource[];
	song_events?: ArchiveEventRelation[];
};

export type Costume = {
	costume_id: number;
	name: string;
	debut_date?: string | null;
	description?: string | null;
	image_url?: string | null;
	costume_sources?: ArchiveSource[];
	costume_events?: ArchiveEventRelation[];
};
