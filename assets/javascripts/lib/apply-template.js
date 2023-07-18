import { getOwner } from "discourse-common/lib/get-owner";

export function prepareTemplate(templateTitle, templateContent, model) {
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
        templateTitle = templateTitle.replace(
          new RegExp(`%{${key}(,fallback:.[^}]*)?}`, "g"),
          vars[key]
        );
        templateContent = templateContent.replace(
          new RegExp(`%{${key}(,fallback:.[^}]*)?}`, "g"),
          vars[key]
        );
      } else {
        templateTitle = templateTitle.replace(
          new RegExp(`%{${key},fallback:(.[^}]*)}`, "g"),
          "$1"
        );
        templateTitle = templateTitle.replace(new RegExp(`%{${key}}`, "g"), "");
        templateContent = templateContent.replace(
          new RegExp(`%{${key},fallback:(.[^}]*)}`, "g"),
          "$1"
        );
        templateContent = templateContent.replace(
          new RegExp(`%{${key}}`, "g"),
          ""
        );
      }
    }
  }

  return { templateTitle, templateContent };
}

export function insertTemplateIntoComposer(
  model,
  { templateTitle, templateContent }
) {
  // insert the title if blank
  if (model && !model.title) {
    model.set("title", templateTitle);
  }

  // insert the content of the template in the compose
  getOwner(this)
    .lookup("service:app-events")
    .trigger("composer:insert-block", templateContent);
}
