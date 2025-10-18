import { Hono } from "hono";
import { BaseController } from "@bishop-and-co/dmvc";
import { PostModel } from "../models/PostModel";

export class PostsController {
  static routes(app: Hono) {
    BaseController.register(app, {
      model: PostModel,
      basePath: "/posts",
      idParam: "post",
      roles: {
        list: ["anonymous"],
        get: ["anonymous"],
        create: ["anonymous"],
        update: ["anonymous"],
        delete: ["anonymous"],
      },
    });
  }
}
