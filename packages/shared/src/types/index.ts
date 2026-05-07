export type UUID = string;

export type Timestamp = Date;

export type MoneyString = string;

export interface Auditable {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
