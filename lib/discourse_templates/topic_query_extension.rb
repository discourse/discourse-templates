# frozen_string_literal: true

module DiscourseTemplates::TopicQueryExtension
  def list_templates
    if SiteSetting.discourse_templates_category.blank?
      raise Discourse::SiteSettingMissing.new('discourse_templates_category')
    end

    create_list(
      :templates,
      {
        category: SiteSetting.discourse_templates_category.to_i,
        # limit defined in a hidden setting with a sane default value (1000) that should be enough to fetch all
        # templates at once in most cases, but it still small enough to prevent things to blow up if the user
        # selected the wrong category in settings with thousands and thousands of posts
        per_page: SiteSetting.discourse_templates_max_replies_fetched.to_i
      }
    ) do |topics|
      topics.all.includes(:first_post).includes(:template_item_usage).where(
        visible: true,
        archived: false
      ) # filter out archived or unlisted topics
        .where('categories.topic_id IS DISTINCT FROM topics.id') # filter out the category description topic
        .reorder('topics.title ASC')
    end
  end
end
