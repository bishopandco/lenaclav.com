import { Hono } from "hono";
import { BaseModel } from "@bishop-and-co/dmvc";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { BlogsController } from "./controllers/BlogsController";
import { BlogModel } from "./models/BlogModel";
import { EventsController } from "./controllers/EventsController";
import { EventModel } from "./models/EventModel";
import { PostsController } from "./controllers/PostsController";
import { PostModel } from "./models/PostModel";
import { UserController } from "./controllers/UserController";
import { UserModel } from "./models/UserModel";
import { authMiddleware } from "./middleware/authMiddleware";

export const registerApp = (app: Hono) => {
  const tableName = process.env.DYNAMODB_TABLE_NAME;
  if (!tableName) {
    throw new Error("DYNAMODB_TABLE_NAME is not set");
  }

  const region = process.env.AWS_REGION || "us-east-1";
  const clientConfig: Record<string, unknown> = { region };
  if (process.env.DYNAMODB_ENDPOINT) {
    clientConfig.endpoint = process.env.DYNAMODB_ENDPOINT;
  }

  const rawClient = new DynamoDBClient(clientConfig);
  const documentClient = DynamoDBDocumentClient.from(rawClient);

  BaseModel.configure({ client: documentClient, table: tableName });
  BaseModel.register(PostModel, BlogModel, EventModel, UserModel);

  app.use("*", authMiddleware);

  PostsController.routes(app);
  BlogsController.routes(app);
  EventsController.routes(app);
  UserController.routes(app);
};
