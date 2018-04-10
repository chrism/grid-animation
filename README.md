# Grid Animations

## Useful transition references

### From ember-animated

#### Clean each example
[`https://github.com/ember-animation/ember-animated/blob/master/tests/dummy/app/components/each-example.js`](https://github.com/ember-animation/ember-animated/blob/master/tests/dummy/app/components/each-example.js)

```js
transition: function * ({ insertedSprites, keptSprites, removedSprites }) {
  insertedSprites.forEach(sprite => {
    sprite.startAtPixel({ x: window.innerWidth });
    move(sprite, { easing: easeOut });
  });

  keptSprites.forEach(move);

  removedSprites.forEach(sprite => {
    // the 0.8 here is purely so I can easily see that the elements
    // are being properly removed immediately after they get far
    // enough
    sprite.endAtPixel({ x: window.innerWidth * 0.8 });
    move(sprite, { easing: easeIn });
  });
}
```


#### Uses parallel and some extra stuff
[`https://github.com/ember-animation/ember-animated/blob/master/tests/dummy/app/controllers/demos/hero/detail.js`](https://github.com/ember-animation/ember-animated/blob/master/tests/dummy/app/controllers/demos/hero/detail.js)

```js
transition: function * ({ receivedSprites, sentSprites, removedSprites }) {

  // received and sent sprites are flying above all the others
  receivedSprites.concat(sentSprites).forEach(sprite => {
    sprite.applyStyles({
      'z-index': 1
    });
  });

  receivedSprites.forEach(parallel(move, scale));
  sentSprites.forEach(parallel(move, scale));

  removedSprites.forEach(sprite => {
    sprite.endTranslatedBy(0, 0);
    continuePrior(sprite);
    opacity(sprite, { to: 0 });
  });
}
```

#### Some extra options and start/end pixels
[`https://github.com/ember-animation/ember-animated/blob/master/tests/dummy/app/controllers/demos/nested.js`](https://github.com/ember-animation/ember-animated/blob/master/tests/dummy/app/controllers/demos/nested.js)

```js

transition: function * ({ insertedSprites, keptSprites, removedSprites }) {
  insertedSprites.forEach(sprite => {
    sprite.startAtPixel({ x: window.innerWidth });
    move(sprite, { easing: easeOut });
  });

  keptSprites.forEach(move);

  removedSprites.forEach(sprite => {
    // the 0.8 here is purely so I can easily see that the elements
    // are being properly removed immediately after they get far
    // enough
    sprite.endAtPixel({ x: window.innerWidth * 0.8 });
    move(sprite, { easing: easeIn });
  });
}
```

#### Using a computed property here
`https://github.com/ember-animation/ember-animated/blob/master/tests/dummy/app/components/swapping-lists-example.js`

```js
transition: computed('animateSendingSide', function() {
  if (this.get('animateSendingSide')) {
    return this.moveSent;
  } else {
    return this.moveReceived;
  }
}),

moveReceived: function * ({ receivedSprites, insertedSprites }) {
  receivedSprites.forEach(move);
  // without this, they won't reveal until the end of the whole
  // transition
  insertedSprites.forEach(s => s.reveal());
},

moveSent: function * ({ sentSprites, insertedSprites }) {
  sentSprites.forEach(move);
  // without this, they won't reveal until the end of the whole
  // transition
  insertedSprites.forEach(s => s.reveal());
}
```

#### Check out moveToFinalPosition()
`https://github.com/ember-animation/ember-animated/blob/master/tests/dummy/app/components/two-lists-example.js`

```js
transition: function * ({ keptSprites, sentSprites, receivedSprites }) {
  // The parts of each list that haven't changed moves to accomodate
  // inserted and removed peers
  keptSprites.forEach(move);

  // Elements that are leaving our list get animated into their new
  // positions in the other list.
  sentSprites.forEach(move);

  // Elements that are arriving in our list don't animate (the other
  // list's sentSprites will animate instead). But we want them to
  // start in their final position so that when they're revealed
  // they're already in the right place.
  //
  // Without this, they would get the default behavior for
  // receivedSprites, which is starting at the same location as the
  // corresponding element in the other list.
  receivedSprites.forEach(sprite => sprite.moveToFinalPosition());
}
```

#### Force feeding opacity
`https://github.com/ember-animation/ember-animated/blob/master/tests/dummy/app/controllers/demos/hero/index.js`

```js
transition: function * ({ insertedSprites, receivedSprites, removedSprites }) {
  insertedSprites.forEach(sprite => {
    opacity(sprite, { from: 0, to: 1 });
  });

  receivedSprites.forEach(sprite => {
    opacity(sprite, { to: 1 });
  });

  removedSprites.forEach(sprite => {
    opacity(sprite, { to: 0 });
  });
}
```

### From living-animation

#### Using duration in Transition
[`https://github.com/ef4/living-animation/blob/master/src/ui/components/definition-slide/component.js`](https://github.com/ef4/living-animation/blob/master/src/ui/components/definition-slide/component.js)

```js
duration: slideTransitionDuration,
transition: function * ({ sentSprites, removedSprites, duration }) {
  // When we're being sent away we `move` and `scale` to the new
  // place.  The `fadeIn` is here because we may have already been
  // fading away when we got interrupted and told to go somewhere
  // new
  sentSprites.forEach(parallel(move, scale, fadeIn));

  // When we're being removed, fade away. This uses half duration so
  // it matches the background slide transition, which fades out for
  // half the duration and then fades in for the second half.
  removedSprites.forEach(sprite => fadeOut(sprite, { duration: duration / 2 }));
}
```

#### Lots of parallel
[`https://github.com/ef4/living-animation/blob/master/src/ui/components/moving-word/component.js`](https://github.com/ef4/living-animation/blob/master/src/ui/components/moving-word/component.js)

```js
transition: function * ({ sentSprites }) {
  sentSprites.forEach(
    parallel(
      move,
      compensateForScale,
      adjustCSS.property('font-size'),
      adjustCSS.property('letter-spacing'),
      adjustColor.property('color')
    )
  );
}
```

#### Complex example with lots of calculations, different manipulations, using yield and wait
[`https://github.com/ef4/living-animation/blob/master/src/ui/routes/affordances/index/controller.js`](https://github.com/ef4/living-animation/blob/master/src/ui/routes/affordances/index/controller.js)

```js
indexTransition: function * ({ sentSprites, receivedSprites, removedSprites, insertedSprites }) {
  if (sentSprites.length === 0 && receivedSprites.length === 0) {
    return;
  }

  let screenBounds = document.documentElement.getBoundingClientRect();
  let motionCenterX, motionCenterY;

  sentSprites.forEach(sprite => {
    motionCenterX = sprite.absoluteInitialBounds.left + sprite.absoluteInitialBounds.width / 2;
    motionCenterY = sprite.absoluteInitialBounds.top + sprite.absoluteInitialBounds.height / 2;

    // TODO: this is a workaround for an issue in ember-animated,
    // you shouldn't ever need to invoke this hook manually.
    arguments[0].onMotionStart(sprite);
  });

  let distances = new Map();

  removedSprites.forEach(sprite => {
    let centerX = sprite.absoluteInitialBounds.left + sprite.absoluteInitialBounds.width / 2;
    let centerY = sprite.absoluteInitialBounds.top + sprite.absoluteInitialBounds.height / 2;

    let dx = centerX - motionCenterX;
    let dy = centerY - motionCenterY;

    let distanceFromCenter = Math.sqrt(dx*dx + dy*dy);
    let magnify = awayDistance * screenBounds.width / distanceFromCenter;

    // our sprite's center and the screen's center form a line. We
    // want to aim for a place along that line far offscreen.
    sprite.endAtPixel({ x: magnify * dx,  y: magnify * dy });
    distances.set(sprite, distanceFromCenter);

    // TODO: this is a workaround for an issue in ember-animated,
    // you shouldn't ever need to invoke this hook manually.
    arguments[0].onMotionStart(sprite);
  });

  removedSprites.sort((a,b) => distances.get(b) - distances.get(a));
  for (let sprite of removedSprites) {
    move(sprite, { easing: easeIn });
    yield wait(perSpriteDelay);
  }

  sentSprites.concat(receivedSprites).forEach(sprite => {
    sprite.applyStyles({
      zIndex: 1
    });
    move(sprite);
    scale(sprite);
  });

  receivedSprites.forEach(sprite => {
    motionCenterX = sprite.absoluteFinalBounds.left + sprite.absoluteFinalBounds.width / 2;
    motionCenterY = sprite.absoluteFinalBounds.top + sprite.absoluteFinalBounds.height / 2;
  });


  distances = new Map();

  insertedSprites.forEach(sprite => {
    let centerX = sprite.absoluteFinalBounds.left + sprite.absoluteFinalBounds.width / 2;
    let centerY = sprite.absoluteFinalBounds.top + sprite.absoluteFinalBounds.height / 2;

    let dx = centerX - motionCenterX;
    let dy = centerY - motionCenterY;

    let distanceFromCenter = Math.sqrt(dx*dx + dy*dy);
    let magnify = awayDistance * screenBounds.width / distanceFromCenter;

    // our sprite's center and the screen's center form a line. We
    // want to aim for a place along that line far offscreen.
    sprite.startAtPixel({ x: magnify * dx,  y: magnify * dy });

    distances.set(sprite, distanceFromCenter);
  });

  insertedSprites.sort((a,b) => distances.get(a) - distances.get(b));
  for (let sprite of insertedSprites) {
    move(sprite, { easing: easeOut });
    yield wait(perSpriteDelay);
  }
}
```

#### Uses helper functions, groupBy, yielding promises and break
[`https://github.com/ef4/living-animation/blob/master/src/ui/routes/tutorial-12/controller.js`](https://github.com/ef4/living-animation/blob/master/src/ui/routes/tutorial-12/controller.js)

```js
import groupBy from 'lodash/groupBy';

export default Controller.extend({

  transition: function * ({ keptSprites,
                            removedSprites,
                            insertedSprites }) {

    yield Promise.all(removedSprites.map(fadeOut));

    keptSprites.forEach(sprite => {
      fadeIn(sprite);
      if (isMovingVertically(sprite)) {
        sprite.applyStyles({
          zIndex: 1
        });
      }
    });

    for (let row of groupIntoRows(keptSprites)) {
      if (offBottomOfScreen(row)) {
        break;
      }
      yield Promise.all(row.map(move));
    }

    insertedSprites.forEach(fadeIn);
  },

});

function isMovingVertically(sprite) {
  let change = sprite.initialBounds.top - sprite.finalBounds.top;
  return Math.abs(change) > 0.5;
}

function groupIntoRows(keptSprites) {
  return Object.values(
    groupBy(
      keptSprites,
      sprite => Math.floor(sprite.absoluteInitialBounds.top)
    )
  );
}

function offBottomOfScreen(row) {
  return row[0].absoluteInitialBounds.top > window.innerHeight &&
    row[0].absoluteFinalBounds.top > window.innerHeight;
}
```

#### Uses models, find and filtering
[`https://github.com/ef4/living-animation/blob/master/src/ui/routes/tutorial-24/controller.js`](https://github.com/ef4/living-animation/blob/master/src/ui/routes/tutorial-24/controller.js)

```js
transition: function * ({ keptSprites }) {
  let activeSprite = keptSprites.find(sprite => sprite.owner.value.dragState);
  let others = keptSprites.filter(sprite => sprite !== activeSprite);
  if (activeSprite) {
    drag(activeSprite, {
      others,
      onCollision(otherSprite) {
        let myModel = activeSprite.owner.value;
        let otherModel = otherSprite.owner.value;
        let myPriority = myModel.sortPriorityWithDefault;
        myModel.set('sortPriority', otherModel.sortPriorityWithDefault);
        otherModel.set('sortPriority', myPriority);
      }
    });
  }
  others.forEach(move);
}
```
