# 🔍 Lost & Found System

A full-stack web application designed to help communities (such as college campuses or offices) easily report and recover lost items. This system bridges the gap between those who lose items and those who find them through a secure and interactive platform.

## 🚀 Features

* **Report Lost Items:** Users can post details about items they have lost, including descriptions and categories.
* **Report Found Items:** "Good Samaritans" can list items they have found to help reunite them with owners.
* **Image Uploads:** Integrated with **Cloudinary** to allow users to upload clear photos of items for better identification.
* **Claim System:** Users can submit claims for found items, which the finder can verify.
* **Secure Authentication:** User registration and login protected with JWT (JSON Web Tokens).
* **Dashboard:** A personal dashboard to track your reported items and claims status.

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS (Styling)
* Redux Toolkit (State Management)

**Backend:**
* Node.js & Express.js
* MySQL (Database)
* Cloudinary (Image Management)
* Multer (File Handling)

## ⚙️ Installation & Run Locally

Follow these steps to set up the project locally on your machine.

### Prerequisites
* Node.js installed
* MySQL installed (or XAMPP)
* Cloudinary Account (for API keys)

### 1. Clone the Repository
```bash
git clone [https://github.com/krishgarg476/Lost-And-Found-System.git](https://github.com/krishgarg476/Lost-And-Found-System.git)
cd Lost-And-Found-System

### 2. Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
