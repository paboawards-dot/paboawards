export type PayMethod = "orange" | "mtn" | "moov" | "wave";

export type Universe = { id: number; slug: string; name: string; tagline: string | null; color: string; sort: number };

export type Category = {
  id: string; slug: string; name: string; universe_id: number; color: string; emoji: string;
  image_url: string | null; status: "open" | "closed"; extended_until: string | null; sort: number;
};

export type Candidate = {
  id: string; slug: string; name: string; category_id: string; photo_url: string | null;
  gallery: string[]; bio: string | null; info: string | null; status: "active" | "hidden";
  votes_count: number; created_at: string;
};

export type RankedCandidate = Candidate & { rank: number };

export type Settings = {
  id: number; votes_enabled: boolean; selections_at: string | null; votes_open_at: string | null;
  votes_close_at: string | null; ceremony_at: string | null; vote_unit_price: number;
  max_votes_per_payment: number | null; contact_phone: string | null; contact_whatsapp: string | null;
  contact_email: string | null; facebook_url: string | null; instagram_url: string | null; tiktok_url: string | null;
};

export type News = { id: string; title: string; body: string | null; images: string[]; published: boolean; published_at: string };

export type Partner = {
  id: string; name: string; role: string | null; description: string | null; logo_url: string | null;
  images: string[]; visible: boolean; sort: number;
};

export type Stats = { votes: number; voters: number; artists: number; categories: number };

export type TxStatus = "pending" | "confirmed" | "failed" | "expired" | "flagged";
