"use strict";

let currentSlideIndex = 0;

function positiveRemainderAfterDivision(number, divider) {
  return ((number % divider) + divider) % divider;
}

window.onload = function() {
  const slides = document.querySelectorAll(".carousel-slide");

  slides.forEach((slideElement, index) => {
    slideElement.style.transform = `translateX(${index * 100}%)`;
  });

  const nextSlideButton = document.querySelector(".carousel-btn-next");

  nextSlideButton.addEventListener("click", function(event) {
    currentSlideIndex = positiveRemainderAfterDivision(currentSlideIndex + 1, slides.length);

    slides.forEach((slideElement, index) => {
      slideElement.style.transform = `translateX(${100 * (index - currentSlideIndex)}%)`;
    });
  });

  const previousSlideButton = document.querySelector(".carousel-btn-prev");

  previousSlideButton.addEventListener("click", function(event) {
    currentSlideIndex = positiveRemainderAfterDivision(currentSlideIndex - 1, slides.length);

    slides.forEach((slideElement, index) => {
      slideElement.style.transform = `translateX(${100 * (index - currentSlideIndex)}%)`;
    });
  });
};
