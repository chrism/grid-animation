import { Motion, rAF, Tween } from 'ember-animated';

import Sprite from 'ember-animated/-private/sprite';

export default function slide(sprite, opts) {
  return new Slide(sprite, opts).run();
}

export class Slide extends Motion {
  constructor(sprite, opts) {
    super(sprite, opts);
    this.prior = null;

    this.xTween = null;
    this.xCloneTween = null;

    this.clone = null;
  }

  interrupted(motions) {
    // We only need to track the prior Slide we are replacing here,
    // because it will have done the same for any earlier ones.
    this.prior = motions.find(m => m instanceof Slide);
  }

  removeSlide() {
    // Removed items (played state) always slide offscreen to the top left

    let duration = this.duration;
    let sprite = this.sprite;

    let initial = sprite.initialBounds;

    let dx;

    if (this.prior) {
      let priorXTween = this.prior.xTween;
      let previousOffset = priorXTween.finalValue - priorXTween.currentValue;
      let distanceToSlide = -(initial.width - previousOffset);
      let transformDiffX = sprite.transform.tx - priorXTween.currentValue;

      dx = distanceToSlide - previousOffset;
      this.xTween = new Tween(transformDiffX, transformDiffX + dx, fuzzyZero(dx) ? 0 : duration, this.opts.easing).plus(priorXTween);
    } else {
      dx = -(initial.width + initial.left);
      this.xTween = new Tween(sprite.transform.tx, sprite.transform.tx + dx, fuzzyZero(dx) ? 0 : duration, this.opts.easing);
    }
  }

  initialSlide() {
    // If there is no prior motion

    let duration = this.duration;
    let sprite = this.sprite;

    let initial = sprite.initialBounds;
    let final = sprite.finalBounds;
    let screenWidth = window.innerWidth;

    let dx;

    // We need to see if there is vertical motion
    // In which case we clone the sprite and animate it too
    if (isMovingVertically(sprite)) {
      let clone = cloneSprite(sprite);
      this.clone = clone;

      let dy = final.top - initial.top;

      // To calculate the difference to animate and initial translation
      // We need to know which direction the clone is moving
      if (isMovingLeft(sprite)) {
        dx = -(screenWidth - final.left);
        clone.translate(screenWidth, dy);
      } else {
        dx = final.width;
        clone.translate(-screenWidth, dy);
      }

      this.xCloneTween = new Tween(clone.transform.tx, clone.transform.tx + dx, fuzzyZero(dx) ? 0 : duration, this.opts.easing);
    } else {
      // A simple slide on the same row
      dx = final.left - initial.left;
    }

    // Finally the sprite needs to be animated too
    this.xTween = new Tween(sprite.transform.tx, sprite.transform.tx + dx, fuzzyZero(dx) ? 0 : duration, this.opts.easing);
  }

