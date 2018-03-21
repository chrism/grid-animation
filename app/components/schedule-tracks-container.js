import Component from '@ember/component';

import slide from '../motions/slide';
import move, { continuePrior } from '../motions/move';

import { serial, parallel } from 'ember-animated';

import { Promise } from 'ember-animated';

import Sprite from 'ember-animated/-private/sprite';

import { fadeOut, fadeIn } from 'ember-animated/motions/opacity';

import { easeInAndOut } from 'ember-animated/easings/cosine';

import groupBy from 'lodash/groupBy';

export default Component.extend({
  classNames: ['schedule-tracks-container'],

  transition: function * ({ keptSprites,
                            insertedSprites,
                            removedSprites }) {

    removedSprites.forEach(sprite => {
      // let endX = sprite.initialBounds.left -sprite.initialBounds.width;
      // sprite.endAtPixel({ x: -sprite.initialBounds.width });
      // continuePrior(sprite);
      slide(sprite, { easing: easeInAndOut });
      // fadeOut(sprite, { duration: 500 });
    });

    keptSprites.forEach(sprite => {
      fadeIn(sprite);
      if (!offBottomOfScreen(sprite)) {
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
