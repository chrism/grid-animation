import Component from '@ember/component';

import slide, { continuePriorSlide } from '../motions/slide';
import move from '../motions/move';

import { serial } from 'ember-animated';

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
      // let endX = sprite.initialBounds.left - sprite.initialBounds.width;
      // sprite.endAtPixel({ x: endX });
      // move(sprite, { easing: easeInAndOut });
      fadeOut(sprite, { duration: 500 });
    });



    // keptSprites.forEach(sprite => {
    //   fadeIn(sprite);
    //   if (!offBottomOfScreen(sprite)) {
    //     continuePriorSlide(sprite);
    //     slide(sprite);
    //   }
    // });

    keptSprites.forEach(slide);

    insertedSprites.forEach(fadeIn);
  }
});

function offBottomOfScreen(sprite) {
  return sprite.absoluteInitialBounds.top > window.innerHeight &&
    sprite.absoluteFinalBounds.top > window.innerHeight;
}
