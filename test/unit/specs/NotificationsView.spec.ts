import Vue from 'vue'
import NotificationsView from '@/components/NotificationsView.vue'
import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon'
import fetchMock from 'fetch-mock'
import Notification from '../../../src/lib/Notification'
import utils from '../lib/testUtils'

describe('NotificationsView.vue', () => {
  let vm: any;

  beforeEach(() => {
    vm = utils.setupVue(NotificationsView);
  });

  afterEach(() => {
    utils.tearDownVue(vm);
  })

  const pushNotificationBatch = (amount: number): void => {
    for (let i = 0; i < amount; i++) {
      const notification: Notification = utils.generateNotification('Example Title', 'Example text', 0, 'broadcast');
      vm.$store.dispatch('sentioo/addNotification', notification);
    }
  }

  it('should display a fallback text when the list is empty', (done) => {
    expect(vm.notifications).to.be.empty;
    expect(utils.getElement(vm, '#empty')).to.exist;
    expect(utils.getElement(vm, '#empty')).to.exist;
    expect(utils.getElement(vm, 'ul li')).to.not.exist;
    const emptyEl: any = utils.getElement(vm, '#empty') || {};
    expect(emptyEl.textContent).to.contain(vm.emptyText);
    done();
  });

  it('should show the correct count of unread and important notifications', async () => {
    const stub: SinonStub = sinon.stub(vm, 'showUnreadText').returns(true);

    for (var i = 0; i < 10; i++) {
      let priority = i < 5 ? 0 : 2;
      const notification: Notification = utils.generateNotification('Example Title', 'Example text', priority, 'broadcast');
      vm.$store.dispatch('sentioo/addNotification', notification);
    }

    await Vue.nextTick();

    expect(utils.getElement(vm, '.unread-text')).to.exist;
    expect(vm.unreadText).to.contain('10 unread');
    expect(vm.unreadText).to.contain('5 important');

    stub.restore();
  });

  it('should display all the notifications, sorted by date', async () => {
    const notification1: Notification = utils.generateNotification('Example Title1', 'Example text1', 0, 'broadcast');
    const notification2: Notification = utils.generateNotification('Example Title2', 'Example text2', 0, 'broadcast');
    notification2.creationTime.setHours(notification2.creationTime.getHours() + 1);
    vm.$store.dispatch('sentioo/addNotification', notification1);
    vm.$store.dispatch('sentioo/addNotification', notification2);

    await Vue.nextTick();
    expect(vm.notifications.length).to.equal(2);
    expect(vm.sortedNotifications.length).to.equal(2);
    // Second notification should be first on the list, since it's the newest by date
    expect(vm.sortedNotifications[0].id).to.equal(notification2.id);
    expect(utils.getElement(vm, '#empty')).to.not.exist;
    expect(utils.getElement(vm, 'ul .notification-item')).to.exist;
    expect(utils.getElement(vm, 'ul .notification-item:first-child')).to.exist;
  });

  it('should mark all notifications as read', async () => {
    pushNotificationBatch(5);
    fetchMock.post(`${vm.baseServerUrl}/readAll`, 200);

    await Vue.nextTick();
    vm.readAll();

    await Vue.nextTick();
    for (let notification of vm.notifications) {
      expect(notification.unread).to.equal(false);
    }
    fetchMock.restore();
  });

  it('should delete all notifications', async () => {
    pushNotificationBatch(5);
    fetchMock.post(`${vm.baseServerUrl}/deleteAll`, 200);

    await Vue.nextTick();
    vm.removeAll();

    await Vue.nextTick();
    expect(vm.notifications.length).to.equal(0);
    fetchMock.restore();
  });
})
