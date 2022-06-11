# frozen_string_literal: true

require "rails_helper"

describe DiscourseTemplates::UserExtension do
  fab!(:moderator) { Fabricate(:moderator) }
  fab!(:user) { Fabricate(:user) }
  fab!(:discourse_templates_category) { Fabricate(:category_with_definition) }
  fab!(:templates_private_category) do
    Fabricate(:private_category_with_definition, group: Group[:moderators])
  end

  context "can_use_templates?" do
    before { Group.refresh_automatic_groups!(:moderators) }

    it "is false when SiteSetting.discourse_templates_category is empty" do
      SiteSetting.discourse_templates_category = ""
      expect(moderator.can_use_templates?).to eq(false)
      expect(user.can_use_templates?).to eq(false)
    end

    it "is false when SiteSetting.discourse_templates_category points to category that does not exist" do
      SiteSetting.discourse_templates_category = -99_999
      expect(moderator.can_use_templates?).to eq(false)
      expect(user.can_use_templates?).to eq(false)
    end

    it "is true when user can access category" do
      SiteSetting.discourse_templates_category = discourse_templates_category.id
      expect(moderator.can_use_templates?).to eq(true)
      expect(user.can_use_templates?).to eq(true)
    end

    it "is false when user can't access category" do
      SiteSetting.discourse_templates_category = templates_private_category.id
      expect(user.can_use_templates?).to eq(false)
    end
  end
end
