# frozen_string_literal: true

require 'rails_helper'

describe DiscourseTemplates::TopicExtension do
  fab!(:topic) { Fabricate(:topic) }

  describe Topic, type: :model do
    it { is_expected.to have_one :template_item_usage }
  end

  context 'template_item_usage_count' do
    it 'retrieves usage count as expected' do
      expect(topic.template_item_usage_count).to eq(0)
    end
  end

  context 'increment_template_item_usage_count!' do
    it 'increments usage count as expected' do
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
end
