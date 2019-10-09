<template>
  <div class="notifications-view">
    <div class="notifications-view-header">
      <div class="notifications-view-header-bulk-icons" v-if="notifications && notifications.length">
        <a href="#" title="Mark all as read" class="notifications-read-all" @click="readAll">
          <i class="fa fa-check-circle"></i>
        </a>
        <a href="#" title="Remove all notifications" class="notifications-remove-all" @click="removeAll">
          <i class="fa fa-trash"></i>
        </a>
      </div>
      <div class="unread-text" v-show="showUnreadText">{{ unreadText }}</div>
    </div>
    <transition-group name="list" tag="ul" class="notification-list">
      <notification-item
        ref="items"
        v-for="notification in sortedNotifications"
        :base-server-url="baseServerUrl"
        :notification="notification"
        :key="notification.id">
      </notification-item>
    </transition-group>
    <div id="empty" class="list-empty" v-if="notifications.length === 0">{{ emptyText }}</div>
  </div>
</template>

<script lang="ts">
import 'whatwg-fetch'
import Notification from '../lib/Notification'
import { mapState, mapActions } from 'vuex'
import NotificationItem from '@/components/NotificationItem.vue'
import configUtils from '../lib/configUtils'
import Vue from 'vue';
import store from '@/store/store';

export default Vue.extend({
  name: 'notifications-view',

  components: {
    NotificationItem
  },

  created () {
    /**
     * Workaround for the issue of the notification list not correctly updating.
     */
    store.subscribe((mutation, state) => {
      this.notifications = state.sentioo.notifications;
    });
  },

  computed: {
    sortedNotifications (): Notification[] {
      return this.notifications.slice().sort((a: Notification, b: Notification) => {
        return new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime();
      });
    },
    unreadCount (): number {
      const count: number = this.notifications.filter((n: Notification) => {
        return n.unread;
      }).length;
      return count;
    },
    showUnreadText (): boolean {
      return configUtils.config.showUnreadText;
    },
    unreadText (): string {
      const count: number = this.unreadCount;
      const plural: string = (count > 1) ? 's' : '';

      const importantCount: number = this.notifications.filter((n: Notification) => {
        const maxLength = configUtils.config.levels.length - 1;
        return (n.priority === maxLength) && n.unread;
      }).length;

      const important: string = importantCount > 0
        ? ` (${importantCount} important)`
        : ``;

      return (count > 0)
        ? `${count} unread notification${plural}${important}`
        : '';
    }
  },

  props: {
    baseServerUrl: String
  },

  data () {
    return {
      emptyText: 'There are no unread notifications.',
      notifications: store.state.sentioo.notifications
    }
  },

  methods: {
    markAllRead () {
      store.dispatch('sentioo/markAllRead');
    },
    deleteAll () {
      store.dispatch('sentioo/deleteAll');
    },
    // Vuex helpers do not work with TypeScript type check,
    // since their props do not get recognised as part of the Vue component
    // ...mapActions('sentioo', [
    //   'markAllRead',
    //   'deleteAll'
    // ]),

    readAll (): void {
      fetch(`${this.baseServerUrl}/readAll`, {
        method: 'POST',
        credentials: 'include'
      }).then((res) => {
        if (res.status === 200) {
          this.markAllRead();
        }
      })
    },

    removeAll (): void {
      fetch(`${this.baseServerUrl}/deleteAll`, {
        method: 'POST',
        credentials: 'include'
      }).then((res) => {
        if (res.status === 200) {
          this.deleteAll();
        }
      })
    }
  }
})
</script>

<style lang="scss">
@import '../theme/notifications-list.scss';

.notifications-view {
  @include container;

  ul {
    @include list;
  }

  .unread-text {
    @include unread-text;
  }

  .list-move {
    @include list-move;
  }

  .list-enter-active {
    @include list-enter-active;
  }

  .list-enter {
    @include list-enter;
  }

  .notifications-view-header {
    @include list-header;
  }

  .notifications-remove-all {
    @include list-remove-all-btn;
  }

  .notifications-read-all {
    @include list-read-all-btn;
  }

  .list-empty {
    @include list-empty;
  }
}
</style>
