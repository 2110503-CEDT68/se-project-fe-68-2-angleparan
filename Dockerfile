FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# ตั้งค่า URL ของ API ที่จะใช้ตอน Build
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
ARG INTERNAL_API_BASE_URL=http://backend:5000/api/v1
ARG NEXTAUTH_URL=http://localhost:3000

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV INTERNAL_API_BASE_URL=$INTERNAL_API_BASE_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL

# ทำการ Build ไฟล์ Next.js
RUN npm run build

EXPOSE 3000

# รันด้วย hostname 0.0.0.0 เพื่อให้เข้าถึงจากภายนอกคอนเทนเนอร์ได้
CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]