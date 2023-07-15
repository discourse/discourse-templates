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
        patchComposer(api, container);
        addOptionsMenuItem(api);
        addKeyboardShortcut(api, container);
      });
    }
  },
};

function patchComposer(api, container) {
  const dTemplates = container.lookup("service:d-templates");

  api.modifyClass("controller:composer", {
    pluginId: "discourse-templates",
    actions: {
      insertTemplate() {
        dTemplates.showComposerUI();
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
  const dTemplates = container.lookup("service:d-templates");

  api.addKeyboardShortcut(
    `${modKey}+shift+i`,
    (event) => {
      event.preventDefault();

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
