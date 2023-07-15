export function prepareTemplate(title, content, model) {
  // Replace variables with values.
  if (model) {
    const vars = {
      my_username: model.get("user.username"),
      my_name: model.get("user.name"),
      topic_title: model.get("topic.title"),
      topic_url: model.get("topic.url"),
      original_poster_username: model.get("topic.details.created_by.username"),
      original_poster_name: model.get("topic.details.created_by.name"),
      reply_to_username: model.get("post.username"),
      reply_to_name: model.get("post.name"),
      last_poster_username: model.get("topic.last_poster_username"),
      reply_to_or_last_poster_username:
        model.get("post.username") || model.get("topic.last_poster_username"),
    };

    for (let key in vars) {
      if (vars[key]) {
        title = title.replace(
          new RegExp(`%{${key}(,fallback:.[^}]*)?}`, "g"),
          vars[key]
        );
        content = content.replace(
          new RegExp(`%{${key}(,fallback:.[^}]*)?}`, "g"),
          vars[key]
        );
      } else {
        title = title.replace(
          new RegExp(`%{${key},fallback:(.[^}]*)}`, "g"),
          "$1"
        );
        title = title.replace(new RegExp(`%{${key}}`, "g"), "");
        content = content.replace(
          new RegExp(`%{${key},fallback:(.[^}]*)}`, "g"),
          "$1"
        );
        content = content.replace(new RegExp(`%{${key}}`, "g"), "");
      }
    }
  }

  return { title, content };
}
