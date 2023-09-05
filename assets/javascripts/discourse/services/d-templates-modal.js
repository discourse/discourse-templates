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
    this.showing = false;
    this.model = null;
  }
}
