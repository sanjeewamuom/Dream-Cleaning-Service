document.querySelector(".icon-menu").addEventListener("click", function (event) {
  event.preventDefault();
  document.body.classList.toggle("menu-open");
});

const spollerButtons = document.querySelectorAll("[data-spoller] .spollers-faq__button");

spollerButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const currentItem = button.closest("[data-spoller]");
    const content = currentItem.querySelector(".spollers-faq__text");

    const parent = currentItem.parentNode;
    const isOneSpoller = parent.hasAttribute("data-one-spoller");

    if (isOneSpoller) {
      const allItems = parent.querySelectorAll("[data-spoller]");
      allItems.forEach((item) => {
        if (item !== currentItem) {
          const otherContent = item.querySelector(".spollers-faq__text");
          item.classList.remove("active");
          otherContent.style.maxHeight = null;
        }
      });
    }

    if (currentItem.classList.contains("active")) {
      currentItem.classList.remove("active");
      content.style.maxHeight = null;
    } else {
      currentItem.classList.add("active");
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
});

const carousel = document.querySelector("[data-results-carousel]");

if (carousel) {
  const track = carousel.querySelector("[data-carousel-track]");
  const slides = track ? Array.from(track.querySelectorAll(".results-carousel__slide")) : [];
  const prevButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const autoplayDelay = 3800;
  const swipeThreshold = 50;

  let currentIndex = 0;
  let trackBaseOffset = 0;
  let slideWidth = 0;
  let slideGap = 0;
  let viewportPaddingLeft = 0;
  let viewportInnerWidth = 0;
  let dragDistance = 0;
  let dragStartX = 0;
  let isDragging = false;
  let autoplayTimer = null;
  let isInitialized = false;

  const getLoopIndex = (index) => {
    const count = slides.length;
    return (index + count) % count;
  };

  const updateSlideStates = () => {
    const prevIndex = getLoopIndex(currentIndex - 1);
    const nextIndex = getLoopIndex(currentIndex + 1);

    slides.forEach((slide, index) => {
      slide.classList.remove("is-active", "is-adjacent");
      if (index === currentIndex) slide.classList.add("is-active");
      if (index === prevIndex || index === nextIndex) slide.classList.add("is-adjacent");
    });
  };

  const updateTrackOffset = (offset = 0) => {
    track.style.setProperty("--track-offset", `${trackBaseOffset}px`);
    track.style.setProperty("--drag-offset", `${offset}px`);
  };

  const measure = () => {
    if (!slides.length) return;
    const viewportStyles = getComputedStyle(carousel);
    const paddingLeft = parseFloat(viewportStyles.paddingLeft) || 0;
    const paddingRight = parseFloat(viewportStyles.paddingRight) || 0;
    viewportPaddingLeft = paddingLeft;
    viewportInnerWidth = carousel.clientWidth - paddingLeft - paddingRight;
    slideWidth = slides[0].offsetWidth;
    const trackStyles = getComputedStyle(track);
    slideGap = parseFloat(trackStyles.gap) || 0;
  };

  const getBaseOffsetForIndex = (index) => {
    const step = slideWidth + slideGap;
    return viewportPaddingLeft + viewportInnerWidth / 2 - slideWidth / 2 - index * step;
  };

  const realign = () => {
    if (!slides.length) return;
    measure();
    trackBaseOffset = getBaseOffsetForIndex(currentIndex);
    updateTrackOffset(0);
  };

  const initializeCarousel = () => {
    if (isInitialized) return;
    currentIndex = 0;
    updateSlideStates();
    realign();
    track.classList.add("is-ready");
    startAutoplay();
    isInitialized = true;
  };

  const goToSlide = (index) => {
    currentIndex = getLoopIndex(index);
    updateSlideStates();
    realign();
  };

  const pauseAutoplay = () => {
    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  const startAutoplay = () => {
    pauseAutoplay();
    autoplayTimer = window.setInterval(() => {
      goToSlide(currentIndex + 1);
    }, autoplayDelay);
  };

  const onPointerDown = (event) => {
    if (event.target.closest(".results-carousel__arrow")) return;
    isDragging = true;
    dragStartX = event.clientX;
    dragDistance = 0;
    track.classList.add("is-dragging");
    carousel.setPointerCapture(event.pointerId);
    pauseAutoplay();
  };

  const onPointerMove = (event) => {
    if (!isDragging) return;
    dragDistance = event.clientX - dragStartX;
    updateTrackOffset(dragDistance);
  };

  const onPointerUp = (event) => {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove("is-dragging");
    if (carousel.hasPointerCapture(event.pointerId)) {
      carousel.releasePointerCapture(event.pointerId);
    }

    if (Math.abs(dragDistance) > swipeThreshold) {
      goToSlide(dragDistance < 0 ? currentIndex + 1 : currentIndex - 1);
    } else {
      realign();
    }

    startAutoplay();
  };

  if (track && slides.length && prevButton && nextButton) {
    prevButton.addEventListener("click", () => {
      goToSlide(currentIndex - 1);
      startAutoplay();
    });

    nextButton.addEventListener("click", () => {
      goToSlide(currentIndex + 1);
      startAutoplay();
    });

    carousel.addEventListener("pointerdown", onPointerDown);
    carousel.addEventListener("pointermove", onPointerMove);
    carousel.addEventListener("pointerup", onPointerUp);
    carousel.addEventListener("pointercancel", onPointerUp);

    carousel.addEventListener("mouseenter", pauseAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);

    window.addEventListener("resize", () => {
      realign();
    });

    initializeCarousel();
  }
}
