import { Request, Response } from "express";
import * as express from "express";
import { GameModel } from "../models/game";
import slugify from "slug";

const clientWantsJson = (request: express.Request): boolean => request.get("accept") === "application/json";

// permet d'afficher tous les jeux
export function index(model: GameModel) {
    return async (request: Request, response: Response): Promise<void> => {
      const gameList = await model.findAll();
    
      if (gameList.length !== 0) {
        if (clientWantsJson(request)) {
          response.json(gameList);
        } else {
          response.render("game", { games: gameList });
        }
      } else {
        response.status(404);
        if (clientWantsJson(request)) {
          response.json({ error: "This platform does not exist." });
        } else {
          response.render("not-found");
        }
      }
    };
  }

  // permet d'afficher la pages de management des jeux
  export function gameListManagement(model: GameModel) {
    return async (request: Request, response: Response): Promise<void> => {
      const gameList = await model.findAll();
    
      if (gameList.length !== 0) {
        if (clientWantsJson(request)) {
          response.json(gameList);
        } else {
          response.render("game-management", { games: gameList });
        }
      } else {
        response.status(404);
        if (clientWantsJson(request)) {
          response.json({ error: "This platform does not exist." });
        } else {
          response.render("not-found");
        }
      }
    };
  }

  // permet d'afficher un jeu
export function show(model: GameModel) {
    return async (request: Request, response: Response): Promise<void> => {
      const game = await model.findBySlug(request.params.slug);
  
      if (game) {
        if (clientWantsJson(request)) {
          response.json(game);
        } else {
        //response.json(platform);
        response.render("game-slug", {game: game})
        }
      } else {
        response.status(404);
        if (clientWantsJson(request)) {
          response.json({ error: "This platform does not exist." });
        } else {
          response.render("not-found");
        }
      }
    };
  }
  
  // permet de créer une console
export function create(model: GameModel) {
    return async (request: Request, response: Response): Promise<void> => {
      const errors = [];
      if (!request.body.name) {
        errors.push("name");
      }
      if (errors.length > 0) {
        response
          .status(400)
          .json({ error: "Missing required fields", missing: errors });
        return;
      }
  
      const game = await model.findByName(request.body.name);
  
      if (game) {
        response
          .status(400)
          .json({ error: "A platform of this name already exists" });
        return;
      }
  
      const slug = slugify(request.body.name);
      const createdGame = {
        name: request.body.name,
        slug: slug,
      };
  
      model.insertOne(createdGame).then(() => {
        response.status(201).json(createdGame);
      });
    };
  }