import {
  queryDatabase,
  getPageProperty,
  getPagePropertyValue,
  getDatabase,
  updatePage,
} from "lib/notion";
import * as cheerio from "cheerio";
import { CheerioAPI } from "cheerio";
import { logger } from "@lib/logger";
import ky from "ky";
import { parsePageConfig, PageConfig } from "./page-config-parser";
import { parseCollection, RecordParsed } from "./page-parser";
import _ from "lodash";

const PAGE_CONFIG_ID = "48b5d5c7fac64ffa9217fa6d9e4b8726";
const NOTION_PAGE_ID = "fed0776d23574745beb578cb4de801d7";

const fixture = {
  votes: {
    type: "number",
    value: 1.64,
  },
  rating: { type: "number", value: 8.7 },
  Name: {
    type: "title",
    value: "Doctor Strange en el multiverso de la locura",
  },
  tags: {
    type: "multi_select",
    value: ["Fantástico", "Acción", "Terror"],
  },
};

export async function updateCollection(
  page: string = NOTION_PAGE_ID,
  pageConfigId: string = PAGE_CONFIG_ID,
) {
  const parsedCollection = await parseCollection(NOTION_PAGE_ID);
  updateRecords(parsedCollection);
}

function updateRecords(parsedCollection: RecordParsed[]) {
  for (let record of parsedCollection) {
    updateRecord(record);
  }
}

function updateRecord(record: RecordParsed) {
  const props: any = {};
  const properties = _.map(fixture, (property, key) => {
    const { type, value } = property;
    props[key] = {
      [type]: translateToApiUpdateProperty(property),
    };
  });
  logger.debug(
    `page-updater:updateRecord:${record.id}`,
    JSON.stringify(props),
  );

  updatePage(record.id, props);
}

const translateToApiUpdateProperty = (property: {
  type: string;
  value: any;
}) => {
  const { type, value } = property;

  switch (type) {
    case "number":
      return value;
    case "multi_select":
      return value.map((e: string) => ({ name: e }));
    case "title":
      return [{ text: { content: value } }];
    case "rich_text":
      return [{ text: { content: value } }];
    default:
      return "Type not supported";
  }
};
