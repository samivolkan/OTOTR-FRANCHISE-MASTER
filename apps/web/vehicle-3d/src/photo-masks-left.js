// Hand-traced against the exact, unmodified 1072 × 586 reference photographs.
// These paths expose source pixels only. They are not segmentation for another
// vehicle/frame and must never be applied to customer photographs by filename.
// Windows, wheels and occluded/back-facing panels are deliberately not inferred.
export const LEFT_PHOTO_MASKS = {
  16: {
    frame: 16, width: 1072, height: 586,
    parts: [
      { id: 'roof', path: 'M383 87 Q448 49 525 41 Q608 35 673 40 L672 46 Q610 44 547 55 Q465 65 390 89 Z', anchor: [545, 46], offset: [0, -65] },
      { id: 'left_front_fender', path: 'M174 222 L241 201 L263 207 Q252 246 257 286 L273 373 L249 370 C247 332 229 289 205 278 C175 264 153 289 144 329 L142 351 L140 341 L144 295 Q149 256 161 235 Z', anchor: [205, 246], offset: [-62, -8] },
      { id: 'left_front_door', path: 'M276 204 L506 180 L497 349 Q494 382 475 387 L278 376 Q258 313 259 259 Q257 227 276 204 Z', anchor: [382, 283], offset: [-66, 20] },
      { id: 'left_rear_fender', path: 'M509 178 L705 166 L708 194 Q716 225 739 239 L672 291 C639 276 604 285 584 310 C560 338 552 378 558 429 L536 424 L498 413 L500 350 Z', anchor: [591, 229], offset: [-25, -34] },
      { id: 'left_sill', path: 'M258 383 L490 394 L556 421 L560 434 L491 422 L259 397 Z', anchor: [408, 404], offset: [-27, 59] },
      { id: 'left_mirror', path: 'M257 165 Q269 155 291 157 L298 162 L297 183 L293 194 L269 195 L255 188 Z', anchor: [278, 177], offset: [-42, -33] },
      { id: 'rear_glass', path: 'M715 67 Q741 50 813 53 Q862 50 889 67 Q930 103 965 157 L713 158 Q705 114 715 67 Z', anchor: [826, 112], offset: [31, -54] },
      { id: 'trunk', path: 'M714 166 L973 166 L994 193 L997 239 L850 247 Q834 220 818 210 Q780 190 715 190 Z', anchor: [907, 201], offset: [67, -25] },
      { id: 'rear_bumper', path: 'M744 244 Q790 264 847 253 L1019 243 Q1041 265 1043 328 L1042 380 Q1023 398 976 406 L951 418 L882 429 Q820 435 775 433 L755 429 Q739 420 735 399 L722 353 Q708 319 677 299 Z', anchor: [913, 328], offset: [62, 43] },
    ],
  },
  19: {
    frame: 19, width: 1072, height: 586,
    parts: [
      { id: 'hood', path: 'M146 219 Q189 196 248 185 L285 186 L263 210 L147 226 Z', anchor: [213, 204], offset: [-46, -53] },
      { id: 'roof', path: 'M449 83 Q500 52 565 47 Q687 40 791 50 L849 57 L846 66 L796 60 Q685 52 578 62 Q511 65 449 83 Z', anchor: [655, 52], offset: [0, -63] },
      { id: 'left_front_fender', path: 'M145 231 L363 207 L354 279 Q352 331 373 394 L337 395 C344 349 324 306 282 284 C239 262 191 277 159 308 C137 334 128 364 128 397 L116 395 Q112 347 136 310 L157 301 L123 260 Z', anchor: [256, 249], offset: [-58, -21] },
      { id: 'left_front_door', path: 'M368 205 L731 182 Q751 215 749 268 L733 339 Q732 379 707 383 Q548 395 377 394 C367 358 351 314 358 272 Z', anchor: [541, 286], offset: [0, 64] },
      { id: 'left_rear_fender', path: 'M737 182 L948 171 L969 192 L979 223 L1010 254 L1021 279 Q1045 310 1047 350 L1015 357 C1014 327 1004 299 977 284 C939 258 885 270 851 294 C826 316 815 352 815 389 L722 390 Q740 374 745 333 L753 274 Q756 224 737 182 Z', anchor: [838, 237], offset: [63, -23] },
      { id: 'left_sill', path: 'M338 400 L810 397 L811 413 L786 414 L780 409 L338 418 Z', anchor: [568, 408], offset: [0, 79] },
      { id: 'left_mirror', path: 'M370 159 Q388 150 402 151 Q412 151 416 160 L422 180 L419 192 Q400 199 376 195 L369 184 Z', anchor: [397, 174], offset: [-30, -48] },
      { id: 'front_bumper', path: 'M116 264 L154 302 C135 325 127 357 126 395 L128 424 Q75 428 40 409 L36 394 L40 346 L43 305 L50 293 L48 283 L59 275 Z', anchor: [80, 369], offset: [-62, 29] },
    ],
  },
  22: {
    frame: 22, width: 1072, height: 586,
    parts: [
      { id: 'hood', path: 'M123 236 Q183 204 270 183 Q390 181 514 196 L504 217 L399 235 L396 228 Q390 222 379 227 Q344 230 298 245 L271 257 Q187 261 115 251 Z', anchor: [314, 214], offset: [-26, -62] },
      { id: 'roof', path: 'M454 72 Q521 53 636 53 Q730 51 791 69 L779 72 Q699 60 638 69 L624 69 Q531 67 471 73 Z', anchor: [644, 60], offset: [4, -62] },
      { id: 'windshield', path: 'M275 175 L365 106 Q414 81 471 74 L621 71 Q610 80 599 94 L532 180 Q413 173 275 175 Z', anchor: [444, 130], offset: [-23, -45] },
      { id: 'left_front_fender', path: 'M402 242 L507 220 L590 205 L600 402 L575 410 C581 377 576 347 558 321 C539 294 514 285 487 291 C457 299 435 320 423 349 C411 379 405 415 402 460 L396 461 L408 405 L447 319 L394 286 Q402 266 402 242 Z', anchor: [527, 261], offset: [-53, -12] },
      { id: 'left_front_door', path: 'M595 204 L805 182 Q831 226 837 280 Q840 324 823 353 Q819 364 806 368 Q733 386 605 403 Z', anchor: [711, 286], offset: [57, 29] },
      { id: 'left_rear_fender', path: 'M810 182 L907 175 Q932 188 944 212 Q964 246 970 282 L970 325 L964 327 Q964 285 939 272 Q915 258 893 285 Q878 311 877 341 L825 353 Q839 312 838 282 Q835 224 810 182 Z', anchor: [871, 234], offset: [65, -15] },
      { id: 'left_sill', path: 'M607 408 L866 363 L861 382 L579 430 L580 422 L607 417 Z', anchor: [727, 400], offset: [35, 68] },
      { id: 'left_mirror', path: 'M598 155 Q628 142 666 155 Q680 160 682 176 L677 188 L617 194 L597 182 Z', anchor: [639, 172], offset: [25, -54] },
      { id: 'front_bumper', path: 'M69 301 Q136 313 215 311 L249 293 Q316 304 390 289 L444 320 L407 404 L398 463 Q319 474 244 466 L179 449 L89 433 L68 423 L60 404 L66 384 Z', anchor: [247, 395], offset: [-51, 48] },
    ],
  },
};
