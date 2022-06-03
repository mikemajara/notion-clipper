import Link from "next/link";
import React, { useState, ReactNode, useEffect } from "react";

import LoadingDots from "components/ui/LoadingDots";
import Button from "components/ui/Button";
import { useUser } from "utils/useUser";
import { postData } from "utils/helpers";

import {
  withAuthRequired,
  User,
} from "@supabase/supabase-auth-helpers/nextjs";
import ky from "ky";
import { useMutation } from "react-query";
import { parseCollection } from "@/utils/page-parser";
import { Flex, HStack, Stack, chakra, Input } from "@chakra-ui/react";

interface Props {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

function Card({ title, description, footer, children }: Props) {
  return (
    <Stack
      border="solid"
      // borderColor="zinc.700"
      maxW="3xl"
      w="full"
      borderRadius="lg"
      m="auto"
      my={8}
    >
      <Stack px={5} py={4} spacing={4}>
        <chakra.h3 fontSize="2xl" mb={1}>
          {title}
        </chakra.h3>
        <chakra.p>{description}</chakra.p>
        {children}
      </Stack>
      <Stack borderTop={"solid"} p={4} borderBottomRadius="md">
        {footer}
      </Stack>
    </Stack>
  );
}

export const getServerSideProps = withAuthRequired({
  redirectTo: "/signin",
});

export default function Account({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const { isLoading, subscription, userDetails } = useUser();

  const [name, setName] = useState("");
  const [pageId, setPageId] = useState("");

  useEffect(() => {
    if (userDetails?.full_name) {
      setName(userDetails.full_name);
    }
  }, [userDetails]);

  const { data, error } = useMutation(() => {
    return ky.post("/modify-user", { json: { name } }).json();
  }, {});

  const redirectToCustomerPortal = async () => {
    setLoading(true);
    try {
      const { url, error } = await postData({
        url: "/api/create-portal-link",
      });
      window.location.assign(url);
    } catch (error) {
      if (error) return alert((error as Error).message);
    }
    setLoading(false);
  };

  const subscriptionPrice =
    subscription &&
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: subscription?.prices?.currency,
      minimumFractionDigits: 0,
    }).format((subscription?.prices?.unit_amount || 0) / 100);

  return (
    <chakra.section
      // bgColor={"black"}
      mb={"32"}
    >
      <Stack
        mx="auto"
        pt={{ base: 8, sm: 24 }}
        pb={8}
        px={{ base: 4, sm: 6, lg: 8 }}
        // className="max-w-6xl mx-auto pt-8 sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8"
      >
        <chakra.h1
          fontSize="5xl"
          fontWeight="extrabold"
          textAlign={{ sm: "center" }}
        >
          Account
        </chakra.h1>
        <chakra.p
          w="full"
          mt={5}
          fontSize="2xl"
          // textColor="zinc.200"
          textAlign={{ sm: "center" }}
          // className="mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl max-w-2xl m-auto"
        >
          We partnered with Stripe for a simplified billing.
        </chakra.p>
      </Stack>
      <div className="p-4">
        <Card
          title="Your Name"
          description="Please enter your full name, or a display name you are comfortable with."
          footer={
            <div className="flex items-start justify-between flex-col sm:flex-row sm:items-center">
              <p>Please use 64 characters at maximum.</p>
              <Button
                variant="slim"
                loading={loading}
                // disabled={loading || !subscription}
                onClick={redirectToCustomerPortal}
              >
                Save
              </Button>
            </div>
          }
        >
          <input
            type="text"
            className="p-2 rounded-md border "
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Card>
        <Card
          title="Your Email"
          description="Please enter the email address you want to use to login."
          footer={<p>We will email you to verify the change.</p>}
        >
          <Input
            value={user ? user.email : undefined}
            // className="text-xl mt-8 mb-4 font-semibold"
          />
        </Card>
        <Card
          title="Your Plan"
          description={
            subscription
              ? `You are currently on the ${subscription?.prices?.products?.name} plan.`
              : ""
          }
          footer={
            <div className="flex items-start justify-between flex-col sm:flex-row sm:items-center">
              <p className="pb-4 sm:pb-0">
                Manage your subscription on Stripe.
              </p>
              <Button
                variant="slim"
                loading={loading}
                disabled={loading || !subscription}
                onClick={redirectToCustomerPortal}
              >
                Open customer portal
              </Button>
            </div>
          }
        >
          <div className="text-xl mt-8 mb-4 font-semibold ">
            {isLoading ? (
              <div className="h-12 mb-6">
                <LoadingDots />
              </div>
            ) : subscription ? (
              `${subscriptionPrice}/${subscription?.prices?.interval}`
            ) : (
              <Link href="/">
                <a>Choose your plan</a>
              </Link>
            )}
          </div>
        </Card>
      </div>
    </chakra.section>
  );
}
