import {
  queryDatabase,
  getPageProperty,
  getPagePropertyValue,
  getDatabase,
} from "lib/notion";
import * as cheerio from "cheerio";
import { CheerioAPI } from "cheerio";
import { logger } from "@lib/logger";
import ky from "ky";
import { parsePageConfig, PageConfig } from "./page-config-parser";

type Page = any;

type RecordParsed = {
  id: string;
  url: string;
  html: CheerioAPI | undefined;
  // selectorFields: SelectorField[],
};

type SelectorField = {
  type?: "css" | "xpath";
  pageId: string;
  selectorProperty: string;
  selector: string;
  valueProperty: string;
  value: any;
};

const fixture: SelectorField = {
  pageId: "123456789",
  selectorProperty: "css-votes",
  selector: "#movie-count-rat > span",
  valueProperty: "votes",
  value: undefined,
};

const PAGE_CONFIG_ID = "f02f18ada9b6499a9224fcff3570eb5a";
const NOTION_PAGE_ID = "fed0776d23574745beb578cb4de801d7";

export const parseCollection = async () => {
  const nonParsedPages: Page[] = await getNonParsedPages(
    NOTION_PAGE_ID,
  );
  const parsedPages = await parsePages(nonParsedPages);
  console.log(parsedPages);
  // updateParsedRecords(parsedRecords);
};

async function getNonParsedPages(pageId: string) {
  const filter = {
    property: "processed",
    checkbox: {
      equals: false,
    },
  };
  const pages = await queryDatabase(pageId, filter);
  return pages;
}

async function parsePages(records: Page[]) {
  let parsedRecords = [];
  const pageConfig = (await parsePageConfig(PAGE_CONFIG_ID)).find(
    (e) => (e.pageId = records[0].parent.database_id),
  );
  logger.debug("pageConfig", pageConfig);
  for (const record of records) {
    const recordParsed = await parseRecord(record, pageConfig);
    // recordParsed.selectorFields.forEach(
    //   (selectorField, idx) => {
    //     recordParsed.selectorFields[idx] = {
    //       ...selectorField,
    //       value: getFieldValue(selectorField)
    //     }
    //   }
    // )
    parsedRecords.push(recordParsed);
  }
  return parsedRecords;
}

async function parseRecord(
  page: Page,
  pageConfig: PageConfig | undefined,
): Promise<RecordParsed> {
  // logger.debug(`record`, page)
  let id = page.id;
  let url = getPagePropertyValue(page, "Url", true);
  logger.debug(`parsing html web...STARTED... (${url})`);
  let webHtml = await (await ky(url)).text();
  logger.debug("parsing html web... FINISHED!");
  // logger.debug(webHtml);
  let html = url ? cheerio.load(webHtml) : undefined;
  const result = {
    id,
    url,
    html,
    values: extractValuesWithConfig(page, html, pageConfig),
  };
  logger.debug(`page-parser.tsx:parseRecord:result`, result);
  return result;
}

async function getDatabaseSelectorProperties() {
  const database = await getDatabase(
    "fed0776d23574745beb578cb4de801d7",
  );
  return Object.keys(database.properties).filter((e: string) =>
    e.startsWith("css-"),
  );
}

function extractValuesWithConfig(
  page: Page,
  $: CheerioAPI | undefined,
  pageConfig: PageConfig | undefined,
) {
  if (!$) {
    throw Error("$ cannot be undefined");
  }
  logger.debug(
    "page-parser.ts:extractValuesWithConfig:pageConfig",
    pageConfig,
  );
  const resultObject = {};
  for (const { property, selector } of pageConfig?.selectors || []) {
    // }
    // return pageConfig?.selectors.forEach(({ property, selector }) => {
    let parsedValue = $(selector);
    // logger.debug(`selector`, parsedValue);
    // logger.debug(`value`, parsedValue);
    // logger.debug(`length ${selector}`, parsedValue.length);
    logger.debug(`element(s) ${property} - ${selector}`);
    if (parsedValue.length > 0)
      logger.debug(
        parsedValue
          .map((i, e) => $(e).html())
          .get()
          .join(", "),
      );
    else logger.debug(parsedValue.html());

    resultObject[property] =
      parsedValue.length > 1
        ? parsedValue
            .map((i, e) => $(e).html())
            .get()
            .join(", ")
        : parsedValue.html()?.trim();
  }
  return resultObject;
}

function parseHtml(url: string): string {
  throw new Error("Function not implemented.");
}

function getSelectorFieldsForRecord(record: any): SelectorField[] {
  throw new Error("Function not implemented.");
}
function getFieldValue(selectorField: SelectorField): any {
  throw new Error("Function not implemented.");
}

function updateParsedRecords(parsedRecords: RecordParsed[]) {
  throw new Error("Function not implemented.");
}
