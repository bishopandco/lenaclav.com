import { Hono } from "hono";
import { BaseController } from "@bishop-and-co/dmvc";
import { EventModel } from "../models/EventModel";

export class EventsController {
  static routes(app: Hono) {
    BaseController.register(app, {
      model: EventModel,
      basePath: "/events",
      idParam: "event",
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
