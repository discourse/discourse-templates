export default function extractVariablesFromChatChannel(
  channel,
  message,
  router
) {
  if (!channel && !message) {
    return {};
  }

  const inReplyTo = message?.inReplyTo;

  const channelVariables = {
    chat_channel_name: channel?.title,
    chat_channel_url: channel?.routeModels
      ? router?.urlFor("chat.channel", ...channel.routeModels)
      : null,
    reply_to_username: inReplyTo?.user?.username,
    reply_to_name: inReplyTo?.user?.name,
    last_poster_username: channel?.lastMessage?.user?.username,
    reply_to_or_last_poster_username:
      inReplyTo?.user?.username || channel?.lastMessage?.user?.username,
  };

  return {
    ...channelVariables,
    context_title: channelVariables.chat_channel_name,
    context_url: channelVariables.chat_channel_url,
  };
}
