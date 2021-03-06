# frozen_string_literal: true

require "rails_helper"

describe DiscourseTemplates::TopicExtension do
  fab!(:topic) { Fabricate(:topic) }

  describe Topic, type: :model do
    it { is_expected.to have_one :template_item_usage }
  end

  context "template_item_usage_count" do
    it "retrieves usage count as expected" do
      expect(topic.template_item_usage_count).to eq(0)
    end
  end

  context "increment_template_item_usage_count!" do
    it "increments usage count as expected" do
      expect(topic.template_item_usage_count).to eq(0)

      topic.increment_template_item_usage_count!
      topic.reload

      expect(topic.template_item_usage_count).to eq(1)

      topic.increment_template_item_usage_count!
      topic.reload

      expect(topic.template_item_usage_count).to eq(2)

      topic.increment_template_item_usage_count!
      topic.reload

      expect(topic.template_item_usage_count).to eq(3)
    end
  end

  context "template?" do
    fab!(:user) { Fabricate(:user) }

    context "normal topics" do
      fab!(:templates_category) { Fabricate(:category_with_definition) }
      fab!(:template) do
        Fabricate(:template_item, category: templates_category)
      end
      fab!(:templates_subcategory) { Fabricate(:category_with_definition, parent_category: templates_category) }
      fab!(:template_on_sub) do
        Fabricate(:template_item, category: templates_category)
      end
      fab!(:other_category) { Fabricate(:category_with_definition) }
      fab!(:other_topic) { Fabricate(:topic, category: other_category) }

      before do
        SiteSetting.discourse_templates_categories = templates_category.id.to_s
      end

      it "returns true when topic belongs to one of the assigned categories" do
        SiteSetting.discourse_templates_categories = "#{templates_category.id.to_s}|#{other_category.id.to_s}"
        expect(template.template?(user)).to eq(true)
        expect(other_topic.template?(user)).to eq(true)
      end

      it "returns true when topic belongs to a sub-category of one of the assigned categories" do
        expect(template_on_sub.template?(user)).to eq(true)
      end

      it "returns false when topic does not belong to one of the assigned categories" do
        expect(other_topic.template?(user)).to eq(false)
      end
    end

    context "private messages" do
      fab!(:other_user) { Fabricate(:user) }

      fab!(:tag_a) { Fabricate(:tag, name: "tag-a") }
      fab!(:tag_b) { Fabricate(:tag, name: "tag-b") }
      fab!(:private_template_tag_a) { Fabricate(:private_template_item, user: user, tags: [tag_a]) }
      fab!(:private_template_tag_b) { Fabricate(:private_template_item, user: user, tags: [tag_b]) }

      before do
        SiteSetting.tagging_enabled = true
        SiteSetting.discourse_templates_enable_private_templates = true
        SiteSetting.discourse_templates_private_templates_tags = "tag-a|tag-b"
      end

      it "returns false unless SiteSetting.tagging_enabled" do
        expect(private_template_tag_a.template?(user)).to eq(true)

        SiteSetting.tagging_enabled = false
        expect(private_template_tag_a.template?(user)).to eq(false)
      end

      it "returns false unless SiteSetting.discourse_templates_enable_private_templates" do
        expect(private_template_tag_a.template?(user)).to eq(true)

        SiteSetting.tagging_enabled = false
        expect(private_template_tag_a.template?(user)).to eq(false)
      end

      it "returns false when user is not the author of the private message" do
        expect(private_template_tag_a.template?(other_user)).to eq(false)
      end

      it "returns true only when the private message is tagged with at least one the allowed tags" do
        expect(private_template_tag_a.template?(user)).to eq(true)
        expect(private_template_tag_b.template?(user)).to eq(true)

        SiteSetting.discourse_templates_private_templates_tags = "tag-a"
        expect(private_template_tag_a.template?(user)).to eq(true)
        expect(private_template_tag_b.template?(user)).to eq(false)

        SiteSetting.discourse_templates_private_templates_tags = "tag-b"
        expect(private_template_tag_a.template?(user)).to eq(false)
        expect(private_template_tag_b.template?(user)).to eq(true)
      end
    end

  end
end
