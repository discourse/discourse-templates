# frozen_string_literal: true

# name: discourse-templates
# about: Use topics in a category as source for templates that can be quickly used in the composer
# version: 2.5.0
# authors: Discourse (discourse-templates), Jay Pfaffman and André Pereira (canned-replies)
# url: https://github.com/discourse/discourse-templates
# transpile_js: true

enabled_site_setting :discourse_templates_enabled

register_asset "stylesheets/discourse-templates.scss"

register_svg_icon "far-clipboard" if respond_to?(:register_svg_icon)

after_initialize do
  module ::DiscourseTemplates
    PLUGIN_NAME ||= "discourse-templates".freeze

    class Engine < ::Rails::Engine
      engine_name DiscourseTemplates::PLUGIN_NAME
      isolate_namespace DiscourseTemplates
    end
  end

  %w[
    ../app/controllers/discourse_templates/templates_controller.rb
    ../app/models/discourse_templates/usage_count.rb
    ../app/serializers/discourse_templates/templates_serializer.rb
    ../lib/discourse_templates/guardian_extension.rb
    ../lib/discourse_templates/topic_extension.rb
    ../lib/discourse_templates/topic_query_extension.rb
    ../lib/discourse_templates/user_extension.rb
  ].each { |path| load File.expand_path(path, __FILE__) }

  reloadable_patch do |plugin|
    Guardian.class_eval { prepend DiscourseTemplates::GuardianExtension }
    Topic.class_eval { prepend DiscourseTemplates::TopicExtension }
    TopicQuery.class_eval { prepend DiscourseTemplates::TopicQueryExtension }
    User.class_eval { prepend DiscourseTemplates::UserExtension }
  end

  add_to_serializer(:current_user, :can_use_templates) { object.can_use_templates? }

  Discourse::Application.routes.append do
    mount ::DiscourseTemplates::Engine, at: "/discourse_templates"
  end

  DiscourseTemplates::Engine.routes.draw do
    resources :templates, path: "/", only: [:index] do
      member { post "use" }
    end
  end
end
