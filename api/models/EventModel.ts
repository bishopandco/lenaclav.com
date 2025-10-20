import { Entity, DocumentClient } from "electrodb";
import type { Schema } from "electrodb";
import { z } from "zod";
import { ulid } from "ulid";
import { BaseModel } from "@bishop-and-co/dmvc";

const EventEntity = new Entity<string, string, string, Schema<string, string, string>>(
  {
    model: {
      entity: "event",
      version: "1",
      service: "lenaclav",
    },
    attributes: {
      event: {
        type: "string",
        default: () => ulid(),
      },
      title: {
        type: "string",
        required: true,
      },
      description: {
        type: "string",
        required: true,
      },
      location: {
        type: "string",
      },
      createdAt: {
        type: "string",
        default: () => new Date().toISOString(),
      },
      startAt: {
        type: "string",
        required: true,
        default: () => new Date().toISOString(),
      },
      endAt: {
        type: "string",
      },
    },
    indexes: {
      event: {
        pk: { field: "pk", composite: ["event"] },
        sk: { field: "sk", composite: ["createdAt"] },
      },
    },
  },
  {},
);

const EventSchema = z.object({
  event: z.string().ulid().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().optional(),
  createdAt: z.string().datetime().default(() => new Date().toISOString()),
  startAt: z.string().datetime().default(() => new Date().toISOString()),
  endAt: z.string().datetime().optional().or(z.literal("")),
});

export class EventModel extends BaseModel<typeof EventSchema> {
  constructor(client: DocumentClient, table: string) {
    super(
      EventEntity,
      EventSchema,
      z.object({
        event: z.string(),
        createdAt: z.string(),
      }),
      client,
      table,
    );
  }
}

export type EventShape = z.infer<typeof EventSchema>;
