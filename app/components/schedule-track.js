import Component from '@ember/component';

export default Component.extend({
  classNames: ['schedule-track'],

  actions: {
    delete() {
      this.get('onDelete')(this.get('scheduleTrack'));
    }
  }
});
