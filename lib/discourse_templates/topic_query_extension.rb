# frozen_string_literal: true

module DiscourseTemplates::TopicQueryExtension
  def list_templates
    if SiteSetting.discourse_templates_categories.blank?
      raise Discourse::SiteSettingMissing.new("discourse_templates_categories")
    end

    parent_categories = SiteSetting.discourse_templates_categories&.split("|")&.map(&:to_i)
    if parent_categories.blank?
      raise Discourse::InvalidParameters.new("At least one category must be select as source for templates")
    end

    all_templates_categories = parent_categories.flat_map { |category_id| Category.subcategory_ids(category_id) }

    list_options = {
      # limit defined in a hidden setting with a sane default value (1000) that should be enough to fetch all
      # templates at once in most cases, but it still small enough to prevent things to blow up if the user
      # selected the wrong category in settings with thousands and thousands of posts
      per_page: SiteSetting.discourse_templates_max_replies_fetched.to_i
    }

    create_list(:templates, list_options, templates_results(all_templates_categories, list_options))
  end

  def templates_results(categories_list, options = {})
    options.reverse_merge!(unordered: true, no_definitions: true)

    default_results(options)
      .references(:category)
      .includes(:first_post)
      .includes(:template_item_usage)
      .where("topics.category_id IN (?)", categories_list) # filter only topics in the configured categories and subs
      .where(
        visible: true,
        archived: false
      ) # filter out archived or unlisted topics
      .reorder("topics.title ASC")
  end
end
