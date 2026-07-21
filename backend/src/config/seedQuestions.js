const db = require('./db');
const { collection, getDocs, doc, setDoc, writeBatch } = require('firebase/firestore');

const CHEMISTRY_CHAPTERS = [
  'Some Basic Concepts of Chemistry',
  'Structure of Atom',
  'Classification of Elements & Periodicity',
  'Chemical Bonding & Molecular Structure',
  'States of Matter',
  'Thermodynamics',
  'Equilibrium',
  'Redox Reactions',
  'Hydrogen',
  's-Block Elements',
  'p-Block Elements (Group 13 & 14)',
  'Organic Chemistry - Basic Principles',
  'Hydrocarbons',
  'Environmental Chemistry',
  'Solid State',
  'Solutions',
  'Electrochemistry',
  'Chemical Kinetics',
  'Surface Chemistry',
  'p-Block Elements (Group 15-18)',
  'd & f Block Elements',
  'Coordination Compounds',
  'Haloalkanes & Haloarenes',
  'Alcohols, Phenols & Ethers',
  'Aldehydes, Ketones & Carboxylic Acids',
  'Amines',
  'Biomolecules',
  'Polymers',
  'Chemistry in Everyday Life'
];

const SEED_DATA = [
  {
    subject: 'Physics',
    examTypes: ['JEE', 'NEET'],
    chapters: ['Mechanics', 'Electromagnetism', 'Thermodynamics', 'Optics', 'Modern Physics']
  },
  {
    subject: 'Chemistry',
    examTypes: ['JEE', 'NEET'],
    chapters: CHEMISTRY_CHAPTERS
  },
  {
    subject: 'Mathematics',
    examTypes: ['JEE'],
    chapters: ['Algebra', 'Calculus', 'Coordinate Geometry', 'Trigonometry']
  },
  {
    subject: 'Biology',
    examTypes: ['NEET'],
    chapters: ['Botany', 'Zoology']
  }
];

function getChemistryQuestionDetails(chapter, index) {
  let qText = '';
  let options = [];
  let correctLetter = 'a';
  let explanation = '';

  const i = index;
  switch (chapter) {
    case 'Some Basic Concepts of Chemistry':
      qText = `Calculate the exact molarity of a solution containing 4 g of NaOH dissolved in 250 mL of aqueous solution (Sample #${i}).`;
      options = ["0.400 M", "0.500 M", "0.350 M", "0.450 M"];
      correctLetter = 'a';
      explanation = "Molarity M = (w/M.W) * (1000/V). Substituting values yields 0.400 M.";
      break;
    default:
      qText = `Concept question for chemistry chapter: ${chapter} #${i}. Identify the correct chemical formulation.`;
      options = ["Option A", "Option B", "Option C", "Option D"];
      correctLetter = 'a';
      explanation = `The detailed explanation for chapter ${chapter} question #${i}.`;
  }
  return { qText, options, correctLetter, explanation };
}

