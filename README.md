# CCIS Concern Hub: A Student Concern Management System

The **CCIS Concern Hub** is a web-based student concern management system developed for the College of Computer and Information Sciences (CCIS) at the Polytechnic University of the Philippines (PUP). This platform enables students to submit academic concerns, complaints, and requests in a structured and private environment while allowing administrators to efficiently manage and resolve concerns.

## 🚀 Features
- **User Authentication:** Sign in using PUP webmail with Firebase Authentication
- **Student Workspace:** Submit, track, and manage concerns.
- **Admin Workspace:** View, filter, and manage student concerns.
- **Discussion Thread:** Engage in direct communication between students and admins for concern resolution.

## 📸 Screenshots  

- **User Sign-in Page**  
  ![User Sign-in](public/images/user-sign-in.png)  

- **Student Workspace**  
  ![Student Workspace](public/images/student-workspace.png)  

- **Submit a Concern**  
  ![Submit Concern](public/images/submit-concern.png)  

- **View Concern and Discussion Thread**  
  ![View Concern](public/images/view-concern.png)  

- **Admin Workspace**  
  ![Admin Workspace](public/images/admin-workspace.png)  

## 🛠️ Prerequisites
Make sure you have the following installed:
- **Node.js**
- **NPM**
- **Firebase CLI**

## ⚙️ Project Setup
1. Clone the repository to your local machine:
```bash
git clone git@github.com:AkzechKyla/CCISConcernHub.git
```
2. Navigate into the project directory:
```bash
cd CCISConcernHub
```
3. Install the necessary dependencies:
```bash
npm install
```
4. Create a `firebaseConfig.js` file with your Firebase configuration.
Example configuration:
```js
const firebaseConfig = {
  apiKey: "AIzaSyBpTmmA5uqI8rWKSxWnIXzDF7W3slzbUGE",
  authDomain: "prototype-project-463c9.firebaseapp.com",
  databaseURL: "https://prototype-project-463c9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "prototype-project-463c9",
  storageBucket: "prototype-project-463c9.firebasestorage.app",
  messagingSenderId: "328202250621",
  appId: "1:328202250621:web:f8a55b5fcee0672b188414"
};

export default firebaseConfig;
```
## 🏃 Running the Project
1. Start the development server:
```bash
npm run dev
```
2. Open your web browser and navigate to the local server URL provided by the terminal (typically http://localhost:3000).

## 🧑‍💻 Technology Stack

### Frontend
- HTML  
- Tailwind CSS  
- JavaScript  
- React.js  

### Backend
- Firebase  
  - Firebase Authentication  
  - Firebase Firestore (for storing concerns)  
  - Firebase Realtime Database (for discussion threads)  
  - Firebase Storage  
  - Firebase Cloud Functions  

## 📄 Contributors
- **Legaspi, John Lloyd S.**  
- **Morcillos, Kyla Franchezka L.**  
- **Quijano, Katherine P.**  
- **Valoria, Kyla Mae N.**

## 📝 Acknowledgments
This project is submitted in partial fulfillment of the requirements for the course **COMP 019: Applications Development and Emerging Technologies** at the **Polytechnic University of the Philippines**.

