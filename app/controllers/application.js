import Controller from '@ember/controller';
import { mapBy, max, min } from '@ember/object/computed';
import { getProperties } from '@ember/object';
import { sortBy } from 'lodash';
import { computed } from '@ember/object';

export default Controller.extend({
  colorsArray: mapBy('model', 'color'),
  queuedPositionsArray: mapBy('queuedTracks', 'position'),
  maxPosition: max('queuedPositionsArray'),
  minPosition: min('queuedPositionsArray'),
  startOffset: 0,

  queuedTracks: computed('model.@each.state', function() {
    let queued = this.get('model').filter(m => {
      // console.log('state', m.state);
      return m.state !== "played" && m.state !== "deleted"
    });
    return queued;
  }),

  sortedScheduleTracks: computed('queuedTracks.@each.position', function() {
    return sortBy(this.get('queuedTracks').toArray(), m => m.get('position'));
  }),

  createScheduleTrack(newPosition) {
    let colorsArray = this.get('colorsArray');
    let randomColor = colorsArray[Math.floor(Math.random() * colorsArray.get('length'))];

    let scheduleTrack = this.get('store').createRecord('scheduleTrack', {
      position: newPosition,
      color: randomColor
    });
  },

  actions: {
    deleteScheduleTrack(scheduleTrack) {
      scheduleTrack.set('state', 'deleted');
    },

    next() {
      let scheduleTrack = this.get('sortedScheduleTracks.firstObject');
      if (scheduleTrack) {
        scheduleTrack.set('state', 'played');
      }
    },

    addEnd() {
      let maxPosition = this.get('maxPosition');

      this.createScheduleTrack(maxPosition + 10);
    },

    addStart() {
      let minPosition = this.get('minPosition');
      let startOffset = this.get('startOffset');
      this.set('startOffset', startOffset + 1);

      this.createScheduleTrack(minPosition + startOffset);

    }
  }
});
