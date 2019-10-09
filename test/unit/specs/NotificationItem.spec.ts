import 'eventsource-polyfill'
import 'whatwg-fetch'
import 'babel-polyfill'
import Vue from 'vue'
import NotificationItem from '../../../src/components/NotificationItem.vue'
import { expect } from 'chai';
import sinon from 'sinon'
import fetchMock from 'fetch-mock'
import Notification from '../../../src/lib/Notification'
import utils from '../lib/testUtils'
import configUtils, { ConfigFile } from '../../../src/lib/configUtils'

describe('NotificationItem.vue', () => {
  let vm: any;

  beforeEach(() => {
    const mockConfig: ConfigFile = { 
      'levels' : [
        {
          'icon' : 'fa-envelope-o',
          'color' : '#4CAF50',
          'backgroundColor' : '#C8E6C9',
          'hoverColor' : '#E8F5E9'
        }
      ],
      'showUnreadText' : false,
      'excerptSize': 10,
      'dynamicIconColor': false,
      'readParams': ['type'],
      'deleteParams': ['type']
    };
    configUtils.overrideConfig(mockConfig);

    vm = utils.setupVue(NotificationItem);
  });

  afterEach(() => {
    utils.tearDownVue(vm);
  });

  it('should read a notification on click', async () => {
    const notification: Notification = utils.generateNotification('Example Title', 'Example text', 0);
    vm.$store.dispatch('sentioo/addNotification', notification);
    vm.notification = notification;
    vm.baseServerUrl = 'http://localhost/test';

    fetchMock.post(`${vm.baseServerUrl}/${notification.id}/read`, 200);
    vm.readNotification();

    await Vue.nextTick();
    expect(vm.notification.unread).to.equal(false);
    fetchMock.restore();
  });

  it('should delete a notification', async () => {
    const notification: Notification = utils.generateNotification('Example Title', 'Example text', 0);

    expect(vm.$store.state.sentioo.notifications.length).to.equal(0);
    vm.$store.dispatch('sentioo/addNotification', notification);
    expect(vm.$store.state.sentioo.notifications.length).to.equal(1);
    
    vm.notification = notification;
    vm.baseServerUrl = 'http://localhost/test';
    const spyRemove = sinon.spy(vm, 'deleteNotification');

    fetchMock.post(`${vm.baseServerUrl}/${notification.id}/delete`, 200);
    vm.removeNotification();

    await Vue.nextTick();
    expect(spyRemove.called).to.equal(true);
    expect(vm.$store.state.sentioo.notifications.length).to.equal(0);

    fetchMock.restore();
  });

  it('should expand the notification text', async () => {
    const longText: string = 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.'
    const notification: Notification = utils.generateNotification('Example Title', longText, 0, 'broadcast');
    vm.notification = notification;
    
    await Vue.nextTick();
    expect(vm.expanded).to.equal(false);
    expect(vm.excerpt.length).to.equal(13);
    expect(vm.excerpt).to.contain('Lorem, ips...');

    vm.toggleExpand();

    await Vue.nextTick();
    expect(vm.expanded).to.equal(true);
    expect(vm.excerpt.length).to.equal(longText.length);
    expect(vm.excerpt).to.contain(longText);
  });

  it('should show a clickable link if the notification text contains an URL', async () => {
    const longText: string = 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. https://www.google.com/'
    const notification: Notification = utils.generateNotification('Example Title', longText, 0, 'broadcast');
    vm.notification = notification;
    
    await Vue.nextTick();
    expect(vm.expanded).to.equal(false);
    expect(vm.excerpt.length).to.equal(13);
    expect(vm.excerpt).to.contain('Lorem, ips...');

    vm.toggleExpand();

    await Vue.nextTick();
    expect(vm.expanded).to.equal(true);
    expect(vm.excerpt.length).to.equal(153);
    expect(vm.excerpt).to.not.contain(longText);
    expect(vm.excerpt).to.contain('<a href="https://www.google.com/"');
    expect(vm.excerpt).to.contain('</a>');
  });
})
