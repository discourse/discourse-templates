export default function extractVariablesFromComposerModel(model) {
  if (!model) {
    return {};
  }

  return {
    my_username: model.user.username,
    my_name: model.user.name,
    topic_title: model.topic?.title,
    topic_url: model.topic?.url,
    original_poster_username: model.topic?.details.created_by.username,
    original_poster_name: model.topic?.details.created_by.name,
    reply_to_username: model.post?.username,
    reply_to_name: model.post?.name,
    last_poster_username: model.topic?.last_poster_username,
    reply_to_or_last_poster_username:
      model.post?.username || model.topic?.last_poster_username,
  };
}
