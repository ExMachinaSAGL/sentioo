<template>
  <li  @mouseover="hovered = true"
        @mouseout="hovered = false"
        class="notification-item"
        :class="[notification.unread ? '' : 'notification-read']"
        :style="{ backgroundColor: backgroundColor }">
    <div class="notification-actions">
      <i class="fa fa-trash" title="Delete notification" @click="removeNotification"></i>
      <i class="fa fa-check-circle" title="Mark as read" @click="readNotification"></i>
    </div>
    <div class="notification-header">
      <div class="icon-container">
        <div class="notification-icon" :style="{ backgroundColor: iconColor }">
          <i class="fa" :class="iconClass"></i>
        </div>
      </div>
      <div class="notification-content">
        <p :class="[notification.unread ? 'notification-title-unread' : 'notification-title-read']">
          {{ notification.title }}
        </p>
        <p class="notification-datetime">
          <span>Date &amp; Time:</span>
          {{notification.validFrom | datetime}}
        </p>
        <p class="notification-text">
          <span v-html="excerpt"></span>
          <span v-if="showMore || expanded" class="excerpt-btn" @click="toggleExpand">{{expanded ? ' (show less)' : ' (show more)'}}</span>
        </p>
      </div>
    </div>
  </li>
</template>

<script lang="ts">
import 'whatwg-fetch'
import Notification from '../lib/Notification'
import configUtils from '../lib/configUtils'
import linkifyHtml from 'linkifyjs/html'
import { mapActions, mapState } from 'vuex'
import Vue, {VueConstructor} from 'vue';
import store from '@/store/store';
import datetime from './../lib/datetimeFilter';

export default Vue.extend({
  name: 'notification-item',

  filters: {
    datetime
  },

  props: {
    notification: {
      type: Object,
      default: () => {
        return {};
      }
    },
    baseServerUrl: String
  },

  computed: {
    iconClass (): string {
      if (this.notification) {
        const priority: number = this.notification.priority;
        return configUtils.getLevel(priority).icon;
      }
      return '';
    },
    iconColor (): string {
      if (this.notification) {
        const priority: number = this.notification.priority;
        return configUtils.getIconColor(priority);
      }
      return '';
    },
    backgroundColor (): string {
      if (this.notification) {
        const priority: number = this.notification.priority;
        const background: string = configUtils.getLevel(priority).backgroundColor;
        const hover: string = configUtils.getLevel(priority).hoverColor;
        return this.hovered || !this.notification.unread ? hover : background;
      }
      return '';
    },
    excerpt (): string {
      if (this.notification) {
        const text: string = this.notification.text || '';
        if ((text.length > this.maxTextLength) && !this.expanded) {
          this.showMore = true;
          return `${text.substring(0, this.maxTextLength)}...`;
        } else {
          this.showMore = false;
          return linkifyHtml(text, {});
        }
      } else return '';
    }
  },

  data () {
    return {
      expanded: false,
      hovered: false,
      maxTextLength: configUtils.config.excerptSize,
      showMore: false
    }
  },

  methods: {
    markRead (n: Notification) {
      store.dispatch('sentioo/markRead', n);
    },
    deleteNotification (n: Notification) {
      store.dispatch('sentioo/deleteNotification', n);
    },
    // Vuex helpers do not work with TypeScript type check,
    // since their props do not get recognised as part of the Vue component
    // ...mapActions('sentioo', [
    //   'markRead',
    //   'deleteNotification'
    // ]),
    readNotification (): void {
      if (!this.notification.unread) return;
      const url = `${this.baseServerUrl}/${this.notification.id}/read${configUtils.getParams(this.notification, 'read')}`;
      fetch(url, {
        method: 'POST',
        credentials: 'include'
      }).then((res) => {
        if (res.status === 200) { this.markRead(this.notification); }
      });
    },
    removeNotification (): void {
      fetch(`${this.baseServerUrl}/${this.notification.id}/delete${configUtils.getParams(this.notification, 'delete')}`, {
        method: 'POST',
        credentials: 'include'
      }).then((res) => {
        if (res.status === 200) { this.deleteNotification(this.notification); }
      });
    },
    toggleExpand (): void {
      this.expanded = !this.expanded;
    }
  }
})
</script>

<style lang="scss">
@import '../theme/notification.scss';

.notification-item {
  @include container;

  .notification-actions {
    font-size: 18px;
    position: absolute;
    top: 5px;
    right: 5px;
    width: auto;
    padding: 0 5px;

    * {
      opacity: 0.7;
      &:hover {
        opacity: 1;
      }
    }

    .fa-check-circle {
      padding-left: 2px;
    }
  }

  &.notification-read {
    background-color: #eee!important;
    opacity: 0.6!important;
    &:hover {
      opacity: 1!important;
    }
  }
}

.notification-header {
  @include header;
}

.notification-content {
  @include notification-content;
}

.notification-icon {
  @include icon;
}

.notification-title-unread {
  @include title-unread;
}

.notification-title-read {
  @include title-read;
}

.notification-btn-container {
  @include btn-container;
}

.notification-text {
  @include text;

  .excerpt-btn {
    text-transform: uppercase;
    color: #B84322;
    font-weight: bold;
    cursor: pointer;
    display: block;
  }
}

.notification-btn {
  @include button;
}

.icon-container {
  @include icon-container;
}
</style>
