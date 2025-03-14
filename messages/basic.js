import { InteractionResponseType } from "discord-interactions";

//SEND A BASIC DISCORD MESSAGE BACK TO A CHANNEL
export const basicMessage = (response) => {
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: response
    },
  }
}