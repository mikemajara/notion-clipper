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

export type RecordParsed = {
  id: string;
  url: string;
  html?: CheerioAPI | undefined;
  properties: any;
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

const PAGE_CONFIG_ID = "48b5d5c7fac64ffa9217fa6d9e4b8726";

export const parseCollection = async (
  pageId: string,
): Promise<RecordParsed[]> => {
  const nonParsedPages: Page[] = await getNonParsedPages(pageId);
  const parsedPages = await parsePages(nonParsedPages);
  logger.debug(parsedPages);
  return parsedPages;
  // updateParsedRecords(parsedRecords);
};

async function getNonParsedPages(pageId: string) {
  const filter = {
    property: "parsed",
    checkbox: {
      equals: false,
    },
  };
  const pages = await queryDatabase(pageId, filter);
  return pages;
}

async function parsePages(records: Page[]) {
  let parsedRecords = [];
  // TODO: parsePageConfig should receive the parent database id and
  // return the pageConfig in one go.
  const pageConfig = await parsePageConfig(PAGE_CONFIG_ID);
  for (const record of records) {
    const recordParsed = await parseRecord(record, pageConfig);
    parsedRecords.push(recordParsed);
  }
  logger.debug(
    `page-parser.ts:parsePages:parsedRecords`,
    parsedRecords,
  );
  return parsedRecords;
}

async function parseRecord(
  page: Page,
  pageConfig: PageConfig | undefined,
): Promise<RecordParsed> {
  let id = page.id;
  let url = getPagePropertyValue(page, "Url", true);

  let webHtml = await (await ky(url)).text();

  let html = url ? cheerio.load(webHtml) : undefined;
  const result = {
    id,
    url,
    // html,
    properties: typeCheckAndConvertValues(
      extractValuesWithConfig(page, html, pageConfig),
    ),
  };

  return result;
}

function extractValuesWithConfig(
  page: Page,
  $: CheerioAPI | undefined,
  pageConfig: PageConfig | undefined,
) {
  if (!$) {
    throw Error("$ cannot be undefined");
  }
  if (!pageConfig) {
    throw Error("pageConfig cannot be undefined");
  }
  logger.debug(
    `page-parser.ts:extractValuesWithConfig:pageConfig`,
    pageConfig,
  );
  const result = [];
  for (let config of pageConfig) {
    let parsedValue = $(config.selector);
    result.push({
      ...config,
      value:
        parsedValue.length > 1
          ? parsedValue.map((i, e) => $(e).html()).get()
          : parsedValue.html()?.trim(),
    });
  }
  logger.debug(
    `page-parser.ts:extractValuesWithConfig:result`,
    result,
  );
  return result;
}

function typeCheckAndConvertValues(values: any) {
  return values.map((e: any) => {
    if (e.type === "number" && typeof e.value !== "number") {
      e.value = parseFloat(e.value);
    }
    logger.debug(`page-parser.ts:typeCheckAndConvertValues:e`, e);
    return e;
  });
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
