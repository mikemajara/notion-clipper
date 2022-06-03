import ky from "ky";
import React from "react";
import { Form } from "react-hook-form-generator";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
} from "@chakra-ui/react";

const schema = {
  firstName: {
    type: "text",
    label: "First Name",
    isRequired: true,
  },
  age: {
    type: "number",
    label: "Number",
  },
  contacts: {
    type: "array",
    label: "Contacts",
    itemField: {
      type: "object",
      properties: {
        firstName: {
          type: "text",
          label: "First Name",
        },
        phoneNumber: {
          type: "text",
          label: "Phone Number",
          htmlInputType: "tel",
        },
      },
    },
  },
};

export const ClipEdit = () => {
  const handleSubmit = (values: any) => {
    ky.post("api/clip", {
      json: values,
    });
  };

  return (
    <Form
      title="My Form"
      schema={schema}
      handleSubmit={handleSubmit}
    />
  );
};

export function ClipEditModal(props: any) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { button } = props;
  return (
    <>
      {React.cloneElement(button, { onClick: onOpen })}
      {/* <Button onClick={onOpen}>Open Modal</Button> */}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ClipEdit />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost">Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
