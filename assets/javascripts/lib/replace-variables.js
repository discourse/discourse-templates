const allowedVariables = [
  "my_username",
  "my_name",
  "context_title",
  "context_url",
  "topic_title",
  "topic_url",
  "original_poster_username",
  "original_poster_name",
  "reply_to_username",
  "reply_to_name",
  "last_poster_username",
  "reply_to_or_last_poster_username",
];

export function replaceVariables(title, content, variables) {
  if (variables && typeof variables === "object") {
    for (const key of allowedVariables) {
      if (variables[key]) {
        title = title.replace(
          new RegExp(`%{${key}(,fallback:.[^}]*)?}`, "g"),
          variables[key]
        );
        content = content.replace(
          new RegExp(`%{${key}(,fallback:.[^}]*)?}`, "g"),
          variables[key]
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
