<template>
  <div class="notification-top-bar">
    <div class="icon-container">
      <div class="notification-icon" :style="{ backgroundColor: iconColor }">
        <i class="fa fa-bell"></i>
      </div>
      <div class="unread-badge" v-if="unreadCount > 0">{{ unreadBadge }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import Notification from '../lib/Notification'
import { mapState, mapGetters } from 'vuex'
import configUtils from '../lib/configUtils'
import Vue from 'vue';
import store from '../store/store'

export default Vue.extend({
  name: 'notification-top-bar',

  props: [
    'showNotifications'
  ],

  created () {
    /**
     * WORKAROUND: solves the issue of not always updating the unread count on
     * notifications array mutation.
     */
    store.subscribe((mutation, state) => {
      const count: number = state.sentioo.notifications
        .filter((n: Notification) => {
          return n.unread;
        }).length;
      this.unreadCount = count;
    });
  },

  computed: {
    notifications () {
      return store.state.sentioo.notifications;
    },
    // Vuex helpers do not work with TypeScript type check,
    // since their props do not get recognised as part of the Vue component
    // ...mapState('sentioo', {
    //   notifications: (state: any) => state.notifications
    // }),
    unreadBadge (): number|string {
      return this.unreadCount > 99 ? `${99}+` : this.unreadCount;
    },
    iconColor (): string {
      if (this.notifications.length > 0 && configUtils.config.dynamicIconColor) {
        const top: Notification = this.mostImportantNotification();
        return configUtils.getLevel(top.priority).color;
      }
      return '';
    }
    // unreadCount (): number {
    //   return store.state.sentioo.notifications
    //     .filter((n: Notification) => {
    //       return n.unread;
    //     }).length;
    // }
  },

  data () {
    return {
      emptyText: 'There are no unread notifications.',
      unreadCount: 0
    }
  },

  methods: {
    /**
     * Returns the notification with the highest priority.
     */
    mostImportantNotification (): Notification {
      return this.notifications.reduce((prev: Notification, current: Notification) => {
        return prev.priority > current.priority ? prev : current;
      });
    }
  }
})
</script>

<style lang="scss" scoped>
@import '../theme/notification-top-bar.scss';

.notification-icon {
  @include notification-icon;
}

.notification-top-bar {
  @include container;
}

.unread-badge {
  @include unread-badge;
}

</style>
