-- Seed data for Abuzar Software Solutions (idempotent)

-- Admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role)
VALUES ('Abuzar Ahmed', 'admin@abuzarsoftware.com', '$2b$10$8IKapY/ZG8jX36KtYSQRWOusViRybUzPKxY9SDsrKN4S4V0JowyIy', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Services
INSERT INTO services (title, icon, description, image, sort_order)
SELECT * FROM (VALUES
  ('Website Development', '🌐', 'Blazing-fast, responsive and SEO-optimized websites built with modern frameworks that convert visitors into customers.', '', 1),
  ('WordPress Development', '📝', 'Custom WordPress themes, plugins and WooCommerce stores that are easy to manage and built to scale.', '', 2),
  ('React Development', '⚛️', 'Interactive single-page applications and complex dashboards built with React, Next.js and TypeScript.', '', 3),
  ('Node.js Development', '🟢', 'Scalable backend APIs, microservices and real-time systems powered by Node.js and modern databases.', '', 4),
  ('Ecommerce Website', '🛒', 'Complete online stores with secure payments, inventory management and conversion-focused checkout flows.', '', 5),
  ('SEO', '📈', 'Technical SEO, on-page optimization and content strategy that puts your business on the first page of Google.', '', 6),
  ('UI/UX Design', '🎨', 'User research, wireframes and pixel-perfect interfaces that make your product delightful to use.', '', 7),
  ('Mobile App Development', '📱', 'Cross-platform iOS and Android apps built with React Native — one codebase, native performance.', '', 8),
  ('Software Development', '⚙️', 'Custom business software, ERPs, CRMs and automation tools tailored precisely to your workflows.', '', 9)
) AS v(title, icon, description, image, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM services);

-- Projects
INSERT INTO projects (title, category, description, technologies, github_url, live_url, image, featured, created_at)
SELECT * FROM (VALUES
  ('FinSight Analytics Dashboard', 'Web App', 'A real-time financial analytics platform with interactive charts, forecasting and multi-tenant reporting for a fintech startup.', 'React, Next.js, PostgreSQL, Tailwind CSS', 'https://github.com/abuzarsoftware/finsight', 'https://finsight.example.com', 'https://images.pexels.com/photos/12969403/pexels-photo-12969403.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', true, now() - interval '10 days'),
  ('ShopEase Ecommerce Platform', 'Ecommerce', 'A full-featured online store with Stripe payments, inventory sync, discount engine and an admin panel processing 10k+ orders monthly.', 'Next.js, Node.js, Stripe, PostgreSQL', 'https://github.com/abuzarsoftware/shopease', 'https://shopease.example.com', 'https://images.pexels.com/photos/29502370/pexels-photo-29502370.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', true, now() - interval '25 days'),
  ('TeamFlow Collaboration Suite', 'Software', 'Enterprise team collaboration software with real-time messaging, task boards and video conferencing for distributed teams.', 'React, Node.js, WebSockets, Redis', 'https://github.com/abuzarsoftware/teamflow', 'https://teamflow.example.com', 'https://images.pexels.com/photos/8284729/pexels-photo-8284729.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', true, now() - interval '40 days'),
  ('DevTrack Issue Manager', 'Web App', 'A lightweight issue tracking tool for engineering teams with sprint planning, burndown charts and GitHub integration.', 'TypeScript, Next.js, Drizzle ORM, PostgreSQL', 'https://github.com/abuzarsoftware/devtrack', 'https://devtrack.example.com', 'https://images.pexels.com/photos/34804000/pexels-photo-34804000.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', false, now() - interval '60 days'),
  ('LedgerPro Accounting Suite', 'Software', 'Double-entry accounting software with invoicing, expense tracking, tax reports and bank reconciliation for SMEs.', 'React, Node.js, PostgreSQL, Docker', '', 'https://ledgerpro.example.com', 'https://images.pexels.com/photos/907487/pexels-photo-907487.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', false, now() - interval '90 days'),
  ('Corporate Website — Nexa Group', 'Website', 'A premium corporate website with CMS, multilingual support and 98+ Lighthouse scores for an international holding company.', 'Next.js, Tailwind CSS, Headless CMS', '', 'https://nexagroup.example.com', 'https://images.pexels.com/photos/236042/pexels-photo-236042.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', false, now() - interval '120 days'),
  ('FitBuddy Mobile App', 'Mobile App', 'A fitness companion app with workout plans, calorie tracking and social challenges — 50k+ downloads on both stores.', 'React Native, Node.js, MongoDB', '', 'https://fitbuddy.example.com', '', false, now() - interval '150 days'),
  ('QuickServe Restaurant POS', 'Software', 'A cloud point-of-sale system for restaurants with table management, kitchen display and daily sales analytics.', 'React, Express, PostgreSQL, Electron', '', '', '', false, now() - interval '180 days')
) AS v(title, category, description, technologies, github_url, live_url, image, featured, created_at)
WHERE NOT EXISTS (SELECT 1 FROM projects);

-- Testimonials
INSERT INTO testimonials (client_name, company, review, photo, rating, created_at)
SELECT * FROM (VALUES
  ('Michael Carter', 'Nexa Group', 'Abuzar Software Solutions rebuilt our corporate website and the results speak for themselves — 3x more leads in the first quarter. Professional, fast and a pleasure to work with.', 'https://images.pexels.com/photos/28442318/pexels-photo-28442318.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', 5, now() - interval '15 days'),
  ('Sarah Mitchell', 'FinSight', 'The analytics dashboard they built handles millions of data points without breaking a sweat. Their engineering quality is genuinely world-class.', 'https://images.pexels.com/photos/33680700/pexels-photo-33680700.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', 5, now() - interval '35 days'),
  ('Amara Johnson', 'ShopEase', 'From design to launch in eight weeks. Our conversion rate jumped 42% after the redesign. I cannot recommend this team highly enough.', 'https://images.pexels.com/photos/7717254/pexels-photo-7717254.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', 5, now() - interval '55 days'),
  ('David Okafor', 'TeamFlow', 'They took our vague idea and turned it into a polished product our users love. Communication was excellent throughout the entire project.', 'https://images.pexels.com/photos/31422830/pexels-photo-31422830.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', 4, now() - interval '75 days'),
  ('James Anderson', 'FitBuddy', 'Our mobile app hit 50,000 downloads in six months. The Abuzar team delivered on time, on budget and beyond expectations.', 'https://images.pexels.com/photos/33799456/pexels-photo-33799456.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', 5, now() - interval '95 days')
) AS v(client_name, company, review, photo, rating, created_at)
WHERE NOT EXISTS (SELECT 1 FROM testimonials);

-- Contacts
INSERT INTO contacts (full_name, email, phone, company, service, budget, message, status, created_at)
SELECT * FROM (VALUES
  ('Emily Rhodes', 'emily@brightlabs.io', '+1 415 555 0132', 'Bright Labs', 'React Development', '$5,000 – $10,000', 'We need a React dashboard for our internal analytics. Ideally kicking off within the next month. Can we schedule a call this week?', 'new', now() - interval '1 day'),
  ('Omar Farooq', 'omar@alnoor-trading.com', '+971 50 555 7788', 'Al Noor Trading', 'Ecommerce Website', '$10,000 – $25,000', 'Looking to build a B2B ecommerce portal with multi-currency support and integration with our existing ERP system.', 'new', now() - interval '3 days'),
  ('Jessica Tan', 'jessica@lumina.sg', '+65 8555 2244', 'Lumina Studio', 'UI/UX Design', '$1,000 – $5,000', 'Our SaaS product needs a complete UX overhaul. We have user feedback data ready to share with your design team.', 'read', now() - interval '12 days'),
  ('Robert King', 'rking@kingslogistics.com', '+44 20 5555 9911', 'Kings Logistics', 'Software Development', '$25,000+', 'We want a custom fleet management system with GPS tracking, driver apps and automated route optimization.', 'replied', now() - interval '35 days'),
  ('Fatima Zahra', 'fatima@medcarehealth.org', '+92 321 5556677', 'MedCare Health', 'Mobile App Development', '$10,000 – $25,000', 'We need a patient appointment booking app for iOS and Android connected to our clinic management system.', 'replied', now() - interval '65 days'),
  ('Lucas Meyer', 'lucas@meyerbau.de', '+49 30 555 8321', 'Meyer Bau GmbH', 'Website Development', '$1,000 – $5,000', 'Our construction company website is outdated. We want a modern site with a project gallery and quote request feature.', 'read', now() - interval '95 days')
) AS v(full_name, email, phone, company, service, budget, message, status, created_at)
WHERE NOT EXISTS (SELECT 1 FROM contacts);

-- Quotes
INSERT INTO quotes (name, email, phone, business, project_type, budget, deadline, description, status, created_at)
SELECT * FROM (VALUES
  ('Hannah Lee', 'hannah@petalandco.com', '+1 646 555 0177', 'Petal & Co.', 'Ecommerce Store', '$5,000 – $10,000', '2026-04-15', 'Online flower shop with same-day delivery scheduling, subscription bouquets and gift messaging. Need Stripe and local courier API integration.', 'pending', now() - interval '2 days'),
  ('Ahmed Hassan', 'ahmed@qitech.sa', '+966 55 555 4433', 'QiTech Solutions', 'Web Application', '$25,000+', '2026-06-01', 'HR management platform for 500+ employees: attendance, payroll, leave management and performance reviews with Arabic/English support.', 'pending', now() - interval '6 days'),
  ('Maria Gonzalez', 'maria@tapasbar.es', '+34 91 555 2288', 'Tapas Bar Madrid', 'Business Website', 'Under $1,000', '2026-03-20', 'Simple but beautiful restaurant website with menu, reservations and Google Maps integration.', 'reviewed', now() - interval '20 days'),
  ('Tom Becker', 'tom@fitzone.app', '+1 310 555 6600', 'FitZone', 'Mobile App', '$10,000 – $25,000', '2026-07-10', 'Gym membership app with class booking, QR check-in and workout tracking. Android and iOS from a single codebase.', 'accepted', now() - interval '50 days'),
  ('Priya Sharma', 'priya@eduspark.in', '+91 98555 11223', 'EduSpark', 'Custom Software', '$10,000 – $25,000', '2026-05-30', 'Learning management system for coaching centers: course content, live classes, quizzes and parent progress reports.', 'reviewed', now() - interval '80 days')
) AS v(name, email, phone, business, project_type, budget, deadline, description, status, created_at)
WHERE NOT EXISTS (SELECT 1 FROM quotes);

-- Settings (website content)
INSERT INTO settings (key, value)
VALUES
  ('hero', '{"heading":"Abuzar Software Solutions","subtitle":"We Build Modern Websites, Mobile Apps and Business Solutions.","badge":"Premium Software House"}'::jsonb),
  ('stats', '{"clients":120,"projects":250,"years":8,"team":24}'::jsonb),
  ('about', '{"intro":"Abuzar Software Solutions is a full-service software house crafting premium digital products for startups and enterprises around the globe. From pixel-perfect websites to scalable business platforms, we turn ambitious ideas into reliable software.","mission":"To empower businesses with modern, high-performance software that accelerates growth and delivers measurable results.","vision":"To become the most trusted software partner for companies worldwide, known for engineering excellence and design that inspires.","process":[{"title":"Discover","description":"We dive deep into your goals, users and market to define a winning strategy."},{"title":"Design","description":"Our designers craft intuitive, beautiful interfaces that users love."},{"title":"Develop","description":"Engineers build robust, scalable solutions with clean, tested code."},{"title":"Deliver","description":"We launch, monitor and continuously improve your product after release."}]}'::jsonb),
  ('team', '[{"name":"Abuzar Ahmed","role":"Founder & CEO","photo":""},{"name":"Sara Khan","role":"Lead UI/UX Designer","photo":""},{"name":"Hamza Ali","role":"Senior Full Stack Engineer","photo":""},{"name":"Ayesha Malik","role":"Project Manager","photo":""}]'::jsonb)
ON CONFLICT (key) DO NOTHING;
