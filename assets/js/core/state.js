// assets/js/core/state.js

export const state = {
  products: [],
  visibleProducts: [],
  batchSize: 20,
  cursor: 0,
  mode: "normal" // normal | random
};

export function setProducts(list) {
  state.products = list;
  state.visibleProducts = [];
  state.cursor = 0;
  state.mode = "normal";
}

export function getNextBatch() {
  const start = state.cursor;
  const end = start + state.batchSize;
  const batch = state.products.slice(start, end);

  state.cursor = end;
  state.visibleProducts.push(...batch);

  // সব product শেষ হলে → random mode
  if (state.cursor >= state.products.length) {
    state.mode = "random";
  }

  return batch;
}

export function getRandomBatch() {
  const shuffled = [...state.products].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, state.batchSize);
}
