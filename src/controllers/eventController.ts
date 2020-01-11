import {
  JsonController,
  Res,
  Req,
  UseBefore,
  Get,
  QueryParam,
  Param
} from "routing-controllers";
import { Response } from "express";
import { BAD_REQUEST, NOT_FOUND } from "http-status-codes";
import AuthorizedRequest from "./../interfaces/authorizedRequest";
import AuthMiddleware from "./../middleware/authMiddleware";
import EventService from "../services/eventService";

/**
 * Controller for events.
 */
@JsonController("/events")
export default class EventController {
  /**
   * Returns a specified amount of the most recent events of a given user.
   * @param amount A positive number representing the limit of events to return.
   * @param req The Express request + jwt payload.
   * @param res The Express response.
   * @returns an array of [[EventDto]] if everything went well (status 200), an error if given an invalid user or a negative amount (status 400).
   */
  @UseBefore(AuthMiddleware)
  @Get()
  public async getEvents(
    @Req() req: AuthorizedRequest,
    @Res() res: Response,
    @QueryParam("amount") amount?: number
  ): Promise<Response> {
    try {
      return res.send(await EventService.getEvents(req.jwtPayload._id, amount));
    } catch (error) {
      return res.status(BAD_REQUEST).send({ error: error.message });
    }
  }

  /**
   * Returns a specific event given its id.
   * @param id The hex string of te event id.
   * @param res The Express response.
   * @returns an [[EventDto]] if everything went well (status 200), an error if the id is invalid (status 404).
   */
  @Get("/:id")
  public async getById(
    @Param("id") id: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      return res.send(await EventService.findEventById(id));
    } catch (error) {
      return res.status(NOT_FOUND).send({ error: error.message });
    }
  }
}
