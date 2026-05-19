// treato.js — Easter egg: throw a bone, watch a dog fetch it

export function triggerTreato() {
  if (document.getElementById('treato-overlay')) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Dog comes from a random horizontal edge; bone comes from the opposite edge
  const fromLeft = Math.random() < 0.5;

  // Bone lands somewhere in the middle 40% of the viewport
  const landX     = vw * (0.30 + Math.random() * 0.40);
  const landY     = vh * (0.30 + Math.random() * 0.30);
  const arcHeight = vh * 0.28;

  // Bone origin: offscreen on the side opposite the dog
  const boneStartX = fromLeft ? vw + 20 : -40;
  const boneStartY = vh * (0.05 + Math.random() * 0.15);

  // Dog rests just beside the bone, on the side it arrived from
  const dogRestX  = fromLeft ? landX - 55 : landX + 10;
  // Dog starts fully offscreen
  const dogStartX = fromLeft ? -70 : vw + 20;
  const dogY      = landY - 15;

  // ── Build DOM ─────────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = 'treato-overlay';
  Object.assign(overlay.style, {
    position:      'fixed',
    inset:         '0',
    pointerEvents: 'none',
    zIndex:        '9999',
    overflow:      'hidden',
  });

  // Bone: placed at its landing spot; animated from the edge via transform
  const bone = document.createElement('span');
  bone.textContent = '🦴'; // 🦴
  bone.setAttribute('aria-hidden', 'true');
  Object.assign(bone.style, {
    position:   'absolute',
    left:       `${landX}px`,
    top:        `${landY}px`,
    fontSize:   '2rem',
    display:    'inline-block',
    userSelect: 'none',
  });

  // Dog wrapper: handles all horizontal movement via transform
  const dogWrap = document.createElement('div');
  Object.assign(dogWrap.style, {
    position:   'absolute',
    left:       '0',
    top:        `${dogY}px`,
    display:    'inline-block',
    lineHeight: '1',
    transform:  `translateX(${dogStartX}px)`, // start offscreen
  });

  // Dog inner: holds the emoji; its base transform is the scaleX flip.
  // Bounce and wag animations use composite:'add' so they layer on top.
  const dogInner = document.createElement('span');
  dogInner.textContent = '🐕'; // 🐕
  dogInner.setAttribute('aria-hidden', 'true');
  Object.assign(dogInner.style, {
    display:         'inline-block',
    fontSize:        '2.5rem',
    userSelect:      'none',
    transformOrigin: 'center bottom',
    transform:       fromLeft ? 'scaleX(1)' : 'scaleX(-1)',
  });

  dogWrap.append(dogInner);
  overlay.append(bone, dogWrap);
  document.body.append(overlay);

  const ease = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

  // ── 1. Arc the bone from its edge to the landing spot ─────────────
  // Because bone.style.left/top is already at landX/landY, we animate
  // from a large negative offset back to translate(0,0). No fill needed —
  // the final state IS the element's natural position.
  const bxOff = boneStartX - landX;
  const byOff = boneStartY - landY;

  bone.animate([
    { transform: `translate(${bxOff}px, ${byOff}px) rotate(0deg)` },
    { transform: `translate(${bxOff * 0.5}px, ${-arcHeight}px) rotate(200deg)`, offset: 0.45 },
    { transform: 'translate(0, 0) rotate(400deg)' },
  ], { duration: 850, easing: 'ease-in' });

  // ── 2. Dog runs in 250 ms after bone is already flying ────────────
  const travelDist  = Math.abs(dogRestX - dogStartX);
  const runDuration = Math.max(400, Math.min(800, travelDist * 1.2));

  setTimeout(() => {
    const runAnim = dogWrap.animate([
      { transform: `translateX(${dogStartX}px)` },
      { transform: `translateX(${dogRestX}px)` },
    ], { duration: runDuration, easing: ease, fill: 'forwards' });

    // Vertical bounce layered on top of the scaleX base via composite:'add'
    const bounceAnim = dogInner.animate([
      { transform: 'translateY(0)' },
      { transform: 'translateY(-7px)' },
      { transform: 'translateY(0)' },
    ], {
      duration:   180,
      iterations: Math.ceil(runDuration / 180) + 2,
      easing:     'ease-in-out',
      composite:  'add',
    });
    // Suppress the AbortError that fires when we cancel this below
    bounceAnim.finished.catch(() => {});

    // ── 3. Dog arrives → grab bone → wag → leave ──────────────────
    runAnim.finished.then(() => {
      bounceAnim.cancel();

      // Pop bone away (dog grabbed it)
      bone.animate([
        { transform: 'scale(1)',   opacity: 1 },
        { transform: 'scale(2.5)', opacity: 0 },
      ], { duration: 220, easing: 'ease-out', fill: 'forwards' })
        .finished.then(() => bone.remove());

      // Tail wag, composited on top of scaleX
      const wagAnim = dogInner.animate([
        { transform: 'rotate(0deg)'  },
        { transform: 'rotate(-15deg)' },
        { transform: 'rotate(15deg)'  },
        { transform: 'rotate(-15deg)' },
        { transform: 'rotate(15deg)'  },
        { transform: 'rotate(-8deg)'  },
        { transform: 'rotate(0deg)'  },
      ], { duration: 750, easing: 'ease-in-out', composite: 'add' });

      wagAnim.finished.then(() => {
        // Trot off whichever side the dog came from
        const exitX = fromLeft ? vw + 100 : -100;

        const exitAnim = dogWrap.animate([
          { transform: `translateX(${dogRestX}px)` },
          { transform: `translateX(${exitX}px)` },
        ], { duration: 550, easing: ease, fill: 'forwards' });

        const exitBounce = dogInner.animate([
          { transform: 'translateY(0)' },
          { transform: 'translateY(-7px)' },
          { transform: 'translateY(0)' },
        ], {
          duration:   180,
          iterations: Math.ceil(550 / 180) + 1,
          easing:     'ease-in-out',
          composite:  'add',
        });
        exitBounce.finished.catch(() => {});

        exitAnim.finished.then(() => overlay.remove());
      });
    });
  }, 250);
}
