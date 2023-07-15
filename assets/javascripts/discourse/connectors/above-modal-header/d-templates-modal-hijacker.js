import { action } from "@ember/object";
import { getOwner } from "discourse-common/lib/get-owner";

export default {
  setupComponent(args, component) {
    component.setProperties({
      active: false,
      model: getOwner(this).lookup("controller:composer").model,
      displayMap: new WeakMap(),
    });

    this.appEvents.on("discourse-templates:hijack-modal", this, "show");
    this.appEvents.on("discourse-templates:restore-modal", this, "hide");
    this.appEvents.on("modal:body-dismissed", this, "hide");
  },

  teardownComponent() {
    this.appEvents.off("discourse-templates:hijack-modal", this, "show");
    this.appEvents.off("discourse-templates:restore-modal", this, "hide");
    this.appEvents.off("modal:body-dismissed", this, "hide");
  },

  @action
  show({ textarea, onInsertTemplate }) {
    const container = document.querySelector(".modal-inner-container");

    if (textarea) {
      this.set("active", true);
      this.set("textarea", textarea);
      this.set("onInsertTemplate", onInsertTemplate);

      Array.from(container.children).forEach((element) => {
        if (element === this.element) {
          return;
        }

        this.displayMap.set(element, element.style.display);
        element.style.display = "none";
      });
    }
  },

  @action
  hide() {
    this.set("active", false);

    const container = document.querySelector(".modal-inner-container");
    Array.from(container.children).forEach((element) => {
      const oldDisplay = this.displayMap.get(element);

      if (oldDisplay != null) {
        this.displayMap.delete(element);
        element.style.display = oldDisplay;
      }
    });
  },
};
