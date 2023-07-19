import { getOwner } from "discourse-common/lib/get-owner";
import { PLATFORM_KEY_MODIFIER } from "discourse/lib/keyboard-shortcuts";
import { withPluginApi } from "discourse/lib/plugin-api";
import extractVariablesFromChatChannel from "../../lib/variables-chat-channel";

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
        addChatIntegration(api, container);
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

const templateTargets = [];

function addKeyboardShortcut(api, container) {
  api.addKeyboardShortcut(
    `${PLATFORM_KEY_MODIFIER}+shift+i`,
    (event) => {
      event.preventDefault();
      const dTemplates = container.lookup("service:d-templates");

      if (dTemplates.isComposerFocused) {
        dTemplates.showComposerUI();
        return;
      }

      for (const target of templateTargets) {
        if (
          dTemplates.isTextAreaFocused &&
          target?.isFocused?.(document.activeElement)
        ) {
          dTemplates.showTextAreaUI(target?.variables);
          return;
        }
      }

      if (dTemplates.isTextAreaFocused) {
        dTemplates.showTextAreaUI();
      }
    },
    {
      global: true,
      help: {
        category: "templates",
        name: "templates.insert_template",
        definition: {
          keys1: [PLATFORM_KEY_MODIFIER, "shift", "I"],
          keysDelimiter: "plus",
        },
      },
    }
  );
}

function addChatIntegration(api, container) {
  if (container.lookup("service:chat")?.userCanChat) {
    templateTargets.push({
      isFocused: function (element) {
        return element?.id === "channel-composer";
      },
      variables: function () {
        const chat = getOwner(this).lookup("service:chat");
        const channelComposer = getOwner(this).lookup(
          "service:chat-channel-composer"
        );

        const activeChannel = chat?.activeChannel;
        const currentMessage = channelComposer?.message;

        const router = getOwner(this).lookup("service:router");
        const variables = extractVariablesFromChatChannel(
          activeChannel,
          currentMessage,
          router
        );

        return variables;
      },
    });
  }
}
