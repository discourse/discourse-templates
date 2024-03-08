import Component from "@glimmer/component";
import { service } from "@ember/service";
import { bind } from "discourse-common/utils/decorators";

export default class Form extends Component {
  @service appEvents;

  @bind
  bindEvents() {
    if (this.args.closeModal) {
      this.appEvents.on("page:changed", this, this.args.closeModal);
    }
  }

  @bind
  unbindEvents() {
    if (this.args.closeModal) {
      this.appEvents.off("page:changed", this, this.args.closeModal);
    }
  }
}
