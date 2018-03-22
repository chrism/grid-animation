import Controller from '@ember/controller';
import { mapBy, max } from '@ember/object/computed';
import { getProperties } from '@ember/object';
import { sortBy } from 'lodash';
import { computed } from '@ember/object';

export default Controller.extend({
  colorsArray: mapBy('model', 'color'),
  positionsArray: mapBy('model', 'position'),
  maxPosition: max('positionsArray'),

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

    add() {
      let { colorsArray, maxPosition } = getProperties(this, 'colorsArray', 'maxPosition');

      let nextPosition = maxPosition + 10;
      let randomColor = colorsArray[Math.floor(Math.random() * colorsArray.get('length'))];

      let scheduleTrack = this.get('store').createRecord('scheduleTrack', {
        position: nextPosition,
        color: randomColor
      });
    }
  }
});
