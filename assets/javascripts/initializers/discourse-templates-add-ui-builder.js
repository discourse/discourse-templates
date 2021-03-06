import { withPluginApi } from "discourse/lib/plugin-api";
import showModal from "discourse/lib/show-modal";

function initializeTemplatesUIBuilder(api) {
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
}

export default {
  name: "discourse-templates-add-ui-builder",

  initialize(container) {
    const siteSettings = container.lookup("site-settings:main");
    const currentUser = container.lookup("current-user:main");

    if (
      siteSettings.discourse_templates_enabled &&
      currentUser?.can_use_templates
    ) {
      withPluginApi("0.5", initializeTemplatesUIBuilder);
    }
  },
};
