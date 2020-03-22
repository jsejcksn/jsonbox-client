mv ./dist/index.cjs.js ./dist/index.cjs \
  && mv ./dist/index.js.js ./dist/index.js \
  && mv ./dist/index.mjs.js ./dist/index.mjs \
  && mv ./dist/index.js.d.ts ./dist/index.d.ts \
  && rm ./dist/index.cjs.d.ts \
  && rm ./dist/index.mjs.d.ts
