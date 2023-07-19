import Service, { inject as service } from "@ember/service";
import { getOwner } from "discourse-common/lib/get-owner";
import DTemplatesModalForm from "../components/d-templates/modal/form";
import { replaceVariables } from "../../lib/replace-variables";
import TextareaManipulator from "../../lib/textarea-manipulator";
import extractVariablesFromComposerModel from "../../lib/variables-composer";

export default class DTemplatesService extends Service {
  @service appEvents;
  @service modal;
  @service site;

  showComposerUI() {
    const onInsertTemplate = this.#insertTemplateIntoComposer.bind(this);

    if (this.site.mobileView) {
      this.#showModal(null, onInsertTemplate); // textarea must be empty when targeting the composer
    } else {
      this.#showComposerPreviewUI(onInsertTemplate);
    }
  }

  showTextAreaUI(textarea = document.activeElement) {
    if (!this.#isTextArea(textarea)) {
      return;
    }

    const modal = document.querySelector(".d-modal");
    const onInsertTemplate = (template) =>
      this.#insertTemplateIntoTextArea(textarea, template);

    if (modal?.contains(textarea)) {
      this.#highjackModal(textarea, onInsertTemplate);
    } else {
      this.#showModal(textarea, onInsertTemplate);
    }
  }

  isComposerFocused() {
    const activeElement = document.activeElement;

    const composerModel = getOwner(this).lookup("controller:composer").model;
    const composerElement = document.querySelector(".d-editor");

    return composerModel && composerElement?.contains(activeElement);
  }

  isTextAreaFocused() {
    return this.#isTextArea(document.activeElement);
  }

  #isTextArea(element) {
    return element?.nodeName === "TEXTAREA";
  }

  #highjackModal(textarea, onInsertTemplate) {
    this.appEvents.trigger("discourse-templates:hijack-modal", {
      textarea,
      onInsertTemplate,
    });
  }

  #showModal(textarea, onInsertTemplate) {
    this.modal.show(DTemplatesModalForm, {
      model: { textarea, onInsertTemplate },
    });
  }

  #showComposerPreviewUI(onInsertTemplate) {
    this.appEvents.trigger("composer-messages:close");
    this.appEvents.trigger("composer:show-preview");
    this.appEvents.trigger("discourse-templates:show", { onInsertTemplate });
  }

  #insertTemplateIntoTextArea(textarea, template) {
    template = replaceVariables(template.title, template.content); // generic textarea with unknown model

    new TextareaManipulator(getOwner(this), textarea).addBlock(
      template.content
    );
  }

  #insertTemplateIntoComposer(template) {
    const composerModel = getOwner(this).lookup("controller:composer").model;
    const templateVariables = extractVariablesFromComposerModel(composerModel);
    template = replaceVariables(
      template.title,
      template.content,
      templateVariables
    );

    // insert the title if blank
    if (composerModel && !composerModel.title) {
      composerModel.set("title", template.title);
    }

    // insert the content of the template in the composer
    this.appEvents.trigger("composer:insert-block", template.content);
  }
}
