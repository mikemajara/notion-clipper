import { logger } from "@lib/logger";
import { Client } from "@notionhq/client";
import { isNil } from "lodash";

const PAGE_SIZE = 100;
const UNFOLD_CHILDREN_LEVEL = 4;

// This Notion token needs to be the token
// that the customer has set for their integration
// so we need to find a singleton or similar
// pattern so that each process can create a
// different Notion Client to query for information
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DEFAULT_PAGE_ID = process.env.NOTION_PAGE_ID || "";

export const queryDatabase = async (
  databaseId: string = DEFAULT_PAGE_ID,
  filter: any = {},
  sorts: any = {},
): Promise<any[]> => {
  if (!databaseId) {
    logger.error("Database ID cannot be empty");
  }
  logger.debug("filter", filter);
  const response = await notion.databases.query({
    database_id: databaseId,
    // filter,
    sorts: [
      {
        property: "Name",
        direction: "ascending",
        ...sorts,
      },
    ],
  });
  return response.results;
};

export const getDatabase = async (
  databaseId: string = DEFAULT_PAGE_ID,
  filter: any = {},
  sorts: any = {},
): Promise<any> => {
  if (!databaseId) {
    logger.error("Database ID cannot be empty");
  }
  const response = await notion.databases.retrieve({
    database_id: databaseId,
  });
  logger.debug("index.ts:getDatabase:response", response);
  return response;
};

export const getPage = async (pageId: any) => {
  const response = await notion.pages.retrieve({ page_id: pageId });
  return response;
};

export const updatePage = async (pageId: any, properties: any) => {
  // const pageId = '60bdc8bd-3880-44b8-a9cd-8a145b3ffbd7';
  const response = await notion.pages.update({
    page_id: pageId,
    properties,
  });
  logger.debug(`notion/index.tsx:updatePage:response`, response);
};

export const getPageBySlug = async (databaseId: any, slug: any) => {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "slug",
      text: {
        equals: slug,
      },
    },
  });
  return response.results[0];
};

export const getBlocks = async (blockId: any) => {
  const response = await notion.blocks.children.list({
    block_id: blockId,
    page_size: PAGE_SIZE,
  });
  return response.results;
};

export const getPageProperty = async (
  pageId: any,
  propertyId: any,
) => {
  const response = await notion.pages.properties.retrieve({
    page_id: pageId,
    property_id: propertyId,
  });

  return response;
};

export const getPagePropertyValue = (
  page: { properties: { [x: string]: { [x: string]: any } } },
  property: string | number,
  plain_text?: any,
) => {
  if (isNil(page)) {
    logger.error(`Entity not found`, page, property);
    return null;
  }
  let type = page.properties?.[property]?.type;
  if (plain_text) {
    if (type === "multi_select") {
      return page.properties?.[property]?.[type].map(
        (block: { name: any }) => block.name,
      );
    }
    if (type === "url") {
      return page.properties?.[property]?.[type];
    }
    return page.properties?.[property]?.[type]
      ?.map((block: { plain_text: any }) => block.plain_text)
      .join("");
  } else if (type == "date") {
    return page.properties?.[property]?.[type]?.start;
  }
  return page.properties?.[property]?.[type];
};

export const getBlockPlainText = (block: {
  [x: string]: any;
  type?: any;
  id?: any;
}) => {
  const { type, id } = block;
  const value = block[type];
  return value.text
    ?.map((part: { plain_text: any }) => part.plain_text)
    .join("");
};

export const getPageIconUrl = (page: { icon: any }) => {
  const { icon } = page;
  return icon.type === "external" ? icon.external.url : icon.file.url;
};

export const getChildren = async (blocks: any[]) => {
  // Retrieve block children for nested blocks (one level deep), for example toggle blocks
  // https://developers.notion.com/docs/working-with-page-content#reading-nested-blocks
  return await Promise.all(
    blocks
      .filter((block: { has_children: any }) => block.has_children)
      .map(
        async (block: {
          [x: string]: { synced_from: { block_id: any } };
          type: any;
          id: any;
        }) => {
          const { id, type } = block;
          let children = [];
          if (
            type == "synced_block" &&
            block[block.type].synced_from
          ) {
            children = await getBlocks(
              block[block.type].synced_from.block_id,
            );
          } else {
            children = await getBlocks(block.id);
          }
          return { id, children };
        },
      ),
  );
};

export const populateChildren = async (blocks: any, level = 0) => {
  const childBlocks = await getChildren(blocks);
  const blocksWithChildren = [];
  for (const block of blocks) {
    if (block.has_children && !block.children) {
      // assign children for this block
      // assign the children, should there be any
      const children = childBlocks.find(
        (x) => x.id === block.id,
      )?.children;

      block["children"] = children?.map((child: any) => ({
        ...child,
        has_parent: true,
      }));

      // keep populating if we dive into children
      if (level < UNFOLD_CHILDREN_LEVEL) {
        block["children"] = await populateChildren(
          block.children,
          level + 1,
        );
      }
    }
    blocksWithChildren.push(block);
  }
  return blocksWithChildren;
};
