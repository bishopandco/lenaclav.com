import { Entity, DocumentClient } from "electrodb";
import { z } from "zod";
import { ulid } from "ulid";
import { BaseModel } from "@bishop-and-co/dmvc";

const BlogEntity = new Entity(
  {
    model: {
      entity: "blog",
      version: "1",
      service: "lenaclav",
    },
    attributes: {
      blog: {
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
      publishedAt: {
        type: "string",
        default: () => new Date().toISOString(),
      },
    },
    indexes: {
      blog: {
        pk: { field: "pk", composite: ["blog"] },
        sk: { field: "sk", composite: ["publishedAt"] },
      },
    },
  },
  {}
);

const BlogSchema = z.object({
  blog: z.string().ulid().optional(),
  title: z.string().min(1),
  body: z.string().min(1),
  publishedAt: z.string().datetime().default(() => new Date().toISOString()),
});

export class BlogModel extends BaseModel<typeof BlogSchema> {
  constructor(client: DocumentClient, table: string) {
    super(
      BlogEntity as any,
      BlogSchema,
      z.object({
        blog: z.string(),
        publishedAt: z.string(),
      }),
      client,
      table
    );
  }
}

export type BlogShape = z.infer<typeof BlogSchema>;
