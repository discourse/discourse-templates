# frozen_string_literal: true

module DiscourseTemplates
  class TemplatesController < ::ApplicationController
    requires_plugin PLUGIN_NAME

    before_action :ensure_logged_in
    before_action :ensure_discourse_templates_enabled
    skip_before_action :check_xhr

    def ensure_discourse_templates_enabled
      raise Discourse::InvalidAccess.new unless guardian.can_use_templates?
    end

    def use
      template_id = params.require(:id)
      topic = Topic.find_by(id: template_id)

      if topic.blank?
        return render_json_error("Invalid template id", status: 422)
      end

      parent_categories_ids = SiteSetting.discourse_templates_categories&.split("|")&.map(&:to_i)

      all_templates_categories_ids = parent_categories_ids.flat_map do |category_id|
        Category.subcategory_ids(category_id).prepend(category_id)
      end

      unless all_templates_categories_ids.include?(topic.category_id)
        return(
          render_json_error("Id does not belong to a template", status: 422)
        )
      end

      record = topic.increment_template_item_usage_count!

      render json: record
    end

    def index
      query = TopicQuery.new(current_user).list_templates
      templates = query.topics

      render json: templates, each_serializer: TemplatesSerializer
    end
  end
end
