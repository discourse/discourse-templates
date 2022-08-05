import { withPluginApi } from "discourse/lib/plugin-api";
import showModal from "discourse/lib/show-modal";

export default {
  name: "discourse-templates-add-ui-builder",

  initialize(container) {
    const siteSettings = container.lookup("site-settings:main");
    const currentUser = container.lookup("current-user:main");

    if (
      siteSettings.discourse_templates_enabled &&
      currentUser?.can_use_templates
    ) {
      withPluginApi("0.5", (api) => {
        api.modifyClass("controller:composer", {
          pluginId: "discourse-templates",
          actions: {
            showTemplatesButton() {
              if (this.site.mobileView) {
                showModal("discourse-templates-modal");
              } else {
                this.appEvents.trigger("composer:show-preview");
                this.appEvents.trigger("discourse-templates:show");
              }
            },
          },
        });

        api.addToolbarPopupMenuOptionsCallback(() => {
          return {
            id: "discourse_templates_button",
            icon: "far-clipboard",
            action: "showTemplatesButton",
            label: "templates.insert_template",
          };
        });

        api.addKeyboardShortcut(
          "meta+shift+i",
          () => {
            const activeElement = document.activeElement;

            if (activeElement?.nodeName === "TEXTAREA") {
              const appEvents = container.lookup("service:app-events");
              const modal = document.querySelector(".d-modal");

              if (modal?.contains(activeElement)) {
                appEvents.trigger("discourse-templates:hijack-modal", {
                  textarea: activeElement,
                });
              } else {
                const modalController = container.lookup(
                  "controller:discourse-templates-modal"
                );

                showModal("discourse-templates-modal");
                modalController.set("textarea", activeElement);
              }
            }
          },
          { global: true }
        );
      });
    }
  },
};
