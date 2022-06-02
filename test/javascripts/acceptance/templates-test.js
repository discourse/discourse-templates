import { click, fillIn, visit } from "@ember/test-helpers";
import { clearPopupMenuOptionsCallback } from "discourse/controllers/composer";
import {
  acceptance,
  count,
  exists,
  query,
} from "discourse/tests/helpers/qunit-helpers";
import selectKit from "discourse/tests/helpers/select-kit-helper";
import { test } from "qunit";
import TemplatesFixtures from "../fixtures/templates-fixtures";

function templatesPretender(server, helper) {
  const repliesPath = "/discourse_templates";
  const replies = TemplatesFixtures[repliesPath];

  server.get(repliesPath, () => helper.response(replies));
  replies.templates.forEach((template) =>
    server.post(`${repliesPath}/${template.id}/use`, () => helper.response({}))
  );
}

acceptance("discourse-templates", function (needs) {
  needs.settings({
    discourse_templates_enabled: true,
    tagging_enabled: true,
  });
  needs.user({
    can_use_templates: true,
  });

  needs.pretender(templatesPretender);
  needs.hooks.beforeEach(() => clearPopupMenuOptionsCallback());

  test("Filtering by tags", async (assert) => {
    const popUpMenu = await selectKit(".toolbar-popup-menu-options");

    await visit("/");

    await click("#create-topic");
    await popUpMenu.expand();
    await popUpMenu.selectRowByValue("showTemplatesButton");

    const tagDropdown = selectKit(".templates-filter-bar .tag-drop");
    await tagDropdown.expand();

    await tagDropdown.fillInFilter(
      "cupcake",
      ".templates-filter-bar .tag-drop input"
    );
    assert.deepEqual(
      tagDropdown.displayedContent(),
      [
        {
          name: "cupcakes",
          id: "cupcakes",
        },
      ],
      "it should filter tags in the dropdown"
    );

    await tagDropdown.selectRowByIndex(0);
    assert.equal(
      count(".templates-list .template-item"),
      1,
      "it should filter replies by tag"
    );

    await click("#template-item-1 .templates-apply");

    assert.equal(
      query(".d-editor-input").value.trim(),
      "Cupcake ipsum dolor sit amet cotton candy cheesecake jelly. Candy canes sugar plum soufflé sweet roll jelly-o danish jelly muffin. I love jelly-o powder topping carrot cake toffee.",
      "it should insert the template in the composer"
    );
  });

  test("Filtering by text", async (assert) => {
    const popUpMenu = await selectKit(".toolbar-popup-menu-options");

    await visit("/");

    await click("#create-topic");
    await popUpMenu.expand();
    await popUpMenu.selectRowByValue("showTemplatesButton");

    await fillIn(".templates-filter-bar input.templates-filter", "test");
    assert.equal(
      count(".templates-list .template-item"),
      2,
      "it should filter by text"
    );

    await click("#template-item-8 .templates-apply");

    assert.equal(
      query(".d-editor-input").value.trim(),
      "Testing testin **123**",
      "it should insert the template in the composer"
    );
  });

  test("Replacing variables", async (assert) => {
    const popUpMenu = await selectKit(".toolbar-popup-menu-options");

    await visit("/");

    await click("#create-topic");
    await popUpMenu.expand();
    await popUpMenu.selectRowByValue("showTemplatesButton");

    await click("#template-item-9 .templates-apply");

    assert.equal(
      query(".d-editor-input").value.trim(),
      "Hi there, regards eviltrout.",
      "it should replace variables"
    );
  });
});

acceptance(
  "discourse-templates - with tags disabled in Settings",
  function (needs) {
    needs.settings({
      discourse_templates_enabled: true,
      tagging_enabled: false,
    });
    needs.user({
      can_use_templates: true,
    });

    needs.pretender(templatesPretender);
    needs.hooks.beforeEach(() => clearPopupMenuOptionsCallback());

    test("Filtering by tags", async (assert) => {
      const popUpMenu = await selectKit(".toolbar-popup-menu-options");

      await visit("/");

      await click("#create-topic");
      await popUpMenu.expand();
      await popUpMenu.selectRowByValue("showTemplatesButton");

      assert.ok(
        !exists(".templates-filter-bar .tag-drop"),
        "tag drop down is not displayed"
      );
    });
  }
);
