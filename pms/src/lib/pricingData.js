export const packages = [
  { id: 'per_session', label: 'Per Session Fees' },
  { id: '2_weeks', label: '2 Weeks Package (12 Sessions) - 5% Off' },
  { id: '4_weeks', label: '4 Weeks Package (25 Sessions) - 10% Off' },
  { id: 'additional', label: 'Additional Charges' }
];

export const mainPricingMatrix = {
  'exercise_therapy': {
    label: 'Exercise Therapy',
    options: [
      { id: '20_30_min', label: '20-30 min', prices: { per_session: 300, '2_weeks': 3420, '4_weeks': 6750 } },
      { id: '45_min', label: '45 min', prices: { per_session: 350, '2_weeks': 3990, '4_weeks': 7875 } },
      { id: '60_90_min', label: '60-90 min', prices: { per_session: 400, '2_weeks': 4560, '4_weeks': 9000 } }
    ]
  },
  'electro_therapy': {
    label: 'ElectroTherapy',
    options: [
      { id: '5_10_min', label: '5-10 min', prices: { per_session: 250, '2_weeks': 2850, '4_weeks': 5625 } },
      { id: '15_min_one', label: '15 min one modality', prices: { per_session: 300, '2_weeks': 3420, '4_weeks': 6750 } },
      { id: '20_min_two', label: '20 min / two modalities', prices: { per_session: 350, '2_weeks': 3990, '4_weeks': 7875 } }
    ]
  },
  'electro_exercise': {
    label: 'Electro therapy + Exercise Therapy',
    options: [
      { id: 'one_mod_20_30', label: 'One modality + 20-30 min Exercise', prices: { per_session: 350, '2_weeks': 3990, '4_weeks': 7875 } },
      { id: 'two_mod_20_30', label: 'Two Modality + 20-30 min Exercise', prices: { per_session: 400, '2_weeks': 4560, '4_weeks': 9000 } },
      { id: 'one_mod_60_90', label: 'One Modality+ 60-90 min exercise', prices: { per_session: 450, '2_weeks': 5130, '4_weeks': 10125 } }
    ]
  },
  'post_op_rehab': {
    label: 'Post Op Rehab',
    options: [
      { id: 'p1_lower', label: 'Phase 1 (Basic) - Lower Limb', prices: { per_session: 300, '2_weeks': 3420, '4_weeks': 6750 } },
      { id: 'p1_upper', label: 'Phase 1 (Basic) - Upper Limb', prices: { per_session: 300, '2_weeks': 3420, '4_weeks': 6750 } },
      { id: 'p1_trunk', label: 'Phase 1 (Basic) - Trunk/Spinal', prices: { per_session: 300, '2_weeks': 3420, '4_weeks': 6750 } },
      
      { id: 'p2_lower', label: 'Phase 2 (Moderate) - Lower Limb', prices: { per_session: 350, '2_weeks': 3990, '4_weeks': 7875 } },
      { id: 'p2_upper', label: 'Phase 2 (Moderate) - Upper Limb', prices: { per_session: 350, '2_weeks': 3990, '4_weeks': 7875 } },
      { id: 'p2_trunk', label: 'Phase 2 (Moderate) - Trunk/Spinal', prices: { per_session: 300, '2_weeks': 3420, '4_weeks': 6750 } },
      
      { id: 'p3_lower', label: 'Phase 3 (Advance) - Lower Limb', prices: { per_session: 400, '2_weeks': 4560, '4_weeks': 9000 } },
      { id: 'p3_upper', label: 'Phase 3 (Advance) - Upper Limb', prices: { per_session: 400, '2_weeks': 4560, '4_weeks': 9000 } },
      { id: 'p3_trunk', label: 'Phase 3 (Advance) - Trunk/Spinal', prices: { per_session: 350, '2_weeks': 3990, '4_weeks': 7875 } },

      { id: 'p4_lower', label: 'Phase 4 (Back to Sports) - Lower Limb', prices: { per_session: 400, '2_weeks': 4560, '4_weeks': 9000 } },
      { id: 'p4_upper', label: 'Phase 4 (Back to Sports) - Upper Limb', prices: { per_session: 400, '2_weeks': 4560, '4_weeks': 9000 } },
      { id: 'p4_trunk', label: 'Phase 4 (Back to Sports) - Trunk/Spinal', prices: { per_session: 400, '2_weeks': 4560, '4_weeks': 9000 } },
    ]
  },
  'spine_conservative': {
    label: 'Spine / Conservative Management',
    options: [
      { id: 'p1', label: 'Phase 1 (One Modality + Basic level exercises)', prices: { per_session: 350, '2_weeks': 3990, '4_weeks': 7875 } },
      { id: 'p2', label: 'Phase 2 (Moderate level Exercises)', prices: { per_session: 300, '2_weeks': 3420, '4_weeks': 6750 } },
      { id: 'p3', label: 'Phase 3 (One Modality + Advance Exercises)', prices: { per_session: 400, '2_weeks': 4560, '4_weeks': 9000 } }
    ]
  },
  'neuro': {
    label: 'Stroke/CP/Peds (Neuro)',
    options: [
      { id: '30_min', label: '30 min', prices: { per_session: 350, '2_weeks': 3990, '4_weeks': 7875 } },
      { id: '45_60_min', label: '45-60 min', prices: { per_session: 400, '2_weeks': 4560, '4_weeks': 9000 } },
      { id: '80_90_min', label: '80-90 min', prices: { per_session: 450, '2_weeks': 5130, '4_weeks': 10125 } }
    ]
  }
};

