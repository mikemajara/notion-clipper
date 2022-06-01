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

const fixture = [
  {
    property: "votes",
    type: "number",
    selector: "",
    value: 1.64,
  },
  {
    property: "rating",
    type: "number",
    selector: "",
    value: 8.7,
  },
  {
    property: "Name",
    type: "title",
    selector: "",
    value: "Doctor Strange en el multiverso de la locura",
  },
  {
    property: "tags",
    type: "multi_select",
    selector: "",
    value: ["Fantástico", "Acción", "Terror"],
  },
];

export async function updateCollection(
  page: string = NOTION_PAGE_ID,
  pageConfigId: string = PAGE_CONFIG_ID,
) {
  const parsedCollection = await parseCollection(NOTION_PAGE_ID);
  updateRecords(parsedCollection);
}

function updateRecords(parsedCollection: RecordParsed[]) {
  for (let record of parsedCollection) {
    logger.debug(
      `page-updater.ts:updateRecords: Updating record...`,
      record,
    );
    updateRecord(record);
  }
}

function updateRecord(record: RecordParsed) {
  const props: any = {};
  const properties = _.map(record.properties, (configValue, key) => {
    const { type, value, property } = configValue;
    props[property] = {
      [type]: translateToApiUpdateProperty(configValue),
    };
  });
  logger.debug(
    `page-updater:updateRecord:${record.id}`,
    JSON.stringify(props),
  );

  updatePage(record.id, { ...props, parsed: { checkbox: true } });
}

const translateToApiUpdateProperty = (configValue: {
  type: string;
  value: any;
}) => {
  const { type, value } = configValue;

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
      return `Type ${type} not supported`;
  }
};
