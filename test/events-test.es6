import expect from 'expect.js';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import {setPageContent, getTestRoot} from 'widjet-test-utils/dom';
import {createEvent, createEventObject, domEvent, addDelegatedEventListener} from '../src/index';

describe('events utils', () => {
  jsdom({url: 'http://localhost/'});

  let [root, node, spy] = [];

  beforeEach(() => {
    setPageContent(`
      <div class="root">
        <div class="foo">
          <div class="child"></div>
        </div>
        <div class="bar">
          <div class="child"></div>
        </div>
      </div>`);

    root = getTestRoot().querySelector('.root');
    node = root.querySelector('.child');

    spy = sinon.spy();
  });

  describe('domEvent()', () => {
    describe('called with just an event name', () => {
      it('creates an event that bubbles and can be cancelled', () => {
        const event = domEvent('foo');

        expect(event.bubbles).to.be.ok();
        expect(event.cancelable).to.be.ok();
        expect(event.type).to.eql('foo');
      });
    });

    describe('called with just event name and some data', () => {
      it('creates an event with a data property', () => {
        const data = 'some event data';
        const event = domEvent('foo', data);

        expect(event.data).to.be(data);
      });
    });

    describe('called with a props object', () => {
      it('creates an event with the corresponding properties', () => {
        const event = domEvent('foo', null, {bubbles: false, cancelable: false});

        expect(event.bubbles).not.to.be.ok();
        expect(event.cancelable).not.to.be.ok();
      });
    });
  });

  describe('using legacy method createEvent()', () => {
    describe('with no data and props', () => {
      it('creates a bubbling and cancelable event', () => {
        const event = createEvent('foo', null, {});

        expect(event.type).to.eql('foo');
        expect(event.bubbles).to.be.ok();
        expect(event.cancelable).to.be.ok();
      });
    });

    describe('with data and props', () => {
      it('setups the event', () => {
        const data = 'some event data';
        const event = createEvent('foo', data, {bubbles: false, cancelable: false});

        expect(event.type).to.eql('foo');
        expect(event.data).to.be(data);
        expect(event.bubbles).not.to.be.ok();
        expect(event.cancelable).not.to.be.ok();
      });
    });
  });

  describe('using legacy method createEventObject()', () => {
    beforeEach(() => {
      if (!document.createEventObject) {
        document.createEventObject = () => ({});
      }
    });
    describe('with no data and props', () => {
      it('creates a bubbling and cancelable event', () => {
        const event = createEventObject('foo', null, {});

        expect(event.type).to.eql('foo');
        expect(event.cancelBubble).not.to.be.ok();
      });
    });

    describe('with data and props', () => {
      it('setups the event', () => {
        const data = 'some event data';
        const event = createEventObject('foo', data, {bubbles: false, cancelable: false});

        expect(event.type).to.eql('foo');
        expect(event.data).to.be(data);
        expect(event.cancelBubble).to.be.ok();
      });
    });
  });

  describe('addDelegatedEventListener()', () => {
    describe('when registered on a root node without a selector', () => {
      it('triggers the listener whatever the target', () => {
        addDelegatedEventListener(root, 'click', spy);

        node.dispatchEvent(domEvent('click'));

        expect(spy.called).to.be.ok();
      });
    });

    describe('when registered on a root node with a selector', () => {
      it('triggers the listener only if the target or its ancestors matches the selector', () => {
        addDelegatedEventListener(root, 'click', '.foo', spy);

        node = root.querySelector('.bar .child');
        node.dispatchEvent(domEvent('click'));

        expect(spy.called).not.to.be.ok();

        node = root.querySelector('.foo .child');
        node.dispatchEvent(domEvent('click'));

        expect(spy.called).to.be.ok();
      });
    });

    describe('when two listeners are added at different level of the tree', () => {
      it('does not trigger the top listener if the propagation have been stopped', () => {
        addDelegatedEventListener(root, 'click', '.foo .child', (e) => {
          e.stopPropagation();
        });
        addDelegatedEventListener(root, 'click', '.foo', spy);

        node = root.querySelector('.foo .child');
        node.dispatchEvent(domEvent('click'));

        expect(spy.called).not.to.be.ok();
      });
    });

    describe('when two listeners are added at the same level of the tree', () => {
      it('does not trigger the second listener if the immediate propagation have been stopped', () => {
        addDelegatedEventListener(root, 'click', '.foo', (e) => {
          e.stopImmediatePropagation();
        });
        addDelegatedEventListener(root, 'click', '.foo', spy);

        node = root.querySelector('.foo .child');
        node.dispatchEvent(domEvent('click'));

        expect(spy.called).not.to.be.ok();
      });
    });
  });
});
