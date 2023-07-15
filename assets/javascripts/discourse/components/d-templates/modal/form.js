import Component from "@glimmer/component";

export default class DTemplates extends Component {
  get onInsertTemplate() {
    return this.args.model?.onInsertTemplate;
  }

  get textarea() {
    return this.args.model?.textarea;
  }
}
