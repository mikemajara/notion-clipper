import { logger } from "@lib/logger";
import {
  getDatabase,
  getPagePropertyValue,
  queryDatabase,
} from "@lib/notion";

export type PageConfig = {
  pageId: string;
  selectors: SelectorTuple[];
};

export type SelectorTuple = {
  property: string;
  selector: string;
};

const PAGE_CONFIG_ID = "48b5d5c7fac64ffa9217fa6d9e4b8726";

export const parsePageConfig = async (
  pageId: string = "",
): Promise<any[]> => {
  if (!pageId) {
    throw Error("pageId must not be empty");
  }
  const db = await queryDatabase(pageId);
  const res = db.map((page) => ({
    property: getPagePropertyValue(page, "property", true),
    type: getPagePropertyValue(page, "type", true),
    selectors: getPagePropertyValue(page, "selector", true),
  }));
  logger.debug(`page-config-parser.ts:parsePageConfig:res`, res);
  return res;
};
