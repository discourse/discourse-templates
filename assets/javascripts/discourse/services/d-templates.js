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
  @service currentUser;

  showComposerUI() {
    const onInsertTemplate = this.#insertTemplateIntoComposer.bind(this);

    if (this.site.mobileView) {
      this.#showModal(null, onInsertTemplate); // textarea must be empty when targeting the composer
    } else {
      this.#showComposerPreviewUI(onInsertTemplate);
    }
  }

  showTextAreaUI(variablesExtractor = null, textarea = document.activeElement) {
    if (!this.#isTextArea(textarea)) {
      return;
    }

    const modal = document.querySelector(".d-modal");
    const onInsertTemplate = this.#insertTemplateIntoTextArea.bind(this);
    const extractVariables = (model) => variablesExtractor?.(model);

    if (modal?.contains(textarea)) {
      this.#highjackModal(textarea, (template) => {
        const modalModel = this.modal.activeModal?.opts?.model;
        onInsertTemplate(textarea, template, extractVariables(modalModel));
      });
    } else {
      this.#showModal(textarea, (template) =>
        onInsertTemplate(textarea, template, extractVariables())
      );
    }
  }

  get isComposerFocused() {
    const activeElement = document.activeElement;

    const composerModel = getOwner(this).lookup("controller:composer").model;
    const composerElement = document.querySelector(".d-editor");

    return composerModel && composerElement?.contains(activeElement);
  }

  get isTextAreaFocused() {
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

  #insertTemplateIntoTextArea(textarea, template, variables) {
    template = this.#replaceTemplateVariables(
      template.title,
      template.content,
      variables
    );

    new TextareaManipulator(getOwner(this), textarea).addBlock(
      template.content
    );
  }

  #insertTemplateIntoComposer(template) {
    const composerModel = getOwner(this).lookup("controller:composer").model;
    const templateVariables = extractVariablesFromComposerModel(composerModel);

    template = this.#replaceTemplateVariables(
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

  #replaceTemplateVariables(title, content, variables = {}) {
    return replaceVariables(title, content, {
      ...variables,
      my_username: this.currentUser?.username,
      my_name: this.currentUser?.displayName,
    });
  }
}
