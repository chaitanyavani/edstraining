function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  if (!block) return;

  const slideIndex = Number.parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = String(slideIndex);

  const slides = block.querySelectorAll('.carousel-slide');
  slides.forEach((aSlide, idx) => {
    const isActive = idx === slideIndex;
    aSlide.setAttribute('aria-hidden', String(!isActive));

    aSlide.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach((focusable) => {
      if (isActive) {
        focusable.removeAttribute('tabindex');
      } else {
        focusable.setAttribute('tabindex', '-1');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    if (!button) return;

    const isActive = idx === slideIndex;
    button.disabled = isActive;
    button.setAttribute('aria-pressed', String(isActive));
    if (isActive) {
      button.setAttribute('aria-current', 'true');
    } else {
      button.removeAttribute('aria-current');
    }
  });
}

function showSlide(block, slideIndex = 0) {
  if (!block) return;

  const slides = block.querySelectorAll('.carousel-slide');
  if (!slides.length) return;

  let realSlideIndex = slideIndex;
  if (realSlideIndex < 0) realSlideIndex = slides.length - 1;
  if (realSlideIndex >= slides.length) realSlideIndex = 0;

  const activeSlide = slides[realSlideIndex];
  const slidesWrapper = block.querySelector('.carousel-slides');
  if (!slidesWrapper || !activeSlide) return;

  block.dataset.activeSlide = String(realSlideIndex);
  updateActiveSlide(activeSlide);

  slidesWrapper.scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (slideIndicators) {
    slideIndicators.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', (event) => {
        const slideIndicator = event.currentTarget.parentElement;
        if (!slideIndicator) return;
        showSlide(block, Number.parseInt(slideIndicator.dataset.targetSlide, 10));
      });
    });
  }

  const prevButton = block.querySelector('.slide-prev');
  const nextButton = block.querySelector('.slide-next');

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      const currentIndex = Number.parseInt(block.dataset.activeSlide || '0', 10);
      showSlide(block, currentIndex - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      const currentIndex = Number.parseInt(block.dataset.activeSlide || '0', 10);
      showSlide(block, currentIndex + 1);
    });
  }

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updateActiveSlide(entry.target);
      }
    });
  }, { threshold: 0.5 });

  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = String(slideIndex);
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(colIdx === 0 ? 'carousel-slide-image' : 'carousel-slide-content');
    slide.append(column);
  });

  const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading && !heading.id) {
    heading.id = `carousel-${carouselId}-heading-${slideIndex}`;
  }

  if (heading && heading.id) {
    slide.setAttribute('aria-labelledby', heading.id);
  }

  return slide;
}

let carouselId = 0;

export default function decorate(block) {
  if (!block) return;

  const rows = [...block.children].filter((child) => child && child.tagName !== 'SCRIPT');
  if (!rows.length) return;

  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  block.classList.add('carousel');
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');

  const isSingleSlide = rows.length < 2;
  let slideIndicators;

  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', 'Carousel slide controls');

    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="Previous slide"></button>
      <button type="button" class="slide-next" aria-label="Next slide"></button>
    `;
    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = String(idx);
      indicator.innerHTML = `<button type="button" aria-label="Show slide ${idx + 1}"></button>`;
      slideIndicators.append(indicator);
    }

    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  const firstSlide = slidesWrapper.querySelector('.carousel-slide');
  if (firstSlide) {
    block.dataset.activeSlide = '0';
    updateActiveSlide(firstSlide);
  }

  if (!isSingleSlide) {
    bindEvents(block);
    showSlide(block, 0);
  }
}
