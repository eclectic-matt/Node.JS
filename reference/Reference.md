---

# Reference
* [Discord Dev Docs - App Commands](https://discord.com/developers/docs/interactions/application-commands)
* [Discord Dev Docs - Opcodes + Statuses](https://discord.com/developers/docs/topics/opcodes-and-status-codes#json)
* [Discord - MD formatting](https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline)
* [roles.json (Github Source)](https://raw.githubusercontent.com/bra1n/townsquare/develop/src/roles.json)
* [Discord.js Ephemeral / Wait](https://discordjs.guide/slash-commands/response-methods.html#editing-responses)



# Read / Write Files (EventLogger)

[readFile, writeFile in nodejs](https://blog.logrocket.com/reading-writing-json-files-node-js-complete-tutorial/#using-fs-writefile-method)

# BOTC Official
Trying to roughly maintain compatibility with official app:
* [BOTC Release](https://github.com/ThePandemoniumInstitute/botc-release)
* [Official App JSON Schema](https://github.com/ThePandemoniumInstitute/botc-release/blob/main/script-schema.json)


# MESSAGE NOTES

## Ephemeral Message Response
```js
// get the associated game ID
const gameId = componentId.replace('accept_button_', '');
// Delete message with token in request body
const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
try {
  await res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: 'What is your object of choice?',
      // Indicates it'll be an ephemeral message
      flags: InteractionResponseFlags.EPHEMERAL,
      components: [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.STRING_SELECT,
              // Append game ID
              custom_id: `select_choice_${gameId}`,
              options: getShuffledOptions(),
            },
          ],
        },
      ],
    },
  });
  // Delete previous message
  await DiscordRequest(endpoint, { method: 'DELETE' });
} catch (err) {
  console.error('Error sending message:', err);
}
```