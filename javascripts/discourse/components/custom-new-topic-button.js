// This component creates a new duplicate "New Topic" button
// which avoids modifying the existing button/translations in core
import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import Composer from "discourse/models/composer";
import I18n from "I18n";

const formatFilter = (filter) =>
  filter?.toLowerCase().trim().replace(/\s+/g, "-");

const settingFilter = (
  categorySlug,
  categoryParentSlug,
  tagId,
  parsedSetting
) => {
  let filteredSetting;

  // precedence: tag > category > parent category

  if (tagId) {
    filteredSetting = parsedSetting.find(
      (entry) => entry && formatFilter(entry.filter) === tagId
    );
  }

  if (!filteredSetting && categorySlug) {
    filteredSetting = parsedSetting.find(
      (entry) => entry && formatFilter(entry.filter) === categorySlug
    );
  }

  if (settings.inherit_parent_category) {
    if (!filteredSetting && categoryParentSlug) {
      filteredSetting = parsedSetting.find(
        (entry) => entry && formatFilter(entry.filter) === categoryParentSlug
      );
    }
  }

  return filteredSetting;
};

export default class CustomNewTopicButton extends Component {
  @service router;
  @service currentUser;
  @service composer;
  @tracked hasDraft = this.currentUser.has_topic_draft;

  get filteredSetting() {
    const parsedSetting = JSON.parse(settings.custom_new_topic_text);
    const category = this.args.category;
    const categorySlug = category?.slug;
    const categoryParentSlug = category?.parentCategory?.slug;
    const tagId = this.args.tag?.id;

    return settingFilter(
      categorySlug,
      categoryParentSlug,
      tagId,
      parsedSetting
    );
  }

  get customCreateTopicLabel() {
    if (this.hasDraft) {
      return I18n.t("topic.open_draft");
    } else {
      return this.filteredSetting?.button_text;
    }
  }

  get customCreateTopicIcon() {
    return this.filteredSetting?.icon;
  }

  @action
  customCreateTopic() {
    this.composer.openComposer({
      action: Composer.CREATE_TOPIC,
      draftKey: Composer.NEW_TOPIC_KEY,
      categoryId: this.args.category?.id,
      tags: this.args.tag?.id,
    });
  }
}