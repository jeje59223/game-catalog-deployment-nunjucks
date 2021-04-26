import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import * as core from "express-serve-static-core";
import { Db } from "mongodb";
import * as platformController from "./controllers/platform";
import { PlatformModel } from "./models/platform";
import * as gameController from "./controllers/game";
import { GameModel } from "./models/game";
import * as nunjucks from "nunjucks";
import moment from 'moment';

export function makeApp(db: Db): core.Express {
  const app = express();

  // configuration de nunjucks
  nunjucks.configure("views", {
    autoescape: true,
    express: app
  });
  // on utilise nunjucks
  app.set("view engine", "njk");
  // pour le css et autres
  app.use("/assets", express.static("public"));
  // on utilise bodyParser
  app.use(bodyParser.urlencoded({extended:true}));

  const jsonParser = bodyParser.json();
  // const formParser = bodyParser.urlencoded({ extended: true });
  
  const platformModel = new PlatformModel(db.collection("platforms"));
  const gameModel = new GameModel(db.collection("games"));
 
  // page d'accueil
  app.get("/", (request: Request, response: Response) => response.render("index.njk"));
   
  // page avec toutes les consoles
  app.get("/platforms", platformController.index(platformModel));

  // page qui affiche la page de gestion des jeux
  app.get("/platforms-management", platformController.platformsListManagement(platformModel));

  // page avec une console
  app.get("/platforms/:slug", platformController.show(platformModel));

  // page pour créer une console
  app.post("/platforms-management", jsonParser, platformController.create(platformModel));

  // enregistrement de la modification d'une platform en bdd
  app.post("/platforms/updateValidate", jsonParser, platformController.update(platformModel));
  
  // page pour supprimer une console
  app.post("/platforms/:slug", jsonParser, platformController.destroy(platformModel));

  // page pour afficher le formulaire de modification d'une console
  app.get("/platform/update/:slug", platformController.formUpdate(platformModel));

  // page pour avoir tous les jeux d'une console
  app.get("/platforms/:slug/games", async (request: Request, response: Response) => {
    
      const platform = await db
        .collection("platforms")
        .find({ slug : request.params.slug })
        .toArray();
      response.render("gamesByPlatform", {consoles: platform})
    }
  );
 

// ************************************************************* GAME ******************************************************************* 
  // page qui affiche la liste des jeux
  app.get("/games", jsonParser, gameController.index(gameModel));

  // page qui affiche la page de gestion des jeux
  app.get("/games-management", gameController.gameListManagement(gameModel));

  // page pour voir les commentaires d'un jeu
  app.get("/games/:slug/comments", async (request: Request, response: Response) => {
    const games = await db
    .collection("games")
    .find({ slug: request.params.slug })
    .toArray();
    const comments = await db
      .collection("comments")
      .find({ slug: request.params.slug })
      .toArray();
    response.render("game-comments", {comments: comments, games: games})
    }
  );

  // ajouter un commentaire
  app.post("/games/:slug", async (request: Request, response: Response) => {
    const created_comment = moment().format('LLLL');
    const createComment = await db
    .collection("comments")
    .insertOne({content: request.body.content, pseudo: request.body.pseudo, slug: request.body.slug, created_comment: created_comment})
    .then()
    response.redirect(`/games/${request.body.slug}/comments`)
    response.json(createComment);
  });

  // pour afficher un jeu
  app.get("/games/:slug", gameController.show(gameModel));

  // pour créer un game
  app.post("/games", jsonParser, gameController.create(gameModel));

  // pour supprimer un game
  app.delete("/games/:slug", async (request: Request, response: Response) => {
    const game = await db
      .collection("games")
      .findOne({ slug: request.params.slug });
    if (game) {
      await db.collection("games").deleteOne({ _id: game._id });

      response.status(204).end();
    } else {
      response.status(404).end();
    }
  });

  // page pour modifier un jeu
  app.put("/games/:slug", jsonParser, async (request: Request, response: Response) => {
      const errors = [];
      if (!request.body.name) {
        errors.push("name");
      }
      if (!request.body.platform_slug) {
        errors.push("platform_slug");
      }
      if (errors.length > 0) {
        return response
          .status(400)
          .json({ error: "Missing required fields", missing: errors });
      }
      const game = await db
        .collection("games")
        .findOne({ slug: request.params.slug });
      if (game) {
        const newGame = { ...game, ...request.body };
        await db.collection("games").replaceOne({ _id: game._id }, newGame);

        response.status(204).end();
      } else {
        response.status(404).end();
      }
    }
  );

  // This should be the last call to `app` in this file
  app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(error);
    next();
  });

  return app;
}
