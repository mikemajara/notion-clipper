import { Stack, Image } from "@chakra-ui/react";
import NextImage from "next/image";
import React from "react";

const Home = () => {
  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      p={10}
      w="full"
      h="90vh"
      bg="white"
    >
      <Image
        borderRadius="lg"
        shadow="lg"
        w={[300, 500]}
        h={[300, 500]}
        src="https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3000&q=80"
      />
      <Stack
        fontSize={30}
        fontWeight="light"
        fontFamily={"Helvetica"}
      >
        <p>Boost your Notion Collections</p>
        <p>More than clipping</p>
        <p>No code scrapping in it's simplest form</p>
      </Stack>
    </Stack>
  );
};

export default Home;
