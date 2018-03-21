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

  firstTimeSlide() {
    let duration = this.duration;
    let sprite = this.sprite;

    let initial = sprite.initialBounds;
    let final = sprite.finalBounds;
    let screenWidth = window.innerWidth;

    let dx;

    if (isMovingVertically(sprite)) {
      dx = -(screenWidth - final.left); // TODO check if sliding right
      let dy = final.top - initial.top;

      let clone = cloneSprite(sprite);
      this.clone = clone;

      clone.translate(screenWidth, dy);
      this.xCloneTween = new Tween(clone.transform.tx, clone.transform.tx + dx, duration, this.opts.easing);
    } else {
      dx = final.left - initial.left;
    }
    this.xTween = new Tween(sprite.transform.tx, sprite.transform.tx + dx, duration, this.opts.easing);
  }

  removeSlide() {
    let duration = this.duration;
    let sprite = this.sprite;

    let initial = sprite.initialBounds;
    let screenWidth = window.innerWidth;

    let dx, distanceToSlide;

    if (this.prior) {

      let priorXTween = this.prior.xTween;
      let previousOffset = priorXTween.finalValue - priorXTween.currentValue;
      distanceToSlide = -(initial.width - previousOffset);
      dx = distanceToSlide - previousOffset;

      let transformDiffX = sprite.transform.tx - priorXTween.currentValue;
      this.xTween = new Tween(transformDiffX, transformDiffX + dx, duration, this.opts.easing).plus(priorXTween);

      let position = sprite.owner.value.get('position');
      console.log('removing position', position, 'previousOffset', previousOffset, 'distanceToSlide', distanceToSlide, 'dx', dx);
    } else {
      dx = -(initial.width + initial.left);
      this.xTween = new Tween(sprite.transform.tx, sprite.transform.tx + dx, duration, this.opts.easing);
    }
  }

  multipleTimeSlide() {
    let duration = this.duration;
    let sprite = this.sprite;
    let screenWidth = window.innerWidth;

    let dx, distanceToSlide;
    let priorXTween = this.prior.xTween;
    let previousOffset = priorXTween.finalValue - priorXTween.currentValue;

    if (isMovingVertically(sprite)) {
      distanceToSlide = -((window.innerWidth - sprite.finalBounds.left) + sprite.initialBounds.left); // sliding left TODO slide right
      dx = distanceToSlide - previousOffset;

      if (this.prior.clone) {
        let clone = this.prior.clone;
        this.clone = clone;

        let priorXCloneTween = this.prior.xCloneTween;
        let transformDiffXClone = clone.transform.tx - priorXCloneTween.currentValue;

        this.xCloneTween = new Tween(transformDiffXClone, transformDiffXClone + dx, duration, this.opts.easing).plus(priorXCloneTween);
      } else {
        let clone = cloneSprite(sprite);
        this.clone = clone;

        let dy = sprite.finalBounds.top - sprite.initialBounds.top;
        clone.translate(screenWidth - priorXTween.currentValue, dy);

        this.xCloneTween = new Tween(clone.transform.tx, clone.transform.tx + dx, duration, this.opts.easing).plus(priorXTween);
      }
    } else {
      distanceToSlide = sprite.finalBounds.left - sprite.initialBounds.left;
      dx = distanceToSlide - previousOffset;
    }

    let transformDiffX = sprite.transform.tx - priorXTween.currentValue;
    this.xTween = new Tween(transformDiffX, transformDiffX + dx, duration, this.opts.easing).plus(priorXTween);

    let position = sprite.owner.value.get('position');
    console.log('position', position, 'previousOffset', previousOffset, 'distanceToSlide', distanceToSlide, 'dx', dx);
  }

  * animate() {
    let sprite = this.sprite;

    if (sprite.owner.state === "removing") {
      this.removeSlide();
    } else if (sprite.owner.state !== "removing" && !isMovingVertically(sprite) && !isMovingHorizontally(sprite)) {
      return;
    } else if (!this.prior) {
      this.firstTimeSlide();
    } else {
      this.multipleTimeSlide();
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