async function seedQuestionsPool() {
  console.log('Checking categories in Firestore...');
  try {
    // 1. Seed Categories (always upsert to ensure sync with latest configuration)
    console.log('Syncing categories in Firestore...');
    const defaultCategories = [
      { id: "jee", title: "JEE", icon: "Calculator", color: "blue", hasSubcategories: false, subcategories: [] },
      { id: "neet", title: "NEET", icon: "Stethoscope", color: "green", hasSubcategories: false, subcategories: [] },
      { id: "mhtcet", title: "MHT CET", icon: "GraduationCap", color: "purple", hasSubcategories: true, subcategories: [
        { id: "mht-pcm", title: "MHT PCM" },
        { id: "mht-pcb", title: "MHT PCB" }
      ]},
      { id: "railways", title: "Railways", icon: "Train", color: "red", hasSubcategories: true, subcategories: [
        { id: "rrb-group-d", title: "RRB Group D" },
        { id: "rrb-je", title: "RRB JE" },
        { id: "rrb-ntpc", title: "RRB NTPC" },
        { id: "rrb-alp", title: "RRB ALP" }
      ]},
      { id: "ssc", title: "SSC", icon: "Landmark", color: "amber", hasSubcategories: true, subcategories: [
        { id: "ssc-cgl", title: "SSC CGL" },
        { id: "ssc-chsl", title: "SSC CHSL" },
        { id: "ssc-cpo", title: "SSC CPO" },
        { id: "ssc-mts", title: "SSC MTS" },
        { id: "ssc-gd", title: "SSC GD" },
        { id: "ssc-je", title: "SSC JE" }
      ]},
      { id: "defence", title: "Defence Exams", icon: "Crosshair", color: "slate", hasSubcategories: true, subcategories: [
        { id: "nda", title: "NDA" },
        { id: "cds", title: "CDS" },
        { id: "afcat", title: "AFCAT" }
      ]},
      { id: "teaching", title: "Teaching", icon: "BookOpen", color: "orange", hasSubcategories: true, subcategories: [
        { id: "ctet", title: "CTET" },
        { id: "ctete", title: "CTETE" },
        { id: "uptet", title: "UPTET" },
        { id: "kvs", title: "KVS" }
      ]},
      { id: "police", title: "Police", icon: "ShieldCheck", color: "indigo", hasSubcategories: true, subcategories: [
        { id: "up-police-constable", title: "UP Police Constable" },
        { id: "up-si", title: "UP SI" },
        { id: "maharashtra-police", title: "Maharashtra Police" },
        { id: "bihar-police", title: "Bihar Police" }
      ]}
    ];

    for (const cat of defaultCategories) {
      await setDoc(doc(db, 'categories', cat.id), {
        title: cat.title,
        icon: cat.icon,
        color: cat.color,
        hasSubcategories: cat.hasSubcategories,
        subcategories: cat.subcategories,
        created_at: new Date().toISOString()
      });
    }
    console.log('Successfully synced categories in Firestore.');

    // 2. Check and Seed Questions
    console.log('Checking database question pool on Firestore...');
    const questionsSnap = await getDocs(collection(db, 'questions'));
    if (!questionsSnap.empty) {
      console.log('Database question pool is already populated on Firestore.');
      return;
    }

    console.log('Seeding default users and test configurations...');
    
    // Seed Default Teacher
    await setDoc(doc(db, 'teachers', 'teacher1'), {
      name: 'Test Teacher',
      username: 'teacher',
      password: 'password123',
      created_at: new Date().toISOString()
    });

    // Seed Default Student (assigned to JEE course)
    await setDoc(doc(db, 'students', 'student1'), {
      name: 'Soham Nandanwar',
      roll_number: 'VU1F2122',
      username: 'soham',
      password: 'password123',
      course: 'JEE',
      is_subscribed: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    });

    // Seed Default Tests
    const defaultTests = [
      { id: '101', name: 'JEE Physics Free Mock Test', category: 'JEE', subject: 'Physics', test_type: 'mock', is_free: 1 },
      { id: '102', name: 'JEE Chemistry Free Mock Test', category: 'JEE', subject: 'Chemistry', test_type: 'mock', is_free: 1 },
      { id: '103', name: 'JEE Mathematics Free Practice Quiz', category: 'JEE', subject: 'Mathematics', test_type: 'quiz', is_free: 1 },
      { id: '104', name: 'NEET Biology Free Practice Quiz', category: 'NEET', subject: 'Biology', test_type: 'quiz', is_free: 1 },
      { id: '105', name: 'NEET Chemistry Free Practice Quiz', category: 'NEET', subject: 'Chemistry', test_type: 'quiz', is_free: 1 },
      { id: '106', name: 'NEET Physics Free Practice Quiz', category: 'NEET', subject: 'Physics', test_type: 'quiz', is_free: 1 },
      { id: '107', name: 'JEE Physics Premium Grand Test', category: 'JEE', subject: 'Physics', test_type: 'mock', is_free: 0 },
      { id: '108', name: 'NEET Biology Premium Grand Test', category: 'NEET', subject: 'Biology', test_type: 'mock', is_free: 0 },
      { id: '109', name: 'JEE Chemistry Premium Grand Test', category: 'JEE', subject: 'Chemistry', test_type: 'mock', is_free: 0 },
    ];

    for (const t of defaultTests) {
      await setDoc(doc(db, 'tests', t.id), {
        name: t.name,
        duration: 30,
        is_published: 1,
        marks: 4.0,
        negative_marks: -1.0,
        randomize_questions: 0,
        category: t.category,
        is_free: t.is_free,
        test_type: t.test_type,
        created_at: new Date().toISOString()
      });

      const batch = writeBatch(db);
      for (let i = 1; i <= 5; i++) {
        const newQId = (Date.now() + i + Math.floor(Math.random() * 1000)).toString();
        batch.set(doc(db, 'questions', newQId), {
          test_id: t.id,
          question_text: `Sample Question ${i} for ${t.name}: Solve the given equation or identify the property.`,
          question_type: 'SINGLE',
          options: [`Option A: Primary statement`, `Option B: Secondary derivation`, `Option C: Neutral condition`, `Option D: None of these`],
          correct_answer: [0],
          explanation: `Explanation for Q${i} of ${t.name}: Option A is correct according to standard theorems.`,
          section: t.subject,
          category: t.category,
          marks: 4.0,
          negative_marks: -1.0,
          created_at: new Date().toISOString()
        });
      }
      await batch.commit();
    }

    console.log('Seeding question pool for custom test generation...');
    const poolBatch = writeBatch(db);
    let questionCounter = 0;

    for (const group of SEED_DATA) {
      const { subject, examTypes, chapters } = group;
      for (const chapter of chapters) {
        for (let i = 1; i <= 5; i++) {
          const exam = examTypes[(i - 1) % examTypes.length];
          const difficulty = 'hard';
          const year = 2020 + (i % 7);
          
          let qText = '';
          let options = [];
          let correctLetter = 'a';
          let explanation = '';

          if (subject === 'Physics') {
            if (chapter === 'Mechanics') {
              qText = `A block of mass 5 kg is placed on a rough inclined plane of angle 30°. A force is applied parallel to the incline. If coefficient of static friction is 0.35, determine normal force.`;
              options = ["42.4 N", "49.0 N", "35.0 N", "None of these"];
              correctLetter = 'a';
              explanation = "Normal force N = m * g * cos(theta) = 5 * 9.8 * cos(30°) = 42.4 N.";
            } else {
              qText = `Electromagnetism concept question #${i} for chapter ${chapter}. Calculate magnetic field value.`;
              options = ["Option A", "Option B", "Option C", "Option D"];
              correctLetter = 'a';
              explanation = "Explanation for electromag question.";
            }
          } else if (subject === 'Chemistry') {
            const details = getChemistryQuestionDetails(chapter, i);
            qText = details.qText;
            options = details.options;
            correctLetter = details.correctLetter;
            explanation = details.explanation;
          } else if (subject === 'Mathematics') {
            qText = `Calculus/Algebra query for ${chapter}. Solve the integration or equation factor.`;
            options = ["Option A", "Option B", "Option C", "Option D"];
            correctLetter = 'a';
            explanation = "Explanation for maths question.";
          } else {
            qText = `Biology test query for chapter ${chapter}. Identify cell organelle function.`;
            options = ["Option A", "Option B", "Option C", "Option D"];
            correctLetter = 'a';
            explanation = "Explanation for biology question.";
          }

          const correctIndexMap = { a: 0, b: 1, c: 2, d: 3 };
          const correctIndex = correctIndexMap[correctLetter] !== undefined ? correctIndexMap[correctLetter] : 0;

          const newQId = (Date.now() + questionCounter + Math.floor(Math.random() * 1000)).toString();
          poolBatch.set(doc(db, 'questions', newQId), {
            test_id: null,
            exam,
            subject,
            chapter,
            question_text: qText,
            option_a: options[0] || '',
            option_b: options[1] || '',
            option_c: options[2] || '',
            option_d: options[3] || '',
            correct_option: correctLetter,
            difficulty,
            year,
            explanation,
            options,
            correct_answer: [correctIndex],
            question_type: 'SINGLE',
            section: subject,
            marks: 4.0,
            negative_marks: -1.0,
            created_at: new Date().toISOString()
          });
          questionCounter++;
        }
      }
    }

    await poolBatch.commit();
    console.log(`Successfully seeded default mock tests, default users, and ${questionCounter} questions in Firestore!`);
  } catch (error) {
    console.error('Failed to seed questions pool on Firestore:', error);
  }
}

module.exports = { seedQuestionsPool };
