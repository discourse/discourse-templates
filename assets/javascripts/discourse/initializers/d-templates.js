import { getOwner } from "discourse-common/lib/get-owner";
import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "discourse-templates-add-ui-builder",

  initialize(container) {
    const siteSettings = container.lookup("service:site-settings");
    const currentUser = container.lookup("service:current-user");

    if (
      siteSettings.discourse_templates_enabled &&
      currentUser?.can_use_templates
    ) {
      withPluginApi("0.5", (api) => {
        patchComposer(api);
        addOptionsMenuItem(api);
        addKeyboardShortcut(api, container);
      });
    }
  },
};

function patchComposer(api) {
  api.modifyClass("controller:composer", {
    pluginId: "discourse-templates",
    actions: {
      insertTemplate() {
        getOwner(this).lookup("service:d-templates").showComposerUI();
      },
    },
  });
}

function addOptionsMenuItem(api) {
  api.addToolbarPopupMenuOptionsCallback(() => {
    return {
      id: "discourse_templates_button",
      icon: "far-clipboard",
      action: "insertTemplate",
      label: "templates.insert_template",
    };
  });
}

function addKeyboardShortcut(api, container) {
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? "meta" : "ctrl";

  api.addKeyboardShortcut(
    `${modKey}+shift+i`,
    (event) => {
      event.preventDefault();
      const dTemplates = container.lookup("service:d-templates");

      if (dTemplates.isComposerFocused()) {
        dTemplates.showComposerUI();
      } else if (dTemplates.isTextAreaFocused()) {
        dTemplates.showTextAreaUI();
      }
    },
    {
      global: true,
      help: {
        category: "templates",
        name: "templates.insert_template",
        definition: {
          keys1: [modKey, "shift", "I"],
          keysDelimiter: "plus",
        },
      },
    }
  );
}
