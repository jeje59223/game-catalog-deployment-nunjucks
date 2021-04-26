import { Request, Response } from "express";
import * as express from "express";
import { PlatformModel } from "../models/platform";
import slugify from "slug";

const clientWantsJson = (request: express.Request): boolean => request.get("accept") === "application/json";

// permet d'afficher la pages avec toutes les consoles
export function index(model: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const platformList = await model.findAll();
  
    if (platformList.length !== 0) {
      if (clientWantsJson(request)) {
        response.json(platformList);
      } else {
        response.render("platform", { platforms: platformList });
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

// permet d'afficher la page de gestion des consoles
export function platformsListManagement(model: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const platformList = await model.findAll();
  
    if (platformList.length !== 0) {
      if (clientWantsJson(request)) {
        response.json(platformList);
      } else {
        response.render("platforms-management", { platforms: platformList });
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

// permet d'afficher une console
export function show(model: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const platform = await model.findBySlug(request.params.slug);

    if (platform) {
      if (clientWantsJson(request)) {
        response.json(platform);
      } else {
      //response.json(platform);
      response.render("platform-slug", {platform: platform})
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
export function create(model: PlatformModel) {
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

    const platform = await model.findByName(request.body.name);

    if (platform) {
      response
        .status(400)
        .json({ error: "A platform of this name already exists" });
      return;
    }
    
    const slug = slugify(request.body.name);

    const createdPlatform = {
      name: request.body.name,
      slug: slug,
      platform_logo: {
        height: 1000,
        url: request.body.url,
        width: 1000
      }
    };

    model.insertOne(createdPlatform).then(() => {
      response.redirect("/platforms-management");
      // response.status(201).json(createdPlatform);
    });
  };
}

// permet de supprimer une console
export function destroy(model: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const platform = await model.findBySlug(request.params.slug);
    if (platform !== null) {
      await model.destroy(platform.slug);
      response.redirect("/platforms-management");
      response.status(204).end();
      
    } else {
      response.status(404).end();
    }
  };
}

// permet d'afficher le formulaire de modification :
export function formUpdate(model: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const platform = await model.findBySlug(request.params.slug);

    if (platform) {
      if (clientWantsJson(request)) {
        response.json(platform);
      } else {
      //response.json(platform);
      response.render("platform-update", {platform: platform})
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

// permet de modifier une console
export function update(model: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {

    console.log(request.body);
    
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

    const result = await model.updateOne(
      request.body.slug,
      request.body.name,
      request.body.url
    );

    if (result === "ok") {
      response.redirect("/platforms-management")
      response.status(204).end();
    } else {
      response.status(403).end();
    }
  };
}
