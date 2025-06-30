let tl = gsap.timeline();
tl.from(".logo,.nav-links li", {
  y: -50,
  stagger: 0.2,
  duration: 0.5,
  opacity: 0,
});
tl.from(".login-btn", {
  y: 50,
  rotate: 720,
  stagger: 0.2,
  duration: 0.5,
  opacity: 0,
});
tl.from(".cart-btn", {
  x: -500,
  rotate: 1440,
  stagger: 0.2,
  duration: 0.5,
  opacity: 0,
});
tl.from(".txt-area h2", {
  x: 300,
  opacity: 0,
  scale: 1.1,
  stagger: 0.3,
});
tl.from(".rocket", {
  y: 300,
  opacity: 0,
  scale: 1.1,
  stagger: 0.3,
});
