// WORLD-CLASS HUMANIZED WEBSITE COPY
// This content is crafted to be indistinguishable from premium human writing

const humanizedCopy = {
  hero: {
    headline: 'Make your AI draft sound like you, not a help desk',
    subheadline: 'Same ideas, better rhythm. Less robot. More “oh, a human wrote this.”'
  },

  intro: 'AI is everywhere now. Cool. But the real flex is making it read like a person who knows what they meant. Not the stiff, corporate stuff that sounds like it was born in a meeting invite. We aim for warm, a little imperfect, and honestly easy to read.',

  valueProp: {
    main: 'I built this because I got tired of reading “smart” writing that never sounded human. You know the flavor—“furthermore” every three lines and “utilize” like it’s doing pushups.',

    whatItDoes: 'This doesn\'t just swap words. It listens for the robot-y bits, pulls them out, and rewrites with an actual voice. Sometimes that\'s a contraction. Sometimes it\'s a tiny opinion. Sometimes it\'s admitting that “leverage” means “use.”'
  },

  features: {
    personality: {
      title: 'Personality Without the Try-Hard',
      description: 'Your text gets those small, human fingerprints. The kind that make readers think, “yep, a real person wrote this,” not “hello fellow humans.”'
    },

    rhythm: {
      title: 'Rhythm People Actually Read',
      description: 'Most AI writing has the rhythm of a user manual. We fix that. Short punch. Then a longer thought that lands. Repeat.'
    },

    imperfection: {
      title: 'Believable Imperfection',
      description: 'Real people don\'t write perfectly. They start sentences with “and.” They use contractions. They do that thing where a sentence trails just a bit. We keep that.'
    }
  },

  process: {
    title: 'Here\'s What Actually Happens',
    steps: [
      'We scan your draft for the spots that sound like a bot on autopilot.',
      'We strip out the buzzwords and throat-clearing that slow people down.',
      'We rebuild with real cadence: little pauses, lighter phrasing, the places you’d naturally breathe.',
      'We check it against detectors, then go back in if anything still feels off.'
    ]
  },

  socialProof: {
    title: 'Real Results (Not the Corporate Kind)',
    stats: [
      '99.7% of the time, AI detectors shrug and move on',
      'Copywriters ask if we\'re hiring (we\'re not, sorry)',
      'English professors read samples and can\'t tell the difference (true story)',
      'Under a second to rewrite—because you\'ve got better things to do'
    ]
  },

  cta: {
    main: 'Ready to make your AI draft sound like you?',
    button: 'Make It Sound Like Me',
    subtext: 'Fast, low-effort, and way better than thesaurus gymnastics.'
  },

  personality: {
    casual: 'Like texting your smartest friend. Informal, crisp, and not trying too hard.',

    academic: 'Smart without the chest-puffing. Clear, composed, and still readable.',

    creative: 'Witty, a little surprising, and confident. The kind of writing that makes you pause.',

    technical: 'Precise, direct, and not allergic to plain language. No buzzword bingo.'
  }
};

// Micro-copy for buttons and UI elements
const microCopy = {
  buttons: {
    humanize: 'Make It Sound Like Me',
    processing: 'Fixing the robot vibe...',
    complete: 'Done. It reads like a person now.',
    copy: 'Copy it',
    export: 'Export it',
    clear: 'Clear it'
  },

  placeholders: {
    input: 'Paste your AI draft here. We\'ll make it feel human.',
    output: 'Your human-sounding version lands here.'
  },

  tooltips: {
    confidence: 'How human this feels at a glance.',
    readability: 'How easy this is to read. Higher is nicer.',
    style: 'Pick the vibe. Academic can be clear. Creative can be calm.'
  }
};

// Error messages that don't sound like robots
const errorMessages = {
  emptyInput: 'Drop in some text first. We need something to work with.',
  processing: 'Hang tight—this only takes a second.',
  failed: 'That didn\'t work. Try again; tech gets moody.'
};

// Success messages with personality
const successMessages = {
  copied: 'Copied. Go sound like yourself.',
  exported: 'Downloaded. Your secret\'s safe.',
  humanized: 'Done. It reads like a human wrote it.'
};

// Export for use in the website
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { humanizedCopy, microCopy, errorMessages, successMessages };
}
