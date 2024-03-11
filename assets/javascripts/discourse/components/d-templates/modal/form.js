import Component from "@glimmer/component";
import { service } from "@ember/service";
import { bind } from "discourse-common/utils/decorators";

export default class Form extends Component {
  @service appEvents;

  constructor() {
    super(...arguments);
    if (this.args.closeModal) {
      this.appEvents.on("page:changed", this, this.args.closeModal);
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);
    if (this.args.closeModal) {
      this.appEvents.off("page:changed", this, this.args.closeModal);
    }
  }
}
