<template>
  <div class="sentioo">
    <a href="#" title="Toggle notifications" class="notifications-toggle" @click="toggleNotifications">
      <notification-top-bar :show-notifications="showNotifications"></notification-top-bar>
    </a>
    <transition name="toggle">
      <notifications-view
        id="notifications-view"
        v-if="showNotifications"
        :base-server-url="baseServerUrl"
        v-on-clickaway="closeDropdown">
      </notifications-view>
    </transition>
  </div>
</template>

<script lang="ts">
import 'eventsource-polyfill'
import NotificationsView from './NotificationsView.vue'
import NotificationTopBar from './NotificationTopBar.vue'

import Notification from '../lib/Notification'
import { SSEConnection, SSEEvent, SSEReadyStates } from './../lib/SSEConnection'
import { mapActions, mapState } from 'vuex'
import { mixin as clickaway } from 'vue-clickaway'
import configUtils from '../lib/configUtils'
import Vue from 'vue';
import store from '../store/store';

declare var process : {
  env: {
    NODE_ENV: string,
    SERVER_URL: string
  }
};

export default Vue.extend({
  name: 'sentioo',

  components: {
    NotificationsView,
    NotificationTopBar
  },

  mixins: [
    clickaway
  ],

  props: [
    'configProp',
    'serverUrl'
  ],

  computed: {
    ...mapState('sentioo', {
      notifications: (state: any) => state.notifications
    }),
    sseServerUrl (): string {
      return `${this.baseServerUrl}/${this.streamPath}`
    }
  },

  data () : {
    connection: SSEConnection | null,
    showNotifications: boolean,
    baseServerUrl: string | null,
    reconnectTimeout: number,
    streamPath: string
    } {
    return {
      connection: null,
      showNotifications: false,
      // baseServerUrl: process.env.SERVER_URL,
      baseServerUrl: this.serverUrl,
      reconnectTimeout: 5000,
      streamPath: 'subscribe'
    }
  },

  created () {
    this.startEvtSource();
    window.addEventListener('keypress', (evt) => {
      const key: number = evt.keyCode;
      // Close notification dropdown on ESC keypress
      if (key === 27 && this.showNotifications) {
        this.closeDropdown();
      }
    });

    if (this.configProp) { // override config if passed as a prop
      configUtils.overrideConfig(this.configProp);
    }
  },

  methods: {
    addNotification (n : Notification) {
      store.dispatch('sentioo/addNotification', n);
    },
    // Vuex helpers do not work with TypeScript type check,
    // since their props do not get recognised as part of the Vue component
    // ...mapActions('sentioo', [
    //   'addNotification'
    // ]),

    closeDropdown (): void {
      this.showNotifications = false;
    },

    startEvtSource (): void {
      this.connection = new SSEConnection(this.sseServerUrl);
      this.connection.on('notify', (evt: SSEEvent) => {
        // console.log('Received notify event');
        const notification: Notification = JSON.parse(evt.data);
        this.addNotification(notification);
      });
      // Handles heartbeat event, sent from server every few seconds
      // to keep the SSE connection alive for older browsers
      // (see https://github.com/Yaffle/EventSource#server-side-requirements)
      this.connection.on('heartbeat', (evt: SSEEvent) => {
        // console.log('Heartbeat');
      });
      this.connection.onOpen((evt: SSEEvent) => {
        // console.log('Connection open');
        // console.log(this.connection.source.readyState);
      });
      this.connection.onError((evt: SSEEvent) => {
        this.handleDisconnects();
      });
      this.connection.onClose((evt: SSEEvent) => {
        this.stopEvtSource();
      });

      window.addEventListener('beforeunload', (evt: any) => {
        this.stopEvtSource();
      });
    },

    stopEvtSource (): void {
      // console.log('Stopping evt source');
      if (this.connection) {
        this.connection.close();
      }
    },

    handleDisconnects (): void {
      if (this.connection) {
        const readyState: number = this.connection.readyState;

        // WORKAROUND: IE10 and FF try to reconnect only once,
        // in that case the readyState is "CLOSED" => manually reconnect
        if (readyState === SSEReadyStates.CLOSED) {
          this.connection.close();
          setTimeout(() => {
            // console.log('Restarting');
            this.startEvtSource(); // re-do everything
          }, this.reconnectTimeout);
        } else {
          // console.log('Connection error. Retrying...');
        }
      }
    },

    toggleNotifications (): void {
      this.showNotifications = !this.showNotifications;
    }
  }
})
</script>

<style lang="scss" scoped>
@import '../theme/sentioo.scss';

.sentioo {
  @include app;
}

.notifications-toggle {
  @include notifications-toggle;
}

.toggle-enter-active, .toggle-leave-active {
  @include toggle-animation-transition;
}
.toggle-enter, .toggle-leave-to {
  @include toggle-animation-start;
}

</style>
