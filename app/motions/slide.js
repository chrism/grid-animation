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
    this.yClonePos = 0;

    this.clone = null;
  }

  interrupted(motions) {
    // We only need to track the prior Slide we are replacing here,
    // because it will have done the same for any earlier ones.
    this.prior = motions.find(m => m instanceof Slide);
  }

  firstTimeSlide() {
    let duration = this.duration;
    let sprite = this.sprite;

    let initial = sprite.initialBounds;
    let final = sprite.finalBounds;
    let standardUnit = initial.width;

    let dx = -standardUnit;

    this.xTween = new Tween(
      sprite.transform.tx,
      sprite.transform.tx + dx,
      duration,
      this.opts.easing
    );

    if (isMovingVertically(sprite)) {
      let clone = cloneSprite(sprite);
      this.clone = clone;

      this.xCloneTween = new Tween(
        clone.transform.tx + final.left + standardUnit,
        clone.transform.tx + final.left,
        duration,
        this.opts.easing
      );

      this.yClonePos = -standardUnit;
    }
  }

  multipleTimeSlide() {
    let duration = this.duration;
    let sprite = this.sprite;

    // This handles the sliding sprite and any prior tween

    let priorXTween = this.prior.xTween;
    let dx, distanceToSlide;
    let screenWidth = window.innerWidth;
    let previousOffset = priorXTween.finalValue - priorXTween.currentValue;

    if (isMovingVertically(sprite)) {
      distanceToSlide = -((window.innerWidth - sprite.finalBounds.left) + sprite.initialBounds.left); // sliding left TODO slide right
      dx = distanceToSlide - previousOffset;
    } else {
      distanceToSlide = sprite.finalBounds.left - sprite.initialBounds.left;
      dx = distanceToSlide - previousOffset;
    }

    let transformDiffX = sprite.transform.tx - priorXTween.currentValue;
    let durationX = fuzzyZero(dx) ? 0 : duration;
    this.xTween = new Tween(transformDiffX, transformDiffX + dx, duration, this.opts.easing).plus(this.prior.xTween);

    // let position = sprite.owner.value.get('position');
    // console.log('position', position, 'previousOffset', previousOffset, 'distanceToSlide', distanceToSlide, 'dx', dx);

    // This handles the cloned sprite (if needed and existing)










    // if(isMovingVertically(sprite)) {
    //   let clone;
    //   if (this.prior.clone) {
    //     clone = this.prior.clone;
    //     let priorXCloneTween = this.prior.xCloneTween;
    //     let transformDiffXClone = clone.transform.tx - priorXCloneTween.currentValue;
    //     let cx = sprite.finalBounds.left - clone.finalBounds.left;
    //     let durationXClone = fuzzyZero(cx) ? 0 : duration;
    //     this.xCloneTween = new Tween(transformDiffXClone, transformDiffXClone + cx, duration, this.opts.easing).plus(this.prior.xCloneTween);
    //   } else {
    //     // clone = cloneSprite(sprite);
    //
    //   }
    //   this.clone = clone;
    //
    //
    //   let finalCloneY = this.clone.finalBounds.top;
    //   let initialCloneY = this.clone.initialBounds.top;
    //   let currentCloneY = this.clone.transform.ty;
    //
    //   this.yClonePos = finalCloneY - initialCloneY - currentCloneY;
    // }
  }

  * animate() {
    // The sprite always stays on the same row and slides to right/left
    // This can include offscreen (if necessary).

    // If the sprite slides offscreen (up/down a row) the a clone is made
    // This clone then slides on the new row from offscreen to the final position
    // Once complete the clone is removed.
    let sprite = this.sprite;

    if (!isMovingVertically(sprite) && !isMovingHorizontally(sprite)) {
      console.log('not moving quick return');
      return;
    }

    if (!this.prior) {
      this.firstTimeSlide();
    } else {
      this.multipleTimeSlide();
    }

    if (!this.clone) {
      yield * this._slideSprite();
    } else {
      yield * this._slideSpriteWithClone();
    }
  }

  *_slideSprite() {
    let sprite = this.sprite;
    while (!this.xTween.done) {
      sprite.translate(this.xTween.currentValue - sprite.transform.tx, 0);
      yield rAF();
    }
  }

  *_slideSpriteWithClone() {
    let sprite = this.sprite;
    let clone = this.clone;

    clone.translate(0, this.yClonePos);

    while (!this.xTween.done || !this.xCloneTween.done) {
      sprite.translate(this.xTween.currentValue - sprite.transform.tx, 0);
      clone.translate(this.xCloneTween.currentValue - clone.transform.tx, 0);
      yield rAF();
    }
    sprite.element.parentElement.removeChild(clone.element);
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

function isMovingDown(sprite) {
  let change = sprite.initialBounds.top - sprite.finalBounds.top;
  return isMovingVertically(sprite) && change < 0;
}

function isMovingHorizontally(sprite) {
  let change = sprite.initialBounds.left - sprite.finalBounds.left;
  return Math.abs(change) > 0.5;
}

function isMovingLeft(sprite) {
  let change = sprite.initialBounds.left - sprite.finalBounds.left;
  return isMovingUp(sprite) || (isMovingHorizontally(sprite) && change > 0);
}

function isMovingRight(sprite) {
  let change = sprite.initialBounds.left - sprite.finalBounds.left;
  return isMovingDown(sprite) || (isMovingHorizontally(sprite) && change < 0);
}

export function continuePriorSlide(sprite, opts) {
  return new ContinuePriorSlide(sprite, opts).run();
}

export class ContinuePriorSlide extends Slide {
  * animate() {
    console.log('prior...');
    if (!this.prior) {
      console.log('no prior quick return');
      return;
    }
    this.xTween = this.prior.xTween;

    if (!this.prior.clone) {
      yield * this._slideSprite();
    } else {
      this.xCloneTween = this.prior.this.xCloneTween;
      this.yClonePos = this.prior.yClonePos;
      yield * this._slideSpriteWithClone();
    }
  }
}
