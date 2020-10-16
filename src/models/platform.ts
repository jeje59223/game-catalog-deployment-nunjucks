
import { Collection, ObjectID } from "mongodb";

type Platform = {
  _id: ObjectID;
  name: string;
  slug: string;
  platform_logo: {
    height: number;
    url: string;
    width: number;
  }
};

type PlatformInput = {
  // code?: number;
  // connectivity?: string;
  // cpu?: string;
  // games?: {
  //   cover: {
  //     thumbnail: string;
  //     url: string;
  //   };
  //   name: string;
  //   slug: string;
  // }[];
  // graphics?: string;
  // media?: string;
  // memory?: string;
  name: string;
  // online?: string;
  // os?: string;
  // output?: string;

  platform_logo: {
    height: number;
    url: string;
    width: number;
  };

  // platform_version_release_date?: string;
  // resolutions?: string;
  slug: string;
  // sound?: string;
  // storage?: string;
  // summary?: string;
  // url?: string;
};

export class PlatformModel {
  collection: Collection<Platform>;

  constructor(collection: Collection<Platform>) {
    this.collection = collection;
  }

  findAll(): Promise<Platform[]> {
    return this.collection.find().toArray();
  }

  findBySlug(slug: string): Promise<Platform | null> {
    return this.collection.findOne({ slug: slug });
  }

  findByName(name: string): Promise<Platform | null> {
    return this.collection.findOne({ name: name });
  }

  insertOne(createdPlatform: PlatformInput): Promise<boolean> {
    return this.collection
      .insertOne(createdPlatform)
      .then(() => true)
      .catch(() => false);
  }

  updateOne(
    slug: string,
    newName: string,
    new_logo: string
  ): Promise<"platform_not_found" | "ok"> {
    return this.findBySlug(slug).then((platform) => {
      if (platform) {
        return this.collection
          .replaceOne({ 
            slug: platform.slug }, 
            { ...platform, 
              name: newName, 
              platform_logo : {
                ...platform.platform_logo,
                url: new_logo
              }
            })
          .then(() => "ok");
      } else {
        return "platform_not_found";
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
