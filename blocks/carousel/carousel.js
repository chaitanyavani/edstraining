export default function decorate(block) {
  const slides = [...block.children].filter((child) => child && child.tagName !== 'SCRIPT');

  if (!slides.length) {
    return;
  }

  block.classList.add('carousel');

  const viewport = document.createElement('div');
  viewport.className = 'carousel-viewport';

  const track = document.createElement('div');
  track.className = 'carousel-track';

  slides.forEach((slide) => {
    slide.classList.add('carousel-slide');
    track.append(slide);
  });

  viewport.append(track);

  const controls = document.createElement('div');
  controls.className = 'carousel-controls';

  const prevButton = document.createElement('button');
  prevButton.type = 'button';
  prevButton.className = 'carousel-button carousel-button-prev';
  prevButton.setAttribute('aria-label', 'Previous slide');
  prevButton.textContent = '‹';

  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.className = 'carousel-button carousel-button-next';
  nextButton.setAttribute('aria-label', 'Next slide');
  nextButton.textContent = '›';

  const dots = document.createElement('div');
  dots.className = 'carousel-dots';

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    if (index === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => {
      currentIndex = index;
      updateCarousel();
    });
    dots.append(dot);
  });

  controls.append(prevButton, dots, nextButton);
  block.replaceChildren(viewport, controls);

  let currentIndex = 0;
  const dotButtons = [...dots.children];

  function updateCarousel() {
    const offset = currentIndex * -100;
    track.style.transform = `translateX(${offset}%)`;

    dotButtons.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === currentIndex);
    });

    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === slides.length - 1;
  }

  prevButton.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      updateCarousel();
    }
  });

  nextButton.addEventListener('click', () => {
    if (currentIndex < slides.length - 1) {
      currentIndex += 1;
      updateCarousel();
    }
  });

  updateCarousel();
}
