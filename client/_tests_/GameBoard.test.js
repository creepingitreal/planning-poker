import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import GameBoard from '../src/components/GameBoard.vue';
import socket from '../socket.js';

vi.mock('../socket.js', () => {
  const listeners = new Map();

  return {
	default: {
	  emit: vi.fn(),
	  on: vi.fn((event, handler) => {
		listeners.set(event, handler);
	  }),
	  off: vi.fn((event, handler) => {
		if (listeners.get(event) === handler) {
		  listeners.delete(event);
		}
	  }),
	  __trigger(event, payload) {
		const handler = listeners.get(event);
		if (handler) {
		  handler(payload);
		}
	  }
	}
  };
});

describe('GameBoard', () => {
  const room = { roomId: 'room-123' };

  const createWrapper = (players) => {
	return mount(GameBoard, {
	  props: {
		players,
		room
	  }
	});
  };

  beforeEach(() => {
	vi.clearAllMocks();
  });

  it('renders all players and vote options', () => {
	const wrapper = createWrapper({
	  one: { user: 'Alex', vote: null },
	  two: { user: 'Chris', vote: 5 }
	});

	expect(wrapper.text()).toContain('Alex');
	expect(wrapper.text()).toContain('Chris');

	const voteOptionButtons = wrapper.findAll('.vote-option');
	expect(voteOptionButtons).toHaveLength(11);
	expect(voteOptionButtons.at(0)?.text()).toBe('1');
	expect(voteOptionButtons.at(10)?.text()).toBe('?');
  });

  it('disables reveal button when there are no votes', () => {
	const wrapper = createWrapper({
	  one: { user: 'Alex', vote: null },
	  two: { user: 'Chris', vote: null }
	});

	const revealButton = wrapper.find('.reveal-btn');
	expect(revealButton.attributes('disabled')).toBeDefined();
	expect(revealButton.text()).toBe('Reveal Votes');
  });

  it('emits castVote with selected value and room id', async () => {
	const wrapper = createWrapper({
	  one: { user: 'Alex', vote: null }
	});

	const voteOptionButtons = wrapper.findAll('.vote-option');
	await voteOptionButtons.at(3)?.trigger('click');

	expect(socket.emit).toHaveBeenCalledWith('castVote', {
	  roomId: 'room-123',
	  vote: 5
	});
  });

  it('emits revealVotes and clearVotes payloads', async () => {
	const wrapper = createWrapper({
	  one: { user: 'Alex', vote: 8 }
	});

	const revealButton = wrapper.find('.reveal-btn');
	const clearButton = wrapper.find('.secondary-blue');

	await revealButton.trigger('click');
	expect(socket.emit).toHaveBeenCalledWith('revealVotes', {
	  roomId: 'room-123',
	  visibility: true
	});

	await clearButton.trigger('click');
	expect(socket.emit).toHaveBeenCalledWith('clearVotes', {
	  roomId: 'room-123'
	});
  });

  it('updates vote visibility from toggleVisibility socket event', async () => {
	const wrapper = createWrapper({
	  one: { user: 'Alex', vote: 3 }
	});

	const revealButton = wrapper.find('.reveal-btn');
	expect(revealButton.text()).toBe('Reveal Votes');

	socket.__trigger('toggleVisibility', true);
	await wrapper.vm.$nextTick();
	expect(wrapper.find('.reveal-btn').text()).toBe('Hide Votes');

	socket.__trigger('toggleVisibility', false);
	await wrapper.vm.$nextTick();
	expect(wrapper.find('.reveal-btn').text()).toBe('Reveal Votes');
  });

  it('removes toggleVisibility listener on unmount', () => {
	const wrapper = createWrapper({
	  one: { user: 'Alex', vote: 3 }
	});

	wrapper.unmount();

	expect(socket.off).toHaveBeenCalledTimes(1);
	expect(socket.off).toHaveBeenCalledWith(
	  'toggleVisibility',
	  expect.any(Function)
	);
  });
});

