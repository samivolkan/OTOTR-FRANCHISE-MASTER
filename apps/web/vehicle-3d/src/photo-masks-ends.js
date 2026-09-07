/**
 * Contours traced against the unmodified 1072 × 586 reference photographs.
 * These are visible photographic surfaces, not reconstructed 3D geometry.
 * Left/right IDs follow the vehicle's direction of travel.
 * A mask is specific to its source frame and must never be reused on uploads.
 */
export const END_PHOTO_MASKS = {
  1: {
    frame: 1,
    width: 1072,
    height: 586,
    parts: [
      {
        id: 'hood',
        path: 'M 337 189 C 411 178 691 178 768 188 L 765 214 C 749 221 735 233 720 246 L 697 262 C 603 265 493 265 409 262 C 389 251 375 242 360 229 L 328 216 Z',
        anchor: [550, 222],
        offset: [0, -66],
      },
      {
        id: 'windshield',
        path: 'M 406 76 C 467 69 645 69 703 77 C 724 99 750 142 763 179 C 673 175 444 176 342 181 C 355 145 380 99 406 76 Z',
        anchor: [553, 130],
        offset: [0, -89],
      },
      {
        id: 'front_bumper',
        path: 'M 296 279 C 305 290 335 297 373 298 C 396 299 405 291 410 279 L 411 266 L 694 266 C 689 282 696 295 719 299 C 758 302 790 289 801 279 C 817 306 827 335 826 368 L 820 424 C 819 445 810 457 794 464 C 778 472 757 474 741 471 L 702 463 L 397 463 C 375 471 355 475 333 471 C 306 467 290 457 284 439 L 279 405 C 274 358 274 319 296 279 Z',
        anchor: [550, 362],
        offset: [0, 68],
      },
      {
        id: 'left_mirror',
        path: 'M 780 156 C 792 148 809 156 821 161 C 829 165 833 173 832 183 L 830 189 C 817 194 797 195 779 192 L 775 177 Z',
        anchor: [804, 176],
        offset: [77, -17],
      },
      {
        id: 'right_mirror',
        path: 'M 331 152 C 324 147 309 153 297 158 C 287 162 281 169 282 179 L 283 184 C 290 190 309 193 328 191 L 334 177 Z',
        anchor: [307, 174],
        offset: [-77, -17],
      },
    ],
  },
  13: {
    frame: 13,
    width: 1072,
    height: 586,
    parts: [
      {
        id: 'trunk',
        path: 'M 313 163 C 417 166 650 166 744 163 L 764 190 C 733 193 709 202 697 216 C 689 226 686 238 682 250 L 558 252 C 552 261 517 261 511 252 L 377 250 C 373 235 370 221 358 211 C 342 200 318 195 295 190 Z',
        anchor: [533, 212],
        offset: [0, -54],
      },
      {
        id: 'rear_glass',
        path: 'M 376 59 C 433 53 632 54 689 61 C 710 83 727 118 737 157 C 631 158 433 158 322 157 C 331 122 350 82 376 59 Z',
        anchor: [531, 115],
        offset: [0, -89],
      },
      {
        id: 'rear_bumper',
        path: 'M 270 263 C 294 271 335 273 376 271 L 688 271 C 730 273 771 270 794 262 C 810 292 817 327 815 363 L 811 395 C 809 417 800 426 783 430 L 755 432 C 752 416 748 406 735 399 C 724 393 707 391 686 391 L 371 391 C 347 391 332 396 321 405 C 312 413 308 422 305 431 L 283 429 C 262 426 251 416 249 398 L 246 371 C 243 330 251 291 270 263 Z',
        anchor: [531, 328],
        offset: [0, 76],
      },
    ],
  },
};
