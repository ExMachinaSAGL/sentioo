import { expect } from 'chai';
import { SSEConnection, SSEReadyStates } from '../../../src/lib/SSEConnection'
import sinon from 'sinon'

describe('SSEConnection', () => {
  let connection: SSEConnection;

  const createAndTriggerEvt = (type: string, callback: any): void => {
    const source = connection.source;
    const evt: Event = new CustomEvent(type);
    connection.on(type, callback);
    expect(connection.listeners[type]).to.exist;
    source.dispatchEvent(evt);
  };

  beforeEach(() => {
    connection = new SSEConnection('http://localhost/test');
  });

  afterEach(() => {
    connection.close();
  });

  it('should add a new event handler to the SSE connection and then remove it', (done) => {
    const callback = sinon.spy();
    createAndTriggerEvt('test', callback);
    expect(callback.called).to.equal(true);
    connection.removeEvent('test');
    expect(connection.listeners['test']).to.not.exist;
    done();
  });

  it('should update the callback for a given event when it already exists', (done) => {
    const callback1 = sinon.spy();
    const callback2 = sinon.spy();
    // Add a callback for the event 'test' and trigger it
    createAndTriggerEvt('test', callback1);
    expect(callback1.calledOnce).to.equal(true);

    createAndTriggerEvt('test', callback2);
    expect(callback1.calledTwice).to.equal(false); // shouldn't be called again
    expect(callback2.calledOnce).to.equal(true);

    done();
  });

  it('should close the SSE connection and remove all listeners', (done) => {
    const source = connection.source;
    const evt: Event = new CustomEvent('test');
    const callback = sinon.spy();

    connection.on('test', callback);
    expect(connection.listeners['test']).to.exist;
    connection.close();
    expect(source.readyState).to.equal(SSEReadyStates.CLOSED);
    expect(connection.listeners).to.be.empty;

    // try to trigger the removed event listener
    source.dispatchEvent(evt);
    expect(callback.called).to.equal(false); // the listener should be removed
    done();
  });
})