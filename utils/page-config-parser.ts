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

export const parsePageConfig = async (
  pageId: string = "",
): Promise<PageConfig[]> => {
  if (!pageId) {
    throw Error("pageId must not be empty");
  }
  const db = await queryDatabase(pageId);
  return db.map((page) => ({
    pageId: getPagePropertyValue(page, "page-id", true),
    selectors: parseSelectors(
      getPagePropertyValue(page, "selectors", true),
    ),
  }));
};

function parseSelectors(selectorString: string): SelectorTuple[] {
  return selectorString
    .replace(/\n/gi, "")
    .split(";")
    .map((tuple: string) => {
      let [property, selector] = tuple.trim().split(":");
      return { property, selector };
    });
}
