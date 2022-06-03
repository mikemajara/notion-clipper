import { SliderFrequency } from "@/components/slider-component";
import {
  Stack,
  chakra,
  Heading,
  Input,
  Switch,
  Button,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react";
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
} from "@chakra-ui/react";
import { AiOutlineEdit } from "react-icons/ai";
import { BiTrashAlt } from "react-icons/bi";
import React from "react";
import { AddIcon } from "@chakra-ui/icons";
import { ClipEditModal } from "@/components/clip-edit";

const FormComponent = (props: any) => {
  const { label, help, input } = props;
  return (
    <FormControl>
      <FormLabel htmlFor="email">{label}</FormLabel>
      {input}
      {help && <FormHelperText>{help}</FormHelperText>}
    </FormControl>
  );
};

const Clips = () => {
  return (
    <Stack p={10}>
      <Heading size="xl">Clips</Heading>

      <Stack direction="row" spacing={10}>
        <FormComponent
          label="Clip name"
          input={
            <Input
              id="email"
              type="email"
              placeholder="My new collection"
            />
          }
        />
        <FormComponent
          label="Collection Page ID"
          input={
            <Input
              id="email"
              type="email"
              placeholder="fed0776d23574745beb578cb4de801d7"
            />
          }
        />
        <FormComponent
          label="Config Page ID"
          input={
            <Input
              id="email"
              type="email"
              placeholder="48b5d5c7fac64ffa9217fa6d9e4b8726"
            />
          }
        />
        <FormComponent
          label="Frequency"
          input={<SliderFrequency />}
        />
        <FormComponent
          label="Enabled"
          input={<Switch id="enabled" colorScheme="green" />}
        />
        <IconButton icon={<AiOutlineEdit />} aria-label="edit" />
        <IconButton icon={<BiTrashAlt />} aria-label="delete" />
      </Stack>
      <Flex>
        <ClipEditModal
          button={
            <Button leftIcon={<AddIcon fontSize="sm" />}>
              Add new clip
            </Button>
          }
        />
      </Flex>
    </Stack>
  );
};

export default Clips;
