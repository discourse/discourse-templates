import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import DTemplatesModalForm from "../../components/d-templates/modal/form";

export default class DTemplatesModalContainer extends Component {
  @service dTemplatesModal;

  <template>
    {{#if this.dTemplatesModal.showing}}
      <div class="modal-container d-templates-modal-container">
        <DTemplatesModalForm @closeModal={{this.dTemplatesModal.hide}} @model={{this.dTemplatesModal.model}} />
      </div>
    {{/if}}
  </template>
}
