import EmberObject from "@ember/object";
import { discourseModule } from "discourse/tests/helpers/qunit-helpers";
import { prepareTemplate } from "discourse/plugins/discourse-templates/lib/apply-template";
import { test } from "qunit";

discourseModule(
  "Unit | Plugins | discourse-templates | Lib | apply-template",
  function () {
    test("prepareTemplate", function (assert) {
      const expectedVariables = {
        my_username: "heisenberg",
        my_name: "Walter White",
        topic_title: "Villains",
        topic_url: "/t/villains/6",
        original_poster_username: "mr_hide",
        original_poster_name: "Dr. Henry Jekyll",
        template_to_username: "dracula",
        template_to_name: "Vlad",
        last_poster_username: "frankenstein",
        template_to_or_last_poster_username: "dracula",
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
          username: expectedVariables.template_to_username,
          name: expectedVariables.template_to_name,
        },
      });

      Object.keys(expectedVariables).forEach((key) => {
        let template, expected, preparedTemplate;

        // simple replacement
        template = {
          templateTitle: `test title:%{${key}}`,
          templateContent: `test response:%{${key}}, %{${key}}, %{${key}}`,
        };
        expected = {
          templateTitle: `test title:${expectedVariables[key]}`,
          templateContent: `test response:${expectedVariables[key]}, ${expectedVariables[key]}, ${expectedVariables[key]}`,
        };

        preparedTemplate = prepareTemplate(
          template.templateTitle,
          template.templateContent,
          fakeModel
        );
        assert.strictEqual(
          preparedTemplate.templateTitle,
          expected.templateTitle,
          `%{${key}} simple replacement/title`
        );
        assert.strictEqual(
          preparedTemplate.templateContent,
          expected.templateContent,
          `%{${key}} simple replacement/content`
        );

        // replacement with fallback (variables defined)
        template = {
          templateTitle: `test title:%{${key},fallback:${key.toUpperCase()}}`,
          templateContent: `test response:%{${key},fallback:${key.toUpperCase()}}, %{${key},fallback:${key.toUpperCase()}}, %{${key},fallback:${key.toUpperCase()}}`,
        };

        preparedTemplate = prepareTemplate(
          template.templateTitle,
          template.templateContent,
          fakeModel
        );
        assert.strictEqual(
          preparedTemplate.templateTitle,
          expected.templateTitle,
          `%{${key}} replacement with fallback - variable defined/title`
        );
        assert.strictEqual(
          preparedTemplate.templateContent,
          expected.templateContent,
          `%{${key}} replacement with fallback - variable defined/content`
        );

        // replacement with fallback (variables undefined)
        expected = {
          templateTitle: `test title:${key.toUpperCase()}`,
          templateContent: `test response:${key.toUpperCase()}, ${key.toUpperCase()}, ${key.toUpperCase()}`,
        };

        preparedTemplate = prepareTemplate(
          template.templateTitle,
          template.templateContent,
          EmberObject.create()
        );
        assert.strictEqual(
          preparedTemplate.templateTitle,
          expected.templateTitle,
          `%{${key}} replacement with fallback - variable undefined/title`
        );
        assert.strictEqual(
          preparedTemplate.templateContent,
          expected.templateContent,
          `%{${key}} replacement with fallback - variable undefined/content`
        );
      });
    });
  }
);
