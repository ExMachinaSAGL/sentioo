import Vue from 'vue'
import Sentioo from '@/components/Sentioo.vue'
import { expect } from 'chai';
import { SSEReadyStates } from '../../../src/lib/SSEConnection'
import sinon, { SinonStub } from 'sinon'
import Notification from '../../../src/lib/Notification'
import utils from '../lib/testUtils'

describe('Sentioo.vue', () => {
  let vm: any;

  const dispatchFakeEvent = (vm: any, type: string, payload: any) => {
    const evt: any = new CustomEvent(type);
    evt.lastEvtId = '10';
    evt.data = JSON.stringify(payload);
    vm.connection.source.dispatchEvent(evt);
  };

  beforeEach(() => {
    vm = utils.setupVue(Sentioo);
  });

  afterEach(() => {
    utils.tearDownVue(vm);
  })

  it('should render correct contents', () => {
    expect(utils.getElement(vm, '.sentioo .notifications-toggle')).to.exist;
    expect(utils.getElement(vm, '.sentioo notifications-view')).to.not.exist;
  });

  it('should open the notification list', async () => {
    expect(utils.getElement(vm, '#notifications-view')).to.be.null;
    expect(vm.showNotifications).to.equal(false);
    vm.showNotifications = true;

    await Vue.nextTick();
    expect(utils.getElement(vm, '#notifications-view')).to.exist;
  });

  it('should try to force a reconnect if the browser doesnt reconnect automatically', async () => {
    let source: any = vm.connection.source;
    const restart: SinonStub = sinon.stub(vm, 'startEvtSource');
    const close: SinonStub = sinon.stub(vm.connection, 'close');
    const evt: any = new CustomEvent('error');
    sinon.stub(vm, 'reconnectTimeout').value(75);
    sinon.stub(vm.connection, 'readyState').value(SSEReadyStates.CLOSED);
    source.dispatchEvent(evt);

    await Vue.nextTick();
    expect(close.called).to.equal(true);
    setTimeout(() => {
      expect(restart.called).to.equal(true);
    }, 1000);
  });

  it('should update the notification list when receiving a notify event', async () => {
    vm.showNotifications = true;
    expect(vm.connection).to.exist;
    expect(vm.connection.source).to.exist;
    const notification: Notification = utils.generateNotification('Example Title', 'Example text', 0, 'broadcast');
    dispatchFakeEvent(vm, 'notify', notification);
  
    await Vue.nextTick();
    let found: Notification = vm.notifications.find((el: Notification) => {
      return el.id == notification.id;
    });
    expect(found).to.not.equal(undefined);
    expect(vm.notifications.length).to.not.equal(0);
  });
})
