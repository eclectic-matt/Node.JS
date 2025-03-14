import fetch from 'node-fetch';

/**
 * Followup Messages
 * Source: https://discord.com/developers/docs/interactions/receiving-and-responding#followup-messages
 * 
 * Sometimes, your bot will want to send followup messages to a user after responding to an interaction. 
 * Or, you may want to edit your original response. 
 * Whether you receive Interactions over the gateway or by outgoing webhook, 
 * you can use the following endpoints to edit your initial response or send followup messages:
 * 
 * PATCH /webhooks/<application_id>/<interaction_token>/messages/@original to edit your initial response to an Interaction
 * DELETE /webhooks/<application_id>/<interaction_token>/messages/@original to delete your initial response to an Interaction
 * POST /webhooks/<application_id>/<interaction_token> to send a new followup message
 * PATCH /webhooks/<application_id>/<interaction_token>/messages/<message_id> to edit a message sent with that token
 *
 * Interactions webhooks share the same rate limit properties as normal webhooks.
 * Interaction tokens are valid for 15 minutes, meaning you can respond to an interaction within that amount of time.
**/
export class EndpointManager 
{
	constructor()
	{
		this.baseUrl = 'https://discord.com/api/v10/';
	}
	
	async sendRequest(endpoint, options)
	{
		// Generate URL
		const url = this.baseUrl + endpoint;
		// Stringify payloads
		if (options.body) options.body = JSON.stringify(options.body);
		// Use node-fetch to make requests
		const res = await fetch(url, {
			headers: {
				Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
				'Content-Type': 'application/json; charset=UTF-8',
				'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
			},
			...options
		});
		// throw API errors
		if (!res.ok) {
			const data = await res.json();
			console.log(res.status);
			throw new Error(JSON.stringify(data));
		}
		// return original response
		return res;
	}

  //=====================
	// INTERACTION RESPONSES
	// @see https://discord.com/developers/docs/interactions/receiving-and-responding
	//=====================

	/**
	 * Create Interaction Response
	 * POST
	 * /interactions/{interaction.id}/{interaction.token}/callback
	 * @param {*} interaction 
	 * @returns 
	 */
	//@see: https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response
	createInteractionResponse(interaction, content)
	{
		const endpoint = `interactions/${interaction.id}/${interaction.token}/callback`;
		return this.sendRequest(endpoint, { 
      method: 'POST', 
      body: {
        content: content,
        components: [],
      }
    });
	}
  
	/**
	 * Get Original Interaction Response
	 * GET
	 * /webhooks/{application.id}/{interaction.token}/messages/@original
	 * @param {*} interaction 
	 * @returns 
	 */
	//@see: Get Original Interaction Response
	getOriginalInteractionResponse(interaction)
	{
		const endpoint = `/webhooks/${process.env.APP_ID}/${interaction.token}/messages/@original`;
		return this.sendRequest(endpoint, { method: 'GET' });
	}

	/**
	 * Edit Original Interaction Response
	 * PATCH
	 * /webhooks/{application.id}/{interaction.token}/messages/@original
	 */
	editOriginalInteractionResponse(interaction, content)
	{
		const endpoint = `/webhooks/${process.env.APP_ID}/${interaction.token}/messages/@original`;
		return this.sendRequest(endpoint, { 
      method: 'PATCH',
      body: {
        content: content,
        components: [],
      }
    });
	}

	/**
	 * Delete Original Interaction Response
	 * DELETE
	 * /webhooks/{application.id}/{interaction.token}/messages/@original
	 * @param {*} interaction 
	 */
	deleteOriginalInteractionResponse(interaction)
	{
		const endpoint = `/webhooks/${process.env.APP_ID}/${interaction.token}/messages/@original`;
		return this.sendRequest(endpoint, { method: 'DELETE' });
	}

	//=====================
	// FOLLOWUP MESSAGES
	// @see https://discord.com/developers/docs/interactions/receiving-and-responding
	//=====================

	/**
	 * Create Followup Message
	 * POST
	 * /webhooks/{application.id}/{interaction.token}
	 * @see https://discord.com/developers/docs/interactions/receiving-and-responding#create-followup-message
	 */
	createFollowupMessage(interaction, content)
	{
		const endpoint = `/webhooks/${process.env.APP_ID}/${interaction.token}/`;
		return this.sendRequest(endpoint, { 
      method: 'POST',
      body: {
        content: content,
        components: [],
      },
    });
	}

	/**
	 * Get Followup Message
	 * GET
	 * /webhooks/{application.id}/{interaction.token}/messages/{message.id}
	 * @see: https://discord.com/developers/docs/interactions/receiving-and-responding#get-followup-message
	 */
	getFollowupMessage(interaction, message)
	{
		const endpoint = `/webhooks/${process.env.APP_ID}/${interaction.token}/messages/${message.id}`;
		return this.sendRequest(endpoint, { method: 'GET' });
	}

	/**
	 * Edit Followup Message
	 * PATCH
	 * /webhooks/{application.id}/{interaction.token}/messages/{message.id}
	 * @see: https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message
   * @example: webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}
	 */
	editFollowupMessage(interaction, message, content)
	{
		const endpoint = `/webhooks/${process.env.APP_ID}/${interaction.token}/messages/${message.id}`;
		return this.sendRequest(endpoint, { 
      method: 'PATCH',
      body: {
        content: content,
        components: [],
      },
    });
	}

	/**
	 * Delete Followup Message
	 * DELETE
	 * /webhooks/{application.id}/{interaction.token}/messages/{message.id}
	 * @see: https://discord.com/developers/docs/interactions/receiving-and-responding#delete-followup-message
	 */
	deleteFollowupMessage(interaction, message)
	{
		const endpoint = `/webhooks/${process.env.APP_ID}/${interaction.token}/messages/${message.id}`;
		return this.sendRequest(endpoint, { method: 'DELETE' });
	}
}