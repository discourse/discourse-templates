# frozen_string_literal: true

require 'rails_helper'

describe CurrentUserSerializer, type: :serializer do
  subject(:serializer) do
    described_class.new(user, scope: guardian, root: false)
  end

  let(:guardian) { Guardian.new }

  context 'CurrentUserSerializer extension' do
    fab!(:user) { Fabricate(:user) }

    it 'includes can_use_templates in serialization' do
      json = serializer.as_json
      expect(json).to have_key(:can_use_templates)
    end
  end
end
