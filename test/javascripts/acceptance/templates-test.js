import { click, fillIn, triggerKeyEvent, visit } from "@ember/test-helpers";
import { clearPopupMenuOptionsCallback } from "discourse/controllers/composer";
import { PLATFORM_KEY_MODIFIER } from "discourse/lib/keyboard-shortcuts";
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

async function selectCategory() {
  const categoryChooser = selectKit(".category-chooser");
  await categoryChooser.expand();
  await categoryChooser.selectRowByValue(2);
}

acceptance("discourse-templates", function (needs) {
  needs.settings({
    discourse_templates_enabled: true,
    allow_uncategorized_topics: true,
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
    await selectCategory();
    await popUpMenu.expand();
    await popUpMenu.selectRowByValue("insertTemplate");

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
    await selectCategory();
    await popUpMenu.expand();
    await popUpMenu.selectRowByValue("insertTemplate");

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
    await selectCategory();
    await popUpMenu.expand();
    await popUpMenu.selectRowByValue("insertTemplate");

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
      await selectCategory();
      await popUpMenu.expand();
      await popUpMenu.selectRowByValue("insertTemplate");

      assert.ok(
        !exists(".templates-filter-bar .tag-drop"),
        "tag drop down is not displayed"
      );
    });
  }
);

acceptance("discourse-templates | keyboard shortcut", function (needs) {
  needs.settings({
    discourse_templates_enabled: true,
    tagging_enabled: true,
  });
  needs.user({
    can_use_templates: true,
  });

  needs.pretender(templatesPretender);
  needs.hooks.beforeEach(() => clearPopupMenuOptionsCallback());

  const triggerKeyboardShortcut = async () => {
    // Testing keyboard events is tough!
    const isMac = PLATFORM_KEY_MODIFIER.toLowerCase() === "meta";
    await triggerKeyEvent(document, "keydown", "I", {
      ...(isMac ? { metaKey: true } : { ctrlKey: true }),
      shiftKey: true,
    });
  };

  const assertTemplateWasInserted = async (assert, textarea) => {
    const tagDropdown = selectKit(".templates-filter-bar .tag-drop");
    await tagDropdown.expand();

    await tagDropdown.fillInFilter(
      "cupcake",
      ".templates-filter-bar .tag-drop input"
    );
    await tagDropdown.selectRowByIndex(0);
    await click("#template-item-1 .templates-apply");

    assert.equal(
      textarea.value.trim(),
      "Cupcake ipsum dolor sit amet cotton candy cheesecake jelly. Candy canes sugar plum soufflé sweet roll jelly-o danish jelly muffin. I love jelly-o powder topping carrot cake toffee.",
      "it should insert the template in the textarea"
    );
  };

  test("Help | Added shortcut to help modal", async function (assert) {
    await visit("/");
    await triggerKeyEvent(document, "keypress", "?".charCodeAt(0));

    assert.ok(exists(".shortcut-category-templates"));
    assert.strictEqual(count(".shortcut-category-templates li"), 1);
  });

  test("Composer | Title field focused | Template is inserted", async (assert) => {
    await visit("/");

    await click("#create-topic");
    await selectCategory();
    const textarea = query(".d-editor-input");

    await triggerKeyboardShortcut();
    await assertTemplateWasInserted(assert, textarea);
  });

  test("Composer | Textarea focused | Template is inserted", async (assert) => {
    await visit("/");

    await click("#create-topic");
    await selectCategory();

    const textarea = query(".d-editor-input");
    await textarea.focus();

    await triggerKeyboardShortcut();
    await assertTemplateWasInserted(assert, textarea);
  });

  test("Modal | Templates modal | Show the modal if a textarea is focused", async (assert) => {
    // if the text area is outside a modal then simply show the insert template modal
    // because there is no need to hijack
    await visit("/u/charlie/preferences/profile");

    const textarea = query(".d-editor-input");
    await textarea.focus();

    await triggerKeyboardShortcut();
    assert.ok(
      exists(".d-modal.d-templates"),
      "It displayed the standard templates modal"
    );
  });

  test("Modal | Templates modal | Template is inserted", async (assert) => {
    await visit("/u/charlie/preferences/profile");

    const textarea = query(".d-editor-input");
    await textarea.focus();

    await triggerKeyboardShortcut();
    await assertTemplateWasInserted(assert, textarea);
  });

  test("Modal | Templates Modal | Stacked Modals | Template is inserted", async (assert) => {
    await visit("/t/topic-for-group-moderators/2480");
    await click(".show-more-actions");
    await click(".show-post-admin-menu");
    await click(".add-notice");

    const textarea = query(".modal-body textarea");
    await textarea.focus();

    await triggerKeyboardShortcut();
    await assertTemplateWasInserted(assert, textarea);
  });

  test("Modal | Templates Modal | Stacked Modals | Closing the template modal returns the focus to the original modal textarea", async (assert) => {
    await visit("/t/topic-for-group-moderators/2480");
    await click(".show-more-actions");
    await click(".show-post-admin-menu");
    await click(".add-notice");

    const textarea = query(".modal-body textarea");
    await textarea.focus();
    assert.notOk(
      exists(".d-templates-modal"),
      "the templates modal does not exist yet"
    );
    await triggerKeyboardShortcut();
    assert.ok(exists(".d-templates-modal"), "it displayed the templates modal");

    await click(".d-templates-modal .btn.modal-close");
    assert.ok(
      textarea === document.activeElement,
      "it focused the original textarea again after closing the templates modal"
    );
  });
});
