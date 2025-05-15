export interface Note {
  id: number;
  slug: string;
  created_at: Date;
  updated_at: Date;
}

export interface Version {
  id: number;
  note_id: number;
  snapshot: Uint8Array;
  author: string;
  created_at: Date;
}

export interface UserEdit {
  userId: string;
  timestamp: Date;
  position: number;
  length: number;
}

export interface Highlight {
  userId: string;
  color: string;
  timestamp: Date;
  position: number;
  length: number;
}
