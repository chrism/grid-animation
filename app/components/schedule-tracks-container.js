import Component from '@ember/component';

import move from 'ember-animated/motions/move';
import { fadeOut, fadeIn } from 'ember-animated/motions/opacity';

import { easeInAndOut } from 'ember-animated/easings/cosine';

export default Component.extend({
  classNames: ['schedule-tracks-container'],

  transition: function * ({ keptSprites,
                            insertedSprites,
                            removedSprites }) {

    insertedSprites.forEach(fadeIn);

    keptSprites.forEach(sprite => {
      move(sprite, { easing: easeInAndOut });
    });

    removedSprites.forEach(sprite => {
      let endX = sprite.initialBounds.left - sprite.initialBounds.width;
      sprite.endAtPixel({ x: endX });
      move(sprite, { easing: easeInAndOut });
    });
  }
});
