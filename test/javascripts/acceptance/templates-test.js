import { click, fillIn, triggerKeyEvent, visit } from "@ember/test-helpers";
import { clearPopupMenuOptionsCallback } from "discourse/controllers/composer";
import {
  acceptance,
  count,
  exists,
  query,
  queryAll,
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
    await selectCategory();
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
    await selectCategory();
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
      await selectCategory();
      await popUpMenu.expand();
      await popUpMenu.selectRowByValue("showTemplatesButton");

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
    const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
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
      exists(".d-modal:visible") && exists(".d-modal .discourse-templates"),
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

  test("Modal | Hijack modal | Template is inserted", async (assert) => {
    await visit("/t/topic-for-group-moderators/2480");
    await click(".show-more-actions");
    await click(".show-post-admin-menu");
    await click(".add-notice");

    const textarea = query(".modal-body textarea");
    await textarea.focus();

    await triggerKeyboardShortcut();
    await assertTemplateWasInserted(assert, textarea);
  });

  test("Modal | Hijack modal | It hijacks the modal UI", async (assert) => {
    await visit("/t/topic-for-group-moderators/2480");
    await click(".show-more-actions");
    await click(".show-post-admin-menu");
    await click(".add-notice");

    const textarea = query(".modal-body textarea");
    await textarea.focus();

    await triggerKeyboardShortcut();
    assert.ok(
      [
        ...queryAll(
          ".modal-inner-container > :not(.discourse-templates-modal-hijacker)"
        ),
      ].every((elem) => elem.style.display === "none"),
      "it hides all other elements inside the modal's inner container"
    );
    assert.ok(
      [
        ...queryAll(
          ".modal-inner-container > .discourse-templates-modal-hijacker"
        ),
      ].every((elem) => elem.style.display !== "none"),
      "it shows the UI injected in the modal"
    );
    assert.ok(
      exists(".modal-header.hijacked-modal-header .title"),
      "it shows the new hijacked title of the modal"
    );
    assert.ok(
      exists(".modal-body.hijacked-modal-body .templates-filterable-list"),
      "it shows the template list"
    );
  });

  test("Modal | Hijack modal | The go back button restores the original modal interface", async (assert) => {
    await visit("/t/topic-for-group-moderators/2480");
    await click(".show-more-actions");
    await click(".show-post-admin-menu");
    await click(".add-notice");

    const textarea = query(".modal-body textarea");
    await textarea.focus();

    const existingElements = [
      ...queryAll(
        ".modal-inner-container > :not(.discourse-templates-modal-hijacker)"
      ),
    ];
    const existingStyleDisplay = existingElements.map(
      (elem) => elem.style.display
    );

    await triggerKeyboardShortcut();
    assert.ok(
      existingElements.every((elem) => elem.style.display === "none"),
      "it hides all other elements inside the modal's inner container"
    );
    assert.ok(
      exists(".modal-header.hijacked-modal-header .title") &&
        exists(".modal-body.hijacked-modal-body .templates-filterable-list"),
      "it displayed the new injected UI"
    );
    await click(".modal-header.hijacked-modal-header .modal-close");
    assert.ok(
      existingElements.every(
        (elem, idx) => elem.style.display === existingStyleDisplay[idx]
      ),
      "it restores the previous existing elements style.display"
    );
    assert.notOk(
      exists(".modal-header.hijacked-modal-header .title") &&
        exists(".modal-body.hijacked-modal-body .templates-filterable-list"),
      "it removed the injected UI"
    );
  });

  test("Modal | Hijack modal | It does not keep state if modal is closed", async (assert) => {
    await visit("/t/topic-for-group-moderators/2480");
    await click(".show-more-actions");
    await click(".show-post-admin-menu");
    await click(".add-notice");

    const textarea = query(".modal-body textarea");
    await textarea.focus();

    await triggerKeyboardShortcut();
    assert.ok(
      exists(".modal-header.hijacked-modal-header .title") &&
        exists(".modal-body.hijacked-modal-body .templates-filterable-list"),
      "it displayed the new injected UI"
    );

    // close the modal while hijacked
    await triggerKeyEvent("#main-outlet", "keydown", "Escape");
    assert.ok(!exists(".d-modal:visible"), "The modal should have been closed");

    // now open the modal again to test that the hijacking did not leak between modal
    // invocations
    await click(".show-more-actions");
    await click(".show-post-admin-menu");
    await click(".add-notice");
    assert.notOk(
      exists(".modal-header.hijacked-modal-header .title") ||
        exists(".modal-body.hijacked-modal-body .templates-filterable-list"),
      "it did not keep the injected UI"
    );
  });
});
