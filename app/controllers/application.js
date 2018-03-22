import Controller from '@ember/controller';
import { mapBy, max, min, setDiff } from '@ember/object/computed';
import { getProperties } from '@ember/object';
import { sortBy } from 'lodash';
import { computed } from '@ember/object';

export default Controller.extend({
  colorsArray: mapBy('model', 'color'),
  queuedPositionsArray: mapBy('queuedTracks', 'position'),
  maxPosition: max('queuedPositionsArray'),
  minPosition: min('queuedPositionsArray'),
  startOffset: 1,
  likedId: null,

  queuedTracks: computed('model.@each.state', function() {
    let queued = this.get('model').filter(m => {
      return m.state !== "played" && m.state !== "deleted"
    });
    return queued;
  }),

  sortedScheduleTracks: computed('queuedTracks.@each.position', function() {
    return sortBy(this.get('queuedTracks').toArray(), m => m.get('position'));
  }),

  allPositions: computed('queuedPositionsArray', 'minPosition', 'maxPosition', function() {
    let allPositions = [];

    for (var i = this.get('minPosition'); i < this.get('maxPosition'); i++) {
      allPositions.push(i);
    }

    return allPositions;
  }),

  availablePositions: setDiff('allPositions', 'queuedPositionsArray'),

  createScheduleTrack(newPosition) {
    let colorsArray = this.get('colorsArray');
    let randomColor = colorsArray[Math.floor(Math.random() * colorsArray.get('length'))];

    let scheduleTrack = this.get('store').createRecord('scheduleTrack', {
      position: newPosition,
      color: randomColor
    });
  },

  clearAllLiked() {
    console.log('clearing');

    this.get('queuedTracks').forEach(scheduleTrack => {
      scheduleTrack.set('liked', false);
    });
  },

  randomNewPosition() {
    let availablePositions = this.get('availablePositions');
    let randomPosition = availablePositions[Math.floor(Math.random()*availablePositions.get('length'))];

    return randomPosition;
  },

  actions: {
    likeScheduleTrack(scheduleTrack) {
      let newPosition = this.randomNewPosition();
      this.clearAllLiked();
      scheduleTrack.set('liked', true);
      scheduleTrack.set('position', newPosition);
    },

    deleteScheduleTrack(scheduleTrack) {
      this.clearAllLiked();
      scheduleTrack.set('state', 'deleted');
    },

    next() {
      this.clearAllLiked();
      let scheduleTrack = this.get('sortedScheduleTracks.firstObject');
      if (scheduleTrack) {
        scheduleTrack.set('state', 'played');
      }
    },

    addEnd() {
      this.clearAllLiked();
      let maxPosition = this.get('maxPosition');

      this.createScheduleTrack(maxPosition + 10);
    },

    addStart() {
      this.clearAllLiked();
      let minPosition = this.get('minPosition');
      let startOffset = this.get('startOffset');
      this.set('startOffset', startOffset + 1);

      this.createScheduleTrack(minPosition + startOffset);

    }
  }
});
