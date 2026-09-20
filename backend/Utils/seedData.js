import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connection from "../Config/db.js";

import Class from "../Model/Academic/Class.js";
import Subject from "../Model/Academic/Subject.js";
import Syllabus from "../Model/Academic/Syllabus.js";
import Institute from "../Model/People/Institute.js";
import User from "../Model/People/User.js";
import Teacher from "../Model/People/Teacher.js";
import Parent from "../Model/People/Parent.js";
import Student from "../Model/People/Student.js";
import Batch from "../Model/People/Batch.js";
import Attendance from "../Model/People/Attendance.js";
import Exam from "../Model/Academic/Exam.js";
import Result from "../Model/Academic/Result.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

// Comprehensive, authentic CBSE Class 1 to 10 Curriculum
const cbseCurriculumByClassAndSubject = {
  // ===================== CLASS 1 =====================
  class_1_Mathematics: [
    { number: 1, title: "Shapes and Space", topics: [{ name: "Inside & Outside" }, { name: "Bigger & Smaller" }, { name: "Top & Bottom" }, { name: "Nearer & Farther" }, { name: "Shapes Around Us" }] },
    { number: 2, title: "Numbers from One to Nine", topics: [{ name: "Counting 1 to 5" }, { name: "Counting 6 to 9" }, { name: "Concept of Zero" }, { name: "More or Less" }] },
    { number: 3, title: "Addition", topics: [{ name: "One More" }, { name: "Adding Objects" }, { name: "Addition Facts up to 9" }] },
    { number: 4, title: "Subtraction", topics: [{ name: "Taking Away" }, { name: "Subtraction Facts" }, { name: "Subtraction on Number Line" }] },
    { number: 5, title: "Numbers from Ten to Twenty", topics: [{ name: "Making Groups of 10" }, { name: "Counting 10 to 20" }, { name: "Addition & Subtraction (10 to 20)" }] },
    { number: 6, title: "Time", topics: [{ name: "Daily Morning Routine" }, { name: "Afternoon, Evening & Night Activities" }, { name: "Days of the Week" }] },
    { number: 7, title: "Measurement", topics: [{ name: "Longer & Shorter" }, { name: "Longest & Shortest" }, { name: "Taller & Shorter" }, { name: "Heavier & Lighter" }] },
    { number: 8, title: "Numbers from Twenty-One to Fifty", topics: [{ name: "Counting 21 to 30" }, { name: "Counting 31 to 40" }, { name: "Counting 41 to 50" }] },
    { number: 9, title: "Data Handling", topics: [{ name: "Counting and Recording Objects" }, { name: "Simple Picture Graphs" }] },
    { number: 10, title: "Patterns", topics: [{ name: "Shape Patterns" }, { name: "Number Patterns" }] },
    { number: 11, title: "Numbers (up to 100)", topics: [{ name: "Counting 51 to 70" }, { name: "Counting 71 to 90" }, { name: "Counting 91 to 100" }] },
    { number: 12, title: "Money", topics: [{ name: "Indian Coins & Currency Notes" }, { name: "Simple Price Calculation" }] },
    { number: 13, title: "How Many", topics: [{ name: "Counting Grouped Tens & Ones" }, { name: "Word Problems" }] },
  ],
  class_1_EVS: [
    { number: 1, title: "About Me & My Body", topics: [{ name: "My Body Parts" }, { name: "My Five Senses" }, { name: "Taking Care of My Body" }] },
    { number: 2, title: "My Family and Home", topics: [{ name: "Small & Big Families" }, { name: "Rooms in a House" }, { name: "Helping at Home" }] },
    { number: 3, title: "Food We Eat", topics: [{ name: "Healthy Foods" }, { name: "Meals of the Day" }, { name: "Good Eating Habits" }] },
    { number: 4, title: "Clothes We Wear", topics: [{ name: "Summer Clothes" }, { name: "Winter Clothes" }, { name: "Rainy Season Wear" }] },
    { number: 5, title: "Clean Habits and Safety", topics: [{ name: "Good Manners" }, { name: "Safety at Home and on Road" }] },
    { number: 6, title: "Plants and Animals Around Us", topics: [{ name: "Common Plants & Trees" }, { name: "Domestic & Wild Animals" }, { name: "Animal Sounds & Homes" }] },
    { number: 7, title: "Our Neighborhood & Festivals", topics: [{ name: "Places in Neighborhood (School, Hospital, Park)" }, { name: "Festivals of India (Diwali, Eid, Christmas)" }] },
  ],
  class_1_English: [
    { number: 1, title: "A Happy Child & Two Little Hands", topics: [{ name: "Phonics & Alphabet Sounds" }, { name: "Rhyming Words" }, { name: "Color Words" }] },
    { number: 2, title: "Greetings & My Family", topics: [{ name: "Everyday Greetings" }, { name: "Talking About Family" }, { name: "Sight Words" }] },
    { number: 3, title: "The Little Turtle & Mittu", topics: [{ name: "Action Words" }, { name: "Bird & Fruit Vocabulary" }, { name: "Story Comprehension" }] },
    { number: 4, title: "Circle & Sundari", topics: [{ name: "Tracing Shapes" }, { name: "Prepositions: Up & Down" }, { name: "Kite Story" }] },
    { number: 5, title: "Anandi's Rainbow & Flying-Man", topics: [{ name: "Rainbow Colors" }, { name: "Community Helpers" }, { name: "Simple Sentence Writing" }] },
  ],
  class_1_Hindi: [
    { number: 1, title: "झूला व आम की टोकरी", topics: [{ name: "स्वर व व्यंजन वर्णमाला" }, { name: "दो अक्षर वाले सरल शब्द" }, { name: "चित्र पठन" }] },
    { number: 2, title: "पत्ते ही पत्ते व पकौड़ी", topics: [{ name: "प्रकृति व पत्तियों की पहचान" }, { name: "आ की मात्रा के शब्द" }, { name: "लयबद्ध कविता" }] },
    { number: 3, title: "रसोईघर व चूहो! म्याऊँ सो रही है", topics: [{ name: "इ व ई की मात्रा" }, { name: "रसोई के बर्तनों के नाम" }, { name: "हास्य कविता" }] },
    { number: 4, title: "बन्दर और गिलहरी व पतंग", topics: [{ name: "उ व ऊ की मात्रा" }, { name: "कहानी पठन व वाक्य रचना" }, { name: "रंगों के नाम" }] },
    { number: 5, title: "गेंद-बल्ला व सात पूँछ का चूहा", topics: [{ name: "ए, ऐ, ओ, औ की मात्राएँ" }, { name: "संयुक्त अक्षर" }, { name: "सुलेख अभ्यास" }] },
  ],

  // ===================== CLASS 2 =====================
  class_2_Mathematics: [
    { number: 1, title: "What is Long, What is Round?", topics: [{ name: "Rolling and Sliding Shapes" }, { name: "Tower Building Activity" }, { name: "Postcard Strength Test" }] },
    { number: 2, title: "Counting in Groups", topics: [{ name: "Pairs & Groups" }, { name: "More than & Less than" }, { name: "Ordinal Numbers (1st to 10th)" }] },
    { number: 3, title: "How Much Can You Carry?", topics: [{ name: "Heavy vs Light" }, { name: "Comparing Weights" }, { name: "The Donkey and His Heavy Sack Story" }] },
    { number: 4, title: "Counting in Tens", topics: [{ name: "Grouping into Tens and Ones" }, { name: "Counting Stick Bundles" }, { name: "The Clever Fox and Chicks" }] },
    { number: 5, title: "Patterns", topics: [{ name: "Tile and Floor Patterns" }, { name: "Border Designs" }, { name: "Number Patterns & Sequences" }] },
    { number: 6, title: "Footprints", topics: [{ name: "Tracing Animal & Human Footprints" }, { name: "2D Shapes: Circles, Rectangles, Triangles" }, { name: "Shape Collage" }] },
    { number: 7, title: "Jugs and Mugs", topics: [{ name: "Volume and Capacity" }, { name: "Measuring Liquid in Liters & Glasses" }, { name: "Thirsty Crow Experiment" }] },
    { number: 8, title: "Tens and Ones", topics: [{ name: "Currency Breakdown (10 Rupee notes & 1 Rupee coins)" }, { name: "Bangles Game Number Counting" }] },
    { number: 9, title: "My Funday", topics: [{ name: "Days of the Week" }, { name: "Months of the Year" }, { name: "Reading a Simple Calendar" }] },
    { number: 10, title: "Add our Points", topics: [{ name: "Mental Addition Techniques" }, { name: "Ball Game Point Counting" }, { name: "Word Problems" }] },
    { number: 11, title: "Lines and Lines", topics: [{ name: "Standing, Sleeping and Slanting Lines" }, { name: "Drawing with Curves" }, { name: "Dancing Lines" }] },
    { number: 12, title: "Give and Take", topics: [{ name: "2-Digit Addition with Regrouping" }, { name: "2-Digit Subtraction with Borrowing" }, { name: "Bangles & Beads Math" }] },
    { number: 13, title: "The Longest Step", topics: [{ name: "Non-standard Units (Fingers, Hand-span, Foot, Pace)" }, { name: "Standard Measuring Scale (cm, m)" }] },
    { number: 14, title: "Birds Come, Birds Go", topics: [{ name: "Story Problems on Addition" }, { name: "Token Cards Mental Calculation" }] },
    { number: 15, title: "How Many Ponytails?", topics: [{ name: "Collecting & Tabulating Class Data" }, { name: "Analyzing Frequencies" }] },
  ],
  class_2_EVS: [
    { number: 1, title: "My Family & Relatives", topics: [{ name: "Joint & Nuclear Families" }, { name: "Family Tree & Relationships" }, { name: "Sharing Work at Home" }] },
    { number: 2, title: "Our Senses & Organs", topics: [{ name: "Five Sensory Organs & Functions" }, { name: "Internal Organs (Heart, Lungs, Brain, Stomach)" }] },
    { number: 3, title: "Food & Healthy Habits", topics: [{ name: "Plant & Animal Food Sources" }, { name: "Vegetarian vs Non-Vegetarian" }, { name: "Clean Drinking Water & Digestion" }] },
    { number: 4, title: "Water Around Us", topics: [{ name: "Sources of Water (Rain, Rivers, Wells)" }, { name: "Uses of Water" }, { name: "Saving Water & Rainwater Harvesting" }] },
    { number: 5, title: "Types of Houses & Shelter", topics: [{ name: "Kutcha & Pucca Houses" }, { name: "Special Houses: Stilt, Igloo, Houseboat, Caravan" }, { name: "Keeping Homes Clean" }] },
    { number: 6, title: "Transport & Communication", topics: [{ name: "Land, Water & Air Transport" }, { name: "Means of Communication (Phone, Post, Internet)" }, { name: "Traffic Signals & Road Rules" }] },
    { number: 7, title: "Seasons, Plants & Animals", topics: [{ name: "The Four Main Seasons" }, { name: "Parts of a Plant & Seed Germination" }, { name: "Animal Habitats & Care" }] },
  ],
  class_2_English: [
    { number: 1, title: "First Day at School & Haldi's Adventure", topics: [{ name: "School Vocabulary & Feelings" }, { name: "Days of the Week" }, { name: "Nouns & Action Words" }] },
    { number: 2, title: "I am Lucky! & I Want", topics: [{ name: "Self-Esteem & Animals" }, { name: "Rhyming Words" }, { name: "Opposites & Describing Words (Adjectives)" }] },
    { number: 3, title: "A Smile & The Wind and the Sun", topics: [{ name: "Fable Comprehension" }, { name: "Pronouns (He, She, It, They)" }, { name: "Speaking Skills" }] },
    { number: 4, title: "Rain & Storm in the Garden", topics: [{ name: "Weather Vocabulary" }, { name: "Snail Story & Sound Words" }, { name: "Prepositions (In, On, Under)" }] },
    { number: 5, title: "Zoo Manners & Funny Bunny", topics: [{ name: "Animal Behavior" }, { name: "Singular & Plural (Adding -s, -es)" }, { name: "Short Story Writing" }] },
    { number: 6, title: "Curlylocks & Make it Shorter", topics: [{ name: "Birbal Wisdom Tale" }, { name: "Comparison of Adjectives" }, { name: "Punctuation (Capital letters, full stop)" }] },
  ],
  class_2_Hindi: [
    { number: 1, title: "ऊँट चला व भालू ने खेली फुटबॉल", topics: [{ name: "रेगिस्तान व वन्यजीव" }, { name: "मात्राओं की पुनरावृत्ति" }, { name: "हास्य कथा पठन" }] },
    { number: 2, title: "म्याऊँ, म्याऊँ! व अधिक बलवान कौन?", topics: [{ name: "सूरज और हवा का संवाद" }, { name: "विलोम शब्द व पर्यायवाची शब्द" }, { name: "संज्ञा शब्द पहचान" }] },
    { number: 3, title: "दोस्त की मदद व बहुत हुआ!", topics: [{ name: "कछुआ और तेंदुए की कहानी" }, { name: "वर्षा ऋतु पर कविता" }, { name: "क्रिया शब्द" }] },
    { number: 4, title: "मेरी किताब व तितली और कली", topics: [{ name: "पुस्तकालय भ्रमण" }, { name: "लिंग बदलो व वचन बदलो" }, { name: "प्रकृति वर्णन" }] },
    { number: 5, title: "बुलबुल व मीठी सारंगी", topics: [{ name: "पक्षी पहचान" }, { name: "मूर्खता और समझदारी की कथा" }, { name: "सरल अनुच्छेद लेखन" }] },
    { number: 6, title: "बस के नीचे बाघ व नटखट चूहा", topics: [{ name: "रोमांचक बाल कथा" }, { name: "संवाद वाचन" }, { name: "चित्र देखकर वाक्य बनाना" }] },
  ],

  // ===================== CLASS 3 =====================
  class_3_Mathematics: [
    { number: 1, title: "Where to Look From", topics: [{ name: "Top, Front and Side Views" }, { name: "Dot Grid Drawing" }, { name: "Mirror Halves and Line of Symmetry" }] },
    { number: 2, title: "Fun with Numbers", topics: [{ name: "3-Digit Numbers (Place Value & Face Value)" }, { name: "Expanded Notation" }, { name: "Counting in 10s, 50s, 100s" }, { name: "Cricket Century Scores Calculation" }] },
    { number: 3, title: "Give and Take", topics: [{ name: "Mental Addition & Subtraction Strategies" }, { name: "Jump Steps on Number Grid" }, { name: "3-Digit Addition with Regrouping" }] },
    { number: 4, title: "Long and Short", topics: [{ name: "Centimeters, Meters, Kilometers" }, { name: "Measuring Body Dimensions" }, { name: "Map Distance Calculation" }] },
    { number: 5, title: "Shapes and Designs", topics: [{ name: "Edges and Corners (Straight vs Curved)" }, { name: "Tangram Puzzles" }, { name: "Tessellation & Floor Tiling Patterns" }] },
    { number: 6, title: "Fun with Give and Take", topics: [{ name: "3-Digit Subtraction with Borrowing" }, { name: "Checking Subtraction with Addition" }, { name: "Story Problems on Shopping" }] },
    { number: 7, title: "Time Goes On", topics: [{ name: "Reading Clocks (Hours & Minutes)" }, { name: "Timeline of Life Events" }, { name: "Calendar Math (Days, Weeks, Leap Years)" }] },
    { number: 8, title: "Who is Heavier?", topics: [{ name: "Kilograms (kg) and Grams (g)" }, { name: "Balancing Scales" }, { name: "Weight Estimation of Animals & Goods" }] },
    { number: 9, title: "How Many Times?", topics: [{ name: "Multiplication as Repeated Addition" }, { name: "Multiplication Tables 2 to 10" }, { name: "Multiplication by 10, 20, 30" }, { name: "Box Multiplication Method" }] },
    { number: 10, title: "Play with Patterns", topics: [{ name: "Number & Letter Sequences" }, { name: "Even and Odd Numbers" }, { name: "Secret Messages Decoding" }] },
    { number: 11, title: "Jugs and Mugs", topics: [{ name: "Liters (L) and Milliliters (mL)" }, { name: "Capacity Estimation" }, { name: "Medicine Dropper vs Water Bucket Volume" }] },
    { number: 12, title: "Can We Share?", topics: [{ name: "Division as Equal Sharing & Grouping" }, { name: "Division as Repeated Subtraction" }, { name: "Relation Between Multiplication & Division" }] },
    { number: 13, title: "Smart Charts", topics: [{ name: "Tally Marks Recording" }, { name: "Drawing Pictographs" }, { name: "Reading Simple Bar Graphs" }] },
    { number: 14, title: "Rupees and Paise", topics: [{ name: "Converting Rupees to Paise" }, { name: "Adding & Subtracting Money" }, { name: "Making Cash Memos and Receipts" }] },
  ],
  class_3_EVS: [
    { number: 1, title: "Poonam's Day out & Plant Fairy", topics: [{ name: "Animal Classification (Fly, Crawl, Walk)" }, { name: "Leaves Diversity & Plant Parts" }, { name: "Bark Rubbing Activity" }] },
    { number: 2, title: "Water O' Water! & Chhotu's House", topics: [{ name: "States of Water & Water Cycle Poems" }, { name: "Storage of Drinking Water" }, { name: "Types of Shelter & Cleanliness" }] },
    { number: 3, title: "Foods We Eat & Saying without Speaking", topics: [{ name: "Regional Foods of India (Dhokla, Idli, Dosa)" }, { name: "Nutritious Diets" }, { name: "Sign Language & Facial Mudras" }] },
    { number: 4, title: "Flying High & What is Cooking?", topics: [{ name: "Bird Beaks, Feathers, Claws & Sounds" }, { name: "Utensil Materials (Clay, Copper, Steel)" }, { name: "Cooking Methods (Boil, Bake, Fry, Steam)" }] },
    { number: 5, title: "Work We Do & Sharing Our Feelings", topics: [{ name: "Community Helpers & Occupations" }, { name: "Child Labor Awareness" }, { name: "Louis Braille & Braille Script" }] },
    { number: 6, title: "The Story of Food & Making Pots", topics: [{ name: "Medicinal Herbs (Tulsi, Turmeric, Ginger)" }, { name: "Plant vs Animal Food Origins" }, { name: "Potter's Wheel & History of Clay Pots" }] },
    { number: 7, title: "A House Like This! & Drop by Drop", topics: [{ name: "Houses in Assam, Ladakh, Rajasthan & Kerala" }, { name: "Water Scarcity & Rainwater Harvesting" }, { name: "Web of Life: Ecological Balance" }] },
  ],

  // ===================== CLASS 4 =====================
  class_4_Mathematics: [
    { number: 1, title: "Building with Bricks", topics: [{ name: "Brick Floor & Wall Patterns" }, { name: "Arch Shapes & Jali Patterns" }, { name: "3D Drawing of Bricks" }] },
    { number: 2, title: "Long and Short", topics: [{ name: "Standard Length Units (mm, cm, m, km)" }, { name: "High Jump and Long Jump Records" }, { name: "Marathon Running Distance Math" }] },
    { number: 3, title: "A Trip to Bhopal", topics: [{ name: "Speed, Time and Distance" }, { name: "Bus Seating & Fuel Tank Calculations" }, { name: "Ticket Pricing Word Problems" }] },
    { number: 4, title: "Tick-Tick-Tick", topics: [{ name: "12-Hour vs 24-Hour Railway Clock" }, { name: "Time Intervals and Duration" }, { name: "Manufacturing & Expiry Dates Calculation" }] },
    { number: 5, title: "The Way The World Looks", topics: [{ name: "Floor Maps and Perspective Views" }, { name: "Reading Directions on a City Map" }] },
    { number: 6, title: "The Junk Seller", topics: [{ name: "Profit and Loss Calculations" }, { name: "Loan and Interest Concepts" }, { name: "Currency Multiplication Calculations" }] },
    { number: 7, title: "Jugs and Mugs", topics: [{ name: "Liters and Milliliters Conversions" }, { name: "Medicine Dosage Calculations" }, { name: "Water Consumption in Daily Life" }] },
    { number: 8, title: "Carts and Wheels", topics: [{ name: "Circular Shapes Around Us" }, { name: "Radius, Diameter, Center of Circle" }, { name: "Using Compass to Draw Circles" }] },
    { number: 9, title: "Halves and Quarters", topics: [{ name: "Fractions: Half (1/2), Quarter (1/4), Three-Quarters (3/4)" }, { name: "Fraction of a Shape and Collection" }, { name: "Equivalent Fractions" }] },
    { number: 10, title: "Play with Patterns", topics: [{ name: "Rotational Patterns (1/4 Turn, 1/2 Turn)" }, { name: "Magic Squares and Number Towers" }] },
    { number: 11, title: "Tables and Shares", topics: [{ name: "Extended Multiplication Tables (up to 20)" }, { name: "Division Word Problems & Long Division" }] },
    { number: 12, title: "How Heavy? How Light?", topics: [{ name: "Weight Conversions (kg and g)" }, { name: "Balancing Pan Scales" }, { name: "Estimating Weights of Vehicles and Animals" }] },
    { number: 13, title: "Fields and Fences", topics: [{ name: "Concept of Perimeter" }, { name: "Calculating Perimeter of Rectangles and Squares" }, { name: "Boundary Problems of Irregular Fields" }] },
    { number: 14, title: "Smart Charts", topics: [{ name: "Bar Graphs with Scaled Axes" }, { name: "Pie Charts (Chapati Charts)" }, { name: "Data Tables Interpretation" }] },
  ],
  class_4_EVS: [
    { number: 1, title: "Going to School & Ear to Ear", topics: [{ name: "Modes of Transport in Difficult Terrains (Bamboo Bridge, Trolley, Vallam)" }, { name: "Animal Ears, Skin Patterns & Reproduction" }] },
    { number: 2, title: "A Day with Nandu & The Story of Amrita", topics: [{ name: "Elephant Herd Structure & Behavior" }, { name: "Khejadi Trees & Bishnoi Conservation Movement" }] },
    { number: 3, title: "Anita and the Honeybees & Omana's Journey", topics: [{ name: "Girl Child Education & Beekeeping" }, { name: "Train Travel from Gujarat to Kerala & Railway Tickets" }] },
    { number: 4, title: "From the Window & Reaching Grandmother's House", topics: [{ name: "Western Ghats, Tunnels, Bridges, Level Crossings" }, { name: "Ferry Rides & Time-tables" }] },
    { number: 5, title: "Hu Tu Tu & The Valley of Flowers", topics: [{ name: "Kabaddi Rules & Karnam Malleswari" }, { name: "Uttarakhand Flora & Madhubani Art" }] },
    { number: 6, title: "Basva's Farm & From Market to Home", topics: [{ name: "Onion Cultivation Process (Ploughing, Sowing, Weeding, Harvesting)" }, { name: "Vegetable Vendor Routine & Spoilage Prevention" }] },
    { number: 7, title: "Too Much Water, Too Little Water & Pochampalli", topics: [{ name: "Water Contamination, Diarrhea & ORS Preparation" }, { name: "Pochampalli Ikat Silk Weaving Heritage" }] },
    { number: 8, title: "Home and Abroad & Defence Officer: Wahida", topics: [{ name: "Abu Dhabi Comparison (Currency, Climate, Desert Life)" }, { name: "First Woman Naval Surgeon: Lieutenant Commander Wahida Prism" }] },
  ],

  // ===================== CLASS 5 =====================
  class_5_Mathematics: [
    { number: 1, title: "The Fish Tale", topics: [{ name: "Large Numbers up to 1 Crore (Indian Place Value System)" }, { name: "Speed, Distance and Time Calculation" }, { name: "Fish Market Economics and Women's Co-operative Bank" }] },
    { number: 2, title: "Shapes and Angles", topics: [{ name: "Angles: Right Angle (90°), Acute Angle (<90°), Obtuse Angle (>90°)" }, { name: "Angle Tester and Degree Clock" }, { name: "Angles in Names and Letters" }] },
    { number: 3, title: "How Many Squares?", topics: [{ name: "Concept of Area on Grid Paper" }, { name: "Area and Perimeter of Rectangles and Right Triangles" }, { name: "Estimating Footprint Area" }] },
    { number: 4, title: "Parts and Wholes", topics: [{ name: "Fractions of Flags and Geometric Figures" }, { name: "Equivalent Fractions and Simplifying" }, { name: "Rupees and Paise as Fractions" }] },
    { number: 5, title: "Does it Look the Same?", topics: [{ name: "Mirror Line Symmetry" }, { name: "Half Turn (180°), Quarter Turn (90°), One-Third Turn, One-Sixth Turn" }, { name: "Symmetric English Letters and Numbers" }] },
    { number: 6, title: "Be My Multiple, I'll be Your Factor", topics: [{ name: "Multiples and Common Multiples (LCM)" }, { name: "Factors and Common Factors (HCF)" }, { name: "Prime and Composite Numbers" }, { name: "Factor Trees" }] },
    { number: 7, title: "Can You See the Pattern?", topics: [{ name: "Turn Rules for Patterns" }, { name: "Number Magic: Palindromes and Magic Hexagons" }, { name: "Calendar Number Tricks" }] },
    { number: 8, title: "Mapping Your Way", topics: [{ name: "Map of India and New Delhi Central Vista" }, { name: "Map Scale (1 cm = 100 km)" }, { name: "Calculating Distance on Maps" }] },
    { number: 9, title: "Boxes and Sketches", topics: [{ name: "2D Nets of 3D Shapes (Cube, Cuboid, Cone, Cylinder)" }, { name: "Floor Maps and Deep Drawings of Houses" }, { name: "Isometric Dot Paper Drawing" }] },
    { number: 10, title: "Tenths and Hundredths", topics: [{ name: "Decimal Numbers (Tenths 0.1, Hundredths 0.01)" }, { name: "Measurement in mm, cm, m using Decimals" }, { name: "Money Calculations with Decimals" }] },
    { number: 11, title: "Area and its Boundary", topics: [{ name: "Formula for Perimeter of Rectangle = 2*(L+B)" }, { name: "Formula for Area of Rectangle = L*B" }, { name: "Area of Square = Side*Side" }, { name: "Threading Perimeter Comparison" }] },
    { number: 12, title: "Smart Charts", topics: [{ name: "Tally Marks Frequency Tables" }, { name: "Bar Graphs with Scaled Data" }, { name: "Pie Charts and Temperature Line Graphs" }] },
    { number: 13, title: "Ways to Multiply and Divide", topics: [{ name: "Multi-digit Multiplication Algorithms (Maniratnam & Bela Methods)" }, { name: "Division with Large Numbers" }, { name: "Real-world Story Problems" }] },
    { number: 14, title: "How Big? How Heavy?", topics: [{ name: "Concept of Volume (Cubic Centimeters cm³)" }, { name: "Volume of Cubes and Cuboids (L*B*H)" }, { name: "Water Displacement Method for Volume" }, { name: "Weight of Large Collections" }] },
  ],
  class_5_EVS: [
    { number: 1, title: "Super Senses", topics: [{ name: "Ant Trails and Chemical Pheromones" }, { name: "Dog Scent and Eagle Vision" }, { name: "Bat Echolocation & Animal Sleep Patterns" }, { name: "Tiger Senses & National Parks of India" }] },
    { number: 2, title: "A Snake Charmer's Story", topics: [{ name: "Kalbeliya Community & Been Instruments" }, { name: "Poisonous Snakes of India (Cobra, Krait, Russell's Viper, Saw-scaled Viper)" }, { name: "Snake Fangs, Venom & Antivenom Medicine" }] },
    { number: 3, title: "From Tasting to Digesting", topics: [{ name: "Tongue Taste Zones (Sweet, Salty, Sour, Bitter)" }, { name: "Dr. Beaumont's Stomach Experiment" }, { name: "Glucose Drip, Nutrition & Proper Food for Growth" }] },
    { number: 4, title: "Mangoes Round the Year & Seeds and Seeds", topics: [{ name: "Mamidi Tandra / Aam Papad Preparation" }, { name: "Food Spoilage vs Preservation" }, { name: "Seed Germination & Dispersal Mechanisms (Wind, Water, Animals, Pods)" }] },
    { number: 5, title: "Every Drop Counts & Experiments with Water", topics: [{ name: "Ghadsisar Lake Jaisalmer, Stepwells (Baolis) & Johads" }, { name: "Floating vs Sinking (Density)" }, { name: "Dead Sea Salinity & Dandi March Salt Law" }] },
    { number: 6, title: "A Treat for Mosquitoes & Up You Go!", topics: [{ name: "Malaria, Ronald Ross Discovery & Anopheles Mosquito" }, { name: "Anaemia, Haemoglobin & Iron-rich Foods (Jaggery, Amla, Green leafy veg)" }, { name: "Mountaineering Camp & Bachendri Pal Everest Ascent" }] },
    { number: 7, title: "Walls Tell Stories & Sunita in Space", topics: [{ name: "Golconda Fort Architecture, Bastions, Cannons & Ancient Water Engineering" }, { name: "Astronaut Sunita Williams Space Shuttle Experience & Gravity" }] },
    { number: 8, title: "What if it Finishes...? & A Shelter so High!", topics: [{ name: "Petroleum Formation, Crude Oil Refining, LPG, CNG & Conservation" }, { name: "Changpa Nomads of Ladakh, Pashmina Goats, Rebo Tents & Leh Architecture" }] },
    { number: 9, title: "When the Earth Shook! & Blow Hot, Blow Cold", topics: [{ name: "Bhuj Gujarat Earthquake 2001 & Disaster Safety Drills" }, { name: "Breathing, Temperature Regulation, Condensation & Stethoscope Principle" }] },
    { number: 10, title: "Whose Forests? & A Seed Tells a Farmer's Story", topics: [{ name: "Suryamani Kuduk Community, Torang & Forest Rights Act 2007" }, { name: "Traditional Organic Farming vs Modern Chemical Fertilizers & Heirloom Seeds" }] },
  ],
  class_5_Science: [
    { number: 1, title: "Plant Reproduction & Agriculture", topics: [{ name: "Structure of a Seed & Conditions for Germination" }, { name: "Seed Dispersal by Wind, Water, Animals & Explosion" }, { name: "Reproduction from Roots, Stems, and Leaves" }, { name: "Crops, Seasons (Kharif & Rabi) and Modern Agricultural Practices" }] },
    { number: 2, title: "Animal Habitats & Adaptations", topics: [{ name: "Terrestrial, Aquatic, Amphibian, Aerial & Arboreal Animals" }, { name: "Breathing Organs: Lungs, Gills, Spiracles & Moist Skin" }, { name: "Feeding Habits: Herbivores, Carnivores, Omnivores & Rodents" }, { name: "Migration Patterns in Birds and Monarch Butterflies" }] },
    { number: 3, title: "Human Skeletal & Muscular Systems", topics: [{ name: "Functions of Skeletal System & 206 Bones" }, { name: "Skull, Backbone, Ribcage & Limbs" }, { name: "Movable Joints: Ball & Socket, Hinge, Pivot, Gliding" }, { name: "Voluntary, Involuntary & Cardiac Muscles" }] },
    { number: 4, title: "Nervous System & Sense Organs", topics: [{ name: "Brain Parts: Cerebrum, Cerebellum, Medulla Oblongata" }, { name: "Spinal Cord & Reflex Action Pathway" }, { name: "Sensory, Motor & Mixed Nerves" }, { name: "Structure and Hygiene of Eye, Ear, Nose, Tongue, and Skin" }] },
    { number: 5, title: "Food, Health, Hygiene & Diseases", topics: [{ name: "Macronutrients: Carbohydrates, Fats, Proteins & Micronutrients: Vitamins, Minerals" }, { name: "Balanced Diet, Roughage & Water Balance" }, { name: "Deficiency Diseases (Night Blindness, Beriberi, Scurvy, Rickets, Goitre, Anaemia)" }, { name: "Communicable Diseases, Germ Transmission & Vaccination Immunity" }] },
    { number: 6, title: "Safety, Prevention and First Aid", topics: [{ name: "Fire Safety: Fire Extinguishers & Dealing with Electrical/Gas Fires" }, { name: "First Aid for Cuts, Bruises, Nosebleeds & Burns" }, { name: "Treatment for Insect Stings, Dog Bites & Snake Bites" }, { name: "Handling Fractures, Splints, Slings & Sprains" }] },
    { number: 7, title: "Air, Atmosphere and Water Purification", topics: [{ name: "Atmospheric Layers: Troposphere, Stratosphere, Mesosphere, Thermosphere, Exosphere" }, { name: "Properties & Composition of Air (Oxygen, Nitrogen, Carbon Dioxide, Rare Gases)" }, { name: "Soluble and Insoluble Impurities in Water" }, { name: "Sedimentation, Decantation, Filtration, Distillation & Chlorination" }] },
    { number: 8, title: "The Earth, Sun, Moon & Eclipses", topics: [{ name: "Internal Structure of Earth: Crust, Mantle, Outer Core, Inner Core" }, { name: "Phases of the Moon and Surface Features (Craters, Seas)" }, { name: "Solar Eclipse and Lunar Eclipse (Umbra & Penumbra)" }, { name: "Artificial Satellites & Space Exploration (Aryabhata, Chandrayaan, Mangalyaan)" }] },
    { number: 9, title: "Matter, Materials & Changes", topics: [{ name: "Arrangement of Molecules in Solids, Liquids, and Gases" }, { name: "Solutes, Solvents, Solutions & Saturation Point" }, { name: "Miscible and Immiscible Liquids" }, { name: "Physical Changes vs Irreversible Chemical Changes" }] },
    { number: 10, title: "Force, Work, Energy & Simple Machines", topics: [{ name: "Types of Force: Gravitational, Frictional, Magnetic, Electrostatic & Buoyant" }, { name: "Scientific Definition of Work & Mechanical Energy" }, { name: "Forms of Energy: Solar, Wind, Hydro, Chemical, Geothermal & Sound" }, { name: "Simple Machines: Levers (Class 1, 2, 3), Pulleys, Wheel and Axle, Inclined Plane, Screw, Wedge" }] },
    { number: 11, title: "Natural Calamities & Environmental Care", topics: [{ name: "Causes and Precautions for Earthquakes & Seismograph Richter Scale" }, { name: "Volcanoes (Active, Dormant, Extinct), Cyclones & Tsunamis" }, { name: "Droughts, Floods & Rainwater Harvesting" }, { name: "3 R's: Reduce, Reuse, Recycle and Global Warming Mitigation" }] },
  ],
};

