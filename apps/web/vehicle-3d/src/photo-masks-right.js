/**
 * Hand-traced visible panel boundaries in the original Opel ADAM S reference
 * photographs: public/real-car/frame-04.jpg, frame-07.jpg and frame-10.jpg.
 * Coordinates are source pixels (1072 × 586), not normalized car geometry.
 * These masks belong ONLY to these exact reference frames. Never reuse them
 * for another vehicle, another camera angle, or an uploaded customer photo.
 * A clipped part contains original photograph pixels; no hidden surface is
 * reconstructed. Door masks exclude glazing and fender masks exclude tyres.
 */
export const RIGHT_PHOTO_MASKS = {
  4: {
    frame: 4, width: 1072, height: 586,
    parts: [
      {
        id: 'hood',
        path: 'M579 188 C654 173 762 175 832 183 C889 189 947 201 979 219 L986 250 C948 259 902 258 855 256 L777 239 C746 226 721 217 705 222 L696 235 L591 214 Z',
        anchor: [780, 215], offset: [41, -75],
      },
      {
        id: 'right_front_door',
        path: 'M290 180 L505 203 L493 397 C415 386 352 375 294 361 C276 356 266 349 262 334 C253 304 257 260 266 224 C272 205 281 189 290 180 Z',
        anchor: [383, 283], offset: [-20, 72],
      },
      {
        id: 'right_front_fender',
        path: 'M510 205 L590 217 L693 238 C689 257 700 276 720 284 L650 309 C629 288 609 285 590 288 C550 292 521 330 518 379 L519 405 L496 401 L497 399 Z',
        anchor: [569, 254], offset: [38, 51],
      },
      {
        id: 'right_rear_fender',
        path: 'M194 170 L286 180 C276 194 269 211 265 230 C256 264 255 304 261 331 C264 343 267 350 274 355 L246 349 C241 310 225 274 199 263 C181 255 165 259 154 271 C141 286 135 304 134 326 C129 303 134 275 143 249 L159 208 L165 194 Z',
        anchor: [220, 222], offset: [-67, 8],
      },
      {
        id: 'right_sill',
        path: 'M246 352 C317 374 415 390 518 407 L524 428 C431 410 332 394 245 381 L235 373 C239 366 243 359 246 352 Z',
        anchor: [373, 390], offset: [-5, 91],
      },
      {
        id: 'front_bumper',
        path: 'M652 313 L721 289 C758 301 808 299 845 291 C850 282 849 275 847 268 L855 259 C902 261 951 261 982 252 L984 245 C1000 260 1018 281 1027 300 L1030 390 C1040 405 1038 425 1025 441 C943 466 817 476 706 461 L693 451 C687 399 676 347 652 313 Z',
        anchor: [880, 376], offset: [91, 39],
      },
      {
        id: 'right_mirror',
        path: 'M417 160 C435 149 463 145 479 150 C490 153 496 160 498 168 L494 180 L503 185 L509 185 L509 194 L486 197 L435 188 L417 181 C413 175 413 167 417 160 Z',
        anchor: [456, 169], offset: [-17, -65],
      },
      {
        id: 'windshield',
        path: 'M478 73 C543 67 614 73 655 86 C715 107 777 143 825 178 L573 181 C555 155 536 125 511 99 Z',
        anchor: [650, 128], offset: [24, -74],
      },
    ],
  },
  7: {
    frame: 7, width: 1072, height: 586,
    parts: [
      {
        id: 'right_front_door',
        path: 'M363 178 L719 204 C729 241 736 281 730 319 L713 392 L414 385 C386 384 368 375 360 354 C346 316 341 265 347 233 C350 212 356 192 363 178 Z',
        anchor: [541, 280], offset: [0, 66],
      },
      {
        id: 'right_front_fender',
        path: 'M723 206 L826 216 L941 233 C945 251 956 263 971 270 L916 313 C895 289 875 281 852 283 C807 284 769 318 756 357 L749 394 L716 392 C736 320 738 269 723 206 Z',
        anchor: [798, 251], offset: [47, -24],
      },
      {
        id: 'right_rear_fender',
        path: 'M145 165 L360 178 C356 199 347 221 346 249 C344 286 348 331 358 353 C365 374 380 382 400 385 L279 390 L277 353 C269 310 240 280 194 274 C164 270 139 276 118 287 L88 247 C103 232 116 212 127 192 Z',
        anchor: [257, 243], offset: [-56, -19],
      },
      {
        id: 'right_sill',
        path: 'M280 393 L714 396 L749 398 L748 417 L280 409 Z',
        anchor: [515, 403], offset: [0, 86],
      },
      {
        id: 'front_bumper',
        path: 'M973 273 C998 278 1020 283 1032 294 L1036 318 L1041 369 C1044 391 1035 414 1022 421 L954 426 L950 399 C950 365 937 335 918 315 Z',
        anchor: [990, 350], offset: [72, 13],
      },
      {
        id: 'rear_bumper',
        path: 'M85 247 L116 282 C92 302 75 333 71 365 L72 389 L58 386 C46 382 38 378 34 371 L38 349 C30 320 35 280 41 261 L58 246 L78 230 Z',
        anchor: [53, 316], offset: [-57, 28],
      },
      {
        id: 'right_mirror',
        path: 'M658 163 C666 150 681 147 695 153 L711 160 C718 165 719 174 715 184 L710 191 L718 194 L719 200 L675 197 L657 190 C652 184 653 171 658 163 Z',
        anchor: [684, 174], offset: [20, -66],
      },
      {
        id: 'hood',
        path: 'M800 186 C823 181 846 185 871 193 L913 207 L938 220 L941 231 L827 213 Z',
        anchor: [875, 207], offset: [36, -63],
      },
    ],
  },
  10: {
    frame: 10, width: 1072, height: 586,
    parts: [
      {
        id: 'trunk',
        path: 'M103 164 L352 165 L347 188 C289 190 248 208 231 242 L217 248 L72 245 L76 215 C81 193 91 176 103 164 Z',
        anchor: [179, 208], offset: [-53, -41],
      },
      {
        id: 'rear_glass',
        path: 'M201 63 C248 51 308 51 335 58 C353 72 365 99 352 159 L111 159 C134 129 164 88 201 63 Z',
        anchor: [253, 113], offset: [-42, -79],
      },
      {
        id: 'rear_bumper',
        path: 'M50 246 L216 252 C260 268 301 251 325 237 L386 292 C348 308 321 344 310 382 L297 428 C273 436 246 413 218 408 L65 391 L31 380 L28 362 C26 321 35 278 50 246 Z',
        anchor: [173, 327], offset: [-78, 35],
      },
      {
        id: 'right_rear_fender',
        path: 'M356 165 L553 182 L562 291 L566 355 C567 370 571 381 580 388 L508 405 C515 375 497 328 465 300 C443 282 412 281 389 291 L328 234 C343 214 350 191 356 165 Z',
        anchor: [445, 226], offset: [-37, 51],
      },
      {
        id: 'right_front_door',
        path: 'M557 184 L791 200 C805 231 817 267 815 307 C813 331 806 356 795 374 L598 387 C579 388 570 377 569 354 L564 264 Z',
        anchor: [686, 279], offset: [43, 55],
      },
      {
        id: 'right_front_fender',
        path: 'M795 201 L851 212 L895 226 C924 245 936 281 932 321 L925 325 C919 293 905 275 884 272 C853 269 830 304 819 344 L812 373 L798 374 C817 329 822 303 813 262 Z',
        anchor: [858, 245], offset: [73, -16],
      },
      {
        id: 'right_sill',
        path: 'M508 407 L581 392 L796 378 L814 377 L809 394 L508 426 Z',
        anchor: [668, 403], offset: [17, 85],
      },
      {
        id: 'right_mirror',
        path: 'M781 155 C787 151 797 154 803 159 L811 172 L808 188 L794 198 L777 193 L774 174 C775 163 777 158 781 155 Z',
        anchor: [792, 175], offset: [46, -53],
      },
      {
        id: 'right_c_pillar',
        path: 'M360 55 C383 43 415 42 459 46 L467 55 C439 63 420 92 398 129 L362 129 C365 101 364 75 360 55 Z',
        anchor: [391, 89], offset: [-10, -69],
      },
    ],
  },
};
