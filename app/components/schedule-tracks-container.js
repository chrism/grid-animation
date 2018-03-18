import Component from '@ember/component';

import slide from '../motions/slide';
import move from '../motions/move';

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
      let endX = sprite.initialBounds.left - sprite.initialBounds.width;
      sprite.endAtPixel({ x: endX });
      move(sprite, { easing: easeInAndOut });
    });

    keptSprites.forEach(sprite => {
      fadeIn(sprite);
      if (!offBottomOfScreen(sprite)) {
        if (isMovingVertically(sprite)) {
          let cloneElement = sprite.element.cloneNode(true);
          cloneElement.id = 'cloned';
          sprite.element.parentElement.appendChild(cloneElement);

          let clone = Sprite.positionedStartingAt(cloneElement, sprite._offsetSprite);
          clone._transitionContext = sprite._transitionContext;
          clone._finalBounds = sprite._finalBounds;
          clone.owner = sprite.owner;

          let startX = clone.finalBounds.left + clone.finalBounds.width;
          let startY = clone.finalBounds.top
          clone.startAtPixel({ x: startX, y: startY });

          slide(clone, { easing: easeInAndOut, clone: true })
          .finally(() => {
            sprite.element.parentElement.removeChild(cloneElement);
          });

          let endX = sprite.initialBounds.left - sprite.initialBounds.width;
          let endY = sprite.initialBounds.top;
          sprite.endAtPixel({ x: endX, y: endY });

          slide(sprite, { easing: easeInAndOut });
        } else {
          slide(sprite, { easing: easeInAndOut });
        }
      }
    });

    insertedSprites.forEach(fadeIn);
  }
});

function isMovingVertically(sprite) {
  let change = sprite.initialBounds.top - sprite.finalBounds.top;
  return Math.abs(change) > 0.5;
}

function offBottomOfScreen(sprite) {
  return sprite.absoluteInitialBounds.top > window.innerHeight &&
    sprite.absoluteFinalBounds.top > window.innerHeight;
}
