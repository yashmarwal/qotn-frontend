export interface MeasurementField {
  key: string;
  label: string;
  unit: string;
  required: boolean;
  hint?: string;
}

export interface GarmentConfig {
  label: string;
  fields: MeasurementField[];
}

export const GARMENT_MEASUREMENTS: Record<string, GarmentConfig> = {
  HALF_SHIRT: {
    label: 'Half Shirt',
    fields: [
      { key: 'chest', label: 'Chest', unit: 'inches', required: true, hint: 'Measure around the fullest part of chest' },
      { key: 'shoulders', label: 'Shoulders', unit: 'inches', required: true, hint: 'Measure from shoulder tip to shoulder tip' },
      { key: 'waist', label: 'Waist', unit: 'inches', required: true, hint: 'Measure around natural waistline' },
      { key: 'shirtLength', label: 'Shirt Length', unit: 'inches', required: true, hint: 'From back of neck to desired length' },
      { key: 'sleeveLength', label: 'Sleeve Length', unit: 'inches', required: true, hint: 'From shoulder tip to wrist' },
      { key: 'collar', label: 'Collar Size', unit: 'inches', required: false, hint: 'Around base of neck + 1 inch' },
      { key: 'bicep', label: 'Bicep', unit: 'inches', required: false, hint: 'Around the widest part of upper arm' },
    ],
  },
  KURTA: {
    label: 'Kurta (Men)',
    fields: [
      { key: 'chest', label: 'Chest', unit: 'inches', required: true, hint: 'Measure around fullest part of chest' },
      { key: 'shoulders', label: 'Shoulders', unit: 'inches', required: true, hint: 'Shoulder tip to shoulder tip' },
      { key: 'waist', label: 'Waist', unit: 'inches', required: true },
      { key: 'hips', label: 'Hips', unit: 'inches', required: true, hint: 'Measure around fullest part of hips' },
      { key: 'kurtaLength', label: 'Kurta Length', unit: 'inches', required: true, hint: 'From shoulder to desired hem' },
      { key: 'sleeveLength', label: 'Sleeve Length', unit: 'inches', required: true },
      { key: 'collar', label: 'Collar', unit: 'inches', required: false },
    ],
  },
  SUIT: {
    label: 'Suit / Blazer',
    fields: [
      { key: 'chest', label: 'Chest', unit: 'inches', required: true, hint: 'Around fullest part of chest over shirt' },
      { key: 'shoulders', label: 'Shoulders', unit: 'inches', required: true },
      { key: 'waist', label: 'Waist', unit: 'inches', required: true },
      { key: 'hips', label: 'Seat/Hips', unit: 'inches', required: true },
      { key: 'jacketLength', label: 'Jacket Length', unit: 'inches', required: true, hint: 'From back of neck to jacket hem' },
      { key: 'sleeveLength', label: 'Sleeve Length', unit: 'inches', required: true, hint: 'From shoulder seam to wrist bone' },
      { key: 'back', label: 'Back Length', unit: 'inches', required: false, hint: 'From nape of neck to waist' },
      { key: 'neck', label: 'Neck', unit: 'inches', required: false },
    ],
  },
  THREE_PIECE_SUIT: {
    label: 'Three Piece Suit',
    fields: [
      { key: 'chest', label: 'Chest', unit: 'inches', required: true },
      { key: 'shoulders', label: 'Shoulders', unit: 'inches', required: true },
      { key: 'jacketWaist', label: 'Jacket Waist', unit: 'inches', required: true },
      { key: 'jacketLength', label: 'Jacket Length', unit: 'inches', required: true },
      { key: 'sleeveLength', label: 'Sleeve Length', unit: 'inches', required: true },
      { key: 'vestLength', label: 'Vest Length', unit: 'inches', required: true, hint: 'From shoulder to desired vest hem' },
      { key: 'vestChest', label: 'Vest Chest', unit: 'inches', required: false },
      { key: 'trouserWaist', label: 'Trouser Waist', unit: 'inches', required: true },
      { key: 'trouserHips', label: 'Trouser Seat', unit: 'inches', required: true },
      { key: 'inseam', label: 'Inseam', unit: 'inches', required: true, hint: 'Crotch to ankle along inner leg' },
      { key: 'outseam', label: 'Outseam', unit: 'inches', required: true, hint: 'Waistband to ankle along outer leg' },
      { key: 'thigh', label: 'Thigh', unit: 'inches', required: false },
      { key: 'knee', label: 'Knee', unit: 'inches', required: false },
      { key: 'bottomWidth', label: 'Bottom Width', unit: 'inches', required: false },
    ],
  },
  PANT: {
    label: 'Trousers / Pants',
    fields: [
      { key: 'waist', label: 'Waist', unit: 'inches', required: true, hint: 'Around natural waistline' },
      { key: 'hips', label: 'Seat/Hips', unit: 'inches', required: true, hint: 'Around fullest part of seat' },
      { key: 'inseam', label: 'Inseam', unit: 'inches', required: true, hint: 'Crotch to ankle, inside leg' },
      { key: 'outseam', label: 'Outseam', unit: 'inches', required: true, hint: 'Waistband to ankle, outer leg' },
      { key: 'thigh', label: 'Thigh', unit: 'inches', required: true, hint: 'Around widest part of thigh' },
      { key: 'knee', label: 'Knee', unit: 'inches', required: false },
      { key: 'bottomWidth', label: 'Bottom Width', unit: 'inches', required: false, hint: 'Width of trouser opening' },
      { key: 'rise', label: 'Rise', unit: 'inches', required: false, hint: 'Crotch seam to waistband' },
    ],
  },
  DRESS: {
    label: 'Dress (Women)',
    fields: [
      { key: 'bust', label: 'Bust', unit: 'inches', required: true, hint: 'Around fullest part of bust' },
      { key: 'waist', label: 'Waist', unit: 'inches', required: true },
      { key: 'hips', label: 'Hips', unit: 'inches', required: true },
      { key: 'shoulders', label: 'Shoulder Width', unit: 'inches', required: true },
      { key: 'sleeveLength', label: 'Sleeve Length', unit: 'inches', required: false, hint: '0 if sleeveless' },
      { key: 'dressLength', label: 'Dress Length', unit: 'inches', required: true, hint: 'From shoulder to desired hem' },
      { key: 'backLength', label: 'Back Length', unit: 'inches', required: false },
      { key: 'armhole', label: 'Armhole', unit: 'inches', required: false },
    ],
  },
  KURTI: {
    label: 'Kurti (Women)',
    fields: [
      { key: 'bust', label: 'Bust', unit: 'inches', required: true },
      { key: 'waist', label: 'Waist', unit: 'inches', required: true },
      { key: 'hips', label: 'Hips', unit: 'inches', required: true },
      { key: 'shoulders', label: 'Shoulder Width', unit: 'inches', required: true },
      { key: 'kurtaLength', label: 'Kurti Length', unit: 'inches', required: true, hint: 'From shoulder to hem' },
      { key: 'sleeveLength', label: 'Sleeve Length', unit: 'inches', required: false },
      { key: 'armhole', label: 'Armhole', unit: 'inches', required: false },
      { key: 'neckDepth', label: 'Neck Depth', unit: 'inches', required: false },
    ],
  },
  SALWAR_CHURIDAR: {
    label: 'Salwar / Churidar',
    fields: [
      { key: 'waist', label: 'Waist', unit: 'inches', required: true },
      { key: 'hips', label: 'Hips/Seat', unit: 'inches', required: true },
      { key: 'length', label: 'Length', unit: 'inches', required: true, hint: 'From waist to ankle' },
      { key: 'thigh', label: 'Thigh', unit: 'inches', required: false },
      { key: 'knee', label: 'Knee', unit: 'inches', required: false },
      { key: 'bottomWidth', label: 'Bottom Width', unit: 'inches', required: false, hint: 'Ankle opening width' },
      { key: 'inseam', label: 'Inseam', unit: 'inches', required: false },
    ],
  },
};

export const GARMENTS_BY_CATEGORY: Record<string, string[]> = {
  men: ['HALF_SHIRT', 'KURTA', 'SUIT', 'THREE_PIECE_SUIT', 'PANT'],
  women: ['DRESS', 'KURTI', 'SALWAR_CHURIDAR'],
  kids: ['HALF_SHIRT', 'PANT', 'DRESS'],
};

export const measurementGuides: Record<string, string> = {
  chest: 'Stand straight. Wrap tape around fullest part of chest, under armpits. Keep tape parallel to floor.',
  shoulders: 'Measure from the bony tip of one shoulder to the other across your upper back.',
  waist: 'Measure around your natural waistline — smallest part of torso, usually 1 inch above belly button.',
  hips: 'Stand with feet together. Measure around the fullest part of your hips and seat.',
  inseam: 'Stand straight. Measure from crotch seam to floor along inner leg.',
  sleeveLength: 'Bend arm slightly. Measure from shoulder tip, over elbow, to wrist bone.',
  kurtaLength: 'Stand straight. Measure from highest point of shoulder to desired hem length.',
  bust: 'Measure around fullest part of bust. Keep tape parallel to floor.',
  neckDepth: 'Measure from base of neck down to desired neckline depth.',
};
