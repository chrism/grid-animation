import DS from 'ember-data';
import ENV from 'grid-animation/config/environment';

export default DS.JSONAPIAdapter.extend({
  host: ENV.rootURL,
  namespace: '/api'
});
