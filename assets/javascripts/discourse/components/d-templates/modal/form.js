import Component from "@glimmer/component";
import { getOwner } from "discourse-common/lib/get-owner";

export default class DTemplates extends Component {
  #dataModel = null;
  #textarea = null;

  constructor() {
    super(...arguments);

    this.#dataModel =
      this.args.model?.model ||
      getOwner(this).lookup("controller:composer").model;
    this.#textarea = this.args.model?.textarea;
  }

  get dataModel() {
    return this.#dataModel;
  }

  get textarea() {
    return this.#textarea;
  }
}
