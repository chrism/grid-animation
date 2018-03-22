import Component from '@ember/component';

import slide from '../motions/slide';
import { Promise } from 'ember-animated';
import { fadeOut, fadeIn } from 'ember-animated/motions/opacity';

import groupBy from 'lodash/groupBy';

export default Component.extend({
  classNames: ['schedule-tracks-container'],

  transition: function * ({ keptSprites,
                            insertedSprites,
                            removedSprites }) {

    let played = removedSprites.filter(sprite => sprite.owner.value.get('state') === "played");
    let deleted = removedSprites.filter(sprite => sprite.owner.value.get('state') === "deleted");

    deleted.forEach(sprite => {
      fadeOut(sprite, { duration: 300 });
    });

    played.forEach(slide);

    keptSprites.forEach(sprite => {
      if (!offBottomOfScreen(sprite)) {
        fadeIn(sprite);
        slide(sprite);
      }
    });

    insertedSprites.forEach(fadeIn);
  }
});

function offBottomOfScreen(sprite) {
  return sprite.absoluteInitialBounds.top > window.innerHeight &&
    sprite.absoluteFinalBounds.top > window.innerHeight;
}
