# frozen_string_literal: true

Fabricator(:template_item, from: :topic) do
  transient :content

  title { sequence(:title) { |i| "This is a test template #{i}" } }

  after_create do |topic, transients|
    Fabricate(:post, topic: topic) do
      raw do
        if transients[:content]
          transients[:content]
        else
          sequence(:title) do |i|
            "This is the content of an awesome template #{i}"
          end
        end
      end
    end
  end
end

Fabricator(:random_template_item, from: :template_item) do
  title { "This is a test template #{rand(999_999).to_s.rjust(6, '0')}" }
end