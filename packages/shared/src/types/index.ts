export interface Note {
  slug: string;
  content: string;
  versions: Version[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Version {
  id: string;
  snapshot: Uint8Array;
  timestamp: Date;
  author: string;
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
