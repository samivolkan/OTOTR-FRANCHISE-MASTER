// This UV layout belongs to one prepared reference car. Never infer a match
// from a customer vehicle's make, body profile, photo angle or file name.
export const PHOTO_BODY_FRAMES = Object.freeze([1, 7, 13, 19]);
export function photoBodyReference(presentation) {
  if (presentation?.kind !== 'demo' || presentation.reportId !== 'OTOTR-SUNUM-DEMO'
      || presentation.profile !== 'hatchback3' || presentation.photos?.length !== 24) return null;
  for (let frame = 1; frame <= 24; frame++) {
    const number = String(frame).padStart(2, '0');
    const matches = presentation.photos.filter(photo => photo.frame === frame);
    if (matches.length !== 1 || matches[0].id !== 'demo-' + number
        || matches[0].url !== './real-car/frame-' + number + '.jpg'
        || matches[0].illustrative !== true) return null;
  }
  return Object.freeze({ referenceId: 'ototr-adam-reference-v1',
    frames: Object.freeze(PHOTO_BODY_FRAMES.map(frame => Object.freeze({ frame,
      url: './real-car/frame-' + String(frame).padStart(2, '0') + '.jpg' }))) });
}
