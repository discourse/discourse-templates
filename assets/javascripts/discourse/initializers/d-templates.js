import { withPluginApi } from "discourse/lib/plugin-api";
import showModal from "discourse/lib/show-modal";

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
      showTemplatesButton() {
        if (this.site.mobileView) {
          showModal("d-templates-modal");
        } else {
          this.appEvents.trigger("composer:show-preview");
          this.appEvents.trigger("discourse-templates:show");
        }
      },
    },
  });
}

function addOptionsMenuItem(api) {
  api.addToolbarPopupMenuOptionsCallback(() => {
    return {
      id: "discourse_templates_button",
      icon: "far-clipboard",
      action: "showTemplatesButton",
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

      const appEvents = container.lookup("service:app-events");

      const activeElement = document.activeElement;

      const composerModel = container.lookup("controller:composer").model;
      const composerElement = document.querySelector(".d-editor");

      if (composerModel && composerElement?.contains(activeElement)) {
        appEvents.trigger("composer:show-preview");
        appEvents.trigger("composer-messages:close");
        appEvents.trigger("discourse-templates:show");
        return;
      }

      if (activeElement?.nodeName === "TEXTAREA") {
        const modal = document.querySelector(".d-modal");

        if (modal?.contains(activeElement)) {
          appEvents.trigger("discourse-templates:hijack-modal", {
            textarea: activeElement,
          });
        } else {
          const modalController = container.lookup(
            "controller:d-templates-modal"
          );

          showModal("d-templates-modal");
          modalController.set("textarea", activeElement);
        }
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
