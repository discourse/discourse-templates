# frozen_string_literal: true

module DiscourseTemplates::UserExtension
  def can_use_templates?
    return false if SiteSetting.discourse_templates_category.blank?

    category = Category.find_by(id: SiteSetting.discourse_templates_category.to_i)
    return false if category.blank?

    # the user can use templates if can see in the source category
    guardian.can_see?(category)
  end
end
