import Component from "@ember/component";
import { action } from "@ember/object";
import { schedule } from "@ember/runloop";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import TextareaTextManipulation from "discourse/mixins/textarea-text-manipulation";
import discourseComputed from "discourse-common/utils/decorators";
import { ALL_TAGS_ID, NO_TAG_ID } from "select-kit/components/tag-drop";
import { insertTemplateIntoComposer } from "../../lib/apply-template";

export default Component.extend(TextareaTextManipulation, {
  classNames: ["templates-filterable-list"],

  init() {
    this._super(...arguments);

    this.setProperties({
      loadingReplies: false,
      listFilter: "",
      replies: [],
      selectedTag: ALL_TAGS_ID,
      availableTags: [],
      _textarea: null,
      ready: false,
    });
  },

  didInsertElement() {
    this._load();
  },

  @discourseComputed("replies", "selectedTag", "listFilter")
  filteredReplies(replies, selectedTag, listFilter) {
    const filterTitle = listFilter.toLowerCase();
    return (
      replies
        .map((template) => {
          /* Give a relevant score to each template. */
          template.score = 0;
          if (template.title.toLowerCase().includes(filterTitle)) {
            template.score += 2;
          } else if (template.content.toLowerCase().includes(filterTitle)) {
            template.score += 1;
          }
          return template;
        })
        // Filter irrelevant replies.
        .filter((template) => template.score !== 0)
        // Filter only replies tagged with the selected tag.
        .filter((template) => {
          if (selectedTag === ALL_TAGS_ID) {
            return true;
          }
          if (selectedTag === NO_TAG_ID && template.tags.length === 0) {
            return true;
          }

          return template.tags.includes(selectedTag);
        })
        .sort((a, b) => {
          /* Sort replies by relevance and title. */
          if (a.score !== b.score) {
            return a.score > b.score ? -1 : 1; /* descending */
          } else if (a.title !== b.title) {
            return a.title < b.title ? -1 : 1; /* ascending */
          }
          return 0;
        })
    );
  },

  @action
  changeSelectedTag(tagId) {
    this.set("selectedTag", tagId);
  },

  @action
  insertTemplate(template) {
    this._textarea = this.textarea;

    this.onBeforeInsertTemplate?.();

    if (this._textarea) {
      this._addBlock(this.getSelected(), template.templateContent);
    } else {
      insertTemplateIntoComposer(this, template);
    }

    this.onAfterInsertTemplate?.();
  },

  _load() {
    ajax("/discourse_templates")
      .then((results) => {
        this.setProperties({
          ready: true,
          replies: results.templates,
          availableTags: this.siteSettings.tagging_enabled
            ? Object.values(
                results.templates.reduce((availableTags, template) => {
                  template.tags.forEach((tag) => {
                    if (availableTags[tag]) {
                      availableTags[tag].count += 1;
                    } else {
                      availableTags[tag] = { id: tag, name: tag, count: 1 };
                    }
                  });

                  return availableTags;
                }, {})
              )
            : [],
        });
      })
      .catch(popupAjaxError)
      .finally(() => {
        this.set("loadingReplies", false);

        schedule("afterRender", () =>
          document.querySelector(".templates-filter")?.focus()
        );
      });
  },
});
