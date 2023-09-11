import { action } from "@ember/object";
import Service from "@ember/service";
import { tracked } from "@glimmer/tracking";

export default class DTemplatesModalService extends Service {
  @tracked showing = false;
  @tracked model = null;

  @action
  show(model) {
    this.showing = true;
    this.model = model;
  }

  @action
  hide() {
    // return the focus back to the textarea
    this.model?.textarea?.focus();

    // clear the model
    this.showing = false;
    this.model = null;
  }
}
