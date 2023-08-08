# frozen_string_literal: true

module PageObjects
  module Modals
    class DTemplatesInsertTemplate < PageObjects::Modals::Base
      include SystemHelpers

      def open_with_keyboard_shortcut
        send_keys([PLATFORM_KEY_MODIFIER, :shift, "i"])
      end

      def open?
        super && has_css?(".d-templates-modal") && finished_loading?
      end

      def finished_loading?
        has_no_css?(".d-templates-modal .spinner")
      end

      def select_template(id)
        find("#template-item-#{id} .templates-apply").click
      end
    end
  end
end
