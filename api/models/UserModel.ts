import { Entity, DocumentClient } from "electrodb";
import { ulid } from "ulid";
import { z } from "zod";
import { BaseModel } from "@bishop-and-co/dmvc";

const UserEntity = new Entity(
  {
    model: {
      entity: "user",
      version: "1",
      service: "lenaclav",
    },
    attributes: {
      user: {
        type: "string",
        default: () => ulid(),
      },
      username: {
        type: "string",
      },
      email: {
        type: "string",
      },
      rolesVersion: {
        type: "number",
        default: () => 0,
      },
      createdAt: {
        type: "string",
        default: () => new Date().toISOString(),
      },
    },
    indexes: {
      user: {
        pk: {
          field: "pk",
          composite: ["user"],
        },
        sk: {
          field: "sk",
          composite: ["createdAt"],
        },
      },
      usernameIndex: {
        index: "gsi2pk-gsi2sk-index",
        pk: {
          field: "gsi2pk",
          composite: ["username"],
        },
        sk: {
          field: "gsi2sk",
          composite: ["createdAt"],
        },
      },
    },
  },
  {}
);

const UserSchema = z.object({
  user: z.string().ulid().optional(),
  username: z.string().min(1),
  email: z.string().min(1),
  rolesVersion: z.number().optional(),
  createdAt: z.string().optional(),
});

export class UserModel extends BaseModel<typeof UserSchema> {
  constructor(client: DocumentClient, table: string) {
    super(
      UserEntity,
      UserSchema,
      z.object({
        user: z.string(),
        createdAt: z.string(),
      }),
      client,
      table
    );
  }

  /**
   * Find a user by username (uses the username GSI).
   */
  public async findByUsername(username: string) {
    const result = await this.find({ username });
    return result.data[0];
  }

  public static async findByUsername(username: string) {
    return this.getInstance().findByUsername(username);
  }
}

export type UserShape = z.infer<typeof UserSchema>;