  priorSlide() {
    // If there is already motion

    let duration = this.duration;
    let sprite = this.sprite;
    let screenWidth = window.innerWidth;

    let dx, distanceToSlide;
    let priorXTween = this.prior.xTween;
    let previousOffset = priorXTween.finalValue - priorXTween.currentValue;

    // We need to check if there is vertical motion again
    // To see if there needs to be a clone
    if (isMovingVertically(sprite)) {

      // To calculate the difference to animate and initial translation
      // We need to know which direction the clone is moving
      if (isMovingLeft(sprite)) {
        distanceToSlide = -((screenWidth - sprite.finalBounds.left) + sprite.initialBounds.left);
      } else {
        distanceToSlide = (screenWidth - sprite.initialBounds.left) + sprite.finalBounds.left;
      }

      dx = distanceToSlide - previousOffset;

      // If there is already an existing clone
      // We need to update that tween with the new positions
      if (this.prior.clone) {
        let clone = this.prior.clone;
        this.clone = clone;

        let priorXCloneTween = this.prior.xCloneTween;
        let transformDiffXClone = clone.transform.tx - priorXCloneTween.currentValue;

        this.xCloneTween = new Tween(transformDiffXClone, transformDiffXClone + dx, fuzzyZero(dx) ? 0 : duration, this.opts.easing).plus(priorXCloneTween);
      } else {
        // If no clone exists but the sprite is moving vertically
        // We need to make one
        let clone = cloneSprite(sprite);
        this.clone = clone;

        let dy = sprite.finalBounds.top - sprite.initialBounds.top;
        let translateX;

        // As usual we need to know which direction
        // In order to calculate the translation needed
        if (isMovingLeft(sprite)) {
          translateX = screenWidth - priorXTween.currentValue;
        } else {
          translateX = -(screenWidth + priorXTween.currentValue);
        }

        clone.translate(translateX, dy);

        this.xCloneTween = new Tween(clone.transform.tx, clone.transform.tx + dx, fuzzyZero(dx) ? 0 : duration, this.opts.easing).plus(priorXTween);
      }
    } else {
      // When the sprite isn't moving vertically
      // It is a simple slide on the same row
      distanceToSlide = sprite.finalBounds.left - sprite.initialBounds.left;
      dx = distanceToSlide - previousOffset;

      // There may have already been a clone so
      // Make sure it finishes the tween first and then gets removed
      if (this.prior.clone) {
        let clone = this.prior.clone;
        this.clone = clone;

        let priorXCloneTween = this.prior.xCloneTween;
        let transformDiffXClone = clone.transform.tx - priorXCloneTween.currentValue;

        this.xCloneTween = new Tween(transformDiffXClone, transformDiffXClone + dx, fuzzyZero(dx) ? 0 : duration, this.opts.easing).plus(priorXCloneTween);
      }
    }

    // Finally the sprite needs to animate too
    let transformDiffX = sprite.transform.tx - priorXTween.currentValue;
    this.xTween = new Tween(transformDiffX, transformDiffX + dx, fuzzyZero(dx) ? 0 : duration, this.opts.easing).plus(priorXTween);
  }

  * animate() {
    let sprite = this.sprite;
    let removing = sprite.owner.state === "removing";

    if (!removing && !isMovingVertically(sprite) && !isMovingHorizontally(sprite)) {
      return;
    }

    if (removing) {
      this.removeSlide();
    } else if (!this.prior) {
      this.initialSlide();
    } else {
      this.priorSlide();
    }

    yield * this._slide();
  }

  *_slide() {
    let sprite = this.sprite;
    let clone = this.clone;

    if (clone) {
      while (!this.xTween.done || !this.xCloneTween.done) {
        sprite.translate(this.xTween.currentValue - sprite.transform.tx, 0);
        clone.translate(this.xCloneTween.currentValue - clone.transform.tx, 0);
        yield rAF();
      }
      sprite.element.parentElement.removeChild(clone.element);
    } else {
      while (!this.xTween.done) {
        sprite.translate(this.xTween.currentValue - sprite.transform.tx, 0);
        yield rAF();
      }
    }
  }
}

// Because sitting around while your sprite animates by 3e-15 pixels
// is no fun.
function fuzzyZero(number) {
  return Math.abs(number) < 0.00001;
}

function cloneSprite(sprite) {
  let cloneElement = sprite.element.cloneNode(true);
  cloneElement.id = cloneElement.id + '-cloned';
  cloneElement.style.zIndex = "-1";
  sprite.element.parentElement.appendChild(cloneElement);

  let clone = Sprite.positionedStartingAt(cloneElement, sprite._offsetSprite);
  clone._transitionContext = sprite._transitionContext;
  clone._finalBounds = sprite._finalBounds;
  clone.owner = sprite.owner;

  return clone;
}

function isMovingVertically(sprite) {
  let change = sprite.initialBounds.top - sprite.finalBounds.top;
  return Math.abs(change) > 0.5;
}

function isMovingUp(sprite) {
  let change = sprite.initialBounds.top - sprite.finalBounds.top;
  return isMovingVertically(sprite) && change > 0;
}

function isMovingHorizontally(sprite) {
  let change = sprite.initialBounds.left - sprite.finalBounds.left;
  return Math.abs(change) > 0.5;
}

function isMovingLeft(sprite) {
  let change = sprite.initialBounds.left - sprite.finalBounds.left;
  return isMovingUp(sprite) || (isMovingHorizontally(sprite) && change < 0);
}