async function seedDatabase() {
  try {
    await connection();
    console.log("Connected to MongoDB for seeding...");

    // 1. Seed Institute
    let institute = await Institute.findOne({ slug: "apex-academy" });
    if (!institute) {
      institute = await Institute.create({
        name: "Apex Academy - Success Mentor",
        slug: "apex-academy",
        tagline: "Premier Coaching for CBSE Classes 1 to 10",
        description:
          "Dedicated tuition and concept-building center with verified batch schedules, live attendance tracking, and transparent progress reports for parents.",
        address: {
          street: "Block B, Sector 14, Main Market",
          city: "Delhi NCR",
          state: "Delhi",
          pincode: "110001",
        },
        contact_email: "contact@successmentor.com",
        contact_phone: "+91 98765 43210",
        classes_offered: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        logo_url: "/logo.png",
        banner_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
        status: "ACTIVE",
      });
      console.log("Created Institute: Apex Academy");
    }

    // 2. Seed Admin User
    let adminUser = await User.findOne({ email: "admin@successmentor.com" });
    if (!adminUser) {
      adminUser = await User.create({
        name: "Sharma Coaching Admin",
        email: "admin@successmentor.com",
        phone: "9876543210",
        password: "adminpassword123",
        role: "ADMIN",
        institute_id: institute._id,
        status: "ACTIVE",
      });
      institute.admin_user_id = adminUser._id;
      await institute.save();
      console.log("Created Admin User: admin@successmentor.com (Pass: adminpassword123)");
    }

    // 3. Seed Teachers with Classes 1 to 5 Dedicated Primary Faculty
    const teacherConfigs = [
      {
        name: "Amit Kumar",
        email: "amit@successmentor.com",
        phone: "9876500003",
        qualifications: ["B.Sc Mathematics", "D.El.Ed", "CTET Primary Certified"],
        specializations: ["Class 1-3 Mathematics", "Foundational Numeracy", "Mental Math & Abacus"],
        assigned_classes: [1, 2, 3],
        primary_subject: "Primary Mathematics",
        experience_years: 6,
        rating: 4.9,
        bio: "Patient, interactive primary tutor specializing in concrete manipulatives, mental arithmetic drills, and early number mastery for Classes 1 to 3.",
        photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      },
      {
        name: "Sunita Rao",
        email: "sunita@successmentor.com",
        phone: "9876500004",
        qualifications: ["M.Sc Environmental Science", "B.Ed", "Primary Pedagogy Specialist"],
        specializations: ["Class 1-5 EVS", "Class 5 General Science", "Nature & Living Systems"],
        assigned_classes: [1, 2, 3, 4, 5],
        primary_subject: "EVS & Primary Science",
        experience_years: 7,
        rating: 4.95,
        bio: "Passionate about bringing science and environment alive through hands-on models, plant experiments, and real-world observation techniques for Classes 1 to 5.",
        photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      },
      {
        name: "Ananya Deshmukh",
        email: "ananya@successmentor.com",
        phone: "9876500005",
        qualifications: ["M.A English Literature", "CELTA Certified", "Early Childhood Educator"],
        specializations: ["Class 1-5 English", "Phonics & Pronunciation", "Creative Writing & Grammar"],
        assigned_classes: [1, 2, 3, 4, 5],
        primary_subject: "English & Phonics",
        experience_years: 6,
        rating: 4.85,
        bio: "Specialist in building strong phonetic foundations, fluent vocabulary, and expressive composition skills for junior school learners in Classes 1 to 5.",
        photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      },
      {
        name: "Kavita Shastri",
        email: "kavita@successmentor.com",
        phone: "9876500006",
        qualifications: ["M.A Hindi", "B.Ed", "Gold Medalist"],
        specializations: ["Class 1-5 Hindi", "Hindi Vyakaran (Grammar)", "Matra & Pronunciation Clarity"],
        assigned_classes: [1, 2, 3, 4, 5],
        primary_subject: "Hindi & Vyakaran",
        experience_years: 8,
        rating: 4.9,
        bio: "Dedicated Hindi educator focused on error-free Matra application, pure pronunciation, and engaging storytelling for Classes 1 to 5.",
        photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      },
      {
        name: "Vikram Sengupta",
        email: "vikram@successmentor.com",
        phone: "9876500007",
        qualifications: ["B.Tech", "M.Sc Applied Mathematics"],
        specializations: ["Class 4-5 Mathematics", "Class 5 Science", "Class 6-7 Maths Foundation"],
        assigned_classes: [4, 5, 6, 7],
        primary_subject: "Upper Primary Maths & Science",
        experience_years: 7,
        rating: 4.8,
        bio: "Expert in upper primary mathematical logic, geometry visualizations, and smoothing the transition into middle school academics.",
        photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      },
      {
        name: "Rajesh Sharma",
        email: "rajesh@successmentor.com",
        phone: "9876500001",
        qualifications: ["M.Sc Mathematics", "B.Ed"],
        specializations: ["Class 9-10 Mathematics", "Class 9-10 Science", "CBSE Board Preparation"],
        assigned_classes: [8, 9, 10],
        primary_subject: "Secondary Maths & Science",
        experience_years: 9,
        rating: 4.95,
        bio: "Specialist in CBSE Class 9-10 Board Exam preparation, problem breakdown strategies, and 100% concept mastery.",
        photo_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
      },
      {
        name: "Pooja Verma",
        email: "pooja@successmentor.com",
        phone: "9876500002",
        qualifications: ["M.A English", "B.Ed"],
        specializations: ["Class 6-10 English", "Class 6-10 Social Science", "History & Civics"],
        assigned_classes: [6, 7, 8, 9, 10],
        primary_subject: "Secondary English & Humanities",
        experience_years: 6,
        rating: 4.85,
        bio: "Passionate educator focusing on language mastery, analytical reading, and conceptual clarity in social sciences.",
        photo_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
      },
    ];

    const teacherDocs = [];
    for (const tConfig of teacherConfigs) {
      let tUser = await User.findOne({ email: tConfig.email });
      if (!tUser) {
        tUser = await User.create({
          name: tConfig.name,
          email: tConfig.email,
          phone: tConfig.phone,
          password: "teacherpassword123",
          role: "TEACHER",
          institute_id: institute._id,
          status: "ACTIVE",
        });
      }
      let tProfile = await Teacher.findOne({ user_id: tUser._id });
      if (!tProfile) {
        tProfile = await Teacher.create({
          user_id: tUser._id,
          institute_id: institute._id,
          name: tConfig.name,
          email: tConfig.email,
          phone: tConfig.phone,
          qualifications: tConfig.qualifications,
          specializations: tConfig.specializations,
          assigned_classes: tConfig.assigned_classes,
          primary_subject: tConfig.primary_subject,
          experience_years: tConfig.experience_years,
          rating: tConfig.rating,
          bio: tConfig.bio,
          photo_url: tConfig.photo_url,
        });
        tUser.profile_id = tProfile._id;
        await tUser.save();
      } else {
        tProfile.qualifications = tConfig.qualifications;
        tProfile.specializations = tConfig.specializations;
        tProfile.assigned_classes = tConfig.assigned_classes;
        tProfile.primary_subject = tConfig.primary_subject;
        tProfile.experience_years = tConfig.experience_years;
        tProfile.rating = tConfig.rating;
        tProfile.bio = tConfig.bio;
        tProfile.photo_url = tConfig.photo_url;
        await tProfile.save();
      }
      teacherDocs.push(tProfile);
    }
    console.log(`Seeded ${teacherDocs.length} Teachers.`);

    // 4. Seed Classes & Subjects from JSON with Detailed Curriculum
    const jsonPath = path.join(__dirname, "../cbse_class_1_to_10_data.json");
    if (fs.existsSync(jsonPath)) {
      const rawText = fs.readFileSync(jsonPath, "utf-8");
      const cleanJson = rawText.replace(/\/\/.*$/gm, "");
      const data = JSON.parse(cleanJson);

      // Seed Classes 1 to 10
      for (const cls of data.classes) {
        const classNum = parseInt(cls.name.replace(/\D/g, ""), 10) || 1;
        await Class.findByIdAndUpdate(
          cls._id,
          {
            _id: cls._id,
            name: cls.name,
            class_number: classNum,
            description: cls.description || `Standard CBSE Class ${classNum} curriculum.`,
            class_url: cls.class_url,
            monthly_base_fee: 1500 + classNum * 150,
          },
          { upsert: true, new: true }
        );
      }
      console.log(`Seeded ${data.classes.length} Classes (Class 1 to 10).`);

      // Seed Subjects
      for (const subj of data.subjects) {
        await Subject.findByIdAndUpdate(
          subj._id,
          {
            _id: subj._id,
            name: subj.name,
            class_id: subj.class_id,
            subject_url: subj.subject_url,
            color_code: subj.name.includes("Math")
              ? "#304b62"
              : subj.name.includes("Sci") || subj.name.includes("EVS")
              ? "#d49539"
              : "#2e7d32",
          },
          { upsert: true, new: true }
        );
      }
      console.log(`Seeded ${data.subjects.length} Subjects.`);

      // Seed Syllabus with Exact CBSE Chapter Hierarchy & Realistic Progress
      for (const syl of data.syllabus) {
        const subjectDoc = await Subject.findById(syl.subject_id);
        const subjName = subjectDoc ? subjectDoc.name : "";
        const classId = subjectDoc ? subjectDoc.class_id : "class_1";

        let chapters = [];

        // Check if specific class & subject curriculum exists
        const lookupKey = `${classId}_${subjName.split(" ")[0]}`;
        if (cbseCurriculumByClassAndSubject[lookupKey]) {
          chapters = cbseCurriculumByClassAndSubject[lookupKey].map((ch) => {
            const isFullyCompleted = ch.number <= 2;
            const isInProgress = ch.number === 3;

            return {
              number: ch.number,
              title: ch.title,
              estimated_hours: 8,
              topics: ch.topics.map((t, idx) => {
                const isTopicDone = isFullyCompleted || (isInProgress && idx < 2);
                return {
                  topic_id: `top_${ch.number}_${idx + 1}`,
                  name: t.name,
                  is_completed: isTopicDone,
                  completed_at: isTopicDone ? new Date() : null,
                };
              }),
            };
          });
        } else {
          // Fallback generic chapters
          chapters = [
            {
              number: 1,
              title: "Core Foundations and Definitions",
              estimated_hours: 8,
              topics: [
                { name: "Key Concepts and Terminology", is_completed: true, completed_at: new Date() },
                { name: "Practical Exercises & Examples", is_completed: true, completed_at: new Date() },
              ],
            },
            {
              number: 2,
              title: "Conceptual Applications and Drills",
              estimated_hours: 8,
              topics: [
                { name: "Guided Practice Problems", is_completed: true, completed_at: new Date() },
                { name: "Worksheet Assessments", is_completed: true, completed_at: new Date() },
              ],
            },
            {
              number: 3,
              title: "Advanced Problem Solving & Applications",
              estimated_hours: 8,
              topics: [
                { name: "Critical Thinking Problems", is_completed: true, completed_at: new Date() },
                { name: "Revision Worksheets & Unit Test", is_completed: false },
              ],
            },
            {
              number: 4,
              title: "Term 2 Comprehensive Mastery",
              estimated_hours: 8,
              topics: [
                { name: "Advanced Concept Modules", is_completed: false },
                { name: "Annual Exam Revision Series", is_completed: false },
              ],
            },
          ];
        }

        await Syllabus.findOneAndUpdate(
          { subject_id: syl.subject_id },
          {
            subject_id: syl.subject_id,
            class_id: classId,
            syllabus_url: syl.syllabus_url,
            chapters: chapters,
          },
          { upsert: true, new: true }
        );
      }
      console.log(`Seeded Authentic CBSE Syllabus trees for Classes 1 to 5 and Higher Classes.`);
    }

    // 5. Seed Batches
    let batch1 = await Batch.findOne({ name: "Class 1 - Primary Stars Foundation Batch" });
    if (!batch1) {
      batch1 = await Batch.create({
        institute_id: institute._id,
        name: "Class 1 - Primary Stars Foundation Batch",
        class_id: "class_1",
        class_number: 1,
        subject_ids: ["class_1_subject_3", "class_1_subject_4"],
        teacher_ids: [teacherDocs[2]._id], // Amit Kumar
        schedule: [
          { day: "MON", start_time: "15:30", end_time: "16:45", subject_id: "class_1_subject_3", room: "Junior Room 1" },
          { day: "WED", start_time: "15:30", end_time: "16:45", subject_id: "class_1_subject_4", room: "Junior Room 1" },
          { day: "FRI", start_time: "15:30", end_time: "16:45", subject_id: "class_1_subject_3", room: "Junior Room 1" },
        ],
        monthly_fee: 1650,
        max_capacity: 15,
        status: "ACTIVE",
      });
      console.log("Created Batch: Class 1 Primary Stars");
    }

    let batch2 = await Batch.findOne({ name: "Class 2 - Bright Minds Batch" });
    if (!batch2) {
      batch2 = await Batch.create({
        institute_id: institute._id,
        name: "Class 2 - Bright Minds Batch",
        class_id: "class_2",
        class_number: 2,
        subject_ids: ["class_2_subject_3", "class_2_subject_4"],
        teacher_ids: [teacherDocs[2]._id],
        schedule: [
          { day: "TUE", start_time: "15:30", end_time: "16:45", subject_id: "class_2_subject_3", room: "Junior Room 2" },
          { day: "THU", start_time: "15:30", end_time: "16:45", subject_id: "class_2_subject_4", room: "Junior Room 2" },
          { day: "SAT", start_time: "11:00", end_time: "12:15", subject_id: "class_2_subject_3", room: "Junior Room 2" },
        ],
        monthly_fee: 1800,
        max_capacity: 15,
        status: "ACTIVE",
      });
      console.log("Created Batch: Class 2 Bright Minds");
    }

    console.log("\n=======================================================");
    console.log("SUCCESS MENTOR CBSE CLASS 1 TO 5 SEEDING COMPLETED!");
    console.log("=======================================================\n");

    process.exit(0);
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
}

seedDatabase();
