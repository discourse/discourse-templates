import EmberObject from "@ember/object";
import { discourseModule } from "discourse/tests/helpers/qunit-helpers";
import { replaceVariables } from "discourse/plugins/discourse-templates/lib/replace-variables";
import extractVariablesFromComposerModel from "discourse/plugins/discourse-templates/lib/variables-composer";
import { test } from "qunit";

discourseModule(
  "Unit | Plugins | discourse-templates | Lib | replace-variables",
  function () {
    test("replaceVariables", function (assert) {
      const expectedVariables = {
        my_username: "heisenberg",
        my_name: "Walter White",
        topic_title: "Villains",
        topic_url: "/t/villains/6",
        original_poster_username: "mr_hide",
        original_poster_name: "Dr. Henry Jekyll",
        reply_to_username: "dracula",
        reply_to_name: "Vlad",
        last_poster_username: "frankenstein",
        reply_to_or_last_poster_username: "dracula",
      };

      const fakeModel = EmberObject.create({
        user: {
          username: expectedVariables.my_username,
          name: expectedVariables.my_name,
        },
        topic: {
          details: {
            created_by: {
              username: expectedVariables.original_poster_username,
              name: expectedVariables.original_poster_name,
            },
          },
          last_poster_username: expectedVariables.last_poster_username,
          title: "Villains",
          url: "/t/villains/6",
        },
        post: {
          username: expectedVariables.reply_to_username,
          name: expectedVariables.reply_to_name,
        },
      });

      Object.keys(expectedVariables).forEach((key) => {
        let template, expected, preparedTemplate;

        // simple replacement
        template = {
          title: `test title:%{${key}}`,
          content: `test response:%{${key}}, %{${key}}, %{${key}}`,
        };
        expected = {
          title: `test title:${expectedVariables[key]}`,
          content: `test response:${expectedVariables[key]}, ${expectedVariables[key]}, ${expectedVariables[key]}`,
        };

        const templateVariables = extractVariablesFromComposerModel(fakeModel);

        preparedTemplate = replaceVariables(
          template.title,
          template.content,
          templateVariables
        );
        assert.strictEqual(
          preparedTemplate.title,
          expected.title,
          `%{${key}} simple replacement/title`
        );
        assert.strictEqual(
          preparedTemplate.content,
          expected.content,
          `%{${key}} simple replacement/content`
        );

        // replacement with fallback (variables defined)
        template = {
          title: `test title:%{${key},fallback:${key.toUpperCase()}}`,
          content: `test response:%{${key},fallback:${key.toUpperCase()}}, %{${key},fallback:${key.toUpperCase()}}, %{${key},fallback:${key.toUpperCase()}}`,
        };

        preparedTemplate = replaceVariables(
          template.title,
          template.content,
          templateVariables
        );
        assert.strictEqual(
          preparedTemplate.title,
          expected.title,
          `%{${key}} replacement with fallback - variable defined/title`
        );
        assert.strictEqual(
          preparedTemplate.content,
          expected.content,
          `%{${key}} replacement with fallback - variable defined/content`
        );

        // replacement with fallback (variables undefined)
        expected = {
          title: `test title:${key.toUpperCase()}`,
          content: `test response:${key.toUpperCase()}, ${key.toUpperCase()}, ${key.toUpperCase()}`,
        };

        preparedTemplate = replaceVariables(
          template.title,
          template.content,
          {}
        );
        assert.strictEqual(
          preparedTemplate.title,
          expected.title,
          `%{${key}} replacement with fallback - variable undefined/title`
        );
        assert.strictEqual(
          preparedTemplate.content,
          expected.content,
          `%{${key}} replacement with fallback - variable undefined/content`
        );
      });
    });
  }
);
