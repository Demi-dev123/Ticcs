Here’s your cleaned README (no emojis, still professional and structured):

````md
# Ticss

Ticss is a lightweight event ticketing and check-in system that allows organizers to create events, generate QR-based passes, manage attendees, and validate real-time check-ins using a simple scan flow.

---

## Features

- Authentication system for event organizers  
- Create and manage events  
- Add and manage attendees  
- Attendee dashboard with search and filtering  
- QR code ticket generation per attendee  
- QR scanning for real-time check-in  
- Export tickets as PNG or PDF  
- Edit, delete, and manage attendee records  
- Shareable ticket links  

---

## Core Concept

Each attendee is issued a unique QR-based pass linked to a `pass_id`.

- QR codes do not store personal data  
- QR codes only reference a secure ID  
- Supabase acts as the source of truth for validation and check-ins  

---

## Tech Stack

- React (Vite)
- Supabase (Auth + Database)
- QR Code Generator and Scanner libraries
- Tailwind CSS / Custom UI styling
- Node.js ecosystem

---

## Project Structure

```bash
src/
 ├── components/
 ├── pages/
 ├── services/
 ├── hooks/
 ├── utils/
 └── App.jsx
````

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ticss.git
cd ticss
```

---

### 2. Install dependencies

```bash
npm install
```

or

```bash
pnpm install
```

---

### 3. Create environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

### 4. Run the development server

```bash
npm run dev
```

The app will run at:

```
http://localhost:5173
```

---

## QR System

* Each attendee has a generated `pass_id`
* QR code encodes only the `pass_id`
* Scanner validates pass in Supabase
* On successful scan, attendee is marked as checked in
* Invalid or reused passes are rejected

---

## Core Flow

```text
Create Event
   ↓
Add Attendees
   ↓
Generate QR Passes
   ↓
Distribute Tickets
   ↓
Scan at Entry
   ↓
Validate and Check-in
```

---

## Security Notes

* Supabase keys are stored in environment variables
* No sensitive data is stored inside QR codes
* Pass validation is handled server-side via database checks

---

## License

This project is for educational and demo purposes.

---

## Author

Built by Demi

```
```
