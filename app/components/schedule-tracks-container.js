import Component from '@ember/component';

import slide from '../motions/slide';
import { fadeOut, fadeIn } from 'ember-animated/motions/opacity';

export default Component.extend({
  classNames: ['schedule-tracks-container'],

  transition: function * ({ keptSprites,
                            insertedSprites,
                            removedSprites }) {

    let played = removedSprites.filter(sprite => sprite.owner.value.get('state') === "played");
    let deleted = removedSprites.filter(sprite => sprite.owner.value.get('state') === "deleted");

    deleted.forEach(sprite => {
      fadeOut(sprite, { duration: 500 });
    });

    played.forEach(slide);

    let keptSliding = keptSprites.filter(sprite => !sprite.owner.value.get('liked'));
    let likedSprite = keptSprites.filter(sprite => sprite.owner.value.get('liked'));

    likedSprite.forEach(sprite => {
      sprite.applyStyles({
        'z-index': -1
      });
      sprite.moveToFinalPosition();
    });


    keptSliding.forEach(sprite => {
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
