import { logger } from "@lib/logger";
import { withAuthRequired } from "@supabase/supabase-auth-helpers/nextjs";
import { NextApiRequest, NextApiResponse } from "next";

const handleRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  if (req.method === "POST") {
    logger.debug(req.body);
  }
};

export default withAuthRequired(handleRequest);
