import { action } from "@ember/object";
import Component from "@glimmer/component";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { prepareTemplate } from "../../../lib/apply-template";

export default class DTemplatesItem extends Component {
  @action
  apply() {
    const template = prepareTemplate(
      this.args.template.title,
      this.args.template.content,
      this.args.model
    );

    // run parametrized action to insert the template
    this.args.onInsertTemplate?.(template);

    ajax(`/discourse_templates/${this.args.template.id}/use`, {
      type: "POST",
    }).catch(popupAjaxError);
  }
}
