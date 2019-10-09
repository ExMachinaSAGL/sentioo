import * as uuidv4 from 'uuid/v4'
import Notification from '../../../src/lib/Notification'
import { options, State, RootState } from '../../../src/store/store'
import Vue, { VueConstructor } from 'vue'
import Vuex, { MutationTree, ActionTree } from 'vuex'

export default {
  generateNotification (title: string, text: string, priority: number, type?: string): Notification {
    let notification: Notification = {
      id: uuidv4(),
      unread: true,
      title: title,
      text: text,
      creationTime: new Date(),
      priority: priority,
      type: type
    };
    return notification;
  },

  getElement(vm: Vue, selector: string): Element | null {
    return vm.$el.querySelector(selector);
  },

  setupVue (module: VueConstructor): Vue | null {
    const testActions = {
      resetStore ({ commit }: any) {
        commit('reset');
      }
    };
    const testMutations = {
      reset (state: State) {
        state.notifications = [];
      }
    };
    if (options && options.modules && options.modules.sentioo) {
      // const storeActions: any = options.modules.sentioo.actions;
      Object.assign(options.modules.sentioo.actions, testActions);
  
      // const storeMutations: any = options.modules.sentioo.mutations;
      Object.assign(options.modules.sentioo.mutations, testMutations);
      const mockStore = new Vuex.Store(options);
      // console.log('store stuff', options.modules);
      const Constructor = module.extend({store: mockStore});
      // console.log('constructor', Constructor);
      return new Constructor().$mount();
    }
    return null;
  },

  tearDownVue (vm: any): void {
    vm.$store.dispatch('sentioo/resetStore');
  }
}