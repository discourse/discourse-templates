# frozen_string_literal: true

module DiscourseTemplates
  # frozen_string_literal: true
  class TemplatesSerializer < ApplicationSerializer
    attributes :id, :title, :content, :tags, :usages

    def content
      object.first_post.raw
    end

    def include_tags?
      SiteSetting.tagging_enabled
    end

    def tags
      object.tags.map(&:name)
    end

    def usages
      object.template_item_usage_count
    end
  end
end
