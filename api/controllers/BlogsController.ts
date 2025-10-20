import { Hono } from "hono";
import { BaseController } from "@bishop-and-co/dmvc";
import { BlogModel } from "../models/BlogModel";

export class BlogsController {
  static routes(app: Hono) {
    BaseController.register(app, {
      model: BlogModel,
      basePath: "/blogs",
      idParam: "blog",
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
