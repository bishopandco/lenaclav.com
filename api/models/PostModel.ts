import { Entity, DocumentClient } from "electrodb";
import { z } from "zod";
import { ulid } from "ulid";
import { BaseModel } from "@bishop-and-co/dmvc";

const PostEntity = new Entity(
  {
    model: {
      entity: "post",
      version: "1",
      service: "lenaclav",
    },
    attributes: {
      post: {
        type: "string",
        default: () => ulid(),
      },
      title: {
        type: "string",
        required: true,
      },
      body: {
        type: "string",
        required: true,
      },
      createdBy: {
        type: "string",
        required: true,
        default: () => "system",
      },
      createdAt: {
        type: "string",
        default: () => new Date().toISOString(),
      },
    },
    indexes: {
      post: {
        pk: { field: "pk", composite: ["post"] },
        sk: { field: "sk", composite: ["createdAt"] },
      },
      byCreator: {
        index: "gsi1pk-gsi1sk-index",
        pk: { field: "gsi1pk", composite: ["createdBy"] },
        sk: { field: "gsi1sk", composite: ["createdAt"] },
      },
    },
  },
  {}
);

const PostSchema = z.object({
  post: z.string().ulid().optional(),
  title: z.string().min(1),
  body: z.string().min(1),
  createdBy: z.string().min(1).default("system"),
  createdAt: z.string().optional(),
});

export class PostModel extends BaseModel<typeof PostSchema> {
  constructor(client: DocumentClient, table: string) {
    super(
      PostEntity,
      PostSchema,
      z.object({
        post: z.string(),
        createdAt: z.string(),
      }),
      client,
      table
    );
  }
}

export type PostShape = z.infer<typeof PostSchema>;
