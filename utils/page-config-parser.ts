import { logger } from "@lib/logger";
import {
  getDatabase,
  getPagePropertyValue,
  queryDatabase,
} from "@lib/notion";

export type PropertyConfig = {
  property: string;
  type: string;
  selector: string;
};

export type PageConfig = PropertyConfig[];

const PAGE_CONFIG_ID = "48b5d5c7fac64ffa9217fa6d9e4b8726";

export const parsePageConfig = async (
  pageId: string = "",
): Promise<PropertyConfig[]> => {
  if (!pageId) {
    throw Error("pageId must not be empty");
  }
  const db = await queryDatabase(pageId);
  const res = db.map((page) => ({
    property: getPagePropertyValue(page, "property", true),
    type: getPagePropertyValue(page, "type", true),
    selector: getPagePropertyValue(page, "selector", true),
  }));
  logger.debug(`page-config-parser.ts:parsePageConfig:res`, res);
  return res;
};
