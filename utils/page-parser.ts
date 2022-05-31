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

const PAGE_CONFIG_ID = "f02f18ada9b6499a9224fcff3570eb5a";

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
  const pageConfig = (await parsePageConfig(PAGE_CONFIG_ID)).find(
    (e) => (e.pageId = records[0].parent.database_id),
  );
  for (const record of records) {
    const recordParsed = await parseRecord(record, pageConfig);
    parsedRecords.push(recordParsed);
  }
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
    properties: extractValuesWithConfig(page, html, pageConfig),
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

  const resultObject: any = {};
  for (const { property, selector } of pageConfig?.selectors || []) {
    let parsedValue = $(selector);
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
