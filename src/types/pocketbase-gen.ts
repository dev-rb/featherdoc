/**
 * This file was @generated using pocketbase-typegen
 */

import type PocketBase from 'pocketbase';
import type { RecordService } from 'pocketbase';

export enum Collections {
  Comments = 'comments',
  Notebooks = 'notebooks',
  Playgrounds = 'playgrounds',
  Scratchpads = 'scratchpads',
  Threads = 'threads',
  Users = 'users',
}

// Alias types for improved usability
export type IsoDateString = string;
export type RecordIdString = string;
export type HTMLString = string;

// System fields
export type BaseSystemFields<T = never> = {
  id: RecordIdString;
  created: IsoDateString;
  updated: IsoDateString;
  collectionId: string;
  collectionName: Collections;
  expand?: T;
};

export type AuthSystemFields<T = never> = {
  email: string;
  emailVisibility: boolean;
  username: string;
  verified: boolean;
} & BaseSystemFields<T>;

// Record types for each collection

export type CommentsRecord = {
  attachments?: string[];
  author?: RecordIdString;
  content?: HTMLString;
  thread?: RecordIdString;
};

export type NotebooksRecord = {
  attachments?: string[];
  author?: RecordIdString;
  content?: HTMLString;
};

export type PlaygroundsRecord<Tcontents = unknown> = {
  collaborators?: RecordIdString[];
  contents: null | Tcontents;
  notebook?: RecordIdString;
  share_link?: string;
  thread?: RecordIdString;
};

export type ScratchpadsRecord<Tcontent = unknown> = {
  collaborators?: RecordIdString[];
  content: null | Tcontent;
  notebook?: RecordIdString;
  thread?: RecordIdString;
};

export type ThreadsRecord = {
  attachments?: string[];
  author: RecordIdString;
  content?: HTMLString;
  resolved?: boolean;
  title: HTMLString;
};

export type UsersRecord = {
  avatar?: string;
  name?: string;
};

// Response types include system fields and match responses from the PocketBase API
export type CommentsResponse<Texpand = unknown> = Required<CommentsRecord> & BaseSystemFields<Texpand>;
export type NotebooksResponse<Texpand = unknown> = Required<NotebooksRecord> & BaseSystemFields<Texpand>;
export type PlaygroundsResponse<Tcontents = unknown, Texpand = unknown> = Required<PlaygroundsRecord<Tcontents>> &
  BaseSystemFields<Texpand>;
export type ScratchpadsResponse<Tcontent = unknown, Texpand = unknown> = Required<ScratchpadsRecord<Tcontent>> &
  BaseSystemFields<Texpand>;
export type ThreadsResponse<Texpand = unknown> = Required<ThreadsRecord> & BaseSystemFields<Texpand>;
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>;

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
  comments: CommentsRecord;
  notebooks: NotebooksRecord;
  playgrounds: PlaygroundsRecord;
  scratchpads: ScratchpadsRecord;
  threads: ThreadsRecord;
  users: UsersRecord;
};

export type CollectionResponses = {
  comments: CommentsResponse;
  notebooks: NotebooksResponse;
  playgrounds: PlaygroundsResponse;
  scratchpads: ScratchpadsResponse;
  threads: ThreadsResponse;
  users: UsersResponse;
};

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
  collection(idOrName: 'comments'): RecordService<CommentsResponse>;
  collection(idOrName: 'notebooks'): RecordService<NotebooksResponse>;
  collection(idOrName: 'playgrounds'): RecordService<PlaygroundsResponse>;
  collection(idOrName: 'scratchpads'): RecordService<ScratchpadsResponse>;
  collection(idOrName: 'threads'): RecordService<ThreadsResponse>;
  collection(idOrName: 'users'): RecordService<UsersResponse>;
};
