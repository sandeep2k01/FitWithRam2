// Goal data with icons and colors — used across landing, offline training, admin inquiries, programs
export const GOALS = [
  {
    id: 'Muscle Building',
    icon: '💪',
    color: '#b45309',
    bg: '#fef3c7',
    description: 'Build size, strength and definition.',
    programType: 'Progressive overload, hypertrophy split',
    dietApproach: 'High protein, caloric surplus',
  },
  {
    id: 'Fat Loss',
    icon: '🔥',
    color: '#dc2626',
    bg: '#fee2e2',
    description: 'Shed body fat while preserving muscle.',
    programType: 'Cardio + weights combination',
    dietApproach: 'Calorie deficit, high protein',
  },
  {
    id: 'Strength Training',
    icon: '🏋️',
    color: '#7c3aed',
    bg: '#ede9fe',
    description: 'Get stronger on compound lifts.',
    programType: 'Heavy compounds, low reps (3-5)',
    dietApproach: 'Caloric maintenance or slight surplus',
  },
  {
    id: 'Endurance',
    icon: '🏃',
    color: '#0369a1',
    bg: '#e0f2fe',
    description: 'Improve stamina and cardiovascular fitness.',
    programType: 'Cardio focus, circuit training',
    dietApproach: 'Balanced macros, high carbs',
  },
  {
    id: 'Flexibility',
    icon: '🧘',
    color: '#047857',
    bg: '#dcfce7',
    description: 'Increase mobility and reduce stiffness.',
    programType: 'Stretching, mobility, yoga',
    dietApproach: 'Anti-inflammatory foods, hydration',
  },
  {
    id: 'General Fitness',
    icon: '⚡',
    color: '#374151',
    bg: '#f3f4f6',
    description: 'All-round health and fitness improvement.',
    programType: 'Mixed, balanced approach',
    dietApproach: 'Whole foods, balanced macros',
  },
]

// Just the string IDs for dropdowns/selects
export const GOAL_IDS = GOALS.map(g => g.id)

// Find a goal by its string ID
export const getGoal = (id) => GOALS.find(g => g.id === id) || GOALS[5]
