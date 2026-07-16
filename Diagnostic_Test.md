Diagnostic\_Test



1\. Project Identity



&#x20;   Organization: IMS Venturi (Vadodara Franchise).



&#x20;   Core Role: Mentor-led test-prep provider.



&#x20;   Product: Diagnostic "Readiness Scorecard" for GMAT, GRE, and SAT.



&#x20;   Goal: High-intent lead generation (capturing user data and qualifying leads for counselor handoff).



2\. Technical Stack (Strict Constraints)



&#x20;   Frontend: React.js (Clean, mobile-optimized, fast UI).



&#x20;   Backend/Auth: Supabase (Primary choice for Auth/OTP and Database).



&#x20;   Deployment: Vercel.



&#x20;   Code Style: Modular, component-based, minimal external dependencies.



3\. Product Features \& Flow

A. The Data Capture (Mandatory)



Before any test logic, the user MUST be verified via:



&#x20;   Name, Email, Phone Number (OTP).



&#x20;   Target Country, Target Course.



&#x20;   Integration: User data must sync to the database immediately upon entry.



B. The Diagnostic Logic



&#x20;   Three Tiers: 1. 15-min Snapshot.

&#x20;   2. 15+15 (Split VA/QA).

&#x20;   3. Full Replica.



Adaptive logic. - just like tests conducted by GMAT/SAT/GRE



C. The Post-Test Handoff



&#x20;   Do not provide exhaustive automated results.



&#x20;   Call-to-Action: "Your results are being analyzed by our senior mentors. You will receive a personalized analysis via WhatsApp/Email shortly."





4\. Brand Guidelines



&#x20;   Tone: Professional, mentor-focused, data-driven, non-aggressive.



&#x20;   Business Logic: We are a "Connector" model. The app's purpose is to surface high-intent leads who are currently "weak" in specific areas, allowing our counselors to provide high-value, personalized advice in the follow-up.



5\. Instructions for the AI



&#x20;   Always prioritize the Data Capture/OTP flow first.



&#x20;   If asking about architecture, always suggest the most efficient path for rapid MVP deployment.



&#x20;   If writing code, include comments explaining the "Lead Handoff" point.



&#x20;   When generating questions, ensure they are tiered by difficulty levels (1-10).





