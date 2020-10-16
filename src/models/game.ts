import { Collection } from "mongodb";

type Game = {
  [key: string]: unknown;
  };

  type GameInput = {
    name: string;
    slug: string;
  };

  export class GameModel {
    collection: Collection<Game>;
  
    constructor(collection: Collection<Game>) {
      this.collection = collection;
    }

    findAll(): Promise<Game[]> {
        return this.collection.find().toArray();
    }

    findBySlug(slug: string): Promise<Game | null> {
        return this.collection.findOne({ slug: slug });
    }

    findByName(name: string): Promise<Game | null> {
        return this.collection.findOne({ name: name });
    }

    insertOne(createdGame: GameInput): Promise<boolean> {
        return this.collection
          .insertOne(createdGame)
          .then(() => true)
          .catch(() => false);
    }

    updateOne(
        slug: string,
        newName: string
      ): Promise<"game not found" | "ok"> {
        return this.findBySlug(slug).then((game) => {
          if (game) {
            return this.collection
              .replaceOne({ slug: game.slug }, { ...game, name: newName })
              .then(() => "ok");
          } else {
            return "game not found";
          }
        });
      }

    destroy(slug: string): Promise<boolean> {
        return this.collection
          .deleteOne({ slug: slug })
          .then(() => true)
          .catch(() => false);
      }
    }