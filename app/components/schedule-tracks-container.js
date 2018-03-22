import Component from '@ember/component';

import slide from '../motions/slide';
import { fadeOut, fadeIn } from 'ember-animated/motions/opacity';
import { spawnChild } from 'ember-animated';

export default Component.extend({
  classNames: ['schedule-tracks-container'],

  transition: function * ({ keptSprites,
                            insertedSprites,
                            removedSprites }) {

    insertedSprites.forEach(fadeIn);

    let played = removedSprites.filter(sprite => sprite.owner.value.get('state') === "played");
    let deleted = removedSprites.filter(sprite => sprite.owner.value.get('state') === "deleted");

    deleted.forEach(sprite => {
      fadeOut(sprite, { duration: 500 });
    });

    played.forEach(slide);

    let keptSliding = keptSprites.filter(sprite => !sprite.owner.value.get('liked'));

    keptSliding.forEach(sprite => {
      if (!offBottomOfScreen(sprite)) {
        sprite.applyStyles({
          'z-index': 1
        });
        fadeIn(sprite);
        slide(sprite);
      }
    });

    let likedSprite = keptSprites.filter(sprite => sprite.owner.value.get('liked'));

    likedSprite.forEach(sprite => {
      spawnChild(function * () {
        yield fadeOut(sprite, { duration: 500 });
        sprite.applyStyles({
          'z-index': -1
        });
        sprite.moveToFinalPosition();
        yield fadeIn(sprite, { duration: 500 });
      });
    });
  }
});

function offBottomOfScreen(sprite) {
  return sprite.absoluteInitialBounds.top > window.innerHeight &&
    sprite.absoluteFinalBounds.top > window.innerHeight;
}
