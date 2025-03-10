import { ChatFormData, ChatType } from "@/types";
import { conversationSchema, imageGenarationSchema } from "./validationSchema";

export const amountOptions = [
  {
    value: "1",
    label: "1枚",
  },
  {
    value: "2",
    label: "2枚",
  },
  {
    value: "3",
    label: "3枚",
  },
  {
    value: "4",
    label: "4枚",
  },
];

export const sizeOptions = [
  {
    value: "256x256",
    label: "256x256",
  },
  {
    value: "512x512",
    label: "512x512",
  },
  {
    value: "1024x1024",
    label: "1024x1024",
  },
];

const formConfig = {
  conversation: { schema: conversationSchema, defaultValue: { prompt: "" } },
  image_generation: {
    schema: imageGenarationSchema,
    defaultValue: { prompt: "", amount: "1", size: "256x256" },
  },
  text_to_speech: { schema: conversationSchema, defaultValue: { prompt: "" } },
  speech_to_text: { schema: conversationSchema, defaultValue: { prompt: "" } },
  image_analysis: { schema: conversationSchema, defaultValue: { prompt: "" } },
};

export const getFormCongfig = (chatType: ChatType) => {
  return formConfig[chatType];
};

export const getRequestData = (
  values: ChatFormData,
  chatId: string,
  chatType: string
) => {
  let apiUrl = "";
  let apiData = {};

  switch (chatType) {
    case "conversation":
      apiUrl = "/api/conversation";
      apiData = { prompt: values.prompt, chatId: chatId };
      break;
    case "image_generation":
      apiUrl = "/api/image_generation";
      apiData = {
        prompt: values.prompt,
        amount: values.amount,
        size: values.size,
        chatId: chatId,
      };
      break;
  }
  return { apiUrl, apiData };
};
