import { action } from "@ember/object";
import { getOwner } from "discourse-common/lib/get-owner";
import TextareaTextManipulation from "discourse/mixins/textarea-text-manipulation";
import { schedule } from "@ember/runloop";

export default {
  setupComponent(args, component) {
    component.reopen(TextareaTextManipulation, {
      _hijackModal(textarea) {
        const container = document.querySelector(".modal-inner-container");

        if (textarea) {
          this.set("active", true);
          this.set("ready", true);
          this.set("_textarea", textarea);

          Array.from(container.children).forEach((element) => {
            if (element === this.element) {
              return;
            }

            this.displayMap.set(element, element.style.display);
            element.style.display = "none";
          });
        }
      },
      _restoreModal() {
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
    });

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
  show({ textarea }) {
    this._hijackModal(textarea);
  },

  @action
  hide() {
    this.set("ready", false);
    this._restoreModal();

    schedule("afterRender", this, () => {
      this.focusTextArea();
      this.set("_textarea", null);
    });
  },

  @action
  insertTemplate({ templateContent }) {
    this._restoreModal();
    this._addBlock(this.getSelected(), templateContent);

    this.send("hide");
  },
};
