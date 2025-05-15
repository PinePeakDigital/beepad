import * as initial from './001-initial';

export interface Migration {
  name: string;
  up: () => Promise<void>;
}

export const migrations: Migration[] = [
  { name: '001-initial', up: initial.up },
];
