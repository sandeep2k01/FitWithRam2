// ─── Shared constants — FitWithRam platform ───
// ⚠️  Set RAM_WHATSAPP to Ram's actual number before going live!
// Format: country code + number, no + or spaces  e.g. 919876543210
export const RAM_WHATSAPP = '+91 7036592919'

export const INQUIRY_STATUSES = ['pending', 'contacted', 'active', 'closed']

export const STATUS_COLORS = {
  pending: { bg: '#fef3c7', color: '#b45309' },
  contacted: { bg: '#dbeafe', color: '#1d4ed8' },
  active: { bg: '#dcfce7', color: '#15803d' },
  closed: { bg: '#f3f4f6', color: '#6b7280' },
}

export const TRAINING_TIMES = [
  'Morning (6am-12pm)',
  'Evening (4pm-9pm)',
  'Weekend Only',
]

export const whatsappMemberMessage = (memberName, goal) =>
  encodeURIComponent(`Hi Ram, I'm ${memberName} from FitWithRam. I submitted an inquiry for ${goal} training.`)

export const whatsappRamMessage = (memberName, goal) =>
  encodeURIComponent(`Hi ${memberName}, this is Ram from FitWithRam. I saw your training inquiry. Let's talk about your ${goal} plan.`)
