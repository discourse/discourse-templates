import Component from "@glimmer/component";
import { getOwner } from "discourse-common/lib/get-owner";

export default class DTemplates extends Component {
  dataModel =
    this.args.model?.model ||
    getOwner(this).lookup("controller:composer").model;
  textarea = this.args.model?.textarea;
}
