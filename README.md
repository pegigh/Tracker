# Class Tracker — حضور و غیاب کلاس

اپ موبایل (موبایل‌فرست) برای ثبت حضور و غیاب کلاس با بک‌اند Node.js و دیتابیس MySQL.

## قوانین کلاس

| نوع کلاس | تعداد جلسات | قانون غیبت |
|----------|-------------|------------|
| ۴ جلسه‌ای | ۴ | هر غیبت = یک جلسه می‌سوزد |
| ۸ جلسه‌ای | ۸ | ۱ غیبت مجاز، بعد از آن جلسه می‌سوزد |

## امکانات

- ثبت حضور و غیاب روزانه
- نمایش شماره جلسه فعلی برای مربی
- افزودن دانش‌آموز جدید در همان روز
- گزارش افرادی که جلساتشان تمام شده (نیاز به ثبت‌نام مجدد)
- UI مینیمال با Radix UI

## پیش‌نیاز

- Node.js 18+
- MySQL 8+

## راه‌اندازی

### ۱. دیتابیس

```bash
cp backend/.env.example backend/.env
# مقادیر DB_USER و DB_PASSWORD را در .env تنظیم کنید
```

```bash
cd backend
npm install
npm run db:init
```

### ۲. بک‌اند

```bash
cd backend
npm run dev
```

سرور روی `http://localhost:3001` اجرا می‌شود.

### ۳. فرانت‌اند

```bash
cd frontend
npm install
npm run dev
```

اپ روی `http://localhost:5173` باز می‌شود. برای موبایل، همان آدرس را در مرورگر گوشی باز کنید (در شبکه محلی).

## ساختار API

| متد | مسیر | توضیح |
|-----|------|-------|
| GET | `/api/class-days/today` | کلاس امروز + لیست حضور |
| POST | `/api/students` | ثبت دانش‌آموز جدید |
| POST | `/api/attendance` | ثبت حضور/غیبت |
| PATCH | `/api/attendance/:id` | ویرایش حضور/غیبت |
| GET | `/api/reports/completed` | جلسات تمام‌شده |
| POST | `/api/students/:id/enroll` | ثبت‌نام مجدد |

## Tech Stack

- **Frontend:** React, Vite, Radix UI Themes
- **Backend:** Node.js, Express
- **Database:** MySQL
