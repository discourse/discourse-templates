# frozen_string_literal: true

module DiscourseTemplates::GuardianExtension
  def can_use_templates?
    user&.can_use_templates? || false
  end
end
