export const categoriesData = [
  {
    id: "jee",
    title: "JEE",
    icon: "Calculator",
    color: "blue",
    hasSubcategories: false
  },
  {
    id: "neet",
    title: "NEET",
    icon: "Stethoscope",
    color: "green",
    hasSubcategories: false
  },
  {
    id: "mhtcet",
    title: "MHT CET",
    icon: "GraduationCap",
    color: "purple",
    hasSubcategories: false
  },
  {
    id: "railways",
    title: "Railways",
    icon: "Train",
    color: "red",
    hasSubcategories: true,
    subcategories: [
      { id: "rrb-group-d", title: "RRB Group D" },
      { id: "rrb-je", title: "RRB JE" },
      { id: "rrb-ntpc", title: "RRB NTPC" },
      { id: "rrb-alp", title: "RRB ALP" }
    ]
  },
  {
    id: "ssc",
    title: "SSC",
    icon: "Landmark",
    color: "amber",
    hasSubcategories: true,
    subcategories: [
      { id: "ssc-cgl", title: "SSC CGL" },
      { id: "ssc-chsl", title: "SSC CHSL" },
      { id: "ssc-cpo", title: "SSC CPO" },
      { id: "ssc-mts", title: "SSC MTS / SSC GD" },
      { id: "ssc-je", title: "SSC JE" }
    ]
  },
  {
    id: "defence",
    title: "Defence Exams",
    icon: "Crosshair",
    color: "slate",
    hasSubcategories: true,
    subcategories: [
      { id: "nda", title: "NDA" },
      { id: "cds", title: "CDS" },
      { id: "afcat", title: "AFCAT" }
    ]
  },
  {
    id: "teaching",
    title: "Teaching",
    icon: "BookOpen",
    color: "orange",
    hasSubcategories: true,
    subcategories: [
      { id: "ctet", title: "CTET" },
      { id: "uptet", title: "UPTET" },
      { id: "kvs", title: "KVS" }
    ]
  },
  {
    id: "police",
    title: "Police",
    icon: "ShieldCheck",
    color: "indigo",
    hasSubcategories: true,
    subcategories: [
      { id: "up-police", title: "UP Police" },
      { id: "up-si", title: "UP SI" },
      { id: "mh-police", title: "Maharashtra Police" },
      { id: "bihar-police", title: "Bihar Police" }
    ]
  }
];

export const generateMockTests = (count) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `test-${i + 1}`,
    title: `Full Length Mock Test ${i + 1}`,
    questions: 20,
    duration: 30,
    difficulty: i % 2 === 0 ? "Medium" : "Hard",
    attempted: `${Math.floor(Math.random() * 500) + 100}+`
  }));
};

// Instead of hardcoding all tests, we can just use generateMockTests on the fly
// when rendering a category or subcategory test list.

export const mockQuestions = [
  {
    id: "q1",
    text: "Which of the following is a characteristic of a valid React component?",
    options: [
      { id: "a", text: "It must return exactly one root element." },
      { id: "b", text: "It must use the 'class' keyword." },
      { id: "c", text: "It cannot manage state." },
      { id: "d", text: "It must be written in TypeScript." }
    ],
    correctOption: "a",
    explanation: "React components must return a single root element (or a fragment) due to JSX syntax constraints."
  },
  {
    id: "q2",
    text: "What does the 'useEffect' hook do in React?",
    options: [
      { id: "a", text: "Directly modifies the DOM before render." },
      { id: "b", text: "Performs side effects in function components." },
      { id: "c", text: "Creates a new Context." },
      { id: "d", text: "Optimizes rendering speed." }
    ],
    correctOption: "b",
    explanation: "useEffect allows you to perform side effects (like data fetching, subscriptions, or manually changing the DOM) in function components."
  },
  {
    id: "q3",
    text: "In Tailwind CSS, which class is used to apply a flex container?",
    options: [
      { id: "a", text: "display-flex" },
      { id: "b", text: "flexbox" },
      { id: "c", text: "flex" },
      { id: "d", text: "d-flex" }
    ],
    correctOption: "c",
    explanation: "The 'flex' utility class in Tailwind sets display to flex."
  }
];
