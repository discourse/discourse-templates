import Component from "@ember/component";
import { action } from "@ember/object";

import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { prepareTemplate } from "../lib/apply-template";

export default Component.extend({
  classNames: ["templates-template-item"],

  @action
  apply() {
    const template = prepareTemplate(
      this.template.title,
      this.template.content,
      this.model
    );

    // run parametrized action to insert the template
    this.onInsertTemplate?.(template);

    ajax(`/discourse_templates/${this.template.id}/use`, {
      type: "POST",
    }).catch(popupAjaxError);
  },
});