export const additionalChargesMatrix = {
  'taping': {
    label: 'Taping',
    options: [
      { id: 'kinesio', label: 'Kinesio', price: 350 },
      { id: 'semirigid', label: 'Semirigid', price: 400 },
      { id: 'rigid', label: 'Rigid', price: 450 }
    ]
  },
  'iastm': {
    label: 'IASTM',
    options: [
      { id: 'upper_limb', label: 'Upper Limb', price: 300 },
      { id: 'lower_limb', label: 'Lower Limb', price: 350 },
      { id: 'trunk', label: 'Trunk', price: 400 }
    ]
  },
  'diet_nutrition': {
    label: 'Diet And Nutrition Plan (Condition Specific)',
    options: [
      { id: 'month_1', label: '1st Month', price: 1500 },
      { id: 'month_2', label: 'Free Follow-up after one month', price: 0 },
      { id: 'month_3', label: '3rd month plan', price: 1500 }
    ]
  },
  'fitness_exercise': {
    label: 'Fitness and Exercise Plan',
    options: [
      { id: 'month_1', label: '1st Month', price: 1000 },
      { id: 'month_2', label: 'Free Follow-up after one month', price: 0 },
      { id: 'month_3', label: '3rd month plan', price: 1500 }
    ]
  },
  'diabetes_rehab': {
    label: 'Diabetes Rehab (Diet and Exercise Plan)',
    options: [
      { id: 'month_1', label: '1st Month', price: 2000 },
      { id: 'month_2', label: 'Free Follow-up after one month', price: 0 },
      { id: 'month_3', label: '3rd month plan', price: 2000 }
    ]
  },
  'fitness_elderly': {
    label: 'Fitness for Elderly (4 times/week)',
    options: [
      { id: 'one_month', label: 'One Month', price: 5500 },
      { id: 'two_months', label: 'Two Months', price: 10000 },
      { id: 'three_months', label: 'Three Months', price: 12000 }
    ]
  },
  'fitness_elderly_3_days': {
    label: 'Fitness for Elderly (3 days/week)',
    options: [
      { id: 'one_month', label: 'One Month', price: 3500 },
      { id: 'two_months', label: 'Two Months', price: 6600 },
      { id: 'three_months', label: 'Three Months', price: 9000 }
    ]
  },
  'cognitive_rehab': {
    label: 'Cognitive Rehab',
    options: [
      { id: '4_weeks', label: '4 weeks', price: '' },
      { id: '8_weeks', label: '8 weeks', price: '' },
      { id: '12_weeks', label: '12 weeks', price: '' }
    ]
  },
  'telerehab': {
    label: 'Telerehab',
    options: [
      { id: '20_30_min', label: '20-30 min', price: 300 },
      { id: '45_min', label: '45 min', price: 350 },
      { id: '60_min', label: '60 min', price: 400 }
    ]
  }
};
