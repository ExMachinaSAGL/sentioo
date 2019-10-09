import Vue from 'vue';
import NotificationTopBar from '@/components/NotificationTopBar.vue'
import { expect } from 'chai';
import Notification from '../../../src/lib/Notification'
import store from '../../../src/store/store'
import utils from '../lib/testUtils'

describe('NotificationTopBar.vue', () => {
  let vm: any;

  const pushNotificationBatch = (amount: number): void => {
    for (let i = 0; i < amount; i++) {
      const notification: Notification = utils.generateNotification('Example Title', 'Example text', 0, 'broadcast');
      store.dispatch('sentioo/addNotification', notification);
    }
  }
  beforeEach(() => {
    vm = utils.setupVue(NotificationTopBar);
  });

  afterEach(() => {
    utils.tearDownVue(vm);
  });

  it('should show the correct unread count on the badge', async () => {
    expect(vm.unreadCount).to.equal(0);
    expect(utils.getElement(vm, '.unread-badge')).to.not.exist;
    
    pushNotificationBatch(5);
    
    await Vue.nextTick();
    expect(vm.unreadCount).to.equal(5);
    let el: any = utils.getElement(vm, '.unread-badge');
    expect(el).to.exist;
    expect(el.textContent).to.contain('5');
    pushNotificationBatch(95);

    await Vue.nextTick();
    expect(vm.unreadCount).to.equal(100);
    el = utils.getElement(vm, '.unread-badge');
    expect(el).to.exist;
    expect(el.textContent).to.contain('99+');
  });
})
