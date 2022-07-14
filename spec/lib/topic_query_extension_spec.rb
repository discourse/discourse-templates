# frozen_string_literal: true

require "rails_helper"
require_relative "../helpers/topics_helper"

RSpec.configure { |c| c.include DiscourseTemplates::TopicsHelper }

describe DiscourseTemplates::TopicQueryExtension do
  fab!(:user) { Fabricate(:user) }
  fab!(:other_category) { Fabricate(:category_with_definition) }
  fab!(:other_topics) { Fabricate.times(5, :topic, category: other_category) }
  fab!(:discourse_templates_category) { Fabricate(:category_with_definition) }
  fab!(:templates) do
    Fabricate.times(
      100,
      :random_template_item,
      category: discourse_templates_category
    )
  end

  context "list_templates" do
    before { SiteSetting.discourse_templates_category = discourse_templates_category.id.to_s }

    it "raises an error when SiteSetting.discourse_templates_category is not set" do
      SiteSetting.discourse_templates_category = ""
      expect { TopicQuery.new(user).list_templates }.to raise_error(
        Discourse::SiteSettingMissing
      )
    end

    it "retrieves all topics in the category" do
      topics = TopicQuery.new(user).list_templates.topics
      expect(topics.size).to eq(templates.size)
    end

    it "retrives topics from multiple parent_categories" do
      SiteSetting.discourse_templates_category =
        [discourse_templates_category, other_category].map(&:id).join("|")

      topics = TopicQuery.new(user).list_templates.topics
      expect(topics.size).to eq(templates.size + other_topics.size)
    end

    it "limits retrieved topics to SiteSetting.discourse_templates_max_replies_fetched" do
      SiteSetting.discourse_templates_max_replies_fetched = 42

      topics = TopicQuery.new(user).list_templates.topics
      expect(topics.size).to eq(SiteSetting.discourse_templates_max_replies_fetched)
    end

    it "filter out the category description topic" do
      expect(discourse_templates_category.topic_id).not_to eq(nil)

      topics = TopicQuery.new(user).list_templates.topics
      topics_without_category_description =
        topics.filter { |topic| topic.id != discourse_templates_category.topic_id }

      expect(topics.size).to eq(topics_without_category_description.size)
    end

    it "retrieves closed topics" do
      topics = TopicQuery.new(user).list_templates.topics
      expect(topics.size).to eq(templates.size)

      closed_replies = templates.sample(templates.size * 0.2)
      closed_replies.each { |template| template.update_status("closed", true, user) }

      topics = TopicQuery.new(user).list_templates.topics
      expect(topics.size).to eq(templates.size)
    end

    it "filter out unlisted topics" do
      topics = TopicQuery.new(user).list_templates.topics
      expect(topics.size).to eq(templates.size)

      unlisted_replies = templates.sample(templates.size * 0.15)
      unlisted_replies.each do |template|
        template.update_status("visible", false, user)
      end

      topics = TopicQuery.new(user).list_templates.topics
      expect(topics.size).to eq(templates.size - unlisted_replies.size)
    end

    it "filter out archived topics" do
      topics = TopicQuery.new(user).list_templates.topics
      expect(topics.size).to eq(templates.size)

      archived_replies = templates.sample(templates.size * 0.25)
      archived_replies.each { |template| template.update_attribute :archived, true }

      topics = TopicQuery.new(user).list_templates.topics
      expect(topics.size).to eq(templates.size - archived_replies.size)
    end

    it "filter out deleted topics" do
      topics = TopicQuery.new(user).list_templates.topics
      expect(topics.size).to eq(templates.size)

      deleted_replies = templates.sample(templates.size * 0.2)
      deleted_replies.each { |template| template.trash! }

      topics = TopicQuery.new(user).list_templates.topics
      expect(topics.size).to eq(templates.size - deleted_replies.size)
    end

    it "sorts retrieved replies by title" do
      sorted_replies = templates.sort_by(&:title)

      # just to ensure the test sample isn't sorted because that would render the real test after the
      # query to be useless
      expect(sorted_replies).not_to eq(templates)

      topics = TopicQuery.new(user).list_templates.topics
      expect(topics).to eq(sorted_replies)
    end
  end
end
