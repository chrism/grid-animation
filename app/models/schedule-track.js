import DS from 'ember-data';

export default DS.Model.extend({
  position: DS.attr('number'),
  color: DS.attr(),

  state: "queued",
  liked: false
});
