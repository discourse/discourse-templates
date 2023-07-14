import Service, { inject as service } from "@ember/service";
import DTemplatesModalForm from "../components/d-templates/modal/form";

export default class DTemplatesService extends Service {
  @service appEvents;
  @service modal;
  @service site;

  insertIntoComposer() {
    if (this.site.mobileView) {
      this.#showModal(); // textarea must be empty when targeting the composer
    } else {
      this.#showComposerPreviewUI();
    }
  }

  insertIntoTextArea(textarea, dataModel) {
    const modal = document.querySelector(".d-modal");

    if (modal?.contains(textarea)) {
      this.#highjackModal(textarea, dataModel);
    } else {
      this.#showModal(textarea, dataModel);
    }
  }

  #highjackModal(textarea, dataModel) {
    this.appEvents.trigger("discourse-templates:hijack-modal", {
      textarea,
      dataModel,
    });
  }

  #showModal(textarea, dataModel) {
    this.modal.show(DTemplatesModalForm, { model: { textarea, dataModel } });
  }

  #showComposerPreviewUI() {
    this.appEvents.trigger("composer:show-preview");
    this.appEvents.trigger("discourse-templates:show");
  }
}
