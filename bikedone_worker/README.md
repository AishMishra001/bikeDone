# Bike Done Partner (Mechanic App) 🚲🔧

A modern, high-UX React Native Expo application built for Bike Done Partner mechanics to onboard seamlessly and receive service requests.

---

## 📱 App Onboarding Flow (Steps 1 to 14 + Dashboard)

Here are the app screenshots showcasing the onboarding flow built step-by-step:

### 1. Welcome & Authentication
| 1. Splash Screen | 3. Verify OTP | 4. Welcome Aboard |
| :---: | :---: | :---: |
| ![Splash Screen](./assets/screenshots/step1_splash.png) | ![Verify OTP](./assets/screenshots/step3_verify_otp.png) | ![Welcome Aboard](./assets/screenshots/step4_welcome_aboard.png) |

---

### 2. Basic Information & Shop Setup
| 5. Basic Details | 6. Shop Type | 7. Shop Information |
| :---: | :---: | :---: |
| ![Basic Details](./assets/screenshots/step5_basic_details.png) | ![Shop Type](./assets/screenshots/step6_shop_type.png) | ![Shop Information](./assets/screenshots/step7_shop_info.png) |

---

### 3. Services, Expertise & Radius
| 8. Services Offered | 9. Expertise Categories | 10. Service Radius |
| :---: | :---: | :---: |
| ![Services Offered](./assets/screenshots/step8_services_offered.png) | ![Expertise Categories](./assets/screenshots/step9_expertise_categories.png) | ![Service Radius](./assets/screenshots/step10_service_radius.png) |

---

### 4. Verification & Submission
| 11. Documents Upload | 12. Bank Details | 13. Review & Submit |
| :---: | :---: | :---: |
| ![Documents Upload](./assets/screenshots/step11_documents_upload.png) | ![Bank Details](./assets/screenshots/step12_bank_details.png) | ![Review & Submit](./assets/screenshots/step13_review_submit.png) |

---

### 5. Approval & Dashboard Home
| 14. Waiting for Approval | 15. Dashboard (Home) |
| :---: | :---: |
| ![Waiting for Approval](./assets/screenshots/step14_approval_pending.png) | ![Dashboard Home](./assets/screenshots/step15_dashboard.png) |

---

## ✨ Features

- **End-to-End Onboarding Flow**: 14 pixel-perfect screens built matching the design system specifications.
- **State Persistence**: Unified `OnboardingContext` keeping form data intact across back and forward navigation.
- **Quick Demo Mode**: Instant **"Fill Demo Data"** action to populate partner profiles for fast testing.
- **Interactive Components**: Custom OTP pin inputs, interactive map picker preview, multiselect chips, radio cards, and document upload indicators.
- **TypeScript & Expo Router**: Strictly typed routes and file-based routing architecture.

---

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev) `~54.0.35` with [React Native](https://reactnative.dev) `0.81.5`
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction) `~6.0.24`
- **Language**: TypeScript `~5.9.2`
- **Icons**: `@expo/vector-icons` (Ionicons)
- **State**: React Context API (`OnboardingContext`)

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Node.js (v18+) and npm installed.

### 2. Installation
Clone the repository and install dependencies:

```bash
npm install
```

### 3. Run Locally

#### Start Development Server:
```bash
npx expo start
```

#### Run in Web Browser:
```bash
npm run web
```

#### Run on iOS / Android:
```bash
# For iOS Simulator
npm run ios

# For Android Emulator
npm run android
```

---

## 📄 License
This project is proprietary and maintained for Bike Done Partner app.
